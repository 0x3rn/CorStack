// Stage every operation before committing; an invalid backup must never erase live content.
export async function replaceCollections(db, entries, settings = {}) {
  const prepared = entries.map(([collection, records]) => {
    if (!Array.isArray(records)) throw new Error('Invalid backup collection: ' + collection);
    const ids = new Set();
    return [collection, records.map(record => {
      if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Invalid backup record: ' + collection);
      const { id, ...data } = record;
      if (id !== undefined && (typeof id !== 'string' || !id || id.includes('/') || ids.has(id))) throw new Error('Invalid or duplicate document ID: ' + collection);
      if (id) ids.add(id);
      if (typeof data.title !== 'string' && typeof data.name !== 'string') throw new Error('Missing record title/name: ' + collection);
      if (!Number.isInteger(data.order) || data.order < 0) throw new Error('Invalid record order: ' + collection);
      return {id, data};
    })];
  });
  for (const [id, data] of Object.entries(settings)) {
    if (!['general','contact'].includes(id) || !data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid settings backup.');
  }
  const snapshots = await Promise.all(prepared.map(([name]) => db.collection(name).get()));
  const operations = [];
  for (const [index, [name, records]] of prepared.entries()) {
    const collection = db.collection(name);
    const retained = new Set(records.map(record => record.id).filter(Boolean));
    for (const doc of snapshots[index].docs) if (!retained.has(doc.id)) operations.push(['delete', doc.ref]);
    for (const {id, data} of records) operations.push(['set', id ? collection.doc(id) : collection.doc(), data]);
  }
  for (const [id,data] of Object.entries(settings)) operations.push(['set', db.collection('settings').doc(id), data]);
  if (operations.length > 500) throw new Error('Restore exceeds the 500-operation atomic batch limit. Use a staged migration instead. No data was changed.');
  const batch = db.batch();
  for (const [operation, ref, data] of operations) {
    if (operation === 'delete') batch.delete(ref); else batch.set(ref, data);
  }
  if (operations.length) await batch.commit();
}
