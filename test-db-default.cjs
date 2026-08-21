const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp({
  projectId: config.projectId,
});

async function test() {
  try {
    const db1 = getFirestore(app);
    console.log("Testing (default) database...");
    const res = await db1.collection('admins').limit(1).get();
    console.log("DEFAULT DB SUCCESS: Docs found:", res.size);
  } catch (err) {
    console.error("DEFAULT DB ERROR:", err.message);
  }

  try {
    const db2 = getFirestore(app, config.firestoreDatabaseId);
    console.log("Testing named database:", config.firestoreDatabaseId);
    const res2 = await db2.collection('admins').limit(1).get();
    console.log("NAMED DB SUCCESS: Docs found:", res2.size);
  } catch (err) {
    console.error("NAMED DB ERROR:", err.message);
  }
  process.exit(0);
}
test();
