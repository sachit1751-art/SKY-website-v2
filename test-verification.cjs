const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function verifyConfig() {
  const cfgPath = path.join(__dirname, 'firebase-applet-config.json');
  console.log('1. Checking firebase-applet-config.json...');
  if (!fs.existsSync(cfgPath)) {
    throw new Error('firebase-applet-config.json missing');
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  console.log('   Project ID:', cfg.projectId);
  console.log('   Firestore Database ID:', cfg.firestoreDatabaseId);

  console.log('2. Checking Single Firebase Admin initialization logic in api/index.ts...');
  const apiContent = fs.readFileSync(path.join(__dirname, 'api/index.ts'), 'utf8');
  if (apiContent.includes('initFirebaseAdmin') && apiContent.includes('FIREBASE_SERVICE_ACCOUNT')) {
    console.log('   Unified Firebase Admin initialization verified.');
  } else {
    throw new Error('Firebase Admin initialization check failed in api/index.ts');
  }

  console.log('3. Checking Initial Superadmin Seed Logic...');
  if (apiContent.includes('olBqGdfdmJddXmyiDbQ6avNkuY72')) {
    console.log('   Initial superadmin UID seed function verified.');
  } else {
    throw new Error('Superadmin UID seed missing in api/index.ts');
  }

  console.log('4. Checking Firestore Rules consistency...');
  const rulesContent = fs.readFileSync(path.join(__dirname, 'firestore.rules'), 'utf8');
  if (rulesContent.includes("role == 'superadmin'") && rulesContent.includes("active == true") && rulesContent.includes("approvalStatus == 'approved'")) {
    console.log('   Firestore rules consistency verified.');
  } else {
    throw new Error('Firestore rules check failed.');
  }

  console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

verifyConfig();
