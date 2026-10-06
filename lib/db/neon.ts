import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { HttpError } from '../http';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = Record<string, JsonValue | undefined>;
export const collections = ['client_types', 'leads', 'payments', 'portfolio', 'pricing', 'process', 'services', 'settings'] as const;
type Row = { id: string; data: JsonObject };
export type SqlClient = NeonQueryFunction<false, false>;

export function getSql(direct = false): SqlClient {
  const url = process.env[direct ? 'DATABASE_URL_UNPOOLED' : 'DATABASE_URL'];
  if (!url) throw new HttpError(503, 'Database access is not configured.');
  try {
    const parsed = new URL(url);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('Invalid connection');
  } catch { throw new HttpError(503, 'Database access is not configured.'); }
  return neon(url, { fetchOptions: { signal: AbortSignal.timeout(15_000) } });
}

function validateReference(collection: string, id?: string) {
  if (!(collections as readonly string[]).includes(collection)) throw new Error('Invalid collection');
  if (id !== undefined && (!id || id.length > 1500 || (id.includes('/') || id.includes('\0')))) throw new Error('Invalid document ID');
}
function encodeData(data: JsonObject) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Document must be an object');
  const { id: _id, ...fields } = data;
  void _id;
  return JSON.stringify(fields, (_key, value) => {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Invalid numeric value');
    return value;
  });
}

export function createDatabase(client: () => SqlClient = getSql) {
  class DocumentReference {
    constructor(readonly collection: string, readonly id: string) { validateReference(collection, id); }
    async get() {
      const rows = await client().query('SELECT id, data FROM corstack_documents WHERE collection = $1 AND id = $2', [this.collection, this.id]);
      return snapshot(rows[0] as Row | undefined, this);
    }
    async update(data: JsonObject) {
      const rows = await client().query('UPDATE corstack_documents SET data = data || $3::jsonb, updated_at = now() WHERE collection = $1 AND id = $2 RETURNING id', [this.collection, this.id, encodeData(data)]);
      if (!rows.length) throw new HttpError(404, 'The record no longer exists.');
    }
    async set(data: JsonObject, options?: { merge?: boolean }) {
      await client().query(setStatement(options?.merge), [this.collection, this.id, encodeData(data)]);
    }
    async delete() {
      await client().query('DELETE FROM corstack_documents WHERE collection = $1 AND id = $2', [this.collection, this.id]);
    }
  }
  function snapshot(row: Row | undefined, ref: DocumentReference) {
    return { id: ref.id, ref, exists: Boolean(row), data: (): JsonObject | undefined => row ? structuredClone(row.data) : undefined };
  }
  function setStatement(merge = false) {
    return `INSERT INTO corstack_documents (collection, id, data) VALUES ($1, $2, $3::jsonb)
      ON CONFLICT (collection, id) DO UPDATE SET data = ${merge ? 'corstack_documents.data || EXCLUDED.data' : 'EXCLUDED.data'}, updated_at = now()`;
  }
  async function query(collection: string, orderBy?: string, direction: 'asc' | 'desc' = 'asc') {
    validateReference(collection);
    if (orderBy !== undefined && !['order', 'createdAt'].includes(orderBy)) throw new Error('Invalid ordering field');
    if (!['asc', 'desc'].includes(direction)) throw new Error('Invalid ordering direction');
    // Only the validated order expression is SQL; every user-controlled value is a parameter.
    const order = orderBy === 'order' ? `(data->>'order')::numeric ${direction}` : orderBy === 'createdAt' ? `data->>'createdAt' ${direction}` : 'id ASC';
    const rows = await client().query(`SELECT id, data FROM corstack_documents WHERE collection = $1 ${orderBy ? 'AND data ? $2' : ''} ORDER BY ${order} NULLS LAST, id ASC`, orderBy ? [collection, orderBy] : [collection]);
    const docs = (rows as Row[]).map(row => snapshot(row, new DocumentReference(collection, row.id)));
    return { docs, size: docs.length, forEach: (fn: (doc: typeof docs[number]) => void) => docs.forEach(fn) };
  }
  return {
    collection(collection: string) {
      validateReference(collection);
      return {
        get: () => query(collection),
        orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({ get: () => query(collection, field, direction) }),
        doc: (id = crypto.randomUUID()) => new DocumentReference(collection, id),
        async add(data: JsonObject) {
          const id = crypto.randomUUID();
          await client().query('INSERT INTO corstack_documents (collection, id, data) VALUES ($1, $2, $3::jsonb)', [collection, id, encodeData(data)]);
          return { id };
        },
      };
    },
    batch() {
      const statements: { text: string; params: unknown[] }[] = [];
      return {
        set(ref: DocumentReference, data: JsonObject) { validateReference(ref.collection, ref.id); statements.push({ text: setStatement(), params: [ref.collection, ref.id, encodeData(data)] }); },
        delete(ref: DocumentReference) { validateReference(ref.collection, ref.id); statements.push({ text: 'DELETE FROM corstack_documents WHERE collection = $1 AND id = $2', params: [ref.collection, ref.id] }); },
        async commit() {
          if (statements.length > 500) throw new Error('Batch exceeds 500 operations');
          if (!statements.length) return;
          const sql = client();
          await sql.transaction(statements.map(s => sql.query(s.text, s.params)));
        },
      };
    },
  };
}

export const db = createDatabase();
