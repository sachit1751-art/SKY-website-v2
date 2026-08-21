import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertTriangle, ArrowLeft, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { SpotlightCard } from '../../components/SpotlightCard';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/SEO';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { signOut, user, adminProfile, isAdmin, isSuperAdmin, refreshProfile, loading: authLoading } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/admin';

  // Handle auto-redirect if already logged in with admin privileges
  useEffect(() => {
    if (user && !authLoading) {
      if (isAdmin || isSuperAdmin) {
        navigate(from, { replace: true });
      }
    }
  }, [user, isAdmin, isSuperAdmin, authLoading, navigate, from]);

  const checkCapsLock = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsShaking(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        throw error;
      }

      const loggedUser = data.user;
      if (!loggedUser) {
        throw new Error('Authentication failed: user record not found.');
      }

      // Verification check from Supabase admins table
      const { data: adminRecord, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', loggedUser.id)
        .single();

      if (adminError || !adminRecord) {
        await signOut();
        showToast({ 
          title: 'Access Denied', 
          message: 'You are not registered as an administrator. Please register first.', 
          type: 'error' 
        });
        return;
      }

      const isSuper = (adminRecord.role === 'superadmin' || adminRecord.role === 'super_admin' || adminRecord.is_super_admin === true) && 
                      adminRecord.active === true && 
                      adminRecord.approval_status === 'approved';
      const isApprovedAdmin = adminRecord.active === true && 
                              adminRecord.approval_status === 'approved' &&
                              adminRecord.role !== 'pending';

      if (!isSuper && !isApprovedAdmin) {
        await signOut();
        const msg = adminRecord.approval_status === 'rejected'
          ? 'Your administrator application has been rejected.'
          : 'Your administrator account is awaiting approval from the superadmin.';
        showToast({ 
          title: 'Pending Approval', 
          message: msg, 
          type: 'error' 
        });
        return;
      }

      showToast({ title: 'Successfully logged in', type: 'success' });
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      let message = error.message || 'Failed to log in. Please check your credentials.';
      showToast({ title: message, type: 'error' });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showToast({ title: 'Please enter your email first', type: 'error' });
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`
      });
      if (error) throw error;
      showToast({ title: 'Password reset email sent!', type: 'success' });
    } catch (error: any) {
      showToast({ title: error.message || 'Failed to send reset email', type: 'error' });
    }
  };

  return (
    <>
      <SEO
        title="Maintainer Console Login"
        description="Log in to your SKY maintainer console to manage ROM releases and device configurations."
        canonicalUrl="/admin/login"
        noIndex={true}
      />
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          <SpotlightCard className="p-6 sm:p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] rounded-3xl shadow-xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#FDE694]/30 dark:bg-[#FDE694]/15 text-[#121212] dark:text-[#FDE694] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#FDE694]/50 shadow-xs">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight">
                Maintainer Console
              </h1>
              <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] mt-1 font-medium">
                Log in with your administrator credentials
              </p>
            </div>
            <motion.form 
              onSubmit={handleLogin} 
              className="space-y-4"
              animate={isShaking ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isShaking) setIsShaking(false);
                  }}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  onClick={checkCapsLock}
                  required
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF0CF]/60 dark:bg-[#151410] border ${isShaking ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'border-[#EBE4CF] dark:border-[#36342A]'} text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] focus:border-transparent outline-none transition-all text-sm font-medium`}
                  placeholder="admin@skyrom.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6]">Password</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[11px] font-bold text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (isShaking) setIsShaking(false);
                    }}
                    onKeyDown={checkCapsLock}
                    onKeyUp={checkCapsLock}
                    onClick={checkCapsLock}
                    required
                    className={`w-full px-4 py-3 rounded-xl bg-[#FAF0CF]/60 dark:bg-[#151410] border ${isShaking ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'border-[#EBE4CF] dark:border-[#36342A]'} text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] focus:border-transparent outline-none transition-all text-sm font-medium pr-12`}
                    placeholder="••••••••"
                  />
                  {capsLock && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500 flex items-center bg-red-500/10 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest gap-1 animate-in fade-in zoom-in duration-200">
                      <AlertTriangle size={12} />
                      Caps Lock
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#FDE694] text-[#121212] font-black rounded-xl hover:bg-[#FCE076] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-sm cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Enter Console</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-3 text-xs border-t border-[#EBE4CF]/80 dark:border-[#36342A]/80">
                <button 
                  type="button" 
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-1 font-semibold text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Website</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => navigate('/admin/register')}
                  className="font-bold text-[#49473E] dark:text-[#FDE694] hover:underline"
                >
                  Register Maintainer
                </button>
              </div>
            </motion.form>
          </SpotlightCard>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

