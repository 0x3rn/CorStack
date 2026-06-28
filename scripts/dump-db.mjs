import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs/promises';
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

async function dumpCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const docs = [];
  snapshot.forEach(doc => {
    // We omit the ID because we typically want to re-seed with fresh IDs or just clean data
    const data = doc.data();
    docs.push(data);
  });
  return docs;
}

async function dumpSettings() {
  const generalDoc = await db.collection('settings').doc('general').get();
  const contactDoc = await db.collection('settings').doc('contact').get();
  
  return {
    general: generalDoc.exists ? generalDoc.data() : {},
    contact: contactDoc.exists ? contactDoc.data() : {}
  };
}

async function run() {
  console.log('Fetching live data from Firestore...');
  
  try {
    const backup = {
      pricing: await dumpCollection('pricing'),
      portfolio: await dumpCollection('portfolio'),
      services: await dumpCollection('services'),
      clientTypes: await dumpCollection('client_types'),
      process: await dumpCollection('process'),
      settings: await dumpSettings()
    };

    const backupPath = path.join(process.cwd(), 'scripts', 'db-backup.json');
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
    
    console.log(`\n✅ Database successfully dumped to ${backupPath}`);
    console.log(`You can now use this backup to safely restore or re-seed your database.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error dumping database:', error);
    process.exit(1);
  }
}

run();
