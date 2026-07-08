import { db } from '../lib/firebase-admin';

async function clearPortfolio() {
  const snapshot = await db.collection('portfolio').get();
  console.log(`Found ${snapshot.size} portfolio items. Deleting...`);
  
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('Portfolio collection cleared successfully.');
}

clearPortfolio().catch(console.error);
