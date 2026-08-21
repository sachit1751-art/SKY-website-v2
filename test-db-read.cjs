const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp({
  projectId: config.projectId,
});
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const res = await db.collection('admins').limit(1).get();
    console.log("DB SUCCESS: Read test successful. Docs found:", res.size);
    process.exit(0);
  } catch (err) {
    console.error("DB ERROR:", err.message);
    process.exit(1);
  }
}
test();
