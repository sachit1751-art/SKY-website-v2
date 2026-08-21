import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { RomItem, RomScreenshot } from '../../../shared/types';
import { AOSP_ROMS } from '../../data';
import { SpotlightCard } from '../../components/SpotlightCard';
import { useToast } from '../../context/ToastContext';
import { 
  ArrowLeft, Save, Upload, X, Smartphone, Globe, Github, Info, 
  Image as ImageIcon, MessageSquare, Send, Trash2, AlertTriangle, 
  Plus, Link as LinkIcon, FileText, UserCheck, Shield 
} from 'lucide-react';
import { SEO } from '../../components/SEO';

// Helper to check if string is a valid UUID
const isValidUUID = (str?: string) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
};

// Maps database row representation from Supabase to frontend RomItem model
const mapDbRomToClient = (rom: any): Partial<RomItem> => {
  if (!rom) return {};
  return {
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
    device: rom.device,
    variant: rom.variant,
    sourceUrl: rom.source_url,
    communityUrl: rom.community_url,
    createdAt: rom.created_at,
    updatedAt: rom.updated_at
  };
};

export const RomEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, adminProfile, isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = adminProfile?.role;
  const isSuper = isSuperAdmin || role === 'superadmin';
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const isMaintainer = role === 'maintainer';
  const isDeveloper = role === 'developer';

  const canEditAnyRom = isSuper || isAdmin || isModerator;

  // Checks if input field is modifiable by the current user
  const canModifyField = (field: string): boolean => {
    if (isSuper || isAdmin) return true;
    if (isModerator) {
      // Moderator can edit metadata and status, but not maintainer handles, download URLs, or pinning status.
      const allowedModeratorFields = [
        'name',
        'title',
        'version',
        'androidVersion',
        'device',
        'variant',
        'description',
        'changelog',
        'extraLinks',
        'screenshots',
        'logoUrl',
        'status'
      ];
      return allowedModeratorFields.includes(field);
    }
    // Maintainers & Developers can modify non-privileged fields of their own ROMs
    const nonPrivilegedFields = [
      'name',
      'title',
      'version',
      'androidVersion',
      'device',
      'variant',
      'description',
      'changelog',
      'extraLinks',
      'screenshots',
      'logoUrl',
      'status',
      'url',
      'sourceUrl',
      'communityUrl',
      'maintainer',
      'maintainerHandle',
      'maintainerUrl'
    ];
    return nonPrivilegedFields.includes(field);
  };

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [newChangelogItem, setNewChangelogItem] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  // State for ROM details being edited
  const [rom, setRom] = useState<Partial<RomItem>>({
    name: '',
    version: '',
    androidVersion: '15',
    description: '',
    status: 'draft',
    maintainer: adminProfile?.name || '',
    maintainerId: adminProfile?.userId || '',
    maintainerHandle: adminProfile?.username || '',
    url: '',
    logoUrl: '',
    device: 'sky',
    variant: 'AOSP',
    changelog: [],
    extraLinks: [],
    screenshots: []
  });

  // Local auto-save draft mechanism to prevent lost work during editing
  useEffect(() => {
    if (loading || saving) return;

    const autoSaveKey = `rom_draft_${id || 'new'}`;
    const timer = setTimeout(() => {
      localStorage.setItem(autoSaveKey, JSON.stringify(rom));
      setShowDraftSaved(true);
      setTimeout(() => setShowDraftSaved(false), 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [rom, id, loading, saving]);

  // Load existing ROM data from Supabase or static AOSP catalog fallback
  useEffect(() => {
    if (id) {
      const fetchRom = async () => {
        try {
          let foundRom: Partial<RomItem> | null = null;

          // 1. Try querying Supabase PostgreSQL database first
          if (isValidUUID(id)) {
            const { data, error } = await supabase
              .from('roms')
              .select('*')
              .eq('id', id)
              .maybeSingle();

            if (!error && data) {
              foundRom = mapDbRomToClient(data);
            }
          }

          // 2. If not found by UUID, try querying Supabase by name slug/match
          if (!foundRom) {
            const cleanName = id.replace(/-/g, ' ');
            const { data, error } = await supabase
              .from('roms')
              .select('*')
              .ilike('name', cleanName)
              .maybeSingle();

            if (!error && data) {
              foundRom = mapDbRomToClient(data);
            }
          }

          // 3. If not in Supabase yet, lookup in pre-existing static AOSP_ROMS catalog
          if (!foundRom) {
            const staticRom = AOSP_ROMS.find(r => 
              r.id === id || 
              r.name.toLowerCase() === id.toLowerCase() || 
              r.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase() ||
              (r.title && r.title.toLowerCase() === id.toLowerCase())
            );

            if (staticRom) {
              // Pre-fill form from static ROM definition
              foundRom = {
                ...staticRom,
                status: staticRom.status === 'Official' ? 'published' : 'draft',
                maintainer: staticRom.maintainer || adminProfile?.name || '',
                maintainerHandle: staticRom.maintainerHandle || adminProfile?.username || '',
                maintainerUrl: staticRom.maintainerUrl || '',
                device: staticRom.device || 'sky',
                variant: staticRom.variant || 'Official'
              };
            }
          }

          if (foundRom) {
            // Verify permissions based on the authoritative ROM Permission Matrix
            const hasOwnership = foundRom.maintainerId === adminProfile?.userId;
            const canEditThis = isSuper || isAdmin || isModerator || ((isMaintainer || isDeveloper) && hasOwnership);

            if (!canEditThis) {
              showToast({ title: 'Unauthorized access: You do not have permission to edit this ROM.', type: 'error' });
              navigate('/admin');
              return;
            }
            setRom(foundRom);
          } else {
            showToast({ title: 'ROM not found in registry', type: 'error' });
            navigate('/admin');
          }
        } catch (error) {
          console.error('Error fetching ROM:', error);
          showToast({ title: 'Failed to load ROM details', type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchRom();
    } else if (adminProfile) {
      // Create new ROM release validation
      const canCreate = isSuper || isAdmin || isMaintainer;
      if (!canCreate) {
        showToast({ title: 'Unauthorized: Only administrators and maintainers can create new ROMs.', type: 'error' });
        navigate('/admin');
        return;
      }
      setRom(prev => ({
        ...prev,
        maintainer: adminProfile.name,
        maintainerId: adminProfile.userId,
        maintainerHandle: adminProfile.username,
        maintainerUrl: adminProfile.telegramUrl || ''
      }));
      setLoading(false);
    }
  }, [id, adminProfile, isSuper, isAdmin, isModerator, isMaintainer, isDeveloper, navigate, showToast]);

  // Image upload handling for ROM icon or screenshots
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'screenshot') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image size (max 2MB limit for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      showToast({ title: 'Image file too large. Max 2MB allowed.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;

      if (type === 'logo') {
        setRom(prev => ({ ...prev, logoUrl: base64String }));
        showToast({ title: 'Logo image updated', type: 'success' });
      } else {
        const newScreenshot: RomScreenshot = {
          id: Date.now().toString(),
          imageUrl: base64String,
          sortOrder: (rom.screenshots?.length || 0) + 1,
          createdAt: new Date().toISOString()
        };
        setRom(prev => ({
          ...prev,
          screenshots: [...(prev.screenshots || []), newScreenshot]
        }));
        showToast({ title: 'Screenshot added to gallery', type: 'success' });
      }
    };
    reader.onerror = () => {
      showToast({ title: 'Failed to read image file', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  // Changelog item helpers
  const handleAddChangelog = () => {
    if (!newChangelogItem.trim()) return;
    setRom(prev => ({
      ...prev,
      changelog: [...(prev.changelog || []), newChangelogItem.trim()]
    }));
    setNewChangelogItem('');
  };

  const handleRemoveChangelog = (index: number) => {
    setRom(prev => ({
      ...prev,
      changelog: (prev.changelog || []).filter((_, i) => i !== index)
    }));
  };

  // Extra link helpers
  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    setRom(prev => ({
      ...prev,
      extraLinks: [...(prev.extraLinks || []), { label: newLinkTitle.trim(), url: newLinkUrl.trim() }]
    }));
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    setRom(prev => ({
      ...prev,
      extraLinks: (prev.extraLinks || []).filter((_, i) => i !== index)
    }));
  };

  // Delete ROM from Supabase database
  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this ROM from Supabase database? This action is permanent.')) return;

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete ROM from database');
      }

      showToast({ title: 'ROM deleted successfully from Supabase', type: 'success' });
      localStorage.removeItem(`rom_draft_${id}`);
      navigate('/admin');
    } catch (error: any) {
      console.error('Error deleting ROM:', error);
      showToast({ title: error.message || 'Failed to delete ROM', type: 'error' });
    }
  };

  // Saves or updates the ROM record directly in the Supabase database via the authenticated Express API
  const handleSave = async (e: React.FormEvent, explicitStatus?: RomItem['status']) => {
    if (e) e.preventDefault();
    
    const newInvalidFields: string[] = [];
    if (!rom.name) newInvalidFields.push('name');
    if (!rom.version) newInvalidFields.push('version');
    if (!rom.url) newInvalidFields.push('url');
    if (!rom.androidVersion) newInvalidFields.push('androidVersion');

    if (newInvalidFields.length > 0) {
      setInvalidFields(newInvalidFields);
      showToast({ title: 'Please fill in all required fields marked with *', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      // Default to published if superadmin saves, or user's explicit selection
      const targetStatus = explicitStatus || rom.status || (isSuperAdmin ? 'published' : 'draft');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Dispatch POST request to backend API to upsert into Supabase
      const response = await fetch('/api/admin/roms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...rom,
          id: rom.id || id, // Pass ID if present
          status: targetStatus,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save ROM changes to Supabase database');
      }

      const result = await response.json();
      
      // Clear local draft cache on success
      localStorage.removeItem(`rom_draft_${id || 'new'}`);
      
      showToast({ title: result.message || `ROM updated successfully in Supabase database!`, type: 'success' });
      navigate('/admin');
    } catch (error: any) {
      console.error('Save error:', error);
      showToast({ title: error.message || 'Failed to save ROM', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#EBE4CF] dark:border-[#36342A] border-t-[#FDE694] animate-spin" />
      </div>
    );
  }

  const romEditorTitle = id 
    ? `Edit ${rom.name || 'ROM'} ${rom.version ? `v${rom.version}` : ''} ${rom.androidVersion ? `(Android ${rom.androidVersion})` : ''} | Maintainer Studio`
    : "Publish New Custom ROM Release | Maintainer Studio";

  const romEditorDescription = id
    ? `Update release notes, download mirrors, changelog, and assets for ${rom.name || 'custom ROM'} on POCO M6 Pro 5G / Redmi 12 5G (sky).`
    : "Configure and publish a new custom ROM, recovery, or kernel build for POCO M6 Pro 5G & Redmi 12 5G (sky / sm4450).";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SEO
        title={romEditorTitle}
        description={romEditorDescription}
        canonicalUrl={id ? `/admin/roms/${id}/edit` : "/admin/roms/new"}
        noIndex={true}
      />
      
      {/* Header bar with Back button and Status Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-3 bg-white dark:bg-[#151410] rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] transition-all text-[#121212] dark:text-[#F4EFE6] cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tighter uppercase">
              {id ? `EDIT ROM: ${rom.name || 'Release'}` : 'NEW ROM RELEASE'}
            </h1>
            <p className="text-xs text-[#787567] dark:text-[#BDB8A4] font-medium">
              Changes will be saved and synchronized directly in the Supabase database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showDraftSaved && (
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 animate-pulse">
              Local Auto-Draft Saved
            </span>
          )}
          <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
            rom.status === 'published' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
            rom.status === 'approved' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
            rom.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
            'bg-gray-500/10 text-gray-600 border border-gray-500/20'
          }`}>
            Status: {rom.status || 'draft'}
          </span>
        </div>
      </div>

      <form onSubmit={(e) => handleSave(e)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Form Body */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Core Identification & Version Section */}
            <SpotlightCard className="p-6 sm:p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
              <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-6 flex items-center gap-2">
                <Info size={16} /> CORE ROM INFORMATION
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div 
                  className="sm:col-span-2"
                  animate={invalidFields.includes('name') ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    ROM Name / Brand *
                  </label>
                  <input
                    type="text"
                    value={rom.name || ''}
                    onChange={(e) => {
                      setRom(prev => ({ ...prev, name: e.target.value }));
                      setInvalidFields(prev => prev.filter(f => f !== 'name'));
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border ${invalidFields.includes('name') ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'border-[#EBE4CF] dark:border-[#36342A]'} text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-bold disabled:opacity-50`}
                    placeholder="e.g. AxionAOSP, EvolutionX, PixelOS, LineageOS"
                    required
                    disabled={!canModifyField('name')}
                  />
                </motion.div>

                <motion.div
                  animate={invalidFields.includes('version') ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Build Version *
                  </label>
                  <input
                    type="text"
                    value={rom.version || ''}
                    onChange={(e) => {
                      setRom(prev => ({ ...prev, version: e.target.value }));
                      setInvalidFields(prev => prev.filter(f => f !== 'version'));
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border ${invalidFields.includes('version') ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'border-[#EBE4CF] dark:border-[#36342A]'} text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-bold disabled:opacity-50`}
                    placeholder="e.g. v2.7, 14.2, 10.4.1"
                    required
                    disabled={!canModifyField('version')}
                  />
                </motion.div>

                <motion.div
                  animate={invalidFields.includes('androidVersion') ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Android Version *
                  </label>
                  <select
                    value={rom.androidVersion || '15'}
                    onChange={(e) => {
                      setRom(prev => ({ ...prev, androidVersion: e.target.value }));
                      setInvalidFields(prev => prev.filter(f => f !== 'androidVersion'));
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border ${invalidFields.includes('androidVersion') ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'border-[#EBE4CF] dark:border-[#36342A]'} text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-bold disabled:opacity-50`}
                    disabled={!canModifyField('androidVersion')}
                  >
                    <option value="17">Android 17</option>
                    <option value="16">Android 16</option>
                    <option value="15">Android 15</option>
                    <option value="14">Android 14</option>
                    <option value="13">Android 13</option>
                    <option value="12">Android 12</option>
                  </select>
                </motion.div>

                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Device Codename
                  </label>
                  <input
                    type="text"
                    value={rom.device || 'sky'}
                    onChange={(e) => setRom(prev => ({ ...prev, device: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-mono text-sm disabled:opacity-50"
                    placeholder="sky / POCO M6 Pro 5G / Redmi 12 5G"
                    disabled={!canModifyField('device')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Package Variant / Flavor
                  </label>
                  <input
                    type="text"
                    value={rom.variant || 'Official'}
                    onChange={(e) => setRom(prev => ({ ...prev, variant: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-medium text-sm disabled:opacity-50"
                    placeholder="e.g. Official, GAPPS, Vanilla, Unofficial"
                    disabled={!canModifyField('variant')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Description & Overview
                  </label>
                  <textarea
                    value={rom.description || ''}
                    onChange={(e) => setRom(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-medium leading-relaxed disabled:opacity-50"
                    placeholder="Describe build features, battery optimizations, kernel details, or special instructions..."
                    disabled={!canModifyField('description')}
                  />
                </div>
              </div>
            </SpotlightCard>

            {/* Maintainer Details Section */}
            <SpotlightCard className="p-6 sm:p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
              <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-6 flex items-center gap-2">
                <UserCheck size={16} /> MAINTAINER ATTRIBUTION
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Maintainer Name
                  </label>
                  <input
                    type="text"
                    value={rom.maintainer || ''}
                    onChange={(e) => setRom(prev => ({ ...prev, maintainer: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-bold disabled:opacity-50"
                    placeholder="e.g. Arrowsploit, Amit, Topex, Kaif"
                    disabled={!canModifyField('maintainer')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Maintainer Handle (@)
                  </label>
                  <input
                    type="text"
                    value={rom.maintainerHandle || ''}
                    onChange={(e) => setRom(prev => ({ ...prev, maintainerHandle: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-mono text-sm disabled:opacity-50"
                    placeholder="@arrowsploit"
                    disabled={!canModifyField('maintainerHandle')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Maintainer Profile / Telegram URL
                  </label>
                  <input
                    type="url"
                    value={rom.maintainerUrl || ''}
                    onChange={(e) => setRom(prev => ({ ...prev, maintainerUrl: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-mono text-sm disabled:opacity-50"
                    placeholder="https://t.me/arrowsploit"
                    disabled={!canModifyField('maintainerUrl')}
                  />
                </div>
              </div>
            </SpotlightCard>

            {/* Downloads & External Links */}
            <SpotlightCard className="p-6 sm:p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
              <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-6 flex items-center gap-2">
                <Globe size={16} /> DOWNLOADS & REPOSITORIES
              </h3>
              
              <div className="space-y-6">
                <motion.div
                  animate={invalidFields.includes('url') ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Download URL (SourceForge, Google Drive, Direct) *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={rom.url || ''}
                      onChange={(e) => {
                        setRom(prev => ({ ...prev, url: e.target.value }));
                        setInvalidFields(prev => prev.filter(f => f !== 'url'));
                      }}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border ${invalidFields.includes('url') ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'border-[#EBE4CF] dark:border-[#36342A]'} text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-mono text-sm disabled:opacity-50`}
                      placeholder="https://sourceforge.net/projects/..."
                      required
                      disabled={!canModifyField('url')}
                    />
                    <Globe size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${invalidFields.includes('url') ? 'text-red-500' : 'text-[#787567] dark:text-[#BDB8A4]'}`} />
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                      Source Code Repository
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={rom.sourceUrl || ''}
                        onChange={(e) => setRom(prev => ({ ...prev, sourceUrl: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-mono text-sm disabled:opacity-50"
                        placeholder="https://github.com/..."
                        disabled={!canModifyField('sourceUrl')}
                      />
                      <Github size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                      Community Discussion Link
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={rom.communityUrl || ''}
                        onChange={(e) => setRom(prev => ({ ...prev, communityUrl: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-mono text-sm disabled:opacity-50"
                        placeholder="https://t.me/..."
                        disabled={!canModifyField('communityUrl')}
                      />
                      <MessageSquare size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
                    </div>
                  </div>
                </div>

                {/* Additional Mirrors and Links */}
                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">
                    Extra Mirrors & External Links
                  </label>
                  
                  <div className="space-y-2 mb-3">
                    {rom.extraLinks?.map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <LinkIcon size={14} className="text-[#FDE694] shrink-0" />
                          <span className="font-bold">{link.label}:</span>
                          <span className="font-mono text-[#787567] dark:text-[#BDB8A4] truncate">{link.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(idx)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      placeholder="Link Label (e.g. Mirror 2, GApps)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                    />
                    <input
                      type="url"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-4 py-2 bg-[#FDE694] text-[#121212] text-xs font-bold rounded-xl hover:bg-[#FCE076] transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    >
                      <Plus size={14} /> Add Link
                    </button>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* Changelog & Release Notes */}
            <SpotlightCard className="p-6 sm:p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
              <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-6 flex items-center gap-2">
                <FileText size={16} /> DETAILED CHANGELOG & RELEASE NOTES
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  {rom.changelog?.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-xs gap-3">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FDE694] mt-1.5 shrink-0" />
                        <span className="leading-relaxed font-medium">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChangelog(idx)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove entry"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChangelogItem}
                    onChange={(e) => setNewChangelogItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChangelog();
                      }
                    }}
                    placeholder="Enter changelog item (e.g. Added Leica Camera, Kernel upstreamed to 5.4.280)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddChangelog}
                    className="px-4 py-2.5 bg-[#FDE694] text-[#121212] text-xs font-bold rounded-xl hover:bg-[#FCE076] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus size={14} /> Add Line
                  </button>
                </div>
              </div>
            </SpotlightCard>

            {/* Screenshots Gallery Section */}
            <SpotlightCard className="p-6 sm:p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase flex items-center gap-2">
                  <ImageIcon size={16} /> SCREENSHOTS GALLERY
                </h3>
                <label className="cursor-pointer px-4 py-2 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-bold hover:border-[#FDE694] transition-colors flex items-center gap-2">
                  <Upload size={14} /> ADD IMAGE
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'screenshot')} />
                </label>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {rom.screenshots?.map((shot) => (
                  <div key={shot.id} className="relative group aspect-[9/16] rounded-xl overflow-hidden border border-[#EBE4CF] dark:border-[#36342A] bg-black/5">
                    <img src={shot.imageUrl} alt="ROM Screenshot" decoding="async" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setRom(prev => ({ ...prev, screenshots: prev.screenshots?.filter(s => s.id !== shot.id) }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {(!rom.screenshots || rom.screenshots.length === 0) && (
                  <div className="col-span-full py-10 flex flex-col items-center border border-dashed border-[#EBE4CF] dark:border-[#36342A] rounded-2xl">
                    <ImageIcon size={28} className="text-[#EBE4CF] dark:text-[#36342A] mb-2" />
                    <p className="text-[#787567] dark:text-[#BDB8A4] text-xs font-medium uppercase tracking-wider">No screenshots attached yet</p>
                  </div>
                )}
              </div>
            </SpotlightCard>
          </div>

          {/* Sidebar Controls & Publishing */}
          <div className="space-y-8">
            
            {/* ROM Logo Card */}
            <SpotlightCard className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
              <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-6">ROM LOGO</h3>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 aspect-square rounded-3xl bg-white dark:bg-[#151410] border-2 border-dashed border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-center overflow-hidden mb-4 group relative shadow-xs">
                  {rom.logoUrl ? (
                    <>
                      <img src={rom.logoUrl} alt="Logo" decoding="async" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                        <Upload size={24} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <Upload size={24} className="text-[#787567] dark:text-[#BDB8A4]" />
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'logo')} />
                </div>
                <p className="text-[10px] text-[#787567] dark:text-[#BDB8A4] text-center font-medium leading-relaxed">
                  Click to upload square icon. Max file size: 2MB.
                </p>
              </div>
            </SpotlightCard>

            {/* Admin Controls / Status Selector */}
            <SpotlightCard className="p-6 border border-amber-500/20 bg-amber-500/5 shadow-xs">
              <h3 className="text-xs font-black text-amber-600 dark:text-amber-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                <Shield size={14} /> PUBLISHING SETTINGS
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={rom.isPinned || false}
                      onChange={(e) => setRom(prev => ({ ...prev, isPinned: e.target.checked }))}
                      className="sr-only" 
                      disabled={!canModifyField('isPinned')}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${rom.isPinned ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'} ${!canModifyField('isPinned') ? 'opacity-50 cursor-not-allowed' : ''}`} />
                    <div className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-white transition-transform ${rom.isPinned ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-xs font-bold text-[#121212] dark:text-[#F4EFE6]">Feature on Top (Pinned)</span>
                </label>
                
                <div>
                  <label className="block text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 ml-1">
                    Release Status in Supabase
                  </label>
                  {isSuper || isAdmin || isModerator ? (
                    <select 
                      value={rom.status || 'published'}
                      onChange={(e) => setRom(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#151410] border border-amber-500/30 text-xs font-bold outline-none text-[#121212] dark:text-[#F4EFE6]"
                      disabled={!canModifyField('status')}
                    >
                      <option value="published">Published (Live to Community)</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending Review</option>
                      <option value="draft">Draft (Private)</option>
                    </select>
                  ) : (
                    <select 
                      value={rom.status === 'published' ? 'published' : (rom.status || 'draft')}
                      onChange={(e) => setRom(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#151410] border border-amber-500/30 text-xs font-bold outline-none text-[#121212] dark:text-[#F4EFE6]"
                      disabled={!canModifyField('status')}
                    >
                      <option value="draft">Draft (Private to Maintainer)</option>
                      <option value="pending">Submit for Admin Review</option>
                    </select>
                  )}
                </div>
              </div>
            </SpotlightCard>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-[#FDE694] text-[#121212] font-black text-sm rounded-2xl hover:bg-[#FCE076] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
              >
                <Save size={18} />
                {saving ? 'SAVING TO SUPABASE...' : 'SAVE & PERSIST ROM'}
              </button>

              {!(isSuper || isAdmin || isModerator) && (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={saving}
                  className="w-full py-3.5 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] font-bold text-xs rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={15} />
                  SUBMIT FOR APPROVAL
                </button>
              )}

              {id && (isSuper || isAdmin || ((isMaintainer || isDeveloper) && rom.maintainerId === adminProfile?.userId && rom.status === 'draft')) && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full py-3.5 bg-red-500/10 text-red-500 font-bold text-xs rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 size={16} />
                  DELETE FROM SUPABASE
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Maintainer Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-4 text-amber-500">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight">Submit for Admin Review</h3>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] font-medium">Pending state publication</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-medium leading-relaxed">
              Submitting this ROM will notify administrators to review and approve the release for the public directory.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] font-bold rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  setShowSubmitModal(false);
                  await handleSave(e as any, 'pending');
                }}
                disabled={saving}
                className="flex-1 py-3 bg-[#FDE694] text-[#121212] font-black rounded-2xl hover:bg-[#FCE076] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RomEditorPage;

