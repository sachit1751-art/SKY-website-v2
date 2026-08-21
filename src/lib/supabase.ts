import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

let _supabaseInstance: any = null;

const getSupabaseClient = () => {
  if (!_supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
      console.warn('Supabase is not configured properly. Returning a dummy client proxy.');
      return new Proxy({}, {
        get: (target, prop) => {
          if (prop === 'auth') {
            return {
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
              getSession: async () => ({ data: { session: null }, error: null }),
              getUser: async () => ({ data: { user: null }, error: null }),
              signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured.') }),
              signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured.') }),
              signOut: async () => ({ error: null }),
            };
          }
          return () => {
            console.error(`Supabase client called but not configured. Property: ${String(prop)}`);
            return {
              select: () => ({
                eq: () => ({
                  order: () => ({
                    limit: async () => ({ data: [], error: new Error('Supabase is not configured.') }),
                    maybeSingle: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
                  }),
                  maybeSingle: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
                }),
                order: () => ({
                  limit: async () => ({ data: [], error: new Error('Supabase is not configured.') }),
                }),
                maybeSingle: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
              }),
            };
          };
        }
      });
    }
    _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseInstance;
};

export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as any;

