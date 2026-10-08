import { getPortfolioBucket, mediaFilename, MAX_IMAGE_BYTES, type PortfolioBucket } from './storage';
import type { PortfolioImage, PortfolioItem } from './types';

export interface ImageManifest {
  version: 1;
  url: string;
  width: number;
  height: number;
  originalBytes: number;
  servedBytes: number;
  blurDataURL: string;
}
export interface ImagesBinding {
  info(stream: ReadableStream<Uint8Array>): Promise<{ width: number; height: number }>;
  input(stream: ReadableStream<Uint8Array>): {
    transform(options: { width: number; height: number; fit: 'contain' }): { output(options: { format: 'image/webp'; quality: number; anim?: boolean }): Promise<{ response(): Response }> };
    output(options: { format: 'image/webp'; quality: number }): Promise<{ response(): Response }>;
  };
}
export const manifestKey = (filename: string) => `portfolio/optimized-v1/${filename}.json`;

export function portfolioFilename(url: string): string | undefined {
  const prefix = '/media/portfolio/';
  // Restrict processing to our own stored uploads, never arbitrary remote URLs.
  const path = url.startsWith(prefix) ? url : /^https:\/\/(?:corstack\.dev|web\.corstack\.dev)\//.test(url) ? new URL(url).pathname : '';
  const filename = path.slice(prefix.length);
  return path.startsWith(prefix) && mediaFilename.test(filename) ? filename : undefined;
}

export function losslessWebpDimensions(bytes: Uint8Array): { width: number; height: number } | undefined {
  const ascii = (offset: number, size: number) => String.fromCharCode(...bytes.subarray(offset, offset + size));
  if (bytes.length < 25 || ascii(0, 4) !== 'RIFF' || ascii(8, 4) !== 'WEBP') return;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let dimensions: { width: number; height: number } | undefined;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const type = ascii(offset, 4), size = view.getUint32(offset + 4, true);
    if (offset + 8 + size > bytes.length) return;
    // A lossy or animated result must never replace a full-quality static source.
    if (type === 'VP8 ' || type === 'ANIM' || type === 'ANMF') return;
    if (type === 'VP8L' && size >= 5 && bytes[offset + 8] === 0x2f) {
      const bits = view.getUint32(offset + 9, true);
      dimensions = { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    offset += 8 + size + (size % 2);
  }
  return dimensions;
}

export async function derivedFilename(bytes: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', Uint8Array.from(bytes));
  return Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('') + '.webp';
}

export async function saveImageManifest(bucket: PortfolioBucket, filename: string, original: Uint8Array, candidate: Uint8Array, preview: Uint8Array, dimensions: { width: number; height: number }): Promise<ImageManifest> {
  if (!mediaFilename.test(filename)) throw new Error('Invalid portfolio filename.');
  const encoded = losslessWebpDimensions(candidate);
  if (!encoded || encoded.width !== dimensions.width || encoded.height !== dimensions.height) throw new Error('The optimized image must be lossless and retain the original dimensions.');
  if (!preview.length || preview.length > 4096) throw new Error('Invalid loading preview.');
  const smaller = candidate.length < original.length;
  const servedFilename = smaller ? await derivedFilename(candidate) : filename;
  if (smaller) await bucket.put(`portfolio/${servedFilename}`, candidate, {
    httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' }, customMetadata: { original: filename, optimization: 'lossless-v1' },
  });
  const manifest: ImageManifest = {
    version: 1, url: `/media/portfolio/${servedFilename}`, ...dimensions,
    originalBytes: original.length, servedBytes: smaller ? candidate.length : original.length,
    blurDataURL: 'data:image/webp;base64,' + btoa(String.fromCharCode(...preview)),
  };
  // Publish metadata only after the derivative is safely stored. Originals stay untouched.
  await bucket.put(manifestKey(filename), new TextEncoder().encode(JSON.stringify(manifest)), {
    httpMetadata: { contentType: 'application/json', cacheControl: 'private, no-store' }, customMetadata: { original: filename },
  });
  return manifest;
}

export async function optimizeUploadedImage(bucket: PortfolioBucket, filename: string, bytes: Uint8Array, images: ImagesBinding): Promise<ImageManifest> {
  if (!isStaticEightBitImage(bytes)) throw new Error('Preserve animation, orientation and high bit depth in the original.');
  const stream = () => new Response(Uint8Array.from(bytes)).body!;
  const dimensions = await images.info(stream());
  // No resize, crop, fit, or quality reduction is applied to the full-size copy.
  const full = (await images.input(stream()).output({ format: 'image/webp', quality: 100 })).response();
  if (!full.ok) throw new Error('Image encoding failed.');
  const candidate = await boundedImageBytes(full, MAX_IMAGE_BYTES);
  const previewResponse = (await images.input(stream()).transform({ width: 16, height: 16, fit: 'contain' }).output({ format: 'image/webp', quality: 50, anim: false })).response();
  if (!previewResponse.ok) throw new Error('Preview encoding failed.');
  return saveImageManifest(bucket, filename, bytes, candidate, await boundedImageBytes(previewResponse, 4096), dimensions);
}

async function boundedImageBytes(response: Response, limit: number): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Missing encoded image.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) { await reader.cancel(); throw new Error('Encoded image exceeds the safe size limit.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

export function isStaticEightBitImage(bytes: Uint8Array): boolean {
  const ascii = (offset: number, length: number) => String.fromCharCode(...bytes.subarray(offset, offset + length));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes[0] === 137 && ascii(1, 3) === 'PNG') {
    if (bytes.length < 33 || bytes[24] > 8) return false;
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const size = view.getUint32(offset, false);
      if (offset + 12 + size > bytes.length || ['acTL', 'eXIf', 'iCCP'].includes(ascii(offset + 4, 4))) return false;
      offset += 12 + size;
    }
    return true;
  }
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const size = view.getUint32(offset + 4, true), type = ascii(offset, 4);
      if (offset + 8 + size > bytes.length || ['ANIM', 'ANMF', 'EXIF', 'ICCP'].includes(type)) return false;
      offset += 8 + size + size % 2;
    }
    return true;
  }
  if (bytes[0] === 255 && bytes[1] === 216) {
    let eightBit = false;
    for (let offset = 2; offset + 4 <= bytes.length;) {
      if (bytes[offset] !== 255) return false;
      const marker = bytes[offset + 1];
      if (marker === 0xda) return eightBit;
      const size = view.getUint16(offset + 2, false);
      if (size < 2 || offset + 2 + size > bytes.length || marker === 0xe1 || marker === 0xe2) return false;
      if ([0xc0, 0xc1, 0xc2].includes(marker)) eightBit = bytes[offset + 4] === 8;
      offset += 2 + size;
    }
  }
  // AVIF may contain HDR/high-bit-depth data; retain it as uploaded.
  return false;
}

export async function getImagesBinding(): Promise<ImagesBinding | undefined> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { IMAGES?: ImagesBinding }).IMAGES;
  } catch { return undefined; }
}

export async function enrichPortfolioImages(items: PortfolioItem[], storage?: PortfolioBucket): Promise<PortfolioItem[]> {
  let bucket: PortfolioBucket;
  try { bucket = storage ?? await getPortfolioBucket(); } catch { return items; }
  const urls = [...new Set(items.flatMap(item => [
    ...(item.desktopImages?.map(image => image.url) ?? []), ...(item.mobileImages?.map(image => image.url) ?? []),
    ...(item.desktopImageUrls ?? []), ...(item.mobileImageUrls ?? []), ...(item.imageUrl ? [item.imageUrl] : []),
  ]))];
  const metadata = new Map<string, ImageManifest>();
  // Bound R2 concurrency, and do not let missing optimization data break public pages.
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(6, urls.length) }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++], filename = portfolioFilename(url);
      if (!filename) continue;
      try {
        const stored = await bucket.get(manifestKey(filename));
        if (!stored) continue;
        const data = JSON.parse(await stored.text()) as ImageManifest;
        if (data.version === 1 && portfolioFilename(data.url) && data.width > 0 && data.height > 0 && data.servedBytes <= data.originalBytes && /^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(data.blurDataURL) && data.blurDataURL.length < 6000) metadata.set(url, data);
      } catch { /* Fall back to the original image, not an unavailable page. */ }
    }
  }));
  const enrich = (image: PortfolioImage): PortfolioImage => {
    const manifest = metadata.get(image.url);
    return manifest ? { ...image, optimizedUrl: manifest.url, blurDataURL: manifest.blurDataURL } : image;
  };
  return items.map(item => ({ ...item,
    desktopImages: (item.desktopImages?.length ? item.desktopImages : (item.desktopImageUrls?.length ? item.desktopImageUrls : item.imageUrl ? [item.imageUrl] : []).map(url => ({ url }))).map(enrich),
    mobileImages: (item.mobileImages?.length ? item.mobileImages : (item.mobileImageUrls ?? []).map(url => ({ url }))).map(enrich),
  }));
}
