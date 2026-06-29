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

  console.log('Clearing existing Client Types...');
  const clientTypesSnapshot = await db.collection('client_types').get();
  for (const doc of clientTypesSnapshot.docs) {
    await doc.ref.delete();
  }

  console.log('Seeding Client Types from backup...');
  for (const item of clientTypes) {
    await db.collection('client_types').add(item);
  }

  console.log('Done!');
  process.exit(0);
}

run();
