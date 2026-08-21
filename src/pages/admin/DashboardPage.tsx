import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { RomItem } from '../../../shared/types';
import { AOSP_ROMS } from '../../data';
import { SpotlightCard } from '../../components/SpotlightCard';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, Edit2, Trash2, Globe, Github, MessageSquare, ExternalLink, 
  Shield, UserPlus, ShieldAlert, Search, RefreshCw, Layers, MessageSquarePlus,
  Download
} from 'lucide-react';
import { DashboardSkeleton } from '../../components/skeletons/DashboardSkeleton';
import { HeaderSkeleton, ProfileSkeleton, ActionSkeleton } from '../../components/skeletons/AdminSkeletons';
import { InviteMaintainer } from '../../components/admin/InviteMaintainer';
import { RecentActivityWidget } from '../../components/admin/RecentActivityWidget';
import { ActivityHeatmapChart } from '../../components/admin/ActivityHeatmapChart';
import { FeedbackManager } from '../../components/admin/FeedbackManager';
import { AdminNotificationBanner } from '../../components/admin/AdminNotificationBanner';
import { SEO } from '../../components/SEO';
import { motion } from 'motion/react';
import { 
  prefetchRomEditorPage, 
  prefetchAdminProfilePage, 
  prefetchApproveAdminsPage, 
  prefetchSecurityLogsPage, 
  prefetchFeedbackAdminPage 
} from '../../utils/prefetchAdmin';

export const DashboardPage: React.FC = () => {
  const { user, adminProfile, isSuperAdmin, signOut, loading: authLoading } = useAuth();
  const [allRoms, setAllRoms] = useState<RomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my_projects' | 'feedback'>('all');
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState<number>(0);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      const response = await fetch('/api/admin/backup', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (!response.ok) {
        throw new Error('Could not fetch backup payload.');
      }
      
      const resData = await response.json();
      if (resData.success && resData.backup) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(resData.backup, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute(
          'download',
          `skyroms_backup_${new Date().toISOString().split('T')[0]}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast({ title: 'System backup exported successfully!', type: 'success' });
      } else {
        throw new Error(resData.error || 'Invalid backup payload.');
      }
    } catch (err: any) {
      showToast({ title: err.message || 'Backup export failed.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // Fetches live system diagnostics
  const fetchDiagnostics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/diagnostics', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDiagnostics(data.diagnostics);
        }
      }
    } catch (e) {
      console.warn('Diagnostics fetch error:', e);
    }
  };

  // Fetches pending feedback count for badge
  const fetchFeedbackCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/feedback', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.feedback)) {
        const pending = data.feedback.filter((f: any) => f.status === 'pending').length;
        setPendingFeedbackCount(pending);
      }
    } catch (e) {}
  };

  // Fetches ROM releases from Supabase PostgreSQL database and merges with catalog
  const fetchRoms = async () => {
    setLoading(true);
    try {
      // 1. Fetch live records from Supabase 'roms' table
      const { data: dbRoms, error } = await supabase
        .from('roms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase ROMs query notice:', error);
      }

      // Map database rows to RomItem interface
      const mappedDbRoms: RomItem[] = (dbRoms || []).map((rom: any) => ({
        id: rom.id,
        name: rom.name,
        title: rom.title,
        version: rom.version,
        androidVersion: rom.android_version,
        status: rom.status,
        maintainer: rom.maintainer,
        maintainerUrl: rom.maintainer_url,
        maintainerHandle: rom.maintainer_handle,
        maintainerId: rom.maintainer_id,
        url: rom.url,
        description: rom.description,
        changelog: rom.changelog || [],
        isPinned: rom.is_pinned,
        logoUrl: rom.logo_url,
        extraLinks: rom.extra_links || [],
        downloadCount: rom.download_count,
        stabilityTrends: rom.stability_trends || [],
        batteryEfficiency: rom.battery_efficiency,
        screenshots: rom.screenshots || [],
        device: rom.device || 'sky',
        variant: rom.variant || 'Official',
        sourceUrl: rom.source_url,
        communityUrl: rom.community_url,
        createdAt: rom.created_at,
        updatedAt: rom.updated_at
      }));

      // 2. Identify catalog ROMs from static data that haven't been stored in Supabase yet
      const dbNames = new Set(mappedDbRoms.map(r => (r.name || '').toLowerCase().trim()));
      const staticCatalogRoms: RomItem[] = AOSP_ROMS.filter(
        staticRom => !dbNames.has((staticRom.name || '').toLowerCase().trim())
      ).map(staticRom => ({
        ...staticRom,
        id: staticRom.id || staticRom.name.toLowerCase().replace(/\s+/g, '-'),
        status: staticRom.status === 'Official' ? 'published' : 'draft',
        maintainer: staticRom.maintainer || '',
        maintainerHandle: staticRom.maintainerHandle || '',
        maintainerUrl: staticRom.maintainerUrl || ''
      }));

      // Combined collection (Supabase records take precedence)
      const allMergedRoms = [...mappedDbRoms, ...staticCatalogRoms];
      setAllRoms(allMergedRoms);
    } catch (error) {
      console.error('Error fetching ROMs:', error);
      showToast({ title: 'Failed to load ROMs from Supabase, using local catalog', type: 'error' });
      setAllRoms(AOSP_ROMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoms();
    fetchFeedbackCount();
    fetchDiagnostics();
    const interval = setInterval(() => {
      fetchFeedbackCount();
      fetchDiagnostics();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter ROMs relevant to currently signed in maintainer
  const myRoms = useMemo(() => {
    if (!adminProfile) return [];
    const profName = (adminProfile.name || '').toLowerCase().trim();
    const profUser = (adminProfile.username || '').toLowerCase().trim().replace(/^@/, '');
    const profId = adminProfile.userId;

    return allRoms.filter(rom => {
      if (rom.maintainerId && profId && rom.maintainerId === profId) return true;
      if (profName && rom.maintainer && rom.maintainer.toLowerCase().includes(profName)) return true;
      const romHandle = (rom.maintainerHandle || '').toLowerCase().replace(/^@/, '').trim();
      if (profUser && romHandle && (romHandle.includes(profUser) || profUser.includes(romHandle))) return true;
      return false;
    });
  }, [allRoms, adminProfile]);

  const displayedRoms = useMemo(() => {
    return activeTab === 'my_projects' ? myRoms : allRoms;
  }, [activeTab, myRoms, allRoms]);

  // Filters displayed ROMs according to maintainer search query
  const filteredRoms = useMemo(() => {
    if (!searchQuery.trim()) return displayedRoms;
    const q = searchQuery.toLowerCase().trim();
    return displayedRoms.filter(r => 
      r.name.toLowerCase().includes(q) ||
      (r.maintainer && r.maintainer.toLowerCase().includes(q)) ||
      (r.maintainerHandle && r.maintainerHandle.toLowerCase().includes(q)) ||
      (r.androidVersion && r.androidVersion.toLowerCase().includes(q)) ||
      (r.version && r.version.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  }, [displayedRoms, searchQuery]);

  // Deletes a ROM record permanently from the Supabase database
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ROM from the Supabase database?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch(`/api/admin/roms/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        let errorData: any = {};
        try { errorData = errText ? JSON.parse(errText) : {}; } catch { errorData = { error: errText }; }
        throw new Error(errorData.error || errText || 'Failed to delete ROM from database');
      }

      showToast({ title: 'ROM deleted successfully from Supabase', type: 'success' });
      setAllRoms(prev => prev.filter(rom => rom.id !== id && rom.name !== id));
    } catch (error: any) {
      console.error('Error deleting ROM:', error);
      showToast({ title: error.message || 'Failed to delete ROM', type: 'error' });
    }
  };

  // Status transition handler
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/admin/roms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id,
          status: newStatus 
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let errorData: any = {};
        try { errorData = errText ? JSON.parse(errText) : {}; } catch { errorData = { error: errText }; }
        throw new Error(errorData.error || errText || 'Failed to update status');
      }

      showToast({ title: `ROM status updated to ${newStatus} in Supabase`, type: 'success' });
      setAllRoms(prev => prev.map(rom => (rom.id === id || rom.name === id) ? { ...rom, status: newStatus as any } : rom));
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast({ title: error.message || 'Failed to update status', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'official': return 'text-green-500 bg-green-500/10 border border-green-500/20';
      case 'approved': return 'text-blue-500 bg-blue-500/10 border border-blue-500/20';
      case 'pending':
      case 'beta': return 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20';
      case 'unofficial': return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border border-gray-500/20';
    }
  };

  const myRomsCount = allRoms.filter(r => r.maintainer?.toLowerCase() === adminProfile?.name?.toLowerCase()).length;
  const dashboardTitle = activeTab === 'feedback'
    ? `Community Feedback (${pendingFeedbackCount} Pending) | Maintainer Console`
    : activeTab === 'my_projects'
    ? `My Maintained Projects (${myRomsCount}) | Maintainer Console`
    : `Maintainer Dashboard (${allRoms.length} ROMs) | SKY Project`;

  const dashboardDescription = `Manage ${allRoms.length} custom ROM releases, monitor download metrics, review maintainer requests, and triage user feedback for the POCO M6 Pro 5G / Redmi 12 5G (sky) ecosystem.`;

  return (
    <>
      <SEO
        title={dashboardTitle}
        description={dashboardDescription}
        canonicalUrl="/admin"
        noIndex={true}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {authLoading ? (
        <HeaderSkeleton />
      ) : (
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tighter">
              DASHBOARD
            </h1>
            <p className="text-[#787567] dark:text-[#BDB8A4] mt-1 font-medium">
              Welcome back, <span className="text-[#121212] dark:text-[#FDE694]">{adminProfile?.name}</span>
              {isSuperAdmin && <span className="ml-2 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] rounded-full font-black tracking-widest border border-red-500/20 uppercase">Super Admin</span>}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <>
                <Link 
                  to="/admin/approve" 
                  onMouseEnter={prefetchApproveAdminsPage}
                  onTouchStart={prefetchApproveAdminsPage}
                  onFocus={prefetchApproveAdminsPage}
                  className="px-4 py-2.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl hover:border-red-500/40 text-xs font-bold text-[#121212] dark:text-[#F4EFE6] transition-all flex items-center gap-2"
                >
                  <UserPlus size={15} className="text-red-500" /> Approve Maintainers
                </Link>
                <Link 
                  to="/admin/logs" 
                  onMouseEnter={prefetchSecurityLogsPage}
                  onTouchStart={prefetchSecurityLogsPage}
                  onFocus={prefetchSecurityLogsPage}
                  className="px-4 py-2.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl hover:border-blue-500/40 text-xs font-bold text-[#121212] dark:text-[#F4EFE6] transition-all flex items-center gap-2"
                >
                  <ShieldAlert size={15} className="text-blue-500" /> Security Logs
                </Link>
              </>
            )}
            <Link 
              to="/admin/feedback" 
              onMouseEnter={prefetchFeedbackAdminPage}
              onTouchStart={prefetchFeedbackAdminPage}
              onFocus={prefetchFeedbackAdminPage}
              className="px-4 py-2.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl hover:border-amber-500/40 text-xs font-bold text-[#121212] dark:text-[#F4EFE6] transition-all flex items-center gap-2"
            >
              <MessageSquarePlus size={15} className="text-amber-500" /> User Feedback
              {pendingFeedbackCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-black">
                  {pendingFeedbackCount}
                </span>
              )}
            </Link>
            <Link 
              to="/admin/roms/new" 
              onMouseEnter={prefetchRomEditorPage}
              onTouchStart={prefetchRomEditorPage}
              onFocus={prefetchRomEditorPage}
              className="px-5 py-2.5 bg-[#FDE694] border border-[#FCE076] text-[#121212] font-bold text-xs rounded-2xl hover:bg-[#FCE076] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus size={16} /> Publish New ROM
            </Link>
            <button 
              onClick={() => signOut()}
              className="px-5 py-2.5 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] text-xs font-bold rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] transition-all cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        </header>
      )}

      {!authLoading && <AdminNotificationBanner />}

      {!authLoading && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 p-1.5 bg-[#EBE4CF]/40 dark:bg-[#151410]/80 rounded-2xl w-max flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'all' ? 'bg-white dark:bg-[#2C2A22] text-[#121212] dark:text-[#F4EFE6] shadow-sm' : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'}`}
            >
              <Layers size={14} /> All ROM Releases ({allRoms.length})
            </button>
            <button
              onClick={() => setActiveTab('my_projects')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'my_projects' ? 'bg-white dark:bg-[#2C2A22] text-[#121212] dark:text-[#F4EFE6] shadow-sm' : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'}`}
            >
              <Shield size={14} /> My Projects ({myRoms.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ROMs, maintainers, versions..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-medium outline-none focus:border-[#FDE694]"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="lg:col-span-1 space-y-8">
          {authLoading ? (
            <ProfileSkeleton />
          ) : (
            <>
              <SpotlightCard className="p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 aspect-square rounded-3xl bg-gradient-to-br from-[#FFF8E1] to-[#FAF3DD] dark:from-[#151410] dark:to-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] shadow-xs overflow-hidden mb-6 flex items-center justify-center">
                    {adminProfile?.avatarUrl ? (
                      <img src={adminProfile.avatarUrl} alt={adminProfile.name} decoding="async" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-[#121212] dark:text-[#FDE694]">
                        {adminProfile?.name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-[#121212] dark:text-[#F4EFE6]">{adminProfile?.name}</h2>
                  <p className="text-[#787567] dark:text-[#BDB8A4] font-mono text-sm mb-4">@{adminProfile?.username}</p>
                  <p className="text-[#787567] dark:text-[#BDB8A4] text-sm mb-6 leading-relaxed">
                    {adminProfile?.bio || 'Official SKY Device maintainer / contributor.'}
                  </p>
                  
                  <div className="flex gap-4 mb-8">
                    {adminProfile?.githubUrl && (
                      <a href={adminProfile.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-[#151410] rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] transition-colors">
                        <Github size={18} className="text-[#121212] dark:text-[#F4EFE6]" />
                      </a>
                    )}
                    {adminProfile?.telegramUrl && (
                      <a href={adminProfile.telegramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-[#151410] rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] transition-colors">
                        <MessageSquare size={18} className="text-[#121212] dark:text-[#F4EFE6]" />
                      </a>
                    )}
                    {adminProfile?.websiteUrl && (
                      <a href={adminProfile.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-[#151410] rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] transition-colors">
                        <Globe size={18} className="text-[#121212] dark:text-[#F4EFE6]" />
                      </a>
                    )}
                  </div>
                  
                  <Link 
                    to="/admin/profile"
                    onMouseEnter={prefetchAdminProfilePage}
                    onTouchStart={prefetchAdminProfilePage}
                    onFocus={prefetchAdminProfilePage}
                    className="w-full py-3 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] font-bold rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] transition-all text-sm block text-center"
                  >
                    EDIT PROFILE
                  </Link>
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase flex items-center gap-2">
                    <Shield size={14} /> SYSTEM STATUS
                  </h3>
                  <button onClick={() => { fetchRoms(); fetchDiagnostics(); }} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors cursor-pointer" title="Refresh list & status">
                    <RefreshCw size={12} className={`text-[#787567] dark:text-[#BDB8A4] ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#787567] dark:text-[#BDB8A4]">Total ROMs</span>
                    <span className="text-sm font-bold text-[#121212] dark:text-[#F4EFE6]">{allRoms.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#787567] dark:text-[#BDB8A4]">Official / Published</span>
                    <span className="text-sm font-bold text-green-500">
                      {allRoms.filter(r => {
                        const st = (r.status || '').toLowerCase();
                        return st === 'published' || st === 'official' || st === 'approved';
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#787567] dark:text-[#BDB8A4]">Pending Reports</span>
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      {pendingFeedbackCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#787567] dark:text-[#BDB8A4]">Account Status</span>
                    <span className="text-sm font-bold text-green-500">Active</span>
                  </div>

                  {diagnostics && (
                    <div className="border-t border-[#EBE4CF] dark:border-[#36342A] pt-4 mt-4 space-y-3">
                      <div className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-1">
                        DATABASE PIPELINE
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#787567] dark:text-[#BDB8A4]">Active Store</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diagnostics.isFeedbackInMemoryFallback ? 'text-amber-500 bg-amber-500/10' : 'text-green-500 bg-green-500/10'}`}>
                          {diagnostics.isFeedbackInMemoryFallback ? 'In-Memory Fallback' : 'Live Supabase'}
                        </span>
                      </div>
                      {diagnostics.inMemoryFeedbackCount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#787567] dark:text-[#BDB8A4]">In-Memory Items</span>
                          <span className="text-sm font-bold text-amber-500">{diagnostics.inMemoryFeedbackCount}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#787567] dark:text-[#BDB8A4]">Credentials Mode</span>
                        <span className="text-xs font-bold text-[#121212] dark:text-[#F4EFE6] bg-[#EBE4CF]/40 dark:bg-[#2C2A22] px-2 py-0.5 rounded-md">
                          {diagnostics.isServiceRoleKeyFallback ? 'Unprivileged Fallback' : 'Service Role'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[#EBE4CF] dark:border-[#36342A] pt-4 mt-2">
                    <button
                      onClick={handleExportBackup}
                      disabled={isExporting}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] transition-all cursor-pointer disabled:opacity-50"
                      title="Download full JSON export of all ROMs, maintainers, feedbacks and audit logs"
                    >
                      <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
                      <span>{isExporting ? 'Exporting...' : 'Backup & Export System Data'}</span>
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            </>
          )}

          {isSuperAdmin && <InviteMaintainer />}
          {isSuperAdmin && <RecentActivityWidget />}
        </div>

        {/* Main Content Area: ROMs or Feedback */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <ActivityHeatmapChart roms={allRoms} />

          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase flex items-center gap-2">
              {activeTab === 'all' ? 'ALL ROM RELEASES' : 'YOUR CLAIMED PROJECTS'} ({filteredRoms.length})
            </h3>
            <span className="text-[11px] text-[#787567] dark:text-[#BDB8A4] font-mono">
              Click edit on any ROM to modify details & changelogs
            </span>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <DashboardSkeleton />
            ) : filteredRoms.length === 0 ? (
              <SpotlightCard className="p-8 sm:p-12 border border-dashed border-[#EBE4CF] dark:border-[#36342A] bg-transparent flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#EBE4CF]/30 dark:bg-[#36342A]/30 flex items-center justify-center mb-6">
                  <Plus size={32} className="text-[#787567] dark:text-[#BDB8A4]" />
                </div>
                <h4 className="text-2xl font-black text-[#121212] dark:text-[#F4EFE6] mb-2 tracking-tight">
                  {activeTab === 'my_projects' ? 'No Projects Claimed Yet' : 'No ROMs Found'}
                </h4>
                <p className="text-[#787567] dark:text-[#BDB8A4] text-sm mb-6 max-w-sm leading-relaxed">
                  {searchQuery 
                    ? 'No ROMs match your search criteria. Try clearing the search query.' 
                    : activeTab === 'my_projects' 
                    ? 'You have not claimed or published any ROMs under your maintainer profile yet. You can view all releases or publish a new build.' 
                    : 'You haven\'t added any ROMs to this list yet.'}
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {activeTab === 'my_projects' && (
                    <button
                      onClick={() => setActiveTab('all')}
                      className="px-6 py-3 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] font-bold text-xs rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] transition-all uppercase tracking-wider cursor-pointer"
                    >
                      VIEW ALL ROMS ({allRoms.length})
                    </button>
                  )}
                  <Link 
                    to="/admin/roms/new"
                    className="px-8 py-3.5 bg-[#FDE694] text-[#121212] font-black text-sm rounded-xl hover:bg-[#FCE076] active:scale-[0.98] transition-all uppercase tracking-wider"
                  >
                    START NEW RELEASE
                  </Link>
                </div>
              </SpotlightCard>
            ) : (
              filteredRoms.map((rom) => (
                <SpotlightCard key={rom.id || rom.name} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 100px' }} className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 aspect-square rounded-2xl bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-center overflow-hidden shrink-0">
                        {rom.logoUrl ? (
                          <img src={rom.logoUrl} alt={rom.name} decoding="async" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-black text-[#121212] dark:text-[#FDE694] opacity-30">
                            {rom.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-xl font-bold text-[#121212] dark:text-[#F4EFE6] tracking-tight">{rom.name}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(rom.status || 'draft')}`}>
                            {rom.status || 'draft'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#787567] dark:text-[#BDB8A4]">
                          <span className="font-mono font-bold text-[#121212] dark:text-[#FDE694]">Android {rom.androidVersion}</span>
                          <span className="w-1 h-1 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
                          <span>v{rom.version}</span>
                          {rom.maintainer && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
                              <span>by <strong className="text-[#121212] dark:text-[#F4EFE6]">{rom.maintainer}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/admin/roms/${rom.id || rom.name}/edit`}
                        onMouseEnter={prefetchRomEditorPage}
                        onTouchStart={prefetchRomEditorPage}
                        onFocus={prefetchRomEditorPage}
                        className="p-3 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] hover:bg-[#FDE694]/10 transition-all"
                        title="Edit ROM Details & Supabase Record"
                      >
                        <Edit2 size={18} />
                      </Link>
                      
                      {rom.url && (
                        <a 
                          href={rom.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] transition-all"
                          title="View Download Page"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}

                      {isSuperAdmin && rom.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(rom.id!, 'approved')}
                          className="p-3 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-all cursor-pointer"
                          title="Approve ROM"
                        >
                          <Shield size={18} />
                        </button>
                      )}

                      {isSuperAdmin && rom.status === 'approved' && (
                        <button 
                          onClick={() => handleStatusUpdate(rom.id!, 'published')}
                          className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
                          title="Publish ROM"
                        >
                          <Globe size={18} />
                        </button>
                      )}

                      <button 
                        onClick={() => handleDelete(rom.id || rom.name)}
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                        title="Delete ROM"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              ))
            )}
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
};

export default DashboardPage;

