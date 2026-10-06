import { db } from '../lib/db/neon.ts';
import { replaceCollections } from './data-safety.mjs';
import fs from 'fs';
import path from 'path';



async function run() {
  if (!process.argv.includes('--replace-existing')) throw new Error('Pass --replace-existing to explicitly allow deleting existing data.');
  const backupPath = path.join(process.cwd(), 'scripts', 'db-backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error('No backup found!');
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const clientTypes = backupData.clientTypes;

  if (!clientTypes) {
    console.error('No clientTypes in backup!');
    process.exit(1);
  }

  await replaceCollections(db, [['client_types', clientTypes.map(item => ({iconName:'User',...item}))]]);

  console.log('Done!');
  process.exit(0);
}

run().catch(error => { console.error(error); process.exitCode = 1; });
