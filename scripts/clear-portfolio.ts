import { db } from '../lib/db/neon';
async function clearPortfolio() {
  if (!process.argv.includes('--replace-existing')) throw new Error('Pass --replace-existing to explicitly allow deleting existing data.');
  const snapshot = await db.collection('portfolio').get();
  if (snapshot.size > 500) throw new Error('Too many records for an atomic deletion. No data was changed.');
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log('Portfolio records cleared. R2 files were retained.');
}
clearPortfolio().catch(error => { console.error(error); process.exitCode = 1; });
