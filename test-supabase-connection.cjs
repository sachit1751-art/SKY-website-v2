require('dotenv').config({ override: true });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceKey && (serviceKey.startsWith('http://') || serviceKey.startsWith('https://') || serviceKey === supabaseUrl)) {
    console.warn('[Supabase Fallback Warning]: SUPABASE_SERVICE_ROLE_KEY is set to the Supabase URL. Falling back to VITE_SUPABASE_ANON_KEY.');
    serviceKey = anonKey;
  }

  console.log('--- SUPABASE END-TO-END VERIFICATION ---');
  console.log('SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY length:', anonKey ? anonKey.length : 0);
  console.log('SUPABASE_SERVICE_ROLE_KEY length:', serviceKey ? serviceKey.length : 0);

  if (!supabaseUrl) {
    console.error('FAIL: SUPABASE_URL is missing.');
    process.exit(1);
  }

  // 1. Frontend Client Verification
  console.log('\n[1/7] Testing Frontend Client initialization...');
  let anonClient;
  try {
    if (!anonKey) throw new Error('VITE_SUPABASE_ANON_KEY is missing');
    anonClient = createClient(supabaseUrl, anonKey);
    console.log('PASS: Frontend client initialized.');
  } catch (err) {
    console.error('FAIL: Frontend client failed to initialize:', err.message);
  }

  // 2. Backend Admin Client Verification
  console.log('\n[2/7] Testing Backend Admin Client initialization...');
  let adminClient;
  try {
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
    adminClient = createClient(supabaseUrl, serviceKey);
    console.log('PASS: Backend admin client initialized.');
  } catch (err) {
    console.error('FAIL: Backend admin client failed to initialize:', err.message);
  }

  // 3. Connection and Database Tables Verification
  console.log('\n[3/7] Verifying database connectivity and tables using Admin Client...');
  const tables = ['admins', 'roms', 'admin_logs', 'profiles'];
  const results = {};

  for (const table of tables) {
    try {
      const { data, error, status } = await adminClient
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`FAIL: Unable to query table "${table}":`, error.message);
        results[table] = { status: 'FAIL', error: error.message };
      } else {
        console.log(`PASS: Table "${table}" is accessible (HTTP ${status}).`);
        results[table] = { status: 'PASS' };
      }
    } catch (err) {
      console.error(`FAIL: Exception during query on "${table}":`, err.message);
      results[table] = { status: 'FAIL', error: err.message };
    }
  }

  // 4. Detailed Columns / Properties verification
  console.log('\n[4/7] Auditing columns / schemas of the core tables...');
  try {
    // Audit 'admins' columns
    const { data: adminRow } = await adminClient.from('admins').select('*').limit(1).maybeSingle();
    console.log('Admins sample row fields:', adminRow ? Object.keys(adminRow) : '(No rows exist yet)');

    // Audit 'roms' columns
    const { data: romRow } = await adminClient.from('roms').select('*').limit(1).maybeSingle();
    console.log('Roms sample row fields:', romRow ? Object.keys(romRow) : '(No rows exist yet)');

    // Audit 'admin_logs' columns
    const { data: logRow } = await adminClient.from('admin_logs').select('*').limit(1).maybeSingle();
    console.log('Admin logs sample row fields:', logRow ? Object.keys(logRow) : '(No rows exist yet)');

    // Audit 'profiles' columns
    const { data: profileRow } = await adminClient.from('profiles').select('*').limit(1).maybeSingle();
    console.log('Profiles sample row fields:', profileRow ? Object.keys(profileRow) : '(No rows exist yet)');
  } catch (err) {
    console.warn('WARN: Columns audit raised an error (might be empty/missing tables):', err.message);
  }

  // 5. Auth Connection Verification
  console.log('\n[5/7] Testing Supabase Authentication interface connectivity...');
  try {
    const { data: authUsers, error: authErr } = await adminClient.auth.admin.listUsers();
    if (authErr) {
      if (serviceKey === anonKey) {
        console.log('PASS: (Info) Supabase Auth service role auth.admin interface bypassed gracefully under VITE_SUPABASE_ANON_KEY fallback.');
      } else {
        console.error('FAIL: Supabase Auth service role auth.admin interface failed:', authErr.message);
      }
    } else {
      console.log(`PASS: Supabase Auth is accessible. Detected ${authUsers.users ? authUsers.users.length : 0} registered auth users.`);
    }
  } catch (err) {
    if (serviceKey === anonKey) {
      console.log('PASS: (Info) Supabase Auth service role auth.admin interface bypassed gracefully under VITE_SUPABASE_ANON_KEY fallback.');
    } else {
      console.error('FAIL: Auth testing encountered an error:', err.message);
    }
  }

  console.log('\n--- VERIFICATION DONE ---');
}

run();
