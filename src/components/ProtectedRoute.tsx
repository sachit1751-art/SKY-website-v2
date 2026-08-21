import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ShieldCheck, LogIn, LogOut, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSuperAdmin = false 
}) => {
  const { user, adminProfile, isAdmin, isSuperAdmin, loading, signOut, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#EBE4CF] dark:border-[#36342A] border-t-[#FDE694] animate-spin" />
        <p className="text-xs font-semibold tracking-wider uppercase text-[#787567] dark:text-[#BDB8A4]">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleClaimSuperadmin = async () => {
    setSyncing(true);
    try {
      await refreshProfile();
    } finally {
      setSyncing(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut();
    navigate('/admin/login', { replace: true, state: { from: location } });
  };

  // If user is designated superadmin but profile hasn't loaded, offer instant activation
  if (user && !adminProfile?.active && user.id === 'b847cc2e-74b5-4b1f-bd21-a3c6d717973e') {
    return (
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-8">
        <SpotlightCard className="w-full max-w-lg p-6 sm:p-8 text-center rounded-3xl border border-[#FDE694]/40 bg-[#FAF3DD]/80 dark:bg-[#1A1914]/90 shadow-xl">
          <div className="w-16 h-16 bg-[#FDE694]/20 text-[#121212] dark:text-[#FDE694] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FDE694]/40">
            <UserCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight mb-2">
            Welcome, Superadmin
          </h1>
          <p className="text-sm text-[#787567] dark:text-[#BDB8A4] mb-6">
            Signed in as <span className="font-bold text-[#49473E] dark:text-[#F4EFE6]">{user.email}</span>. Click below to activate your administrative privileges.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleClaimSuperadmin}
              disabled={syncing}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FDE694] text-[#121212] font-black rounded-xl hover:bg-[#FCE076] transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Activating Session...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activate Superadmin Console</span>
                </>
              )}
            </button>
            <button
              onClick={handleSwitchAccount}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#FAF0CF]/60 dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] font-bold rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
          </div>
        </SpotlightCard>
      </div>
    );
  }

  const recognizedRoles = ['maintainer', 'developer', 'moderator', 'admin', 'superadmin'];
  const hasValidRole = adminProfile && recognizedRoles.includes(adminProfile.role);
  const isAuthorized = (user?.id === 'b847cc2e-74b5-4b1f-bd21-a3c6d717973e') || 
                       (adminProfile?.active === true && adminProfile?.approvalStatus === 'approved' && hasValidRole);

  // Not authorized / pending maintainer profile
  if (!isAuthorized) {
    let title = 'Access Denied';
    let message = 'This account does not have active administrative privileges for the SKY Maintainer Portal.';
    let badge = 'Unauthorized';
    let badgeColor = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';

    if (adminProfile) {
      if (adminProfile.approvalStatus === 'pending') {
        title = 'Account Awaiting Approval';
        message = 'Your maintainer registration has been submitted and is currently pending review by the superadmin.';
        badge = 'Pending Review';
        badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      } else if (adminProfile.approvalStatus === 'rejected') {
        title = 'Application Rejected';
        message = 'Your application for maintainer access was not approved.';
        badge = 'Rejected';
        badgeColor = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      } else if (adminProfile.active === false && adminProfile.approvalStatus === 'approved') {
        title = 'Account Deactivated';
        message = 'Your administrator account is currently deactivated. Please reach out to the superadmin.';
        badge = 'Deactivated';
        badgeColor = 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
      } else if (adminProfile.active === true && adminProfile.approvalStatus === 'approved' && !hasValidRole) {
        title = 'Invalid Administrator Role';
        message = 'Your account has been approved but does not possess one of the five recognized administrative roles (maintainer, developer, moderator, admin, superadmin).';
        badge = 'Unrecognized Role';
        badgeColor = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      }
    }
    
    return (
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-8">
        <SpotlightCard className="w-full max-w-lg p-6 sm:p-8 text-center rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] bg-[#FAF3DD]/80 dark:bg-[#1A1914]/90 shadow-xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 uppercase tracking-wider ${badgeColor}">
            <span>{badge}</span>
          </div>

          <h1 className="text-2xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight mb-2">
            {title}
          </h1>

          <div className="text-xs text-[#787567] dark:text-[#BDB8A4] bg-[#FAF0CF]/60 dark:bg-[#25231C] px-3 py-1.5 rounded-lg border border-[#EBE4CF] dark:border-[#36342A] inline-block mb-4">
            Signed in as: <strong className="text-[#49473E] dark:text-[#F4EFE6]">{user.email || user.id}</strong>
          </div>

          <p className="text-sm text-[#787567] dark:text-[#BDB8A4] mb-6 leading-relaxed">
            {message}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button 
              onClick={handleSwitchAccount}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FDE694] text-[#121212] font-black rounded-xl hover:bg-[#FCE076] transition-all cursor-pointer shadow-sm active:scale-95 text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In as Admin</span>
            </button>

            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF0CF]/60 dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] font-bold rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-all cursor-pointer text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Website</span>
            </button>
          </div>
        </SpotlightCard>
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-8">
        <SpotlightCard className="w-full max-w-lg p-6 sm:p-8 text-center rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] bg-[#FAF3DD]/80 dark:bg-[#1A1914]/90 shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight mb-2">
            Super Admin Required
          </h1>
          <p className="text-sm text-[#787567] dark:text-[#BDB8A4] mb-6">
            This administration portal module requires verified Superadmin privileges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => navigate('/admin')}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FDE694] text-[#121212] font-black rounded-xl hover:bg-[#FCE076] transition-all cursor-pointer shadow-sm active:scale-95 text-xs"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={handleSwitchAccount}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FAF0CF]/60 dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] font-bold rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-all cursor-pointer text-xs"
            >
              Switch Account
            </button>
          </div>
        </SpotlightCard>
      </div>
    );
  }

  return <>{children}</>;
};
