import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SpotlightCard } from '../../components/SpotlightCard';
import { useToast } from '../../context/ToastContext';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';
import { SEO } from '../../components/SEO';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Check if user entered via a recovery link or active recovery session
    const checkRecoverySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsRecoverySession(true);
        }
      } catch (err) {
        console.error('Error checking recovery session:', err);
      } finally {
        setSessionChecking(false);
      }
    };

    checkRecoverySession();

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session?.user)) {
        setIsRecoverySession(true);
        setSessionChecking(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (pwd: string) => {
    if (!pwd) return '';
    if (pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must include at least one uppercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must include at least one number.';
    return '';
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setFormError(pwdErr);
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Direct Supabase auth update password call
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      if (!data?.user) {
        throw new Error('Failed to update password. Please try requesting a new recovery link.');
      }

      // Security requirement: sign out immediately after successful password update
      await supabase.auth.signOut();

      setResetSuccess(true);
      showToast({
        title: 'Password Updated',
        message: 'Your password has been reset successfully. Please sign in with your new credentials.',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      const msg = error.message || 'Failed to update password. Your recovery link may have expired.';
      setFormError(msg);
      showToast({ title: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset Password | SKY Maintainer Console"
        description="Set a new password for your SKY administrator account."
        canonicalUrl="/admin/reset-password"
        noIndex={true}
      />
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          {resetSuccess ? (
            <SpotlightCard className="p-6 sm:p-8 border border-green-500/30 bg-green-500/5 text-center rounded-3xl shadow-xl">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[#121212] dark:text-[#F4EFE6]">
                Password Reset Complete
              </h2>
              <p className="text-sm text-[#787567] dark:text-[#BDB8A4] mb-6 leading-relaxed">
                Your password has been successfully updated. Redirecting you to the login page...
              </p>
              <button
                type="button"
                onClick={() => navigate('/admin/login', { replace: true })}
                className="w-full py-3.5 bg-[#FDE694] text-[#121212] font-black rounded-xl hover:bg-[#FCE076] transition-all shadow-sm cursor-pointer text-xs uppercase tracking-wider"
              >
                Go to Login Now
              </button>
            </SpotlightCard>
          ) : (
            <SpotlightCard className="p-6 sm:p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] rounded-3xl shadow-xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-[#FDE694]/30 dark:bg-[#FDE694]/15 text-[#121212] dark:text-[#FDE694] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#FDE694]/50 shadow-xs">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight">
                  Set New Password
                </h1>
                <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] mt-1 font-medium">
                  Enter your new administrative password below
                </p>
              </div>

              {!sessionChecking && !isRecoverySession && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-medium leading-relaxed">
                  Make sure you opened this page from the password reset link sent to your email.
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 chars, 1 uppercase & 1 number"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF0CF]/60 dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] focus:border-transparent outline-none transition-all text-sm font-medium pr-12"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={password} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF0CF]/60 dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] focus:border-transparent outline-none transition-all text-sm font-medium pr-12"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-medium leading-relaxed">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#FDE694] text-[#121212] font-black rounded-xl hover:bg-[#FCE076] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-sm cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center pt-3 text-xs border-t border-[#EBE4CF]/80 dark:border-[#36342A]/80">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/login')}
                    className="inline-flex items-center gap-1 font-semibold text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </form>
            </SpotlightCard>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
