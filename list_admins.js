import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snapshot = await getDocs(collection(db, 'admins'));
  snapshot.docs.forEach(doc => {
    console.log(doc.data().name);
  });
  process.exit(0);
}
run();
