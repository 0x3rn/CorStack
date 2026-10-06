import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { DocumentReference, GeoPoint, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { collections, getSql, type JsonObject } from '../lib/db/neon';
import { readImage, validateImage } from '../lib/storage';
import { countRecords, importBackup, normalizeBackup, referencedSourceImages, sourceImage, verifyBackup, type DatabaseBackup } from './migration-data';

const runFile = promisify(execFile);
function option(name: string) { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; }
function stamp() { return new Date().toISOString().replace(/[:.]/g, '-'); }
async function writeBackup(filename: string, data: unknown) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, JSON.stringify(data, null, 2), { flag: 'wx', mode: 0o600 });
  console.log('Saved private backup: ' + filename);
}
function firebaseValue(value: unknown, project: string): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof GeoPoint) return { latitude: value.latitude, longitude: value.longitude };
  if (value instanceof DocumentReference) return `projects/${project}/databases/(default)/documents/${value.path}`;
  if (Buffer.isBuffer(value)) return value.toString('base64');
  if (Array.isArray(value)) return value.map(v => firebaseValue(v, project));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, firebaseValue(v, project)]));
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Source has a non-finite number; migration requires an explicit mapping.');
  return value;
}
async function exportFirestore() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId || /^your[_-]/i.test(projectId) || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) throw new Error('Set the real Firebase service-account configuration before exporting.');
  const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
  const source = getFirestore(app);
  const all = await source.listCollections();
  const backup: DatabaseBackup = { formatVersion: 2, provider: 'firestore', sourceProjectId: projectId, createdAt: new Date().toISOString(), collections: {} };
  for (const name of new Set([...collections, ...all.map(c => c.id)])) {
    const documents = await source.collection(name).get();
    backup.collections[name] = [];
    for (const doc of documents.docs) {
      if ((await doc.ref.listCollections()).length) throw new Error('Source contains subcollections. Extend the exporter before migrating; source data is unchanged.');
      backup.collections[name].push({ id: doc.id, data: firebaseValue(doc.data(), projectId) as JsonObject });
    }
  }
  await writeBackup(option('--output') || path.join('migration-backups', 'firestore-' + stamp() + '.json'), backup);
  console.log('Record counts:', Object.fromEntries(Object.entries(backup.collections).map(([name, records]) => [name, records.length])));
}
async function loadBackup(filename: string | undefined) {
  if (!filename) throw new Error('Provide the source backup filename.');
  return normalizeBackup(JSON.parse(await fs.readFile(filename, 'utf8')));
}
async function copyMedia(backup: DatabaseBackup) {
  const bucket = option('--bucket'), sourceBucket = option('--source-bucket');
  if (!bucket || !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket) || !sourceBucket) throw new Error('Provide --bucket <R2 bucket name> and --source-bucket <Firebase bucket name>.');
  const assetDir = option('--asset-dir');
  const localDir = path.resolve('migration-backups', 'assets');
  await fs.mkdir(localDir, { recursive: true });
  const replacements = new Map<string, string>();
  const manifest: { key: string; sha256: string; size: number; contentType: string }[] = [];
  const wrangler = path.resolve('node_modules', 'wrangler', 'bin', 'wrangler.js');
  async function moveImage(value: string) {
    if (replacements.has(value)) return replacements.get(value)!;
    const source = sourceImage(value, sourceBucket);
    if (!source) return value;
    const { url, objectKey } = source;
    let bytes: Uint8Array, contentType: string;
    if (assetDir) {
      const root = path.resolve(assetDir), file = path.resolve(root, objectKey);
      if (!file.startsWith(root + path.sep)) throw new Error('Invalid source asset path');
      bytes = await fs.readFile(file);
      const ext = path.extname(file).toLowerCase();
      contentType = ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif' } as Record<string, string>)[ext] || '';
    } else {
      const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`Firebase image download failed (${response.status}). Re-enable source access temporarily or supply --asset-dir with the original files. No database URLs were changed.`);
      const headers = new Headers(response.headers);
      if (headers.get('content-type')?.split(';')[0] === 'application/octet-stream') {
        const inferred = ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif' } as Record<string, string>)[path.extname(objectKey).toLowerCase()];
        if (inferred) headers.set('Content-Type', inferred);
      }
      const init: RequestInit & { duplex: 'half' } = { method: 'POST', headers, body: response.body, duplex: 'half' };
      const image = await readImage(new Request('https://migration.invalid', init));
      bytes = image.bytes; contentType = image.contentType;
    }
    const ext = validateImage(bytes, contentType);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const filename = sha256 + '.' + ext, key = 'portfolio/' + filename;
    const file = path.join(localDir, filename);
    await fs.writeFile(file, bytes, { mode: 0o600 });
    await runFile(process.execPath, [wrangler, 'r2', 'object', 'put', bucket + '/' + key, '--file', file, '--content-type', contentType, '--cache-control', 'public, max-age=31536000, immutable', '--remote']);
    const verification = file + '.verified';
    await runFile(process.execPath, [wrangler, 'r2', 'object', 'get', bucket + '/' + key, '--file', verification, '--remote']);
    const returned = await fs.readFile(verification);
    if (createHash('sha256').update(returned).digest('hex') !== sha256) throw new Error('R2 checksum verification failed. Do not switch production.');
    await fs.unlink(verification);
    manifest.push({ key, sha256, size: bytes.length, contentType });
    const replacement = '/media/portfolio/' + filename;
    replacements.set(value, replacement);
    console.log('Copied and verified image ' + manifest.length);
    return replacement;
  }
  async function walk(value: unknown): Promise<unknown> {
    if (typeof value === 'string') return moveImage(value);
    if (Array.isArray(value)) { const items = []; for (const item of value) items.push(await walk(item)); return items; }
    if (value && typeof value === 'object') { const entries: [string, unknown][] = []; for (const [key, item] of Object.entries(value)) entries.push([key, await walk(item)]); return Object.fromEntries(entries); }
    return value;
  }
  const prepared = normalizeBackup(await walk(backup));
  const timestamp = stamp();
  await writeBackup(option('--output') || path.join('migration-backups', 'prepared-' + timestamp + '.json'), prepared);
  await writeBackup(path.join('migration-backups', 'asset-manifest-' + timestamp + '.json'), manifest);
  console.log('Every referenced Firebase image was copied and verified. Local public assets and external image links were retained.');
}
async function main() {
  const [command, filename] = process.argv.slice(2);
  if (command === 'export-firestore') return exportFirestore();
  if (command === 'copy-media') return copyMedia(await loadBackup(filename));
  if (command === 'import-neon' || command === 'verify-neon') {
    const backup = await loadBackup(filename);
    if (command === 'import-neon') {
      if (!process.argv.includes('--apply')) { console.log('Import plan:', countRecords(backup), 'Pass --apply to import into an empty Neon database.'); return; }
      if (referencedSourceImages(backup).length) throw new Error('Backup still references Firebase Storage. Run copy-media successfully before importing.');
      const direct = process.env.DATABASE_URL_UNPOOLED;
      if (!direct || new URL(direct).hostname.includes('-pooler')) throw new Error('Set DATABASE_URL_UNPOOLED to the direct Neon connection string.');
      await importBackup(getSql(true), backup);
    }
    console.log('Database counts and all record fields verified:', await verifyBackup(getSql(command === 'import-neon'), backup));
    return;
  }
  console.log('Commands: export-firestore, copy-media <backup> --bucket <R2> --source-bucket <Firebase>, import-neon <prepared-backup> [--apply], verify-neon <prepared-backup>.');
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Migration failed'); process.exitCode = 1; });
