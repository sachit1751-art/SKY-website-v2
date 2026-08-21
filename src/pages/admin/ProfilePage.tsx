import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Admin } from '../../../shared/types'; // Adjust imports as necessary
import { SpotlightCard } from '../../components/SpotlightCard';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Upload, User, Github, MessageSquare, Globe, Info } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { adminProfile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<Admin>>(adminProfile || {});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminProfile) return;

    if (file.size > 1 * 1024 * 1024) {
      showToast({ title: 'Image too large. Max 1MB allowed.', type: 'error' });
      return;
    }

    // Read the file as Base64 for instant storage inside the database
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfile(prev => ({ ...prev, avatarUrl: base64String }));
      showToast({ title: 'Avatar updated successfully', type: 'success' });
    };
    reader.onerror = () => {
      showToast({ title: 'Failed to read avatar image', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('admins')
        .upsert({
          id: adminProfile.userId,
          name: profile.name || '',
          username: profile.username || '',
          bio: profile.bio || '',
          avatar_url: profile.avatarUrl || '',
          github_url: profile.githubUrl || '',
          telegram_url: profile.telegramUrl || '',
          website_url: profile.websiteUrl || '',
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      await refreshProfile();
      showToast({ title: 'Profile updated successfully', type: 'success' });
      navigate('/admin');
    } catch (error: any) {
      console.error('Save error:', error);
      showToast({ title: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const profileTitle = adminProfile?.name 
    ? `${adminProfile.name} - Maintainer Profile Settings | Admin Console` 
    : "Maintainer Profile Settings | Admin Console";

  const profileDesc = adminProfile?.name
    ? `Manage public profile credentials, avatar, bio, and social links for ${adminProfile.name} in the SKY maintainer directory.`
    : "Configure your SKY device maintainer profile, public links, and bio.";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SEO
        title={profileTitle}
        description={profileDesc}
        canonicalUrl="/admin/profile"
        noIndex={true}
      />
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => navigate('/admin')}
          className="p-3 bg-white dark:bg-[#151410] rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] transition-all text-[#121212] dark:text-[#F4EFE6]"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tighter uppercase">
          EDIT PROFILE
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Sidebar */}
          <div className="md:col-span-1">
            <SpotlightCard className="p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs sticky top-8">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 aspect-square rounded-3xl bg-white dark:bg-[#151410] border-2 border-dashed border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-center overflow-hidden mb-6 group relative">
                  {profile.avatarUrl ? (
                    <>
                      <img src={profile.avatarUrl} alt="Avatar" decoding="async" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload size={32} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <User size={48} className="text-[#787567] dark:text-[#BDB8A4]" />
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                </div>
                <h3 className="text-sm font-bold text-[#121212] dark:text-[#F4EFE6] mb-1">{profile.name}</h3>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] font-mono mb-6">@{profile.username}</p>
                <p className="text-[10px] text-[#787567] dark:text-[#BDB8A4] text-center leading-relaxed">
                  Click the avatar to upload a new one.<br />Max size: 1MB.
                </p>
              </div>
            </SpotlightCard>
          </div>

          {/* Form Content */}
          <div className="md:col-span-2 space-y-8">
            <SpotlightCard className="p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
              <h3 className="text-sm font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-8 flex items-center gap-2">
                <Info size={16} /> PUBLIC IDENTITY
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.name || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] outline-none font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">Username (Handle)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4] font-mono text-sm">@</span>
                      <input
                        type="text"
                        value={profile.username || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] outline-none font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">Role in SKY (Assigned by Superadmin)</label>
                  <input
                    type="text"
                    value={adminProfile?.role || profile.role || 'Unassigned'}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-[#EBE4CF]/30 dark:bg-[#1C1A14] border border-[#EBE4CF] dark:border-[#36342A] text-[#787567] dark:text-[#BDB8A4] font-bold cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">Avatar Image URL (Optional override)</label>
                  <input
                    type="text"
                    value={profile.avatarUrl || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] outline-none font-medium"
                    placeholder="https://example.com/avatar.png"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">Bio</label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] outline-none font-medium leading-relaxed"
                    placeholder="Tell the community about yourself..."
                  />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
              <h3 className="text-sm font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-8 flex items-center gap-2">
                <Globe size={16} /> SOCIAL LINKS
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">GitHub URL</label>
                    <div className="relative">
                      <Github size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
                      <input
                        type="url"
                        value={profile.githubUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] outline-none font-mono text-sm"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">Telegram URL</label>
                    <div className="relative">
                      <MessageSquare size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
                      <input
                        type="url"
                        value={profile.telegramUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, telegramUrl: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] outline-none font-mono text-sm"
                        placeholder="https://t.me/..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#121212] dark:text-[#F4EFE6] uppercase tracking-wider mb-2 ml-1">Website</label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
                    <input
                      type="url"
                      value={profile.websiteUrl || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-[#121212] dark:text-[#F4EFE6] outline-none font-mono text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </SpotlightCard>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-[#FDE694] text-[#121212] font-black rounded-2xl hover:bg-[#FCE076] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm shadow-black/5"
            >
              <Save size={20} />
              {saving ? 'UPDATING PROFILE...' : 'SAVE PROFILE CHANGES'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;

