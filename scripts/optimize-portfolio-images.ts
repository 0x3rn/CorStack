import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { portfolioFilename, saveImageManifest } from '../lib/image-optimization';
import { readImage, type PortfolioBucket } from '../lib/storage';
import type { PublicContent } from '../lib/types';

sharp.concurrency(1);
sharp.cache(false);

const apply = process.argv.includes('--apply');
const selected = process.argv.indexOf('--filename');
const filenameFilter = selected < 0 ? undefined : process.argv[selected + 1];
const origin = 'https://corstack.dev';
const workingDirectory = path.resolve('.wrangler', 'image-optimization');
const bucketName = 'corstack-media';

async function main() {
  const response = await fetch(origin + '/api/content', { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Portfolio content unavailable (${response.status}).`);
  const { portfolio } = await response.json() as PublicContent;
  const filenames = [...new Set(portfolio.flatMap(item => [
    ...(item.desktopImages?.map(image => image.url) ?? []), ...(item.mobileImages?.map(image => image.url) ?? []),
    ...(item.desktopImageUrls ?? []), ...(item.mobileImageUrls ?? []), ...(item.imageUrl ? [item.imageUrl] : []),
  ]).map(portfolioFilename).filter((filename): filename is string => Boolean(filename)))];
  if (filenameFilter && !filenames.includes(filenameFilter)) throw new Error('The selected file is not a referenced portfolio upload.');
  await fs.mkdir(workingDirectory, { recursive: true });
  if (apply && (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN)) throw new Error('Cloudflare account credentials are required to apply the optimization.');
  const written: string[] = [];
  const bucket: PortfolioBucket = {
    get: async () => null,
    put: async (key, bytes, options) => {
      if (!apply) return;
      const local = path.join(workingDirectory, key.endsWith('.json') ? key.split('/').at(-1)! : key.slice('portfolio/'.length));
      await fs.writeFile(local, bytes);
      // Use the same R2 object endpoint as Wrangler, without launching a large
      // CLI process for every upload/download on memory-constrained machines.
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${bucketName}/objects/${key.split('/').map(encodeURIComponent).join('/')}`;
      const authorization = `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`;
      const uploaded = await fetch(endpoint, { method: 'PUT', headers: { Authorization: authorization,
        'Content-Type': options.httpMetadata.contentType, 'Cache-Control': options.httpMetadata.cacheControl,
        'cf-r2-data-catalog-check': 'true' }, body: Uint8Array.from(bytes), signal: AbortSignal.timeout(60_000) });
      if (!uploaded.ok) throw new Error(`R2 upload failed (${uploaded.status}); originals remain unchanged.`);
      const returned = await fetch(endpoint, { headers: { Authorization: authorization }, signal: AbortSignal.timeout(60_000) });
      if (!returned.ok || !Buffer.from(bytes).equals(Buffer.from(await returned.arrayBuffer()))) throw new Error('R2 byte verification failed; original images remain unchanged.');
      written.push(key);
    },
  };
  const results = [];
  for (const filename of filenames.filter(value => !filenameFilter || value === filenameFilter)) {
    const source = await fetch(`${origin}/media/portfolio/${filename}`, { redirect: 'error', signal: AbortSignal.timeout(60_000) });
    if (!source.ok) throw new Error(`Original image unavailable (${source.status}): ${filename}`);
    const image = await readImage(new Request('https://optimization.invalid', { method: 'POST', headers: source.headers, body: source.body, duplex: 'half' } as RequestInit));
    const bytes = Buffer.from(image.bytes);
    const metadata = await sharp(bytes, { limitInputPixels: 80_000_000 }).metadata();
    if (!metadata.width || !metadata.height) throw new Error('Missing source dimensions.');
    // Leave animation, HDR/high-bit-depth, and EXIF-oriented originals intact.
    // These require a separate fidelity policy rather than a silent conversion.
    if ((metadata.pages ?? 1) > 1 || (metadata.orientation ?? 1) !== 1 || metadata.depth !== 'uchar') {
      results.push({ filename, skipped: 'Animation, orientation or bit depth requires preserving the original.' });
      continue;
    }
    const candidate = await sharp(bytes).keepIccProfile().webp({ lossless: true, effort: 6 }).toBuffer();
    const [before, after] = await Promise.all([
      sharp(bytes).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(candidate).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    ]);
    if (before.info.width !== after.info.width || before.info.height !== after.info.height || !before.data.equals(after.data)) {
      results.push({ filename, skipped: 'Decoded pixel comparison differs; original retained.' });
      continue;
    }
    const preview = await sharp(bytes).resize({ width: 16, height: 16, fit: 'inside' }).webp({ quality: 50 }).toBuffer();
    const manifest = await saveImageManifest(bucket, filename, image.bytes, candidate, preview, { width: metadata.width, height: metadata.height });
    const result = { filename, width: manifest.width, height: manifest.height, originalBytes: manifest.originalBytes,
      servedBytes: manifest.servedBytes, savedBytes: manifest.originalBytes - manifest.servedBytes, url: manifest.url, pixelComparison: 'identical' };
    results.push(result);
    console.log(`${apply ? 'Optimized' : 'Plan'} ${filename}: ${result.width}x${result.height}, ${result.originalBytes} -> ${result.servedBytes} bytes (decoded pixels identical)`);
  }
  const report = { applied: apply, createdAt: new Date().toISOString(), images: results, objectsWritten: written,
    originalBytes: results.reduce((sum, image) => sum + ('originalBytes' in image ? image.originalBytes : 0), 0),
    servedBytes: results.reduce((sum, image) => sum + ('servedBytes' in image ? image.servedBytes : 0), 0) };
  await fs.writeFile(path.join(workingDirectory, apply ? 'applied.json' : 'plan.json'), JSON.stringify(report, null, 2));
  console.log(`Images: ${results.length}; original bytes: ${report.originalBytes}; served bytes: ${report.servedBytes}. Originals and database URLs unchanged.`);
  if (!apply) console.log('Run again with --apply to store verified derivatives and metadata in R2.');
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Image optimization failed.'); process.exitCode = 1; });
