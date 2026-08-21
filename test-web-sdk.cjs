const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, serverTimestamp } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function run() {
  try {
    const docRef = doc(db, 'admins', 'olBqGdfdmJddXmyiDbQ6avNkuY72');
    console.log("Attempting getDoc via Web Client SDK...");
    const snap = await getDoc(docRef);
    console.log("Doc exists?", snap.exists());
    if (snap.exists()) {
      console.log("Data:", snap.data());
    }
  } catch (e) {
    console.error("Web SDK Error:", e.message);
  }
  process.exit(0);
}
run();
