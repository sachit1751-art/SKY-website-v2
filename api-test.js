// api/index.ts
import "dotenv/config";
import express from "express";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
var firebaseConfig = {};
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (e) {
  console.warn("[Firebase] Could not read firebase-applet-config.json");
}
var EXPECTED_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId;
if (!EXPECTED_PROJECT_ID) {
  console.warn("[Firebase Admin] Missing FIREBASE_PROJECT_ID in environment variables.");
}
var EXPECTED_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || "(default)";
if (EXPECTED_PROJECT_ID) {
  process.env.FIREBASE_PROJECT_ID = EXPECTED_PROJECT_ID;
  process.env.GCLOUD_PROJECT = EXPECTED_PROJECT_ID;
  process.env.GOOGLE_CLOUD_PROJECT = EXPECTED_PROJECT_ID;
  process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: EXPECTED_PROJECT_ID });
}
var app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use("/api", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});
var db;
var authAdmin;
var adminApp;
function formatPrivateKey(key) {
  if (!key) return void 0;
  let formatted = key.trim();
  if (formatted.startsWith('"') && formatted.endsWith('"') || formatted.startsWith("'") && formatted.endsWith("'")) {
    formatted = formatted.slice(1, -1);
  }
  formatted = formatted.replace(/\\n/g, "\n");
  if (formatted.includes("-----BEGIN PRIVATE KEY-----") && !formatted.includes("-----BEGIN PRIVATE KEY-----\n")) {
    formatted = formatted.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n");
  }
  if (formatted.includes("-----END PRIVATE KEY-----") && !formatted.includes("\n-----END PRIVATE KEY-----")) {
    formatted = formatted.replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
  }
  return formatted;
}
async function initFirebaseAdmin() {
  if (db && authAdmin) return;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
  } else {
    let credential = void 0;
    let credentialSource = "default / ambient";
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        if (sa.private_key) sa.private_key = formatPrivateKey(sa.private_key);
        credential = cert(sa);
        credentialSource = "FIREBASE_SERVICE_ACCOUNT (JSON)";
      } catch (e) {
        console.error("[Firebase Admin] Error parsing FIREBASE_SERVICE_ACCOUNT:", e.message);
      }
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      try {
        credential = cert({
          projectId: process.env.FIREBASE_PROJECT_ID || EXPECTED_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)
        });
        credentialSource = "FIREBASE_PRIVATE_KEY & FIREBASE_CLIENT_EMAIL";
      } catch (e) {
        console.error("[Firebase Admin] Error with private key config:", e.message);
      }
    }
    const appOptions = { projectId: EXPECTED_PROJECT_ID };
    if (credential) appOptions.credential = credential;
    try {
      adminApp = initializeApp(appOptions);
      console.log(`[Firebase Admin Initialized] Source: ${credentialSource}`);
    } catch (e) {
      console.error("[Firebase Admin] initializeApp error:", e.message);
      throw e;
    }
  }
  try {
    db = getFirestore(adminApp, EXPECTED_DATABASE_ID || void 0);
  } catch (e) {
    console.error(`[Firebase Admin] Database initialization error:`, e.message);
    throw e;
  }
  authAdmin = getAuth(adminApp);
}
async function setRomRecord(romId, data) {
  if (!db) throw new Error("Firestore not initialized");
  const payload = { ...data, updatedAt: FieldValue.serverTimestamp() };
  await db.collection("roms").doc(romId).set(payload, { merge: true });
  return payload;
}
async function getRomRecord(romId) {
  if (!db) throw new Error("Firestore not initialized");
  const snap = await db.collection("roms").doc(romId).get();
  if (snap.exists) return { ...snap.data(), id: snap.id };
  return null;
}
async function deleteRomRecord(romId) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection("roms").doc(romId).delete();
}
async function setAdminRecord(uid, data) {
  if (!db) throw new Error("Firestore not initialized");
  const payload = { ...data, updatedAt: FieldValue.serverTimestamp() };
  await db.collection("admins").doc(uid).set(payload, { merge: true });
  return payload;
}
async function getAdminRecord(uid) {
  if (!db) throw new Error("Firestore not initialized");
  const doc = await db.collection("admins").doc(uid).get();
  if (doc.exists) return { ...doc.data(), id: doc.id };
  return null;
}
async function getAllAdminRecords() {
  if (!db) throw new Error("Firestore not initialized");
  const snap = await db.collection("admins").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
async function deleteAdminRecord(uid) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection("admins").doc(uid).delete();
}
async function logAdminAction(adminUid, action, details) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection("admin_logs").add({
    adminUid,
    action,
    details,
    timestamp: FieldValue.serverTimestamp()
  });
}
initFirebaseAdmin().catch((err) => console.error("[Firebase Admin Startup Warning]:", err.message));
var registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  max: 10,
  message: { error: "Too many registration attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
async function resolveToken(token) {
  if (!token) return null;
  if (!authAdmin) throw new Error("Auth not initialized");
  try {
    const decoded = await authAdmin.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email?.toLowerCase(), name: decoded.name };
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return null;
  }
}
async function verifySuperAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed authorization header." });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: "Authentication failed: Invalid or expired token." });
    }
    const admin = await getAdminRecord(user.uid);
    if (!admin || admin.active !== true) {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }
    if (admin.role === "superadmin") {
      req.userUid = user.uid;
      req.email = user.email;
      req.isSuperAdmin = true;
      next();
    } else {
      res.status(403).json({ error: "Access denied. Superadmin privileges required." });
    }
  } catch (e) {
    res.status(500).json({ error: `Server error during authorization: ${e.message}` });
  }
}
async function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed authorization header." });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: "Authentication failed: Invalid or expired token." });
    }
    const admin = await getAdminRecord(user.uid);
    if (!admin || admin.active !== true || admin.approvalStatus !== "approved") {
      return res.status(403).json({ error: "Access denied. Approved administrator privileges required." });
    }
    const isSuper = admin.role === "superadmin";
    req.userUid = user.uid;
    req.email = user.email;
    req.isSuperAdmin = isSuper;
    next();
  } catch (e) {
    res.status(500).json({ error: `Server error during authorization: ${e.message}` });
  }
}
app.use(async (req, res, next) => {
  try {
    await initFirebaseAdmin();
    if (!db || !authAdmin) {
      return res.status(500).json({ error: "Firebase Admin not initialized" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: `Initialization error: ${err.message}` });
  }
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", projectId: EXPECTED_PROJECT_ID });
});
app.get("/api/admin/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed authorization header." });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    const admin = await getAdminRecord(user.uid);
    if (admin) {
      return res.status(200).json({ success: true, admin });
    }
    return res.status(404).json({ error: "Admin profile not found." });
  } catch (e) {
    return res.status(500).json({ error: `Authentication failed: ${e.message}` });
  }
});
app.post("/api/admin/log", verifyAdmin, async (req, res) => {
  const { action, details } = req.body;
  try {
    await logAdminAction(req.userUid, action, details);
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/register", registrationLimiter, async (req, res) => {
  const { email, password, name, username, telegramUsername } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }
  try {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await authAdmin.getUserByEmail(cleanEmail);
      return res.status(409).json({ error: "An account with this email already exists." });
    } catch (authErr) {
      if (authErr.code !== "auth/user-not-found") {
        throw authErr;
      }
    }
    const newUser = await authAdmin.createUser({
      email: cleanEmail,
      password,
      displayName: name?.trim() || "Admin"
    });
    const userUid = newUser.uid;
    const displayName = name?.trim() || cleanEmail.split("@")[0];
    const displayUsername = username?.trim() || cleanEmail.split("@")[0];
    await setAdminRecord(userUid, {
      userId: userUid,
      name: displayName,
      email: cleanEmail,
      username: displayUsername,
      telegramUsername: telegramUsername?.trim() || "",
      role: "maintainer",
      active: false,
      approvalStatus: "pending",
      isSuperAdmin: false
    });
    await logAdminAction(userUid, "REGISTER_ADMIN", { email: cleanEmail, role: "maintainer", active: false, approvalStatus: "pending" });
    return res.status(200).json({
      success: true,
      uid: userUid,
      isSuperAdmin: false,
      message: "Registration submitted successfully. Awaiting approval."
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    return res.status(500).json({ error: "Registration failed." });
  }
});
app.get("/api/admin/admins", verifySuperAdmin, async (req, res) => {
  try {
    const admins = await getAllAdminRecords();
    return res.status(200).json({ success: true, admins });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/requests", verifySuperAdmin, async (req, res) => {
  try {
    const all = await getAllAdminRecords();
    const requests = all.filter((a) => a.approvalStatus === "pending");
    return res.status(200).json({ success: true, requests });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/approve", verifySuperAdmin, async (req, res) => {
  const { adminId } = req.body;
  if (!adminId) return res.status(400).json({ error: "Admin ID required." });
  try {
    await setAdminRecord(adminId, {
      approvalStatus: "approved",
      active: true
    });
    await logAdminAction(req.userUid, "APPROVE_ADMIN", { adminId });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/reject", verifySuperAdmin, async (req, res) => {
  const { adminId } = req.body;
  if (!adminId) return res.status(400).json({ error: "Admin ID required." });
  try {
    await setAdminRecord(adminId, {
      approvalStatus: "rejected",
      active: false
    });
    await logAdminAction(req.userUid, "REJECT_ADMIN", { adminId });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/deactivate", verifySuperAdmin, async (req, res) => {
  const { adminId } = req.body;
  if (!adminId) return res.status(400).json({ error: "Admin ID required." });
  try {
    await setAdminRecord(adminId, {
      active: false
    });
    await logAdminAction(req.userUid, "DEACTIVATE_ADMIN", { adminId });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/reactivate", verifySuperAdmin, async (req, res) => {
  const { adminId } = req.body;
  if (!adminId) return res.status(400).json({ error: "Admin ID required." });
  try {
    await setAdminRecord(adminId, {
      active: true,
      approvalStatus: "approved"
    });
    await logAdminAction(req.userUid, "REACTIVATE_ADMIN", { adminId });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/delete-admin", verifySuperAdmin, async (req, res) => {
  const { adminId } = req.body;
  if (!adminId) return res.status(400).json({ error: "Admin ID required." });
  try {
    await deleteAdminRecord(adminId);
    if (authAdmin) {
      try {
        await authAdmin.deleteUser(adminId);
      } catch {
      }
    }
    await logAdminAction(req.userUid, "DELETE_ADMIN", { adminId });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/logs", verifySuperAdmin, async (req, res) => {
  try {
    if (db) {
      try {
        const snap = await db.collection("admin_logs").orderBy("timestamp", "desc").limit(100).get();
        if (!snap.empty) {
          const logs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          return res.status(200).json({ success: true, logs });
        }
      } catch {
      }
    }
    return res.status(200).json({ success: true, logs: memoryLogs });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/roms", verifyAdmin, async (req, res) => {
  try {
    const romData = req.body;
    const romId = romData.id || `rom-${Date.now()}`;
    const existing = await getRomRecord(romId);
    const isSuper = req.isSuperAdmin;
    if (!isSuper) {
      if (existing) {
        if (existing.maintainerId !== req.userUid) {
          return res.status(403).json({ error: "You can only modify your own ROMs." });
        }
      }
      if (romData.status === "published") {
        return res.status(403).json({ error: "Maintainers cannot publish ROMs directly. Submit for review instead." });
      }
      romData.maintainerId = req.userUid;
    } else {
      if (!romData.maintainerId) {
        romData.maintainerId = req.userUid;
      }
    }
    const payload = {
      ...romData,
      createdAt: existing ? existing.createdAt : romData.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    await setRomRecord(romId, payload);
    await logAdminAction(req.userUid, existing ? "UPDATE_ROM" : "CREATE_ROM", { romId, name: romData.name });
    return res.status(200).json({ success: true, id: romId });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.delete("/api/admin/roms/:id", verifyAdmin, async (req, res) => {
  try {
    const romId = req.params.id;
    const existing = await getRomRecord(romId);
    if (!existing) {
      return res.status(404).json({ error: "ROM not found" });
    }
    const isSuper = req.isSuperAdmin;
    if (!isSuper) {
      if (existing.maintainerId !== req.userUid) {
        return res.status(403).json({ error: "You can only delete your own ROMs." });
      }
      if (existing.status !== "draft") {
        return res.status(403).json({ error: "Maintainers can only delete draft ROMs." });
      }
    }
    await deleteRomRecord(romId);
    await logAdminAction(req.userUid, "DELETE_ROM", { romId });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
var index_default = app;
export {
  index_default as default
};
