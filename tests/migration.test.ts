import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
import { neon, neonConfig } from '@neondatabase/serverless';
import { createDatabase, collections, type SqlClient } from '../lib/db/neon';
import { normalizeBackup, importBackup, sourceImage, referencedSourceImages, verifyBackup, type DatabaseBackup } from '../scripts/migration-data';
import { HttpError, apiError, assertSameOrigin } from '../lib/http';
import { readImage, validateImage, mediaFilename } from '../lib/storage';

const postgres = new PGlite();
let sql: SqlClient;
const originalFetch = neonConfig.fetchFunction;
const originalEndpoint = neonConfig.fetchEndpoint;
before(async () => {
  await postgres.exec(fs.readFileSync('migrations/0001_documents.sql', 'utf8'));
  neonConfig.fetchEndpoint = () => 'https://test.invalid/sql';
  neonConfig.fetchFunction = async (_url: RequestInfo | URL, options?: RequestInit) => {
    const body = JSON.parse(options!.body as string) as { query: string; params: unknown[]; queries?: { query: string; params: unknown[] }[] };
    const run = async (client: Pick<PGlite, 'query'>, item: { query: string; params: unknown[] }) => {
      const result = await client.query<Record<string, unknown>>(item.query, item.params);
      return { command: 'SELECT', rowCount: result.affectedRows || result.rows.length, fields: result.fields,
        rows: result.rows.map(row => result.fields.map(field => row[field.name] == null ? null : typeof row[field.name] === 'object' ? JSON.stringify(row[field.name]) : String(row[field.name]))) };
    };
    try {
      if (body.queries) {
        const results = await postgres.transaction(async client => {
          const results = [];
          for (const item of body.queries!) results.push(await run(client, item));
          return results;
        });
        return Response.json({ results });
      }
      return Response.json(await run(postgres, body));
    } catch (error) {
      return Response.json({ message: error instanceof Error ? error.message : 'Query failed', code: 'TEST_ERROR' }, { status: 400 });
    }
  };
  sql = neon('postgres://test:test@localhost/corstack');
});
after(async () => { neonConfig.fetchFunction = originalFetch; neonConfig.fetchEndpoint = originalEndpoint; await postgres.close(); });

test('Neon adapter preserves IDs, orders numerically, and merges fields without replacing records', async () => {
  await postgres.exec('DELETE FROM corstack_documents');
  const db = createDatabase(() => sql);
  await db.collection('portfolio').doc('one').set({ title: 'One', order: 11, desktopImages: [{ url: '/hirehook.png', description: 'Original' }] });
  await db.collection('portfolio').doc("two'; DROP TABLE corstack_documents; --").set({ title: 'Two', order: 2 });
  await db.collection('portfolio').doc('unordered').set({ title: 'Without order' });
  const ordered = await db.collection('portfolio').orderBy('order').get();
  assert.deepEqual(ordered.docs.map(doc => doc.data()!.order), [2, 11]);
  await db.collection('portfolio').doc('one').update({ title: 'Updated' });
  assert.deepEqual((await db.collection('portfolio').doc('one').get()).data()!.desktopImages, [{ url: '/hirehook.png', description: 'Original' }]);
  await db.collection('settings').doc('general').set({ heroHeadline: 'Headline', socialTwitter: 'https://example.test' });
  await db.collection('settings').doc('general').set({ heroHeadline: 'New headline' }, { merge: true });
  assert.equal((await db.collection('settings').doc('general').get()).data()!.socialTwitter, 'https://example.test');
  await assert.rejects(db.collection('portfolio').doc('missing').update({ title: 'Missing' }), error => error instanceof HttpError && error.status === 404);
  assert.throws(() => db.collection('unknown'), /Invalid collection/);
  assert.throws(() => db.collection('portfolio').doc('../escape'), /Invalid document/);
  await assert.rejects(db.collection('portfolio').orderBy('order; DROP TABLE corstack_documents').get(), /Invalid ordering/);
});

test('Postgres batches roll back every operation on an invalid record', async () => {
  const db = createDatabase(() => sql);
  await db.collection('portfolio').doc('retained').set({ title: 'Retained', order: 0 });
  const batch = db.batch();
  batch.delete(db.collection('portfolio').doc('retained'));
  batch.set(db.collection('portfolio').doc('invalid'), { title: 'Bad order', order: 'not-a-number' });
  await assert.rejects(batch.commit());
  assert.equal((await db.collection('portfolio').doc('retained').get()).exists, true);
  assert.equal((await db.collection('portfolio').doc('invalid').get()).exists, false);
});

function backup(): DatabaseBackup {
  return { formatVersion: 2, provider: 'firestore', sourceProjectId: 'corstack-dev', createdAt: '2026-10-05T00:00:00Z',
    collections: Object.fromEntries(collections.map(collection => [collection, [{ id: collection + '-id', data: { title: collection, order: 1, raw: '<b>Preserved</b>' } }]])) };
}
test('migration preserves all eight collections and refuses populated targets', async () => {
  await postgres.exec('DELETE FROM corstack_documents');
  const source = backup();
  await importBackup(sql, source);
  assert.deepEqual(await verifyBackup(sql, source), Object.fromEntries(collections.map(name => [name, 1])));
  await assert.rejects(importBackup(sql, source), /populated/);
  await verifyBackup(sql, source);
  const db = createDatabase(() => sql);
  await db.collection('leads').doc('leads-id').update({ raw: 'Changed' });
  await assert.rejects(verifyBackup(sql, source), /verification failed/);
});
test('migration rejects missing collections, duplicate IDs, and unmapped data before import', () => {
  const source = backup();
  delete source.collections.payments;
  assert.throws(() => normalizeBackup(source), /Missing collection/);
  const duplicate = backup(); duplicate.collections.leads.push(duplicate.collections.leads[0]);
  assert.throws(() => normalizeBackup(duplicate), /duplicate ID/);
  const unknown = backup(); unknown.collections.unmapped = [];
  assert.throws(() => normalizeBackup(unknown), /unmapped/);
  const invalidNumber = backup(); invalidNumber.collections.payments[0].data.amount = Infinity;
  assert.throws(() => normalizeBackup(invalidNumber), /non-finite/);
});

test('asset migration recognizes the configured Firebase bucket without rewriting external links or message text', () => {
  const value = 'https://firebasestorage.googleapis.com/v0/b/corstack-dev.firebasestorage.app/o/portfolio%2Fimage.png?token=test';
  const parsed = sourceImage(value, 'corstack-dev.firebasestorage.app');
  assert.equal(parsed!.objectKey, 'portfolio/image.png');
  assert.equal(parsed!.url.searchParams.get('alt'), 'media');
  assert.equal(sourceImage('/hirehook.png'), null);
  assert.equal(sourceImage('https://other.example/image.png'), null);
  assert.equal(sourceImage('Please read https://firebasestorage.googleapis.com/my-link'), null);
  assert.throws(() => sourceImage(value, 'another-bucket'), /unexpected/);
  assert.throws(() => sourceImage(value.replace('https:', 'http:')), /unexpected/);
  assert.equal(sourceImage('https://storage.googleapis.com/corstack-dev.firebasestorage.app/portfolio/image.png')!.objectKey, 'portfolio/image.png');
  const data = backup(); data.collections.portfolio[0].data.desktopImages = [{ url: value, description: 'Original caption' }];
  assert.deepEqual(referencedSourceImages(data), [value]);
});

function load(file: string, dependencies: Record<string, unknown>) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} as Record<string, (...args: unknown[]) => Promise<Response>> };
  vm.runInNewContext(compiled, { module: loaded, exports: loaded.exports, require: (id: string) => {
    if (!(id in dependencies)) throw new Error('Unexpected dependency: ' + id);
    return dependencies[id];
  }, Response, Request, Headers, crypto, console: { error() {} } });
  return loaded.exports;
}
const png = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
test('R2 uploads authenticate before storage access and return a safe same-origin image URL', async () => {
  const saved: { key: string; bytes: Uint8Array; options: unknown }[] = [];
  const dependencies = {
    '@/lib/admin': { verifyAdmin: async () => ({ uid: 'admin-uid' }) },
    '@/lib/http': { apiError, assertSameOrigin },
    '@/lib/storage': { readImage, getPortfolioBucket: async () => ({ put: async (key: string, bytes: Uint8Array, options: unknown) => saved.push({ key, bytes, options }) }) },
  };
  const request = () => new Request('https://corstack.dev/api/admin/uploads', { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: png });
  const forbidden = load('app/api/admin/uploads/route.ts', { ...dependencies, '@/lib/admin': { verifyAdmin: async () => { throw new HttpError(403, 'Not authorized'); } } });
  assert.equal((await forbidden.POST(request())).status, 403);
  assert.equal(saved.length, 0);
  const route = load('app/api/admin/uploads/route.ts', dependencies);
  const response = await route.POST(request());
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.match(result.url, /^\/media\/portfolio\/[0-9a-f-]+\.png$/);
  assert.equal(saved[0].key, result.url.slice('/media/'.length));
  assert.deepEqual(saved[0].bytes, png);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});
test('upload validation rejects fake images and bounds bodies without trusting Content-Length', async () => {
  assert.throws(() => validateImage(new TextEncoder().encode('<script>bad</script>'), 'image/png'), /contents/);
  await assert.rejects(readImage(new Request('https://corstack.dev', { method: 'POST', headers: { 'Content-Type': 'image/svg+xml' }, body: '<svg/>' })), error => error instanceof HttpError && error.status === 415);
  await assert.rejects(readImage(new Request('https://corstack.dev', { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: new Uint8Array(10 * 1024 * 1024 + 1) })), error => error instanceof HttpError && error.status === 413);
});
test('public R2 reads cannot escape portfolio keys and support conditional caching', async () => {
  let reads = 0;
  const route = load('app/media/portfolio/[filename]/route.ts', {
    '@/lib/http': { apiError },
    '@/lib/storage': { mediaFilename, getPortfolioBucket: async () => ({ get: async () => { reads++; return { httpEtag: '"image"', body: new ReadableStream({ start(controller) { controller.enqueue(png); controller.close(); } }), writeHttpMetadata: (headers: Headers) => headers.set('Content-Type', 'image/png') }; } }) },
  });
  const filename = 'ca1c1f33-213c-40bc-a0ad-75aee5cfe7a1.png';
  const req = new Request('https://corstack.dev/media/portfolio/' + filename);
  assert.equal((await route.GET(req, { params: Promise.resolve({ filename: '../private' }) })).status, 404);
  assert.equal(reads, 0);
  const response = await route.GET(req, { params: Promise.resolve({ filename }) });
  assert.equal(response.headers.get('content-type'), 'image/png');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), png);
  const cached = await route.GET(new Request(req, { headers: { 'If-None-Match': '"image"' } }), { params: Promise.resolve({ filename }) });
  assert.equal(cached.status, 304);
});
