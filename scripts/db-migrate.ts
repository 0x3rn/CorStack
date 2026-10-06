import fs from 'node:fs/promises';
import path from 'node:path';
import { getSql } from '../lib/db/neon';

export async function migrate() {
  const files = (await fs.readdir('migrations')).filter(name => /^\d+_[a-z_]+\.sql$/.test(name)).sort();
  if (!process.argv.includes('--apply')) {
    console.log('Schema migrations: ' + files.join(', ') + '. Pass --apply to apply them to DATABASE_URL_UNPOOLED.');
    return;
  }
  const url = process.env.DATABASE_URL_UNPOOLED;
  if (!url || new URL(url).hostname.includes('-pooler')) throw new Error('Set DATABASE_URL_UNPOOLED to the direct Neon connection string.');
  const sql = getSql(true);
  await sql.query('CREATE TABLE IF NOT EXISTS corstack_schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const applied = new Set((await sql.query('SELECT name FROM corstack_schema_migrations')).map(row => row.name));
  for (const name of files) {
    if (applied.has(name)) continue;
    const source = await fs.readFile(path.join('migrations', name), 'utf8');
    // These repository-owned migrations contain plain DDL, without procedural blocks.
    const statements = source.split(';').map(s => s.trim()).filter(Boolean);
    await sql.transaction([...statements.map(text => sql.query(text)), sql.query('INSERT INTO corstack_schema_migrations (name) VALUES ($1)', [name])]);
    console.log('Applied ' + name);
  }
}
migrate().catch(error => { console.error(error instanceof Error ? error.message : 'Schema migration failed'); process.exitCode = 1; });
