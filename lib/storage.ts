import { HttpError } from './http';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const extensions: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif' };
export const mediaFilename = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{64})\.(?:png|jpg|webp|avif)$/;
export type StoredImage = { body: ReadableStream<Uint8Array>; httpEtag: string; writeHttpMetadata(headers: Headers): void; text(): Promise<string> };
export type PortfolioBucket = {
  put(key: string, value: Uint8Array, options: { httpMetadata: { contentType: string; cacheControl: string }; customMetadata: Record<string, string> }): Promise<unknown>;
  get(key: string): Promise<StoredImage | null>;
};

export async function getPortfolioBucket(): Promise<PortfolioBucket> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as unknown as { PORTFOLIO_BUCKET?: PortfolioBucket }).PORTFOLIO_BUCKET;
    if (bucket) return bucket;
  } catch { /* Surface a useful configuration error without leaking infrastructure details. */ }
  throw new HttpError(503, 'Portfolio storage is not configured.');
}

export function validateImage(bytes: Uint8Array, contentType: string) {
  if (!extensions[contentType]) throw new HttpError(415, 'Choose a PNG, JPEG, WebP, or AVIF image.');
  if (!bytes.length) throw new HttpError(400, 'The image is empty.');
  if (bytes.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Images must be 10 MB or smaller.');
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  const valid = contentType === 'image/png' ? [137,80,78,71,13,10,26,10].every((n, i) => bytes[i] === n)
    : contentType === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : contentType === 'image/webp' ? ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP'
    : ascii(4, 4) === 'ftyp' && /avif|avis/.test(ascii(8, Math.min(bytes.length - 8, 128)));
  if (!valid) throw new HttpError(400, 'The file contents do not match its image type.');
  return extensions[contentType];
}

export async function readImage(request: Request) {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() || '';
  if (!extensions[contentType]) throw new HttpError(415, 'Choose a PNG, JPEG, WebP, or AVIF image.');
  if (Number(request.headers.get('content-length')) > MAX_IMAGE_BYTES) throw new HttpError(413, 'Images must be 10 MB or smaller.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Missing image.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES) { await reader.cancel(); throw new HttpError(413, 'Images must be 10 MB or smaller.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const extension = validateImage(bytes, contentType);
  return { bytes, contentType, extension };
}
