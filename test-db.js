const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp({
  projectId: config.projectId,
  databaseURL: `https://${config.projectId}.firebaseio.com`
});
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const res = await db.collection('test_connection').add({ timestamp: Date.now() });
    console.log("DB SUCCESS: Inserted test document", res.id);
    await db.collection('test_connection').doc(res.id).delete();
    console.log("DB SUCCESS: Deleted test document");
    process.exit(0);
  } catch (err) {
    console.error("DB ERROR:", err.message);
    process.exit(1);
  }
}
test();
