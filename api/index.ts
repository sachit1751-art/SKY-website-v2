import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// Force JSON content type for all /api routes to prevent HTML/text parsing errors
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Initialize Supabase Server Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const isValidKey = (key: string) => {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return false;
  if (trimmed === supabaseUrl) return false;
  return trimmed.length >= 10;
};

if (!supabaseUrl || !isValidKey(supabaseServiceKey)) {
  console.warn('[Supabase Server] Valid Supabase credentials are not fully configured.');
}

let _supabaseAdminInstance: any = null;

const getSupabaseAdmin = () => {
  if (!_supabaseAdminInstance) {
    if (!supabaseUrl || !isValidKey(supabaseServiceKey) || !supabaseUrl.startsWith('http')) {
      return new Proxy({}, {
        get: (target, prop) => {
          if (prop === 'auth') {
            return {
              getUser: async () => ({ data: { user: null }, error: new Error('Supabase service key is not configured.') }),
              admin: {
                createUser: async () => ({ data: null, error: new Error('Supabase service key is not configured.') }),
                deleteUser: async () => ({ error: new Error('Supabase service key is not configured.') }),
              }
            };
          }
          return () => {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null, error: new Error('Supabase service key is not configured.') }),
                  single: async () => ({ data: null, error: new Error('Supabase service key is not configured.') }),
                  order: () => ({
                    limit: async () => ({ data: [], error: new Error('Supabase service key is not configured.') }),
                  }),
                }),
                order: () => ({
                  limit: async () => ({ data: [], error: new Error('Supabase service key is not configured.') }),
                }),
              }),
              insert: async () => ({ data: null, error: new Error('Supabase service key is not configured.') }),
              upsert: () => ({
                select: () => ({
                  single: async () => ({ data: null, error: new Error('Supabase service key is not configured.') }),
                })
              }),
              delete: () => ({
                eq: async () => ({ error: new Error('Supabase service key is not configured.') })
              }),
            };
          };
        }
      });
    }
    _supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey.trim(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdminInstance;
};

const supabaseAdmin = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseAdmin();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as any;

// Database and Client Mapping Helpers
function mapAdminToClient(data: any) {
  if (!data) return null;
  return {
    id: data.id,
    userId: data.id,
    email: data.email,
    name: data.name,
    displayName: data.display_name,
    username: data.username,
    role: data.role,
    active: data.active,
    approvalStatus: data.approval_status,
    isSuperAdmin: data.is_super_admin || data.role === 'superadmin',
    bio: data.bio,
    avatarUrl: data.avatar_url,
    githubUrl: data.github_url,
    telegramUrl: data.telegram_url,
    telegramUsername: data.telegram_username,
    websiteUrl: data.website_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapAdminToDb(data: any) {
  if (!data) return null;
  const dbData: any = {};
  if (data.id !== undefined) dbData.id = data.id;
  if (data.userId !== undefined) dbData.id = data.userId;
  if (data.email !== undefined) dbData.email = data.email;
  if (data.name !== undefined) dbData.name = data.name;
  if (data.displayName !== undefined) dbData.display_name = data.displayName;
  if (data.username !== undefined) dbData.username = data.username;
  if (data.role !== undefined) dbData.role = data.role;
  if (data.active !== undefined) dbData.active = data.active;
  if (data.approvalStatus !== undefined) dbData.approval_status = data.approvalStatus;
  if (data.isSuperAdmin !== undefined) dbData.is_super_admin = data.isSuperAdmin;
  if (data.bio !== undefined) dbData.bio = data.bio;
  if (data.avatarUrl !== undefined) dbData.avatar_url = data.avatarUrl;
  if (data.githubUrl !== undefined) dbData.github_url = data.githubUrl;
  if (data.telegramUrl !== undefined) dbData.telegram_url = data.telegramUrl;
  if (data.telegramUsername !== undefined) dbData.telegram_username = data.telegramUsername;
  if (data.websiteUrl !== undefined) dbData.website_url = data.websiteUrl;
  return dbData;
}

function mapRomToClient(data: any) {
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    title: data.title,
    version: data.version,
    androidVersion: data.android_version,
    status: data.status,
    maintainer: data.maintainer,
    maintainerUrl: data.maintainer_url,
    maintainerHandle: data.maintainer_handle,
    maintainerId: data.maintainer_id,
    url: data.url,
    description: data.description,
    changelog: data.changelog,
    isPinned: data.is_pinned,
    logoUrl: data.logo_url,
    extraLinks: data.extra_links,
    downloadCount: data.download_count,
    stabilityTrends: data.stability_trends,
    batteryEfficiency: data.battery_efficiency,
    screenshots: data.screenshots,
    device: data.device,
    variant: data.variant,
    sourceUrl: data.source_url,
    communityUrl: data.community_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapRomToDb(data: any) {
  if (!data) return null;
  const dbData: any = {};
  if (data.id !== undefined) dbData.id = data.id;
  if (data.name !== undefined) dbData.name = data.name;
  if (data.title !== undefined) dbData.title = data.title;
  if (data.version !== undefined) dbData.version = data.version;
  if (data.androidVersion !== undefined) dbData.android_version = data.androidVersion;
  if (data.status !== undefined) dbData.status = data.status;
  if (data.maintainer !== undefined) dbData.maintainer = data.maintainer;
  if (data.maintainerUrl !== undefined) dbData.maintainer_url = data.maintainerUrl;
  if (data.maintainerHandle !== undefined) dbData.maintainer_handle = data.maintainerHandle;
  if (data.maintainerId !== undefined) dbData.maintainer_id = data.maintainerId;
  if (data.url !== undefined) dbData.url = data.url;
  if (data.description !== undefined) dbData.description = data.description;
  if (data.changelog !== undefined) dbData.changelog = data.changelog;
  if (data.isPinned !== undefined) dbData.is_pinned = data.isPinned;
  if (data.logoUrl !== undefined) dbData.logo_url = data.logoUrl;
  if (data.extraLinks !== undefined) dbData.extra_links = data.extraLinks;
  if (data.downloadCount !== undefined) dbData.download_count = data.downloadCount;
  if (data.stabilityTrends !== undefined) dbData.stability_trends = data.stabilityTrends;
  if (data.batteryEfficiency !== undefined) dbData.battery_efficiency = data.batteryEfficiency;
  if (data.screenshots !== undefined) dbData.screenshots = data.screenshots;
  if (data.device !== undefined) dbData.device = data.device;
  if (data.variant !== undefined) dbData.variant = data.variant;
  if (data.sourceUrl !== undefined) dbData.source_url = data.sourceUrl;
  if (data.communityUrl !== undefined) dbData.community_url = data.communityUrl;
  if (data.createdAt !== undefined) dbData.created_at = data.createdAt;
  if (data.updatedAt !== undefined) dbData.updated_at = data.updatedAt;
  return dbData;
}

// Helper to validate if a string is a standard UUID
function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

// Database query helpers for ROMs
// Persists or updates a ROM record in the Supabase 'roms' table
async function setRomRecord(romId: string, data: any) {
  // Resolve or generate a valid UUID identifier
  let targetId = isValidUUID(romId) ? romId.trim() : undefined;

  // If provided ID is not a UUID, check if a ROM with this name already exists in Supabase
  if (!targetId && data.name) {
    const existingByName = await getRomRecord(data.name);
    if (existingByName && existingByName.id && isValidUUID(existingByName.id)) {
      targetId = existingByName.id;
    }
  }

  // Generate a new UUID if none exists
  if (!targetId) {
    targetId = crypto.randomUUID();
  }

  const existing = await getRomRecord(targetId);
  const dbPayload = mapRomToDb(data);
  dbPayload.id = targetId;
  dbPayload.updated_at = new Date().toISOString();
  
  if (existing && existing.createdAt) {
    dbPayload.created_at = existing.createdAt;
  } else if (data.createdAt) {
    dbPayload.created_at = data.createdAt;
  } else if (!dbPayload.created_at) {
    dbPayload.created_at = new Date().toISOString();
  }

  // Perform upsert into Supabase PostgreSQL 'roms' table
  const { data: upsertedData, error } = await supabaseAdmin
    .from('roms')
    .upsert(dbPayload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase setRomRecord Error]:', error.message);
    throw error;
  }
  return mapRomToClient(upsertedData);
}

// Retrieves a single ROM record from Supabase by UUID or Name
async function getRomRecord(romIdOrName: string) {
  if (!romIdOrName) return null;
  const clean = romIdOrName.trim();

  // If query is a valid UUID, search by ID first
  if (isValidUUID(clean)) {
    const { data, error } = await supabaseAdmin
      .from('roms')
      .select('*')
      .eq('id', clean)
      .maybeSingle();

    if (!error && data) {
      return mapRomToClient(data);
    }
  }

  // Fallback search by ROM Name in Supabase
  const { data, error } = await supabaseAdmin
    .from('roms')
    .select('*')
    .ilike('name', clean)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase getRomRecord by Name]:', error.message);
    return null;
  }
  return mapRomToClient(data);
}

// Retrieves all ROM records from Supabase
async function getAllRomRecords() {
  const { data, error } = await supabaseAdmin
    .from('roms')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRomToClient);
}

// Deletes a ROM record from Supabase by UUID or Name
async function deleteRomRecord(romIdOrName: string) {
  if (!romIdOrName) return;
  let targetId = romIdOrName.trim();

  if (!isValidUUID(targetId)) {
    const existing = await getRomRecord(romIdOrName);
    if (existing && existing.id) {
      targetId = existing.id;
    } else {
      return; // Record not in Supabase database
    }
  }

  const { error } = await supabaseAdmin
    .from('roms')
    .delete()
    .eq('id', targetId);
  if (error) throw error;
}

// In-memory feedback fallback cache
const memoryFeedbackStore: any[] = [
  {
    id: 'fb-sample-1',
    type: 'feature',
    category: 'roms',
    title: 'Add official RisingOS Android 15 v6.2 release',
    description: 'The maintainer has released a new official build on Telegram with fastboot recovery support.',
    contact: '@sky_tester',
    deviceInfo: { screenSize: '1920x1080', platform: 'Linux x86_64' },
    status: 'resolved',
    adminResponse: 'Added to catalog in latest update.',
    upvotes: 18,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'fb-sample-2',
    type: 'bug',
    category: 'device_info',
    title: 'Update Snapdragon 4 Gen 2 clock speeds',
    description: 'CPU clock speed is 2x 2.20GHz Cortex-A78 and 6x 1.95GHz Cortex-A55.',
    contact: 'contributor@poco.org',
    deviceInfo: { screenSize: '390x844', platform: 'Android' },
    status: 'resolved',
    adminResponse: 'Corrected in device specs.',
    upvotes: 9,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fb-sample-3',
    type: 'feature',
    category: 'guide',
    title: 'Provide Magisk root and KernelSU flashing matrix table',
    description: 'A comparison table of KernelSU vs APatch vs Magisk compatibility for HyperOS 2.0 kernels.',
    contact: 't.me/sky_root',
    deviceInfo: { screenSize: '412x915', platform: 'Android' },
    status: 'in_progress',
    adminResponse: 'Work in progress by team documentation contributors.',
    upvotes: 24,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

function mapFeedbackToClient(data: any) {
  if (!data) return null;
  return {
    id: data.id,
    type: data.type || 'general',
    category: data.category || 'general',
    title: data.title || '',
    description: data.description || '',
    contact: data.contact || null,
    deviceInfo: data.device_info || data.deviceInfo || null,
    status: data.status || 'pending',
    adminResponse: data.admin_response || data.adminResponse || null,
    upvotes: typeof data.upvotes === 'number' ? data.upvotes : (typeof data.upvote_count === 'number' ? data.upvote_count : 0),
    ip: data.ip || null,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
  };
}

function mapFeedbackToDb(data: any) {
  if (!data) return null;
  return {
    id: data.id,
    type: data.type,
    category: data.category,
    title: data.title,
    description: data.description,
    contact: data.contact,
    device_info: data.deviceInfo || data.device_info,
    status: data.status || 'pending',
    admin_response: data.adminResponse || data.admin_response,
    upvotes: typeof data.upvotes === 'number' ? data.upvotes : 0,
    created_at: data.createdAt || data.created_at || new Date().toISOString(),
    updated_at: data.updatedAt || data.updated_at || new Date().toISOString(),
  };
}

async function getAllFeedbackRecords() {
  try {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const dbRecords = data.map(mapFeedbackToClient);
      // Merge with any memory entries not yet in DB
      const dbIds = new Set(dbRecords.map((r: any) => r.id));
      const unsyncedMemory = memoryFeedbackStore.filter(m => !dbIds.has(m.id));
      return [...dbRecords, ...unsyncedMemory];
    }
  } catch (err) {
    console.warn('[Supabase Feedback Query]:', err);
  }
  return [...memoryFeedbackStore];
}

async function saveFeedbackRecord(entry: any) {
  // 1. Update in-memory store
  const existingIdx = memoryFeedbackStore.findIndex(m => m.id === entry.id);
  const clientEntry = mapFeedbackToClient(entry);
  if (existingIdx >= 0) {
    memoryFeedbackStore[existingIdx] = { ...memoryFeedbackStore[existingIdx], ...clientEntry };
  } else {
    memoryFeedbackStore.unshift(clientEntry);
  }

  // 2. Persist to Supabase
  try {
    const dbPayload = mapFeedbackToDb(entry);
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .upsert(dbPayload)
      .select()
      .maybeSingle();

    if (!error && data) {
      return mapFeedbackToClient(data);
    }
  } catch (err) {
    console.warn('[Supabase Feedback Upsert Notice]:', err);
  }

  return clientEntry;
}

async function deleteFeedbackRecord(id: string) {
  const idx = memoryFeedbackStore.findIndex(m => m.id === id);
  if (idx >= 0) {
    memoryFeedbackStore.splice(idx, 1);
  }
  try {
    await supabaseAdmin
      .from('feedback')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn('[Supabase Feedback Delete Notice]:', err);
  }
}

async function setAdminRecord(uid: string, data: any) {
  // Always merge with the existing record before upserting.
  // Admin actions such as approve/reject/deactivate only modify
  // a subset of fields and must never erase required columns.
  const { data: existingRecord, error: fetchError } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const existingClientRecord = existingRecord
    ? mapAdminToClient(existingRecord)
    : {};

  const mergedData = {
    ...existingClientRecord,
    ...data,
    userId: uid,
    id: uid,
  };

  const dbPayload = mapAdminToDb(mergedData);

  // Preserve the canonical Auth email if the admins record doesn't
  // already contain one. This is required because admins.email is NOT NULL.
  if (!dbPayload.email) {
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(uid);

    if (authError) throw authError;

    const authEmail = authUser.user?.email?.trim().toLowerCase();

    if (!authEmail) {
      throw new Error(
        `Cannot update administrator ${uid}: Supabase Auth user has no email address.`
      );
    }

    dbPayload.email = authEmail;
  }

  dbPayload.id = uid;
  dbPayload.updated_at = new Date().toISOString();

  if (existingRecord) {
    const { data: updatedData, error } = await supabaseAdmin
      .from('admins')
      .update(dbPayload)
      .eq('id', uid)
      .select()
      .single();

    if (error) throw error;
    return mapAdminToClient(updatedData);
  } else {
    const { data: upsertedData, error } = await supabaseAdmin
      .from('admins')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return mapAdminToClient(upsertedData);
  }
}

async function getAdminRecord(uid: string) {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw error;
  return mapAdminToClient(data);
}

async function getAdminRecordByEmail(email: string) {
  const clean = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('email', clean)
    .maybeSingle();
  if (error) throw error;
  return mapAdminToClient(data);
}

async function getAllAdminRecords() {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*');
  if (error) throw error;
  return (data || []).map(mapAdminToClient);
}

async function deleteAdminRecord(uid: string) {
  const { error } = await supabaseAdmin
    .from('admins')
    .delete()
    .eq('id', uid);
  if (error) throw error;
}

async function logAdminAction(adminUid: string, action: string, details: any) {
  await supabaseAdmin.from('admin_logs').insert({
    admin_uid: adminUid,
    action,
    details: details || {}
  });
}

// Superadmin Seeding Triggered on Startup
const INITIAL_SUPERADMIN_UID = 'b847cc2e-74b5-4b1f-bd21-a3c6d717973e';

async function seedInitialSuperadmin() {
  if (!isValidKey(supabaseServiceKey)) {
    return;
  }
  try {
    const { data: existingAdmin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', INITIAL_SUPERADMIN_UID)
      .maybeSingle();

    if (!existingAdmin) {
      console.log(`[Superadmin Seed] Superadmin database record not found. Seeding: ${INITIAL_SUPERADMIN_UID}`);
      
      const payload = {
        id: INITIAL_SUPERADMIN_UID,
        email: 'admin@skyroms.com',
        name: 'Superadmin',
        display_name: 'Superadmin',
        username: 'superadmin',
        role: 'superadmin',
        active: true,
        approval_status: 'approved',
        is_super_admin: true,
      };

      const { error: insertError } = await supabaseAdmin.from('admins').insert(payload);
      if (insertError) {
        console.warn('[Superadmin Seed Error]:', insertError.message);
      } else {
        console.log(`[Superadmin Seed] Successfully seeded superadmin admins record for ${INITIAL_SUPERADMIN_UID}`);
      }
    } else {
      console.log(`[Superadmin Seed] Superadmin record ${INITIAL_SUPERADMIN_UID} is already initialized.`);
    }
  } catch (err: any) {
    console.warn(`[Superadmin Seed Error]: ${err.message}`);
  }
}

// Run superadmin seed on boot
seedInitialSuperadmin().catch(err => console.error('[Startup Seed failure]:', err));

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many registration attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function resolveToken(token: string) {
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') return null;
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token.trim());
    if (error || !user) {
      return null;
    }
    return { uid: user.id, email: user.email?.toLowerCase(), name: user.user_metadata?.name };
  } catch (err: any) {
    return null;
  }
}

async function verifySuperAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed: Invalid or expired token.' });
    }
    
    const admin = await getAdminRecord(user.uid);
    if (!admin || admin.active !== true) {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    if (admin.role === 'superadmin' && admin.active === true && admin.approvalStatus === 'approved') {
      req.userUid = user.uid;
      req.email = user.email;
      req.isSuperAdmin = true;
      req.adminProfile = admin;
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Superadmin privileges required.' });
    }
  } catch (e: any) {
    res.status(500).json({ error: `Server error during authorization: ${e.message}` });
  }
}

async function verifyAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed: Invalid or expired token.' });
    }
    
    const admin = await getAdminRecord(user.uid);
    if (!admin || admin.active !== true || admin.approvalStatus !== 'approved') {
      return res.status(403).json({ error: 'Access denied. Approved administrator privileges required.' });
    }

    const allowedRoles = ['maintainer', 'developer', 'moderator', 'admin', 'superadmin'];
    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ error: 'Access denied. Invalid administrator role.' });
    }

    const isSuper = admin.role === 'superadmin';
    req.userUid = user.uid;
    req.email = user.email;
    req.isSuperAdmin = isSuper;
    req.adminProfile = admin;
    next();
  } catch (e: any) {
    res.status(500).json({ error: `Server error during authorization: ${e.message}` });
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', supabaseConnected: !!supabaseUrl });
});

// Admin routes mapping

// Get Current Admin
app.get('/api/admin/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    const admin = await getAdminRecord(user.uid);

    if (admin) {
      // Validate that the user role belongs to our recognized schema roles (including pending status)
      const allowedRoles = ['pending', 'maintainer', 'developer', 'moderator', 'admin', 'superadmin'];
      if (!allowedRoles.includes(admin.role)) {
        return res.status(403).json({ error: 'Access denied. Invalid administrator role.' });
      }
      return res.status(200).json({ success: true, admin });
    }
    return res.status(404).json({ error: 'Admin profile not found.' });
  } catch (e: any) {
    return res.status(500).json({ error: `Authentication failed: ${e.message}` });
  }
});

// Log Action
app.post('/api/admin/log', verifyAdmin, async (req: any, res) => {
  const { action, details } = req.body;
  try {
    await logAdminAction(req.userUid, action, details);
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Register Admin
app.post('/api/admin/register', registrationLimiter, async (req, res) => {
  const { email, password, name, username, telegramUsername } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Check if record already exists in public.admins
    const existingAdminDoc = await getAdminRecordByEmail(cleanEmail);
    if (existingAdminDoc) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // 2. Register user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: { name: name?.trim() || 'Admin' }
    });

    if (authError || !authData?.user) {
      console.error('[Supabase Auth Admin Error] Failed to create auth user:', authError?.message);
      return res.status(500).json({ error: 'Failed to create user in Auth database: ' + (authError?.message || 'Unknown error') });
    }

    const userUid = authData.user.id;
    const displayName = name?.trim() || cleanEmail.split('@')[0];
    const displayUsername = username?.trim() || cleanEmail.split('@')[0];

    // 3. Create profile record
    await supabaseAdmin.from('profiles').insert({
      id: userUid,
      email: cleanEmail,
      display_name: displayName,
      username: displayUsername
    });

    // 4. Create Admin record in admins table
    // Always force unprivileged defaults for new registrations: role="pending", active=false, approvalStatus="pending", isSuperAdmin=false
    await setAdminRecord(userUid, {
      userId: userUid,
      name: displayName,
      displayName: displayName,
      email: cleanEmail,
      username: displayUsername,
      telegramUsername: telegramUsername?.trim() || '',
      role: 'pending',
      active: false,
      approvalStatus: 'pending',
      isSuperAdmin: false,
    });

    try {
      await logAdminAction(userUid, 'REGISTER_ADMIN', { email: cleanEmail, role: 'pending', active: false, approvalStatus: 'pending' });
    } catch (logErr: any) {
      console.warn('[Admin Log Warning]:', logErr.message);
    }

    return res.status(200).json({
      success: true,
      uid: userUid,
      isSuperAdmin: false,
      message: 'Registration submitted successfully. Awaiting approval.'
    });
  } catch (error: any) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({ error: error.message || 'Registration failed.' });
  }
});

// Get Admins / Requests (Superadmin only)
app.get('/api/admin/admins', verifySuperAdmin, async (req, res) => {
  try {
    const admins = await getAllAdminRecords();
    return res.status(200).json({ success: true, admins });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/requests', verifySuperAdmin, async (req, res) => {
  try {
    const all = await getAllAdminRecords();
    const requests = all.filter((a: any) => a.approvalStatus === 'pending');
    return res.status(200).json({ success: true, requests });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Allowed assignable roles for superadmin approval (superadmin cannot be assigned via normal approval)
const ALLOWED_ASSIGNABLE_ROLES = ['maintainer', 'developer', 'moderator'];

// Approve Admin
app.post('/api/admin/approve', verifySuperAdmin, async (req: any, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  const assignedRole = req.body.role || req.body.assignedRole;

  if (!adminId) return res.status(400).json({ error: 'Admin ID required.' });

  if (!assignedRole || !ALLOWED_ASSIGNABLE_ROLES.includes(assignedRole)) {
    return res.status(400).json({ 
      error: `Invalid or unallowed role '${assignedRole}'. Allowed assignable roles: ${ALLOWED_ASSIGNABLE_ROLES.join(', ')}` 
    });
  }

  try {
    await setAdminRecord(adminId, {
      approvalStatus: 'approved',
      active: true,
      role: assignedRole,
      isSuperAdmin: false,
    });
    await logAdminAction(req.userUid, 'APPROVE_ADMIN', { adminId, role: assignedRole });
    return res.status(200).json({ success: true, message: `Administrator approved successfully with role: ${assignedRole}` });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Reject Admin
app.post('/api/admin/reject', verifySuperAdmin, async (req: any, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId) return res.status(400).json({ error: 'Admin ID required.' });
  try {
    await setAdminRecord(adminId, {
      approvalStatus: 'rejected',
      active: false,
    });
    await logAdminAction(req.userUid, 'REJECT_ADMIN', { adminId });
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Deactivate Admin
app.post('/api/admin/deactivate', verifySuperAdmin, async (req: any, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId) return res.status(400).json({ error: 'Admin ID required.' });
  try {
    await setAdminRecord(adminId, {
      active: false,
    });
    await logAdminAction(req.userUid, 'DEACTIVATE_ADMIN', { adminId });
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Reactivate Admin
app.post('/api/admin/reactivate', verifySuperAdmin, async (req: any, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId) return res.status(400).json({ error: 'Admin ID required.' });
  try {
    await setAdminRecord(adminId, {
      active: true,
      approvalStatus: 'approved',
    });
    await logAdminAction(req.userUid, 'REACTIVATE_ADMIN', { adminId });
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Delete Admin
app.post('/api/admin/delete-admin', verifySuperAdmin, async (req: any, res) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId) return res.status(400).json({ error: 'Admin ID required.' });
  try {
    await deleteAdminRecord(adminId);
    // Delete from auth.users as well
    await supabaseAdmin.auth.admin.deleteUser(adminId);
    await logAdminAction(req.userUid, 'DELETE_ADMIN', { adminId });
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Admin Logs (Superadmin only)
app.get('/api/admin/logs', verifySuperAdmin, async (req, res) => {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    const formattedLogs = (logs || []).map(log => ({
      id: log.id,
      adminUid: log.admin_uid,
      adminEmail: log.admin_email,
      action: log.action,
      details: log.details,
      timestamp: log.created_at
    }));

    return res.status(200).json({ success: true, logs: formattedLogs });
  } catch (e: any) {
    return res.status(500).json({ error: `Failed to fetch logs: ${e.message}` });
  }
});

// Public ROMs API: Retrieve all ROM records from Supabase database
app.get('/api/roms', async (req, res) => {
  try {
    const roms = await getAllRomRecords();
    return res.status(200).json({ success: true, roms });
  } catch (e: any) {
    console.error('[Public Get ROMs Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to fetch ROMs' });
  }
});

// Public single ROM API: Retrieve by ID or Name
app.get('/api/roms/:idOrName', async (req, res) => {
  try {
    const rom = await getRomRecord(req.params.idOrName);
    if (!rom) {
      return res.status(404).json({ error: 'ROM not found' });
    }
    return res.status(200).json({ success: true, rom });
  } catch (e: any) {
    console.error('[Public Get ROM Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to fetch ROM' });
  }
});

// Public feedback endpoint for user bug reports and feature requests
app.post('/api/feedback', async (req, res) => {
  try {
    const { type, title, description, category, contact, deviceInfo } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const feedbackEntry = {
      id: crypto.randomUUID(),
      type: type || 'general',
      category: category || 'general',
      title: String(title).slice(0, 200),
      description: String(description).slice(0, 2000),
      contact: contact ? String(contact).slice(0, 100) : null,
      deviceInfo: deviceInfo || null,
      status: 'pending',
      adminResponse: null,
      upvotes: 1, // Author automatically gives initial upvote
      ip: req.ip || req.headers['x-forwarded-for'] || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`[User Feedback Received]: [${feedbackEntry.type.toUpperCase()}] ${feedbackEntry.title}`, feedbackEntry);

    const saved = await saveFeedbackRecord(feedbackEntry);

    return res.status(200).json({
      success: true,
      id: saved.id,
      feedback: saved,
      message: 'Thank you! Your feedback has been recorded successfully.'
    });
  } catch (e: any) {
    console.error('[Feedback Submission Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to submit feedback' });
  }
});

// Public: Browse community feedback entries for support and upvoting
app.get('/api/feedback', async (req, res) => {
  try {
    const all = await getAllFeedbackRecords();
    // Return sanitized public list (hide IP, protect contact details)
    const publicList = all.map((f: any) => ({
      id: f.id,
      type: f.type,
      category: f.category,
      title: f.title,
      description: f.description,
      status: f.status,
      adminResponse: f.adminResponse,
      upvotes: typeof f.upvotes === 'number' ? f.upvotes : 0,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt
    }));
    return res.status(200).json({ success: true, feedback: publicList });
  } catch (e: any) {
    console.error('[Public Feedback Fetch Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to load feedback entries' });
  }
});

// Public: Upvote or toggle vote on a feedback entry
app.post('/api/feedback/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'upvote' | 'downvote' | 'toggle'
    const all = await getAllFeedbackRecords();
    const existing = all.find((f: any) => f.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Feedback entry not found' });
    }

    const currentVotes = typeof existing.upvotes === 'number' ? existing.upvotes : 0;
    let nextVotes = currentVotes;

    if (action === 'downvote') {
      nextVotes = Math.max(0, currentVotes - 1);
    } else {
      nextVotes = currentVotes + 1;
    }

    const updated = {
      ...existing,
      upvotes: nextVotes,
      updatedAt: new Date().toISOString()
    };

    const saved = await saveFeedbackRecord(updated);

    return res.status(200).json({
      success: true,
      id,
      upvotes: saved.upvotes || nextVotes,
      message: 'Vote recorded successfully'
    });
  } catch (e: any) {
    console.error('[Feedback Upvote Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to process upvote' });
  }
});

// Admin: List all feedback records from Supabase
app.get('/api/admin/feedback', verifyAdmin, async (req: any, res) => {
  try {
    const feedbackList = await getAllFeedbackRecords();
    return res.status(200).json({ success: true, count: feedbackList.length, feedback: feedbackList });
  } catch (e: any) {
    console.error('[Admin Feedback Fetch Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to fetch feedback entries' });
  }
});

// Admin: Update feedback status or response
app.patch('/api/admin/feedback/:id', verifyAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const all = await getAllFeedbackRecords();
    const existing = all.find((f: any) => f.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Feedback record not found.' });
    }

    const updated = {
      ...existing,
      status: status !== undefined ? status : existing.status,
      adminResponse: adminResponse !== undefined ? adminResponse : existing.adminResponse,
      updatedAt: new Date().toISOString()
    };

    const saved = await saveFeedbackRecord(updated);
    await logAdminAction(req.userUid, 'UPDATE_FEEDBACK', { feedbackId: id, status, title: existing.title });

    return res.status(200).json({ success: true, feedback: saved });
  } catch (e: any) {
    console.error('[Admin Feedback Update Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to update feedback entry' });
  }
});

// Admin: Delete feedback record (SUPERADMIN ONLY)
app.delete('/api/admin/feedback/:id', verifyAdmin, async (req: any, res) => {
  try {
    if (req.adminProfile?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Only Superadmins can delete feedback.' });
    }
    const { id } = req.params;
    await deleteFeedbackRecord(id);
    await logAdminAction(req.userUid, 'DELETE_FEEDBACK', { feedbackId: id });
    return res.status(200).json({ success: true, message: 'Feedback entry deleted successfully.' });
  } catch (e: any) {
    console.error('[Admin Feedback Delete Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to delete feedback entry' });
  }
});

// Centralized permission verification function for the authoritative ROM Permission Matrix
function checkRomPermission(adminProfile: any, existingRom: any, incomingData: any): { allowed: boolean; error?: string; mergedData?: any } {
  const role = adminProfile?.role;
  const userId = adminProfile?.id;

  if (adminProfile?.active !== true || adminProfile?.approvalStatus !== 'approved') {
    return { allowed: false, error: 'Access denied. Account is inactive or not approved.' };
  }

  const isSuper = role === 'superadmin';
  const isAdmin = role === 'admin';

  if (isSuper || isAdmin) {
    // Superadmin and legacy Admin have full control over ROMs.
    // If Admin role exists, we treat it with same permissions for ROM editing.
    const merged = {
      ...existingRom,
      ...incomingData,
      id: existingRom?.id || incomingData.id || crypto.randomUUID()
    };
    return { allowed: true, mergedData: merged };
  }

  const isUpdate = !!existingRom;

  if (role === 'maintainer') {
    if (!isUpdate) {
      // Create new ROM:
      // Can create if the existing system permits creation, but forced to assign ownership to self.
      if (incomingData.status === 'published') {
        return { allowed: false, error: 'Unauthorized: Maintainers cannot publish ROMs directly.' };
      }
      if (incomingData.isPinned === true) {
        return { allowed: false, error: 'Unauthorized: Only administrators can pin ROMs.' };
      }
      const newRom = {
        ...incomingData,
        maintainerId: userId,
        downloadCount: 0,
        isPinned: false
      };
      return { allowed: true, mergedData: newRom };
    } else {
      // Edit existing ROM:
      if (existingRom.maintainerId !== userId) {
        return { allowed: false, error: 'Unauthorized: You can only modify your own ROM submissions.' };
      }
      // Cannot change ownership
      if (incomingData.maintainerId && incomingData.maintainerId !== userId) {
        return { allowed: false, error: 'Unauthorized: You cannot change the assigned maintainer.' };
      }
      // Cannot publish directly
      if (incomingData.status === 'published' && existingRom.status !== 'published') {
        return { allowed: false, error: 'Unauthorized: Maintainers cannot publish ROMs directly.' };
      }
      // Cannot modify privileged fields
      if (incomingData.isPinned !== undefined && incomingData.isPinned !== existingRom.isPinned) {
        return { allowed: false, error: 'Unauthorized: Only administrators can modify pinning status.' };
      }
      if (incomingData.downloadCount !== undefined && incomingData.downloadCount !== existingRom.downloadCount) {
        return { allowed: false, error: 'Unauthorized: You cannot modify download counts.' };
      }

      const merged = {
        ...existingRom,
        ...incomingData,
        id: existingRom.id,
        maintainerId: userId, // enforce
        downloadCount: existingRom.downloadCount, // preserve
        isPinned: existingRom.isPinned // preserve
      };
      return { allowed: true, mergedData: merged };
    }
  }

  if (role === 'developer') {
    if (!isUpdate) {
      return { allowed: false, error: 'Unauthorized: Developers do not have ROM creation privileges.' };
    } else {
      // Edit existing ROM:
      if (existingRom.maintainerId !== userId) {
        return { allowed: false, error: 'Unauthorized: You can only modify your own ROM submissions.' };
      }
      // Cannot change ownership
      if (incomingData.maintainerId && incomingData.maintainerId !== userId) {
        return { allowed: false, error: 'Unauthorized: You cannot change the assigned developer.' };
      }
      // Cannot publish directly
      if (incomingData.status === 'published' && existingRom.status !== 'published') {
        return { allowed: false, error: 'Unauthorized: Developers cannot publish ROMs directly.' };
      }
      // Cannot modify privileged fields
      if (incomingData.isPinned !== undefined && incomingData.isPinned !== existingRom.isPinned) {
        return { allowed: false, error: 'Unauthorized: Only administrators can modify pinning status.' };
      }
      if (incomingData.downloadCount !== undefined && incomingData.downloadCount !== existingRom.downloadCount) {
        return { allowed: false, error: 'Unauthorized: You cannot modify download counts.' };
      }

      const merged = {
        ...existingRom,
        ...incomingData,
        id: existingRom.id,
        maintainerId: userId, // enforce
        downloadCount: existingRom.downloadCount, // preserve
        isPinned: existingRom.isPinned // preserve
      };
      return { allowed: true, mergedData: merged };
    }
  }

  if (role === 'moderator') {
    if (!isUpdate) {
      return { allowed: false, error: 'Unauthorized: Moderators do not have ROM creation privileges.' };
    } else {
      // Moderator edits existing ROM:
      // Define forbidden fields that moderators must NOT modify.
      const forbiddenKeys = [
        'id',
        'maintainerId',
        'maintainer',
        'maintainerUrl',
        'maintainerHandle',
        'url',
        'downloadCount',
        'isPinned',
        'createdAt',
        'updatedAt'
      ];

      for (const key of forbiddenKeys) {
        if (incomingData[key] !== undefined && incomingData[key] !== existingRom[key]) {
          return { allowed: false, error: `Unauthorized: Moderators cannot modify the ${key} field.` };
        }
      }

      const merged = {
        ...existingRom,
        ...incomingData,
        id: existingRom.id,
        maintainerId: existingRom.maintainerId,
        maintainer: existingRom.maintainer,
        maintainerUrl: existingRom.maintainerUrl,
        maintainerHandle: existingRom.maintainerHandle,
        url: existingRom.url,
        downloadCount: existingRom.downloadCount,
        isPinned: existingRom.isPinned
      };
      return { allowed: true, mergedData: merged };
    }
  }

  return { allowed: false, error: 'Access denied. Unrecognized or unauthorized role.' };
}

// ROM Management: Create or Edit/Update existing ROMs
// Ensures all updates reflect immediately in the Supabase 'roms' table
app.post('/api/admin/roms', verifyAdmin, async (req: any, res) => {
  try {
    const romData = req.body;
    const incomingId = romData.id;
    
    // Look up existing ROM in Supabase by UUID or Name to preserve metadata
    const existing = incomingId ? await getRomRecord(incomingId) : (romData.name ? await getRomRecord(romData.name) : null);

    // Run authoritative server-side permission check using trusted admin profile from DB
    const check = checkRomPermission(req.adminProfile, existing, romData);
    if (!check.allowed) {
      // Log denied authorization attempts
      try {
        await logAdminAction(req.userUid, 'DENIED_ROM_MUTATION', { 
          romId: incomingId || existing?.id || 'new', 
          requestedAction: existing ? 'UPDATE' : 'CREATE',
          reason: check.error,
          role: req.adminProfile?.role
        });
      } catch (logErr) {
        // Safe fallback if logging has database issues
      }
      return res.status(403).json({ error: check.error || 'Access denied.' });
    }

    const payload = {
      ...check.mergedData,
      createdAt: existing ? existing.createdAt : (romData.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString()
    };

    // Persist changes directly to the Supabase database
    const targetId = existing?.id || incomingId || '';
    const savedRom = await setRomRecord(targetId, payload);
    
    // Record audit entry in admin_logs including action, ROM ID, authenticated user ID, role, and timestamp
    await logAdminAction(req.userUid, existing ? 'UPDATE_ROM' : 'CREATE_ROM', { 
      romId: savedRom?.id || targetId, 
      name: payload.name,
      status: payload.status,
      role: req.adminProfile?.role
    });

    return res.status(200).json({ 
      success: true, 
      id: savedRom?.id || targetId,
      rom: savedRom,
      message: `ROM ${existing ? 'updated' : 'created'} successfully in Supabase database.`
    });
  } catch (e: any) {
    console.error('[Admin Save ROM Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to save ROM to database' });
  }
});

// Delete ROM endpoint with permission check
app.delete('/api/admin/roms/:id', verifyAdmin, async (req: any, res) => {
  try {
    const romId = req.params.id;
    const existing = await getRomRecord(romId);

    if (!existing) {
      return res.status(404).json({ error: 'ROM not found in database' });
    }

    const role = req.adminProfile?.role;
    const isSuper = req.isSuperAdmin;
    const isAdmin = role === 'admin';

    // Perform strict role-based verification for deletion
    if (!isSuper && !isAdmin) {
      if (role === 'maintainer' || role === 'developer') {
        if (existing.maintainerId !== req.userUid) {
          return res.status(403).json({ error: 'You can only delete your own ROMs.' });
        }
        if (existing.status !== 'draft') {
          return res.status(403).json({ error: 'You can only delete draft ROMs.' });
        }
      } else {
        // Moderator or other roles cannot delete ROMs
        // Log denied delete attempt
        try {
          await logAdminAction(req.userUid, 'DENIED_ROM_DELETION', { 
            romId, 
            name: existing.name,
            role
          });
        } catch (logErr) {}
        return res.status(403).json({ error: 'Unauthorized: You do not have permissions to delete ROMs.' });
      }
    }

    // Remove from Supabase database
    await deleteRomRecord(romId);
    await logAdminAction(req.userUid, 'DELETE_ROM', { romId, name: existing.name, role });

    return res.status(200).json({ success: true, message: 'ROM deleted successfully from database.' });
  } catch (e: any) {
    console.error('[Admin Delete ROM Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to delete ROM' });
  }
});

export default app;
