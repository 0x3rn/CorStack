import { replaceCollections } from './data-safety.mjs';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = getApps().length === 0 ? initializeApp({
  credential: cert(serviceAccount),
}) : getApps()[0];

const db = getFirestore(app);

async function run() {
  if (!process.argv.includes('--replace-existing')) throw new Error('Pass --replace-existing to explicitly allow deleting existing data.');
  const backupPath = path.join(process.cwd(), 'scripts', 'db-backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error('No backup found!');
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  if (backupData.projectId && backupData.projectId !== serviceAccount.projectId) throw new Error('Backup belongs to a different Firebase project.');
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
