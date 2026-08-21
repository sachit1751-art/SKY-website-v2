import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, ShieldCheck, User, Mail, Lock, Send } from 'lucide-react';
import { SpotlightCard } from '../../components/SpotlightCard';
import { useToast } from '../../context/ToastContext';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';
import { SEO } from '../../components/SEO';

export const RegisterAdminPage: React.FC = () => {
  // Auth Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile Fields (Optional)
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');

  // UI / State
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const validatePassword = (pwd: string) => {
    if (!pwd) return '';
    if (pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must include at least one uppercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must include at least one number.';
    return '';
  };

  const [isSuperResult, setIsSuperResult] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Field Validations
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

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
      let registeredSuccess = false;
      let isSuper = false;
      let successMessage = 'Registration submitted successfully! Awaiting approval.';

      // Attempt 1: Server-side API endpoint
      try {
        const response = await fetch('/api/admin/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim(),
            username: username.trim(),
            telegramUsername: telegramUsername.trim(),
          }),
        });

        const responseText = await response.text();
        let data: any = {};
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          data = {};
        }

        if (response.ok && data.success) {
          registeredSuccess = true;
          isSuper = !!data.isSuperAdmin;
          if (data.message) successMessage = data.message;
        } else if (response.status === 409) {
          throw new Error(data.error || 'An account with this email already exists.');
        } else {
          console.warn('Server registration failed, attempting client-side registration:', data.error || responseText);
        }
      } catch (apiErr: any) {
        if (apiErr.message.includes('already exists')) {
          throw apiErr;
        }
        console.warn('Server registration API error:', apiErr.message);
      }

      // Attempt 2: Direct Client-Side Supabase Sign Up and inserts
      if (!registeredSuccess) {
        const cleanEmail = email.trim().toLowerCase();
        const displayName = name.trim() || cleanEmail.split('@')[0];
        const displayUsername = username.trim() || cleanEmail.split('@')[0];

        // 1. Create Supabase Auth Account
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password
        });

        if (signUpError) {
          throw signUpError;
        }

        const newUid = data.user?.id;
        if (!newUid) {
          throw new Error('Could not retrieve new user UUID.');
        }

        // 2. Insert into profiles table
        const { error: profileError } = await supabase.from('profiles').insert({
          id: newUid,
          email: cleanEmail,
          display_name: displayName,
          username: displayUsername,
        });

        if (profileError) {
          console.warn('Profile record insert failed:', profileError.message);
        }

        // 3. Insert into admins table
        const { error: adminError } = await supabase.from('admins').insert({
          id: newUid,
          email: cleanEmail,
          name: displayName,
          display_name: displayName,
          username: displayUsername,
          telegram_username: telegramUsername.trim(),
          role: 'pending',
          active: false,
          approval_status: 'pending',
          is_super_admin: false,
        });

        if (adminError) {
          throw adminError;
        }

        registeredSuccess = true;
      }

      setIsSuperResult(isSuper);
      setRegistrationSuccess(true);
      showToast({ title: successMessage, type: 'success' });
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = error.message || 'Registration failed. Please try again.';
      setFormError(message);
      showToast({ title: message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-6">
      <SEO
        title="Register Maintainer Account"
        description="Submit an application for maintainer credentials in the SKY device ecosystem."
        canonicalUrl="/admin/register"
        noIndex={true}
      />
      <div className="w-full max-w-lg">
        {registrationSuccess ? (
          <SpotlightCard className="p-6 sm:p-8 border border-green-500/30 bg-green-500/5 text-center rounded-3xl">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <ShieldCheck size={36} />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-[#121212] dark:text-[#F4EFE6]">
              {isSuperResult ? 'Superadmin Account Ready!' : 'Registration Submitted!'}
            </h2>
            <p className="text-sm text-[#787567] dark:text-[#BDB8A4] mb-6 leading-relaxed max-w-md mx-auto">
              {isSuperResult
                ? 'Your superadmin account is activated. You can log in directly to manage all ROM releases, review maintainers, and configure permissions.'
                : 'Your account has been created successfully. For security reasons, maintainer accounts require approval by a superadmin before accessing the dashboard.'}
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-3.5 bg-[#FDE694] text-[#121212] font-black rounded-2xl hover:bg-[#FCE076] transition-all shadow-sm cursor-pointer"
            >
              GO TO LOGIN
            </button>
          </SpotlightCard>
        ) : (
          <SpotlightCard className="p-6 sm:p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] rounded-3xl shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#121212] dark:text-[#F4EFE6] tracking-tight">
                Register SKY Admin
              </h1>
              <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] mt-2 leading-relaxed">
                Create your SKY team account. Accounts require superadmin approval.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* AUTHENTICATION SECTION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-[#EBE4CF] dark:border-[#36342A]">
                  <Lock size={16} className="text-[#FDE694]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#121212] dark:text-[#F4EFE6]">
                    Authentication Credentials
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-[#787567] dark:text-[#BDB8A4]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@skyrom.com"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF0CF]/60 dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 chars, 1 uppercase & 1 number"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF0CF]/60 dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none text-sm font-medium pr-12"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-4 top-3.5 text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={password} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF0CF]/60 dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none text-sm font-medium pr-12"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-4 top-3.5 text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* PROFILE SECTION */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-[#EBE4CF] dark:border-[#36342A]">
                  <User size={16} className="text-[#FDE694]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#121212] dark:text-[#F4EFE6]">
                    Profile Information (Optional)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Sky"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF0CF]/60 dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. alexsky"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF0CF]/60 dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-[#F4EFE6] mb-1.5 px-1">
                    Telegram Username
                  </label>
                  <div className="relative">
                    <Send size={18} className="absolute left-4 top-3.5 text-[#787567] dark:text-[#BDB8A4]" />
                    <input
                      type="text"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      placeholder="@username"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF0CF]/60 dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none text-sm font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-[#787567] dark:text-[#BDB8A4] mt-1 px-1">
                    Used for team identification only. Not used for login credentials.
                  </p>
                </div>
              </div>

              {/* ERROR DISPLAY */}
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs font-medium leading-relaxed">
                  {formError}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#FDE694] text-[#121212] font-black rounded-2xl hover:bg-[#FCE076] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin mr-2" />
                    REGISTERING...
                  </div>
                ) : (
                  'REGISTER ACCOUNT'
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-[#787567] dark:text-[#BDB8A4]">Already registered? </span>
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="text-xs font-bold text-[#121212] dark:text-[#FDE694] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          </SpotlightCard>
        )}
      </div>
    </div>
  );
};

export default RegisterAdminPage;


