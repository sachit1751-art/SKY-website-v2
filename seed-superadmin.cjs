const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  let cfg = {};
  if (fs.existsSync(configPath)) {
    cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  let options = {
    projectId: cfg.projectId || 'gen-lang-client-0819059161'
  };

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      options.credential = cert(sa);
      options.projectId = sa.project_id;
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', e.message);
    }
  }

  return initializeApp(options);
}

async function run() {
  const app = getAdminApp();
  const auth = getAuth(app);
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  let databaseId = '';
  if (fs.existsSync(configPath)) {
    databaseId = JSON.parse(fs.readFileSync(configPath, 'utf8')).firestoreDatabaseId || '';
  }

  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

  const targetUid = 'olBqGdfdmJddXmyiDbQ6avNkuY72';

  console.log(`Checking Firebase Authentication for UID: ${targetUid} on project: ${app.options.projectId}...`);
  let userEmail = '';
  let userDisplayName = '';

  try {
    const userRecord = await auth.getUser(targetUid);
    userEmail = userRecord.email || '';
    userDisplayName = userRecord.displayName || '';
    console.log(`Found Auth User: UID=${userRecord.uid}, Email=${userEmail}, DisplayName=${userDisplayName}`);
  } catch (authErr) {
    console.warn(`[Auth Fetch Warning]: ${authErr.message}. Proceeding with Firestore document initialization...`);
  }

  try {
    const docRef = db.collection('admins').doc(targetUid);
    const docSnap = await docRef.get();

    const now = FieldValue.serverTimestamp();

    if (docSnap.exists) {
      const data = docSnap.data();
      console.log('Existing document found in admins collection:', data);
      
      const updates = {};
      if (data.role !== 'superadmin') updates.role = 'superadmin';
      if (data.active !== true) updates.active = true;
      if (data.approvalStatus !== 'approved') updates.approvalStatus = 'approved';
      if (data.isSuperAdmin !== true) updates.isSuperAdmin = true;
      if (!data.uid) updates.uid = targetUid;
      if (!data.userId) updates.userId = targetUid;
      if (userEmail && data.email !== userEmail) updates.email = userEmail;
      if (userDisplayName && data.name !== userDisplayName) updates.name = userDisplayName;
      if (userDisplayName && data.displayName !== userDisplayName) updates.displayName = userDisplayName;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = now;
        await docRef.update(updates);
        console.log('Updated existing superadmin document with:', updates);
      } else {
        console.log('Existing document is already up to date!');
      }
    } else {
      console.log('Document does not exist. Creating new superadmin document...');
      const payload = {
        uid: targetUid,
        userId: targetUid,
        email: userEmail || 'sachit1771@gmail.com',
        name: userDisplayName || 'Superadmin',
        displayName: userDisplayName || 'Superadmin',
        username: userEmail ? userEmail.split('@')[0] : 'superadmin',
        role: 'superadmin',
        isSuperAdmin: true,
        active: true,
        approvalStatus: 'approved',
        createdAt: now,
        updatedAt: now
      };
      await docRef.set(payload);
      console.log('Successfully created initial superadmin document:', payload);
    }
    console.log('SEED SUCCESSFUL!');
  } catch (err) {
    console.error('SEED FAILED:', err.message);
    process.exit(1);
  }
}

run();
