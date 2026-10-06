import { collections, type JsonObject, type SqlClient } from '../lib/db/neon';

export type BackupRecord = { id: string; data: JsonObject };
export type DatabaseBackup = {
  formatVersion: 2;
  provider: 'firestore' | 'neon';
  sourceProjectId?: string;
  createdAt: string;
  collections: Record<string, BackupRecord[]>;
};
export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => JSON.stringify(key) + ':' + stableJson(val)).join(',') + '}';
  return JSON.stringify(value);
}

function checkJson(value: unknown) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') { if (!Number.isFinite(value)) throw new Error('Backup contains a non-finite number'); return; }
  if (Array.isArray(value)) { value.forEach(checkJson); return; }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) { Object.values(value).forEach(checkJson); return; }
  throw new Error('Backup contains a value that cannot be preserved as JSON');
}

export function sourceImage(value: string, sourceBucket?: string): { url: URL; objectKey: string } | null {
  let url: URL;
  try { url = new URL(value); } catch { return null; }
  let bucket: string, objectKey: string;
  if (url.hostname === 'firebasestorage.googleapis.com') {
    const match = /^\/v0\/b\/([^/]+)\/o\/(.+)$/.exec(url.pathname);
    if (!match) throw new Error('Unrecognized Firebase image URL');
    bucket = decodeURIComponent(match[1]); objectKey = decodeURIComponent(match[2]);
    url.searchParams.set('alt', 'media');
  } else if (url.hostname === 'storage.googleapis.com') {
    const match = /^\/([^/]+)\/(.+)$/.exec(url.pathname);
    if (!match) return null;
    bucket = decodeURIComponent(match[1]); objectKey = decodeURIComponent(match[2]);
    if (sourceBucket && bucket !== sourceBucket) return null;
    if (!sourceBucket && !/\.(?:firebasestorage\.app|appspot\.com)$/.test(bucket)) return null;
  } else return null;
  if (url.protocol !== 'https:' || (sourceBucket && bucket !== sourceBucket)) throw new Error('Found an unexpected Firebase bucket URL. Migration stopped without changing the database.');
  return { url, objectKey };
}

export function referencedSourceImages(backup: DatabaseBackup) {
  const found: string[] = [];
  function walk(value: unknown) {
    if (typeof value === 'string') { if (sourceImage(value)) found.push(value); }
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  }
  walk(backup.collections);
  return found;
}

export function normalizeBackup(input: unknown): DatabaseBackup {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid backup');
  const raw = input as Record<string, unknown>;
  let data: Record<string, unknown>;
  if (raw.formatVersion === 2) {
    if (raw.provider !== 'firestore' && raw.provider !== 'neon') throw new Error('Unknown backup provider');
    if (!raw.collections || typeof raw.collections !== 'object' || Array.isArray(raw.collections)) throw new Error('Missing collections');
    data = raw.collections as Record<string, unknown>;
  } else if (raw.formatVersion === 1) {
    const settings = raw.settings as Record<string, unknown> | undefined;
    if (!settings || !settings.general || !settings.contact) throw new Error('Missing settings');
    data = {};
    for (const name of collections) {
      if (name === 'settings') data.settings = Object.entries(settings).map(([id, fields]) => ({ id, data: fields }));
      else {
        const items = raw[name === 'client_types' ? 'clientTypes' : name];
        if (!Array.isArray(items)) throw new Error('Missing collection: ' + name);
        data[name] = items.map(({ id, ...fields }) => ({ id, data: fields }));
      }
    }
  } else throw new Error('Unsupported backup version');
  if (Object.keys(data).some(name => !(collections as readonly string[]).includes(name))) throw new Error('Backup contains an unmapped collection. Extend the schema before importing it.');
  const normalized: Record<string, BackupRecord[]> = {};
  for (const name of collections) {
    const records = data[name];
    if (!Array.isArray(records)) throw new Error('Missing collection: ' + name);
    const ids = new Set<string>();
    normalized[name] = records.map(record => {
      if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Invalid record in ' + name);
      const { id, data: fields } = record;
      if (typeof id !== 'string' || !id || id.length > 1500 || (id.includes('/') || id.includes('\0')) || ids.has(id)) throw new Error('Invalid or duplicate ID in ' + name);
      if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw new Error('Invalid record fields in ' + name);
      ids.add(id);
      const { id: _storedId, ...clean } = fields;
      void _storedId;
      checkJson(clean);
      if (clean.order !== undefined && (typeof clean.order !== 'number' || !Number.isFinite(clean.order))) throw new Error('Invalid order in ' + name);
      return { id, data: clean };
    });
  }
  return { formatVersion: 2, provider: raw.provider === 'neon' ? 'neon' : 'firestore',
    sourceProjectId: typeof (raw.sourceProjectId ?? raw.projectId) === 'string' ? String(raw.sourceProjectId ?? raw.projectId) : undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(), collections: normalized };
}

export function backupRows(backup: DatabaseBackup) {
  return collections.flatMap(collection => backup.collections[collection].map(record => ({ collection, ...record })));
}
export function countRecords(backup: DatabaseBackup) {
  return Object.fromEntries(collections.map(name => [name, backup.collections[name].length]));
}
export async function importBackup(sql: SqlClient, backup: DatabaseBackup) {
  const rows = backupRows(normalizeBackup(backup));
  if (!rows.length) throw new Error('The source backup is empty. Nothing was imported.');
  const inserts = [];
  for (let i = 0; i < rows.length; i += 200) inserts.push(sql.query(
    'INSERT INTO corstack_documents (collection, id, data) SELECT collection, id, data FROM jsonb_to_recordset($1::jsonb) AS x(collection text, id text, data jsonb)',
    [JSON.stringify(rows.slice(i, i + 200))],
  ));
  await sql.transaction([
    sql.query("SELECT pg_advisory_xact_lock(hashtext('corstack-import'))"),
    sql.query("DO $$ BEGIN IF EXISTS (SELECT 1 FROM corstack_documents) THEN RAISE EXCEPTION 'Target database is populated. Import aborted without changing data.'; END IF; END $$"),
    ...inserts,
  ]);
}
export async function verifyBackup(sql: SqlClient, backup: DatabaseBackup) {
  const actual = await sql.query('SELECT collection, id, data FROM corstack_documents ORDER BY collection, id');
  const expected = backupRows(normalizeBackup(backup)).sort((a, b) => a.collection.localeCompare(b.collection) || a.id.localeCompare(b.id));
  const sortedActual = actual.sort((a, b) => String(a.collection).localeCompare(String(b.collection)) || String(a.id).localeCompare(String(b.id)));
  if (stableJson(sortedActual) !== stableJson(expected)) throw new Error('Database verification failed: counts, IDs, or record fields differ. Do not switch production.');
  return countRecords(backup);
}
