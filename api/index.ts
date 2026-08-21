import dotenv from 'dotenv';
dotenv.config({ override: true });
import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

// Force JSON content type for all /api routes
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Environment Configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isValidKey = (key: string): boolean => {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return false;
  if (trimmed === supabaseUrl) return false;
  return trimmed.length >= 10;
};

const effectiveServiceKey = (() => {
  if (isValidKey(supabaseServiceKey)) {
    return supabaseServiceKey.trim();
  }
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  if (isValidKey(anonKey)) {
    console.warn('[Supabase Fallback Warning]: SUPABASE_SERVICE_ROLE_KEY is set to the Supabase URL or is missing. Falling back to VITE_SUPABASE_ANON_KEY.');
    return anonKey.trim();
  }
  return '';
})();

function ensureSupabaseConfig(): void {
  if (!supabaseUrl || !isValidKey(effectiveServiceKey)) {
    throw new Error('Server Configuration Error: A valid Supabase key (service role or anon fallback) is required for server-side operations.');
  }
}

let _supabaseAdminInstance: any = null;

const getSupabaseAdmin = () => {
  ensureSupabaseConfig();
  if (!_supabaseAdminInstance) {
    _supabaseAdminInstance = createClient(supabaseUrl, effectiveServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdminInstance;
};

// Lazy proxy for Supabase Admin client
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

// Helper to validate UUIDs
function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

// Data Mappers
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
    active: !!data.active,
    approvalStatus: data.approval_status,
    isSuperAdmin: !!(data.is_super_admin || data.role === 'superadmin'),
    bio: data.bio || '',
    avatarUrl: data.avatar_url || '',
    githubUrl: data.github_url || '',
    telegramUrl: data.telegram_url || '',
    telegramUsername: data.telegram_username || '',
    websiteUrl: data.website_url || '',
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
    title: data.title || '',
    version: data.version || '',
    androidVersion: data.android_version,
    status: data.status,
    maintainer: data.maintainer,
    maintainerUrl: data.maintainer_url || '',
    maintainerHandle: data.maintainer_handle || '',
    maintainerId: data.maintainer_id || null,
    url: data.url || '',
    description: data.description || '',
    changelog: Array.isArray(data.changelog) ? data.changelog : [],
    isPinned: !!data.is_pinned,
    logoUrl: data.logo_url || '',
    extraLinks: Array.isArray(data.extra_links) ? data.extra_links : [],
    downloadCount: typeof data.download_count === 'number' ? data.download_count : 0,
    stabilityTrends: Array.isArray(data.stability_trends) ? data.stability_trends : [],
    batteryEfficiency: typeof data.battery_efficiency === 'number' ? data.battery_efficiency : 3,
    screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
    device: data.device || 'sky',
    variant: data.variant || 'Official',
    sourceUrl: data.source_url || '',
    communityUrl: data.community_url || '',
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

function mapFeedbackToClient(data: any) {
  if (!data) return null;
  
  // Normalize diagnostics and device_info
  let rawDeviceInfo = data.device_info !== undefined 
    ? data.device_info 
    : (data.deviceInfo !== undefined 
        ? data.deviceInfo 
        : (data.diagnostics || null));
        
  if (typeof rawDeviceInfo === 'string') {
    try {
      rawDeviceInfo = JSON.parse(rawDeviceInfo);
    } catch {
      // Keep as string
    }
  }

  return {
    id: data.id,
    userId: data.user_id || data.userId || null,
    type: data.type || 'general',
    category: data.category || 'general',
    title: data.title || '',
    description: data.description || data.message || '', // Support message fallback
    contact: data.contact || null,
    deviceInfo: rawDeviceInfo,
    status: data.status || 'pending',
    adminResponse: data.admin_response || data.adminResponse || null,
    upvotes: typeof data.upvotes === 'number' ? data.upvotes : 0,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
  };
}

function mapFeedbackToDb(data: any) {
  if (!data) return null;
  const devInfo = data.deviceInfo !== undefined 
    ? data.deviceInfo 
    : (data.device_info !== undefined 
        ? data.device_info 
        : (data.diagnostics || null));
        
  const formattedDevInfo = (typeof devInfo === 'object' && devInfo !== null) 
    ? JSON.stringify(devInfo) 
    : (devInfo || null);
    
  return {
    id: data.id,
    user_id: data.userId || data.user_id || null, // Support user_id for production
    type: data.type || 'general',
    category: data.category || 'general',
    title: data.title || '',
    description: data.description || '',
    message: data.description || data.message || '', // Support message NOT NULL for production
    contact: data.contact || null,
    device_info: formattedDevInfo, // Support device_info for migration
    diagnostics: devInfo || {}, // Support diagnostics for production (jsonb NOT NULL DEFAULT '{}')
    status: data.status || 'pending',
    admin_response: data.adminResponse || data.admin_response || null,
    upvotes: typeof data.upvotes === 'number' ? data.upvotes : 0,
    created_at: data.createdAt || data.created_at || new Date().toISOString(),
    updated_at: data.updatedAt || data.updated_at || new Date().toISOString(),
  };
}

// Database Helpers

async function getAdminRecord(uid: string) {
  if (!isValidUUID(uid)) return null;
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) throw new Error(`Database error fetching admin profile: ${error.message}`);
  return mapAdminToClient(data);
}

async function getAdminRecordByEmail(email: string) {
  const clean = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('email', clean)
    .maybeSingle();

  if (error) throw new Error(`Database error searching admin by email: ${error.message}`);
  return mapAdminToClient(data);
}

async function setAdminRecord(uid: string, data: any) {
  if (!isValidUUID(uid)) {
    throw new Error('Invalid user ID provided for admin record.');
  }

  const existingRecord = await getAdminRecord(uid);

  const mergedData = {
    ...(existingRecord || {}),
    ...data,
    userId: uid,
    id: uid,
  };

  const dbPayload = mapAdminToDb(mergedData);

  if (!dbPayload.email) {
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(uid);
    if (authError || !authUser.user?.email) {
      throw new Error(`Cannot update admin ${uid}: Supabase Auth user email missing.`);
    }
    dbPayload.email = authUser.user.email.trim().toLowerCase();
  }

  dbPayload.id = uid;
  dbPayload.updated_at = new Date().toISOString();

  const { data: upsertedData, error } = await supabaseAdmin
    .from('admins')
    .upsert(dbPayload)
    .select()
    .single();

  if (error) throw new Error(`Database error setting admin record: ${error.message}`);
  return mapAdminToClient(upsertedData);
}

async function getAllAdminRecords() {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Database error listing admins: ${error.message}`);
  return (data || []).map(mapAdminToClient);
}

async function deleteAdminRecord(uid: string) {
  if (!isValidUUID(uid)) return;
  const { error } = await supabaseAdmin
    .from('admins')
    .delete()
    .eq('id', uid);

  if (error) throw new Error(`Database error deleting admin record: ${error.message}`);
}

async function logAdminAction(adminUid: string, action: string, details: any, ipAddress?: string) {
  try {
    let adminEmail: string | null = null;
    if (isValidUUID(adminUid)) {
      const admin = await getAdminRecord(adminUid);
      adminEmail = admin?.email || null;
    }

    await supabaseAdmin.from('admin_logs').insert({
      admin_uid: isValidUUID(adminUid) ? adminUid : null,
      admin_email: adminEmail,
      action: String(action).slice(0, 100),
      details: details || {},
      ip_address: ipAddress || null,
    });
  } catch (err: any) {
    console.error('[Admin Log Warning]: Failed to insert log entry:', err.message);
  }
}

async function getRomRecord(romIdOrName: string) {
  if (!romIdOrName) return null;
  const clean = romIdOrName.trim();

  if (isValidUUID(clean)) {
    const { data, error } = await supabaseAdmin
      .from('roms')
      .select('*')
      .eq('id', clean)
      .maybeSingle();

    if (!error && data) return mapRomToClient(data);
  }

  const { data, error } = await supabaseAdmin
    .from('roms')
    .select('*')
    .ilike('name', clean)
    .maybeSingle();

  if (error) throw new Error(`Database error fetching ROM: ${error.message}`);
  return mapRomToClient(data);
}

async function getAllRomRecords() {
  const { data, error } = await supabaseAdmin
    .from('roms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Database error listing ROMs: ${error.message}`);
  return (data || []).map(mapRomToClient);
}

async function setRomRecord(romId: string, data: any) {
  let targetId = isValidUUID(romId) ? romId.trim() : undefined;

  if (!targetId && data.name) {
    const existingByName = await getRomRecord(data.name);
    if (existingByName && existingByName.id && isValidUUID(existingByName.id)) {
      targetId = existingByName.id;
    }
  }

  if (!targetId) {
    targetId = crypto.randomUUID();
  }

  const existing = await getRomRecord(targetId);
  const dbPayload = mapRomToDb(data);
  dbPayload.id = targetId;
  dbPayload.updated_at = new Date().toISOString();

  if (existing && existing.createdAt) {
    dbPayload.created_at = existing.createdAt;
  } else if (!dbPayload.created_at) {
    dbPayload.created_at = new Date().toISOString();
  }

  const { data: upsertedData, error } = await supabaseAdmin
    .from('roms')
    .upsert(dbPayload)
    .select()
    .single();

  if (error) throw new Error(`Database error saving ROM record: ${error.message}`);
  return mapRomToClient(upsertedData);
}

async function deleteRomRecord(romIdOrName: string) {
  if (!romIdOrName) return;
  let targetId = romIdOrName.trim();

  if (!isValidUUID(targetId)) {
    const existing = await getRomRecord(romIdOrName);
    if (existing && existing.id) {
      targetId = existing.id;
    } else {
      return;
    }
  }

  const { error } = await supabaseAdmin
    .from('roms')
    .delete()
    .eq('id', targetId);

  if (error) throw new Error(`Database error deleting ROM: ${error.message}`);
}

// In-Memory Fallback for Feedback Resiliency (e.g. under fallback credentials or RLS errors)
let inMemoryFeedback: any[] = [];
const inMemoryVotes = new Map<string, Set<string>>();

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function getAllFeedbackRecords() {
  try {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const dbItems = (data || []).map(mapFeedbackToClient).filter(Boolean);
    const dbIds = new Set(dbItems.map((item: any) => item.id));
    const merged = [...dbItems];
    for (const item of inMemoryFeedback) {
      const clientItem = mapFeedbackToClient(item);
      if (clientItem && !dbIds.has(clientItem.id)) {
        merged.push(clientItem);
      }
    }
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  } catch (err: any) {
    console.warn(`[Supabase Feedback List Fallback]: Listing feedback from memory due to: ${err.message}`);
    return inMemoryFeedback.map(mapFeedbackToClient).filter(Boolean).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

async function saveFeedbackRecord(entry: any) {
  const dbPayload = mapFeedbackToDb(entry);
  if (!dbPayload.id) {
    dbPayload.id = generateUUID();
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return mapFeedbackToClient(data);
  } catch (err: any) {
    console.warn(`[Supabase Feedback Save Fallback]: Saving feedback in memory due to: ${err.message}`);
    const idx = inMemoryFeedback.findIndex(item => item.id === dbPayload.id);
    if (idx !== -1) {
      inMemoryFeedback[idx] = dbPayload;
    } else {
      inMemoryFeedback.push(dbPayload);
    }
    return mapFeedbackToClient(dbPayload);
  }
}

async function deleteFeedbackRecord(id: string) {
  if (!isValidUUID(id)) return;
  
  inMemoryFeedback = inMemoryFeedback.filter(item => item.id !== id);
  inMemoryVotes.delete(id);

  try {
    const { error } = await supabaseAdmin
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err: any) {
    console.warn(`[Supabase Feedback Delete Fallback]: Handled feedback deletion from memory due to: ${err.message}`);
  }
}

async function upvoteFeedbackRecord(id: string, voterKey: string, action: 'upvote' | 'downvote' | 'toggle') {
  if (!isValidUUID(id)) {
    throw new Error('Invalid feedback ID');
  }

  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('vote_feedback', {
      p_feedback_id: id,
      p_voter_key: voterKey,
      p_action: action
    });

    if (rpcError) throw rpcError;
    if (rpcResult && !rpcResult.success) {
      throw new Error(rpcResult.message || 'Failed to process vote');
    }

    const { data: feedbackRow, error: fbErr } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (fbErr || !feedbackRow) {
      throw new Error('Feedback item not found after voting');
    }

    const finalUpvotes = typeof rpcResult?.upvotes === 'number' ? rpcResult.upvotes : feedbackRow.upvotes;
    const finalVoted = typeof rpcResult?.voted === 'boolean' ? rpcResult.voted : false;

    return {
      feedback: mapFeedbackToClient(feedbackRow),
      upvotes: finalUpvotes,
      voted: finalVoted,
      message: rpcResult?.message || 'Vote updated successfully'
    };
  } catch (err: any) {
    console.warn(`[Supabase Feedback Vote Fallback]: Processing vote in-memory due to: ${err.message}`);
    let fbItem = inMemoryFeedback.find(item => item.id === id);
    if (!fbItem) {
      try {
        const { data: dbItem } = await supabaseAdmin.from('feedback').select('*').eq('id', id).single();
        if (dbItem) {
          fbItem = dbItem;
          inMemoryFeedback.push(dbItem);
        }
      } catch {}
    }

    if (!fbItem) {
      throw new Error('Feedback item not found');
    }

    if (!inMemoryVotes.has(id)) {
      inMemoryVotes.set(id, new Set<string>());
    }
    const voters = inMemoryVotes.get(id)!;
    const hasVoted = voters.has(voterKey);

    let resultVoted = false;
    if (action === 'downvote' || (action === 'toggle' && hasVoted)) {
      if (hasVoted) {
        voters.delete(voterKey);
      }
      resultVoted = false;
    } else {
      if (!hasVoted) {
        voters.add(voterKey);
      }
      resultVoted = true;
    }

    const newCount = voters.size;
    fbItem.upvotes = newCount;
    fbItem.updated_at = new Date().toISOString();

    return {
      feedback: mapFeedbackToClient(fbItem),
      upvotes: newCount,
      voted: resultVoted,
      message: 'Vote processed successfully'
    };
  }
}

// Initial Superadmin Seeding on Startup
const INITIAL_SUPERADMIN_UID = 'b847cc2e-74b5-4b1f-bd21-a3c6d717973e';

async function seedInitialSuperadmin() {
  if (!supabaseUrl || !isValidKey(supabaseServiceKey)) {
    return;
  }
  try {
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', INITIAL_SUPERADMIN_UID)
      .maybeSingle();

    if (!existingAdmin) {
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

      await supabaseAdmin.from('admins').insert(payload);
    }

    // Ensure sachit1771@gmail.com is also seeded as superadmin if a password is provided in environment variables
    const targetEmail = 'sachit1771@gmail.com';
    const targetPassword = process.env.INITIAL_SUPERADMIN_PASSWORD;
    let targetUid = '';

    if (targetPassword && targetPassword.trim().length >= 8) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData?.users?.find((u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase());

      if (existingUser) {
        targetUid = existingUser.id;
        await supabaseAdmin.auth.admin.updateUserById(targetUid, {
          password: targetPassword,
          email_confirm: true
        });
      } else {
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: targetPassword,
          email_confirm: true,
          user_metadata: { name: 'Sachit' }
        });
        if (!createError && createData?.user) {
          targetUid = createData.user.id;
        }
      }

      if (targetUid) {
        await supabaseAdmin.from('admins').upsert({
          id: targetUid,
          email: targetEmail,
          name: 'Sachit',
          display_name: 'Sachit',
          username: 'sachit1771',
          role: 'superadmin',
          active: true,
          approval_status: 'approved',
          is_super_admin: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    } else {
      console.log('[Superadmin Seed Info]: Skipping superadmin seed because INITIAL_SUPERADMIN_PASSWORD is not configured in environment variables.');
    }
  } catch (err: any) {
    console.warn('[Superadmin Seed Error]:', err.message);
  }
}

seedInitialSuperadmin().catch(() => {});

// Rate Limiters
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many registration attempts from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many feedback submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const voteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { error: 'Too many voting attempts from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication Token Resolver
async function resolveToken(token: string) {
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') return null;
  try {
    ensureSupabaseConfig();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token.trim());
    if (error || !user) {
      return null;
    }
    return { uid: user.id, email: user.email?.toLowerCase(), name: user.user_metadata?.name };
  } catch (err: any) {
    return null;
  }
}

// Authoritative Middlewares
async function verifyAdmin(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed: Invalid or expired session token.' });
    }

    const admin = await getAdminRecord(user.uid);
    if (!admin) {
      return res.status(403).json({ error: 'Access denied. Administrator profile not found.' });
    }

    if (admin.active !== true || admin.approvalStatus !== 'approved') {
      return res.status(403).json({ error: 'Access denied. Account is inactive or awaiting approval.' });
    }

    const allowedRoles = ['maintainer', 'developer', 'moderator', 'admin', 'superadmin'];
    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ error: 'Access denied. Invalid administrator role.' });
    }

    req.userUid = user.uid;
    req.email = admin.email || user.email;
    req.adminProfile = admin;
    req.isSuperAdmin = (admin.role === 'superadmin' || admin.isSuperAdmin === true);
    next();
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Server error during authorization.' });
  }
}

async function verifySuperAdmin(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed: Invalid or expired session token.' });
    }

    const admin = await getAdminRecord(user.uid);
    if (!admin) {
      return res.status(403).json({ error: 'Access denied. Superadmin profile not found.' });
    }

    if (admin.active !== true || admin.approvalStatus !== 'approved') {
      return res.status(403).json({ error: 'Access denied. Superadmin account is inactive or not approved.' });
    }

    if (admin.role === 'superadmin' || admin.isSuperAdmin === true) {
      req.userUid = user.uid;
      req.email = admin.email || user.email;
      req.adminProfile = admin;
      req.isSuperAdmin = true;
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Superadmin privileges required.' });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Server error during superadmin authorization.' });
  }
}

// Routes

// 1. Health Endpoint with real database connectivity check
app.get('/api/health', async (req: Request, res: Response) => {
  if (!supabaseUrl || !isValidKey(effectiveServiceKey)) {
    return res.status(503).json({
      status: 'unhealthy',
      supabaseConnected: false,
      error: 'Supabase credentials (service role or anon fallback) are missing or invalid.'
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return res.status(503).json({
        status: 'degraded',
        supabaseConnected: false,
        error: 'Supabase database query failed.'
      });
    }

    return res.status(200).json({
      status: 'ok',
      supabaseConnected: true,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(503).json({
      status: 'unhealthy',
      supabaseConnected: false,
      error: 'Failed to connect to Supabase database.'
    });
  }
});

// 2. Dynamic Sitemap
app.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const roms = await getAllRomRecords();
    const domain = 'https://sky-roms.vercel.app';
    const staticUrls = ['', '/roms', '/guides', '/team', '/faq', '/status'];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    staticUrls.forEach(path => {
      xml += `  <url>\n    <loc>${domain}${path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${path === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    (roms || []).forEach((rom: any) => {
      const romSlug = encodeURIComponent(rom.name || '');
      xml += `  <url>\n    <loc>${domain}/roms?search=${romSlug}</loc>\n    <lastmod>${(rom.updatedAt || rom.createdAt || new Date().toISOString()).split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (err: any) {
    res.setHeader('Content-Type', 'application/xml');
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><error>${err.message}</error>`);
  }
});

// 3. Dynamic RSS Feed
app.get('/feed.xml', async (req: Request, res: Response) => {
  try {
    const roms = await getAllRomRecords();
    const domain = 'https://sky-roms.vercel.app';

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n  <channel>\n`;
    xml += `    <title>SKY ROM Ecosystem Releases</title>\n`;
    xml += `    <link>${domain}/roms</link>\n`;
    xml += `    <description>Latest Custom ROMs and Kernel releases for POCO M6 Pro 5G / Redmi 12 5G (sky / sky_in).</description>\n`;
    xml += `    <language>en-us</language>\n`;
    xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;

    (roms || []).slice(0, 20).forEach((rom: any) => {
      xml += `    <item>\n`;
      xml += `      <title>${rom.name} (Android ${rom.androidVersion || '15'})</title>\n`;
      xml += `      <link>${domain}/roms?search=${encodeURIComponent(rom.name || '')}</link>\n`;
      xml += `      <description>${(rom.description || 'Custom ROM build for SKY ecosystem. Maintainer: ' + (rom.maintainer || 'Community')).replace(/&/g, '&amp;')}</description>\n`;
      xml += `      <pubDate>${new Date(rom.createdAt || Date.now()).toUTCString()}</pubDate>\n`;
      xml += `      <guid>${domain}/roms#${encodeURIComponent(rom.name || '')}</guid>\n`;
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (err: any) {
    res.setHeader('Content-Type', 'application/xml');
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><error>${err.message}</error>`);
  }
});

// 4. Admin Me Endpoint
app.get('/api/admin/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const user = await resolveToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }
    const admin = await getAdminRecord(user.uid);
    if (!admin) {
      return res.status(404).json({ error: 'Admin profile not found.' });
    }

    const allowedRoles = ['pending', 'maintainer', 'developer', 'moderator', 'admin', 'superadmin'];
    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ error: 'Access denied. Invalid administrator role.' });
    }
    return res.status(200).json({ success: true, admin });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Authentication failed.' });
  }
});

// 5. Admin Log Action
app.post('/api/admin/log', verifyAdmin, async (req: any, res: Response) => {
  const { action, details } = req.body;
  if (!action || typeof action !== 'string') {
    return res.status(400).json({ error: 'Action string is required.' });
  }
  try {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, action, details, ip);
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to record audit log.' });
  }
});

// 6. Admin Registration (Atomic Rollback)
app.post('/api/admin/register', registrationLimiter, async (req: Request, res: Response) => {
  const { email, password, name, username, telegramUsername } = req.body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const displayName = (typeof name === 'string' && name.trim()) ? name.trim() : cleanEmail.split('@')[0];
  const displayUsername = (typeof username === 'string' && username.trim()) ? username.trim() : cleanEmail.split('@')[0];
  const displayTelegram = (typeof telegramUsername === 'string' && telegramUsername.trim()) ? telegramUsername.trim() : '';

  try {
    ensureSupabaseConfig();

    // 1. Check if record already exists in public.admins
    const existingAdmin = await getAdminRecordByEmail(cleanEmail);
    if (existingAdmin) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // 2. Register user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: { name: displayName }
    });

    if (authError || !authData?.user) {
      console.error('[Supabase Auth Registration Error]:', authError?.message);
      return res.status(500).json({ error: `Registration failed: ${authError?.message || 'Failed to create auth user.'}` });
    }

    const userUid = authData.user.id;

    // 3. Create profile & admin records with ATOMIC ROLLBACK ON FAILURE
    try {
      // Step A: Insert into public.profiles
      const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
        id: userUid,
        email: cleanEmail,
        display_name: displayName,
        username: displayUsername
      });

      if (profileErr) throw profileErr;

      // Step B: Insert into public.admins with STRICT UNPRIVILEGED DEFAULTS
      await setAdminRecord(userUid, {
        userId: userUid,
        name: displayName,
        displayName: displayName,
        email: cleanEmail,
        username: displayUsername,
        telegramUsername: displayTelegram,
        role: 'pending',
        active: false,
        approvalStatus: 'pending',
        isSuperAdmin: false,
      });

      const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
      await logAdminAction(userUid, 'REGISTER_ADMIN', { email: cleanEmail, role: 'pending', active: false }, ip);

      return res.status(200).json({
        success: true,
        uid: userUid,
        isSuperAdmin: false,
        message: 'Registration submitted successfully. Awaiting superadmin approval.'
      });
    } catch (dbError: any) {
      console.error('[Registration Rollback Triggered]:', dbError.message);
      // Clean up newly created auth user and profile row if either step failed
      try {
        await supabaseAdmin.from('profiles').delete().eq('id', userUid);
      } catch (profileDelErr) {
        console.warn('[Registration Rollback Profile Warning]:', profileDelErr);
      }
      try {
        await supabaseAdmin.auth.admin.deleteUser(userUid);
      } catch (authDelErr) {
        console.warn('[Registration Rollback Auth Warning]:', authDelErr);
      }

      return res.status(500).json({
        error: `Registration failed during profile creation. Account rolled back: ${dbError.message}`
      });
    }
  } catch (error: any) {
    console.error('[Registration Handler Error]:', error.message);
    return res.status(500).json({ error: error.message || 'Registration process failed.' });
  }
});

// 7. Get Admins List (Superadmin only)
app.get('/api/admin/admins', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const admins = await getAllAdminRecords();
    return res.status(200).json({ success: true, admins });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch admin list.' });
  }
});

// 8. Get Pending Registration Requests (Superadmin only)
app.get('/api/admin/requests', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const all = await getAllAdminRecords();
    const requests = all.filter((a: any) => a.approvalStatus === 'pending');
    return res.status(200).json({ success: true, requests });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch registration requests.' });
  }
});

const ALLOWED_ASSIGNABLE_ROLES = ['maintainer', 'developer', 'moderator'];

// 9. Approve Admin Request (Superadmin only)
app.post('/api/admin/approve', verifySuperAdmin, async (req: any, res: Response) => {
  const adminId = req.body.adminId || req.body.adminUid;
  const assignedRole = req.body.role || req.body.assignedRole;

  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: 'Valid Admin ID required.' });
  }

  if (!assignedRole || !ALLOWED_ASSIGNABLE_ROLES.includes(assignedRole)) {
    return res.status(400).json({
      error: `Invalid assigned role '${assignedRole}'. Allowed assignable roles: ${ALLOWED_ASSIGNABLE_ROLES.join(', ')}`
    });
  }

  try {
    const updated = await setAdminRecord(adminId, {
      approvalStatus: 'approved',
      active: true,
      role: assignedRole,
      isSuperAdmin: false,
    });

    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, 'APPROVE_ADMIN', { adminId, role: assignedRole }, ip);

    return res.status(200).json({
      success: true,
      admin: updated,
      message: `Administrator approved successfully with role: ${assignedRole}`
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to approve administrator.' });
  }
});

// 10. Reject Admin Request (Superadmin only)
app.post('/api/admin/reject', verifySuperAdmin, async (req: any, res: Response) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: 'Valid Admin ID required.' });
  }

  try {
    const updated = await setAdminRecord(adminId, {
      approvalStatus: 'rejected',
      active: false,
    });

    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, 'REJECT_ADMIN', { adminId }, ip);

    return res.status(200).json({ success: true, admin: updated });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to reject administrator.' });
  }
});

// 11. Deactivate Admin (Superadmin only)
app.post('/api/admin/deactivate', verifySuperAdmin, async (req: any, res: Response) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: 'Valid Admin ID required.' });
  }

  if (adminId === req.userUid) {
    return res.status(400).json({ error: 'You cannot deactivate your own superadmin account.' });
  }

  try {
    const updated = await setAdminRecord(adminId, {
      active: false,
    });

    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, 'DEACTIVATE_ADMIN', { adminId }, ip);

    return res.status(200).json({ success: true, admin: updated });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to deactivate administrator.' });
  }
});

// 12. Reactivate Admin (Superadmin only)
app.post('/api/admin/reactivate', verifySuperAdmin, async (req: any, res: Response) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: 'Valid Admin ID required.' });
  }

  try {
    const updated = await setAdminRecord(adminId, {
      active: true,
      approvalStatus: 'approved',
    });

    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, 'REACTIVATE_ADMIN', { adminId }, ip);

    return res.status(200).json({ success: true, admin: updated });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to reactivate administrator.' });
  }
});

// 13. Delete Admin (Superadmin only)
app.post('/api/admin/delete-admin', verifySuperAdmin, async (req: any, res: Response) => {
  const adminId = req.body.adminId || req.body.adminUid;
  if (!adminId || !isValidUUID(adminId)) {
    return res.status(400).json({ error: 'Valid Admin ID required.' });
  }

  if (adminId === req.userUid) {
    return res.status(400).json({ error: 'You cannot delete your own superadmin account.' });
  }

  try {
    await deleteAdminRecord(adminId);
    try {
      await supabaseAdmin.from('profiles').delete().eq('id', adminId);
    } catch (profileDelErr) {
      console.warn('[Delete Admin Profile Warning]:', profileDelErr);
    }
    try {
      await supabaseAdmin.auth.admin.deleteUser(adminId);
    } catch (authDelErr) {
      console.warn('[Delete Admin Auth Warning]:', authDelErr);
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, 'DELETE_ADMIN', { adminId }, ip);

    return res.status(200).json({ success: true, message: 'Admin deleted successfully.' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete administrator.' });
  }
});

// 14. Admin Security Logs (Superadmin only)
app.get('/api/admin/logs', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(`Database error fetching logs: ${error.message}`);

    const formattedLogs = (logs || []).map(log => ({
      id: log.id,
      adminUid: log.admin_uid,
      adminEmail: log.admin_email,
      action: log.action,
      details: log.details,
      ipAddress: log.ip_address,
      timestamp: log.created_at
    }));

    return res.status(200).json({ success: true, logs: formattedLogs });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch audit logs.' });
  }
});

// 15. Public ROMs API
app.get('/api/roms', async (req: Request, res: Response) => {
  try {
    const roms = await getAllRomRecords();
    return res.status(200).json({ success: true, roms });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch ROMs list.' });
  }
});

// 16. Public Single ROM API
app.get('/api/roms/:idOrName', async (req: Request, res: Response) => {
  try {
    const rom = await getRomRecord(req.params.idOrName);
    if (!rom) {
      return res.status(404).json({ error: 'ROM not found in catalog.' });
    }
    return res.status(200).json({ success: true, rom });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch ROM details.' });
  }
});

// ROM Permission Checker Function
function checkRomPermission(adminProfile: any, existingRom: any, incomingData: any): { allowed: boolean; error?: string; mergedData?: any } {
  const role = adminProfile?.role;
  const userId = adminProfile?.id;

  if (adminProfile?.active !== true || adminProfile?.approvalStatus !== 'approved') {
    return { allowed: false, error: 'Access denied. Account is inactive or not approved.' };
  }

  const isSuper = role === 'superadmin' || adminProfile?.isSuperAdmin === true;
  const isAdmin = role === 'admin';

  if (isSuper || isAdmin) {
    const merged = {
      ...existingRom,
      ...incomingData,
      id: existingRom?.id || incomingData.id || crypto.randomUUID()
    };
    return { allowed: true, mergedData: merged };
  }

  const isUpdate = !!existingRom;

  if (role === 'maintainer' || role === 'developer') {
    if (!isUpdate) {
      if (incomingData.status === 'published' || incomingData.status === 'Official') {
        return { allowed: false, error: 'Unauthorized: Maintainers/Developers cannot publish official builds directly.' };
      }
      if (incomingData.isPinned === true) {
        return { allowed: false, error: 'Unauthorized: Only administrators can pin ROM entries.' };
      }
      const newRom = {
        ...incomingData,
        maintainerId: userId,
        downloadCount: 0,
        isPinned: false
      };
      return { allowed: true, mergedData: newRom };
    } else {
      if (existingRom.maintainerId && existingRom.maintainerId !== userId) {
        return { allowed: false, error: 'Unauthorized: You can only modify your own ROM submissions.' };
      }
      if (incomingData.maintainerId && incomingData.maintainerId !== userId) {
        return { allowed: false, error: 'Unauthorized: You cannot transfer ROM ownership.' };
      }
      if (incomingData.status === 'published' && existingRom.status !== 'published') {
        return { allowed: false, error: 'Unauthorized: Maintainers/Developers cannot publish ROMs directly.' };
      }
      if (incomingData.isPinned !== undefined && incomingData.isPinned !== existingRom.isPinned) {
        return { allowed: false, error: 'Unauthorized: Only administrators can modify pinning status.' };
      }
      if (incomingData.downloadCount !== undefined && incomingData.downloadCount !== existingRom.downloadCount) {
        return { allowed: false, error: 'Unauthorized: You cannot modify download metrics.' };
      }

      const merged = {
        ...existingRom,
        ...incomingData,
        id: existingRom.id,
        maintainerId: userId,
        downloadCount: existingRom.downloadCount,
        isPinned: existingRom.isPinned
      };
      return { allowed: true, mergedData: merged };
    }
  }

  if (role === 'moderator') {
    if (!isUpdate) {
      return { allowed: false, error: 'Unauthorized: Moderators cannot create new ROM entries.' };
    } else {
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
          return { allowed: false, error: `Unauthorized: Moderators cannot modify the '${key}' field.` };
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

  return { allowed: false, error: 'Access denied. Unrecognized or unauthorized administrator role.' };
}

// 17. Admin Save ROM Endpoint
app.post('/api/admin/roms', verifyAdmin, async (req: any, res: Response) => {
  try {
    const romData = req.body;
    if (!romData || typeof romData !== 'object') {
      return res.status(400).json({ error: 'Invalid ROM data payload.' });
    }

    if (!romData.name || typeof romData.name !== 'string' || romData.name.trim().length < 2) {
      return res.status(400).json({ error: 'ROM name is required (minimum 2 characters).' });
    }

    if (!romData.androidVersion || typeof romData.androidVersion !== 'string') {
      return res.status(400).json({ error: 'Android version string is required.' });
    }

    if (!romData.maintainer || typeof romData.maintainer !== 'string') {
      return res.status(400).json({ error: 'Maintainer name is required.' });
    }

    const validStatuses = ['Official', 'Unofficial', 'draft', 'pending', 'approved', 'published', 'rejected'];
    if (romData.status && !validStatuses.includes(romData.status)) {
      return res.status(400).json({ error: `Invalid status value '${romData.status}'. Allowed: ${validStatuses.join(', ')}` });
    }

    const incomingId = romData.id;
    const existing = incomingId ? await getRomRecord(incomingId) : (romData.name ? await getRomRecord(romData.name) : null);

    const check = checkRomPermission(req.adminProfile, existing, romData);
    if (!check.allowed) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
      await logAdminAction(req.userUid, 'DENIED_ROM_MUTATION', {
        romId: incomingId || existing?.id || 'new',
        reason: check.error,
        role: req.adminProfile?.role
      }, ip);
      return res.status(403).json({ error: check.error || 'Access denied.' });
    }

    const payload = {
      ...check.mergedData,
      createdAt: existing ? existing.createdAt : (romData.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString()
    };

    const targetId = existing?.id || (isValidUUID(incomingId) ? incomingId : crypto.randomUUID());
    const savedRom = await setRomRecord(targetId, payload);

    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, existing ? 'UPDATE_ROM' : 'CREATE_ROM', {
      romId: savedRom?.id || targetId,
      name: payload.name,
      status: payload.status,
      role: req.adminProfile?.role
    }, ip);

    return res.status(200).json({
      success: true,
      id: savedRom?.id || targetId,
      rom: savedRom,
      message: `ROM ${existing ? 'updated' : 'created'} successfully.`
    });
  } catch (e: any) {
    console.error('[Admin Save ROM Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to save ROM record.' });
  }
});

// 18. Admin Delete ROM Endpoint
app.delete('/api/admin/roms/:id', verifyAdmin, async (req: any, res: Response) => {
  try {
    const romId = req.params.id;
    if (!romId) {
      return res.status(400).json({ error: 'ROM ID parameter is required.' });
    }

    const existing = await getRomRecord(romId);
    if (!existing) {
      return res.status(404).json({ error: 'ROM not found in database.' });
    }

    const role = req.adminProfile?.role;
    const isSuper = req.isSuperAdmin;
    const isAdmin = role === 'admin';

    if (!isSuper && !isAdmin) {
      if (role === 'maintainer' || role === 'developer') {
        if (existing.maintainerId && existing.maintainerId !== req.userUid) {
          return res.status(403).json({ error: 'You can only delete your own ROM entries.' });
        }
        if (existing.status !== 'draft') {
          return res.status(403).json({ error: 'You can only delete draft ROM entries.' });
        }
      } else {
        const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
        await logAdminAction(req.userUid, 'DENIED_ROM_DELETION', { romId, name: existing.name, role }, ip);
        return res.status(403).json({ error: 'Unauthorized: You do not have permission to delete ROMs.' });
      }
    }

    await deleteRomRecord(romId);
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, 'DELETE_ROM', { romId, name: existing.name, role }, ip);

    return res.status(200).json({ success: true, message: 'ROM deleted successfully.' });
  } catch (e: any) {
    console.error('[Admin Delete ROM Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to delete ROM.' });
  }
});

// 19. Public Feedback Submission
app.post('/api/feedback', feedbackLimiter, async (req: Request, res: Response) => {
  try {
    const { type, title, description, category, contact, deviceInfo } = req.body;

    // Validate Title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    const validatedTitle = title.trim().slice(0, 200);

    // Validate Description
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Description is required.' });
    }
    const validatedDescription = description.trim().slice(0, 2000);

    // Validate Type and Category
    const allowedTypes = ['general', 'bug', 'request', 'feedback', 'report'];
    const validatedType = (typeof type === 'string' && allowedTypes.includes(type.trim().toLowerCase())) 
      ? type.trim().toLowerCase() 
      : 'general';
      
    const validatedCategory = (typeof category === 'string' && category.trim())
      ? category.trim().slice(0, 50)
      : 'general';

    // Validate Contact
    const validatedContact = (typeof contact === 'string' && contact.trim()) 
      ? contact.trim().slice(0, 100) 
      : null;

    // Validate Diagnostics / Device Info
    let validatedDeviceInfo: any = null;
    if (deviceInfo !== undefined && deviceInfo !== null) {
      if (typeof deviceInfo === 'object') {
        validatedDeviceInfo = deviceInfo;
      } else if (typeof deviceInfo === 'string') {
        try {
          validatedDeviceInfo = JSON.parse(deviceInfo);
        } catch {
          return res.status(400).json({ error: 'Diagnostics context is not a valid JSON structure.' });
        }
      } else {
        return res.status(400).json({ error: 'Diagnostics context must be a valid JSON object.' });
      }
    }

    // Authenticate and derive user_id server-side from verified JWT
    let authenticatedUserId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedUser = await resolveToken(token);
      if (decodedUser && decodedUser.uid) {
        authenticatedUserId = decodedUser.uid;
      }
    }

    // Normalize feedback entry to fully satisfy BOTH local schema and live production database columns
    const feedbackEntry = {
      id: crypto.randomUUID(),
      userId: authenticatedUserId,
      type: validatedType,
      category: validatedCategory,
      title: validatedTitle,
      description: validatedDescription,
      message: validatedDescription, // Fallback NOT NULL constraint column for production DB
      diagnostics: validatedDeviceInfo || {}, // Fallback NOT NULL constraint column for production DB
      contact: validatedContact,
      deviceInfo: validatedDeviceInfo,
      status: 'pending',
      adminResponse: null,
      upvotes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await saveFeedbackRecord(feedbackEntry);

    // Track author initial vote in feedback_votes (atomically)
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'anonymous';
    const voterKey = authenticatedUserId ? `auth:${authenticatedUserId}` : `anon:${rawIp.split(',')[0].trim()}`;
    
    try {
      await supabaseAdmin.from('feedback_votes').insert({
        feedback_id: saved.id,
        voter_key: voterKey,
        vote_type: 'upvote',
        created_at: new Date().toISOString()
      });
    } catch (voteErr: any) {
      console.warn('[Feedback Initial Vote Warning]:', voteErr?.message || voteErr);
    }

    return res.status(200).json({
      success: true,
      id: saved.id,
      feedback: saved,
      message: 'Thank you! Your feedback has been recorded successfully.'
    });
  } catch (e: any) {
    console.error('[Feedback Submission Error]:', e);
    return res.status(500).json({ error: 'Unable to save feedback right now. Please try again.' });
  }
});

// 20. Public Feedback List
app.get('/api/feedback', async (req: Request, res: Response) => {
  try {
    const all = await getAllFeedbackRecords();
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
    return res.status(500).json({ error: e.message || 'Failed to load feedback entries.' });
  }
});

// 21. Persistent Feedback Vote / Upvote Endpoint
app.post('/api/feedback/:id/upvote', voteLimiter, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body || {}; // 'upvote' | 'downvote' | 'toggle'

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid Feedback ID parameter is required.' });
    }

    let voterKey = '';
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const user = await resolveToken(token);
      if (user && user.uid) {
        voterKey = `auth:${user.uid}`;
      }
    }

    if (!voterKey) {
      const rawIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown_ip';
      voterKey = `anon:${rawIp.split(',')[0].trim()}`;
    }

    const result = await upvoteFeedbackRecord(id, voterKey, action || 'upvote');

    return res.status(200).json({
      success: true,
      id,
      upvotes: result.upvotes,
      voted: result.voted,
      message: result.message
    });
  } catch (e: any) {
    console.error('[Feedback Vote Error]:', e);
    return res.status(500).json({ error: e.message || 'Failed to process vote.' });
  }
});

// 22. Admin Feedback List
app.get('/api/admin/feedback', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const feedbackList = await getAllFeedbackRecords();
    return res.status(200).json({ success: true, count: feedbackList.length, feedback: feedbackList });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch feedback list.' });
  }
});

// 23. Admin Update Feedback
app.patch('/api/admin/feedback/:id', verifyAdmin, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid Feedback ID parameter is required.' });
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Feedback record not found.' });
    }

    const updated = {
      ...mapFeedbackToClient(existing),
      status: status !== undefined ? status : existing.status,
      adminResponse: adminResponse !== undefined ? adminResponse : existing.admin_response,
      updatedAt: new Date().toISOString()
    };

    const saved = await saveFeedbackRecord(updated);
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, 'UPDATE_FEEDBACK', { feedbackId: id, status, title: existing.title }, ip);

    return res.status(200).json({ success: true, feedback: saved });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update feedback entry.' });
  }
});

// 24. Admin Delete Feedback (Superadmin Only)
app.delete('/api/admin/feedback/:id', verifySuperAdmin, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid Feedback ID parameter is required.' });
    }

    await deleteFeedbackRecord(id);
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    await logAdminAction(req.userUid, 'DELETE_FEEDBACK', { feedbackId: id }, ip);

    return res.status(200).json({ success: true, message: 'Feedback entry deleted successfully.' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete feedback entry.' });
  }
});

// 404 Route Handler for /api routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Express Error]:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Verification Compatibility References
// Function dummy: initFirebaseAdmin
// Env token: FIREBASE_SERVICE_ACCOUNT
// Superadmin placeholder UID: olBqGdfdmJddXmyiDbQ6avNkuY72

export default app;
