import { db } from '../lib/db/neon.ts';
import fs from 'node:fs/promises';
import path from 'node:path';
async function run() {
  const names = ['leads', 'payments', 'pricing', 'portfolio', 'services', 'client_types', 'process'];
  const snapshots = await Promise.all(names.map(name => db.collection(name).get()));
  const backup = { formatVersion: 1, provider: 'neon', createdAt: new Date().toISOString() };
  for (const [i, name] of names.entries()) backup[name === 'client_types' ? 'clientTypes' : name] = snapshots[i].docs.map(doc => ({ ...doc.data(), id: doc.id }));
  const settings = await db.collection('settings').get();
  backup.settings = Object.fromEntries(settings.docs.map(doc => [doc.id, doc.data()]));
  backup.settings.general ??= {};
  backup.settings.contact ??= {};
  const filename = path.join('scripts', 'db-backup.json');
  await fs.writeFile(filename, JSON.stringify(backup, null, 2), { mode: 0o600 });
  console.log('Private Neon backup saved to ' + filename);
}
run().catch(error => { console.error(error instanceof Error ? error.message : 'Backup failed'); process.exitCode = 1; });
