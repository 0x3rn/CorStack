import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import { enrichPortfolioImages, isStaticEightBitImage, losslessWebpDimensions, manifestKey, portfolioFilename, saveImageManifest } from '../lib/image-optimization';
import type { PortfolioBucket, StoredImage } from '../lib/storage';

const filename = '11111111-1111-4111-8111-111111111111.png';
function storage() {
  const writes = new Map<string, Uint8Array>();
  const bucket: PortfolioBucket = {
    put: async (key, bytes) => { writes.set(key, bytes); },
    get: async key => writes.has(key) ? { text: async () => new TextDecoder().decode(writes.get(key)) } as StoredImage : null,
  };
  return { bucket, writes };
}
async function fixture(width: number, height: number) {
  const source = await sharp({ create: { width, height, channels: 3, background: '#f0bc57' } }).png().toBuffer();
  const candidate = await sharp(source).webp({ lossless: true }).toBuffer();
  const preview = await sharp(source).resize(16, 16, { fit: 'inside' }).webp().toBuffer();
  return { source, candidate, preview };
}

test('lossless candidates preserve both exact required dimensions and decoded pixels', async () => {
  for (const [width, height] of [[1600, 1200], [1200, 1600]]) {
    const { source, candidate } = await fixture(width, height);
    assert.deepEqual(losslessWebpDimensions(candidate), { width, height });
    assert.equal(isStaticEightBitImage(source), true);
    assert.ok((await sharp(source).raw().toBuffer()).equals(await sharp(candidate).raw().toBuffer()));
  }
});

test('lossy WebP and changed dimensions cannot be published as lossless derivatives', async () => {
  const { bucket, writes } = storage();
  const { source, candidate, preview } = await fixture(40, 30);
  const lossy = await sharp(source).webp({ quality: 75 }).toBuffer();
  assert.equal(losslessWebpDimensions(lossy), undefined);
  await assert.rejects(saveImageManifest(bucket, filename, source, lossy, preview, { width: 40, height: 30 }), /lossless/);
  await assert.rejects(saveImageManifest(bucket, filename, source, candidate, preview, { width: 30, height: 40 }), /dimensions/);
  assert.equal(writes.size, 0);
});

test('only smaller copies are stored, and source bytes and URLs stay untouched', async () => {
  const { bucket, writes } = storage();
  const { source, candidate, preview } = await fixture(1600, 1200);
  assert.ok(candidate.length < source.length);
  const result = await saveImageManifest(bucket, filename, source, candidate, preview, { width: 1600, height: 1200 });
  assert.equal(writes.has('portfolio/' + filename), false);
  assert.match(result.url, /^\/media\/portfolio\/[a-f0-9]{64}\.webp$/);
  assert.ok(writes.has(manifestKey(filename)));
  assert.equal(result.servedBytes, candidate.length);
  const smallOriginal = new Uint8Array(1);
  const retained = await saveImageManifest(bucket, filename, smallOriginal, candidate, preview, { width: 1600, height: 1200 });
  assert.equal(retained.url, '/media/portfolio/' + filename);
  assert.equal(retained.servedBytes, 1);
});

test('a failed derivative write cannot publish a manifest pointing to a missing image', async () => {
  const { source, candidate, preview } = await fixture(1600, 1200);
  const keys: string[] = [];
  const bucket: PortfolioBucket = { get: async () => null, put: async key => { keys.push(key); throw new Error('R2 unavailable'); } };
  await assert.rejects(saveImageManifest(bucket, filename, source, candidate, preview, { width: 1600, height: 1200 }));
  assert.equal(keys.length, 1);
  assert.equal(keys.includes(manifestKey(filename)), false);
});

test('only our stored images can be enriched, with legacy URLs and descriptions preserved', async () => {
  assert.equal(portfolioFilename('https://evil.test/media/portfolio/' + filename), undefined);
  assert.equal(portfolioFilename('/media/portfolio/../private.png'), undefined);
  const { bucket } = storage();
  const { source, candidate, preview } = await fixture(1600, 1200);
  const metadata = await saveImageManifest(bucket, filename, source, candidate, preview, { width: 1600, height: 1200 });
  const url = '/media/portfolio/' + filename;
  const [item] = await enrichPortfolioImages([{ title: 'Project', category: 'Web', order: 0, desktopImages: [{ url, description: 'Dashboard' }], mobileImageUrls: ['https://external.test/image.png'] }], bucket);
  assert.equal(item.desktopImages?.[0].url, url);
  assert.equal(item.desktopImages?.[0].description, 'Dashboard');
  assert.equal(item.desktopImages?.[0].optimizedUrl, metadata.url);
  assert.equal(item.mobileImages?.[0].optimizedUrl, undefined);
  assert.ok(item.desktopImages?.[0].blurDataURL?.startsWith('data:image/webp;base64,'));
});

test('missing or corrupt optimization metadata falls back to original images', async () => {
  const bucket: PortfolioBucket = { put: async () => {}, get: async () => ({ text: async () => '{broken' }) as StoredImage };
  const url = '/media/portfolio/' + filename;
  const [item] = await enrichPortfolioImages([{ title: 'Project', category: 'Web', order: 0, imageUrl: url }], bucket);
  assert.deepEqual(item.desktopImages, [{ url }]);
});

test('high-bit-depth PNG and animated files are retained rather than silently flattened', async () => {
  const { source } = await fixture(40, 30);
  const highDepth = Uint8Array.from(source); highDepth[24] = 16;
  assert.equal(isStaticEightBitImage(highDepth), false);
  // Conservative handling of color profiles and orientation metadata in new uploads.
  for (const type of ['iCCP', 'eXIf']) {
    const chunk = Buffer.alloc(12); chunk.write(type, 4);
    const withMetadata = Buffer.concat([source.subarray(0, 33), chunk, source.subarray(33)]);
    assert.equal(isStaticEightBitImage(withMetadata), false);
  }
  const blue = await sharp({ create: { width: 40, height: 30, channels: 3, background: 'blue' } }).png().toBuffer();
  const animated = await sharp([source, blue], { join: { animated: true } }).webp({ loop: 0 }).toBuffer();
  assert.equal(losslessWebpDimensions(animated), undefined);
  assert.equal(isStaticEightBitImage(animated), false);
});
