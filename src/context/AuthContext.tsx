import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Admin } from '../../shared/types';

interface AuthContextType {
  user: User | null;
  adminProfile: Admin | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSessionExpiring: boolean;
  setIsSessionExpiring: (expiring: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionExpiring, setIsSessionExpiring] = useState(false);

  const handleGracefulLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[Auth] Exception during Supabase signOut:', e);
    } finally {
      setUser(null);
      setAdminProfile(null);
      setIsSessionExpiring(false);

      if (
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/admin') &&
        !['/admin/login', '/admin/register', '/admin/reset-password'].includes(window.location.pathname)
      ) {
        window.location.href = '/admin/login';
      }
    }
  };

  const fetchAdminProfile = async (userId: string) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('[Auth] Session retrieval error:', sessionError.message);
        await handleGracefulLogout();
        return;
      }

      const token = sessionData?.session?.access_token;

      if (token) {
        try {
          const response = await fetch('/api/admin/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.status === 401) {
            console.warn('[Auth] Token expired or invalid according to server (401). Triggering graceful logout.');
            await handleGracefulLogout();
            return;
          }

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.admin) {
              const data = result.admin;
              const isSuper = (data.role === 'superadmin' || data.role === 'super_admin' || data.isSuperAdmin === true) && 
                              data.active === true && 
                              data.approvalStatus === 'approved';
              
              setAdminProfile({
                id: data.id,
                userId: data.id,
                name: data.name || '',
                email: data.email || '',
                username: data.username || '',
                role: isSuper ? 'superadmin' : data.role,
                bio: data.bio || '',
                avatarUrl: data.avatarUrl || '',
                githubUrl: data.githubUrl || '',
                telegramUrl: data.telegramUrl || '',
                telegramUsername: data.telegramUsername || '',
                websiteUrl: data.websiteUrl || '',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                active: data.active === true,
                approvalStatus: data.approvalStatus || 'pending',
                isSuperAdmin: isSuper
              });
              return;
            }
          }
        } catch (fetchErr) {
          console.warn('[Auth] Error querying /api/admin/me, attempting fallback:', fetchErr);
        }
      }

      // Fallback directly to client-side Supabase query ONLY if server endpoint is unreachable
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && (error.code === 'PGRST301' || (error.message && error.message.includes('JWT')))) {
        console.warn('[Auth] Client-side query returned JWT error:', error.message);
        await handleGracefulLogout();
        return;
      }

      if (data && !error) {
        const isSuper = (data.role === 'superadmin' || data.role === 'super_admin' || data.is_super_admin === true) && 
                        data.active === true && 
                        data.approval_status === 'approved';
        
        setAdminProfile({
          id: data.id,
          userId: data.id,
          name: data.name || '',
          email: data.email || '',
          username: data.username || '',
          role: isSuper ? 'superadmin' : data.role,
          bio: data.bio || '',
          avatarUrl: data.avatar_url || '',
          githubUrl: data.github_url || '',
          telegramUrl: data.telegram_url || '',
          telegramUsername: data.telegram_username || '',
          websiteUrl: data.website_url || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          active: data.active === true,
          approvalStatus: data.approval_status || 'pending',
          isSuperAdmin: isSuper
        });
      } else {
        setAdminProfile(null);
      }
    } catch (error) {
      console.error('[Auth] Error fetching admin profile:', error);
      setAdminProfile(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Check initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn('[Auth] Initial session error:', error.message);
          handleGracefulLogout();
          setLoading(false);
          return;
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchAdminProfile(currentUser.id).finally(() => {
            if (isMounted) setLoading(false);
          });
        } else {
          setAdminProfile(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[Auth] Initial session fetch exception:', err);
        if (isMounted) {
          handleGracefulLogout();
          setLoading(false);
        }
      });

    // Listen to all auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      try {
        switch (event) {
          case 'INITIAL_SESSION':
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (currentUser) {
              await fetchAdminProfile(currentUser.id);
            } else {
              setAdminProfile(null);
            }
            break;

          case 'PASSWORD_RECOVERY':
            // Keep the recovery session active without logging out or redirecting
            break;

          case 'SIGNED_OUT':
          default:
            if (!currentUser) {
              setAdminProfile(null);
            }
            break;
        }
      } catch (err) {
        console.error('[Auth] Exception in onAuthStateChange handler:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 30-minute inactivity auto-logout timer for enhanced security
  useEffect(() => {
    if (!user) return;

    let inactivityTimer: NodeJS.Timeout;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

    const handleInactivityLogout = async () => {
      try {
        console.log('[Auth] Auto-logging out session due to 30 minutes of inactivity.');
        await handleGracefulLogout();
      } catch (e) {
        console.error('[Auth] Auto-logout error:', e);
      }
    };

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleInactivityLogout, INACTIVITY_LIMIT);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [user]);

  const signOut = async () => {
    await handleGracefulLogout();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchAdminProfile(user.id);
    }
  };

  const recognizedRoles = ['maintainer', 'developer', 'moderator', 'admin', 'superadmin'];
  const isSuper = (adminProfile?.isSuperAdmin === true || adminProfile?.role === 'superadmin' || adminProfile?.role === 'super_admin') && 
                  adminProfile?.active === true && 
                  adminProfile?.approvalStatus === 'approved';
  const isApproved = adminProfile ? (adminProfile.active && adminProfile.approvalStatus === 'approved' && recognizedRoles.includes(adminProfile.role)) : false;

  const value = {
    user,
    adminProfile,
    loading,
    isAdmin: isSuper || isApproved,
    isSuperAdmin: isSuper,
    signOut,
    refreshProfile,
    isSessionExpiring,
    setIsSessionExpiring
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
