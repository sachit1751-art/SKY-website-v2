import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { UserPlus } from 'lucide-react';
import { SpotlightCard } from '../SpotlightCard';

export const InviteMaintainer: React.FC = () => {
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('maintainer');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim() || !name.trim() || !email.trim()) {
      showToast({ title: 'Please provide UID, Name, and Email', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('admins').insert({
        id: uid.trim(),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        display_name: name.trim(),
        username: name.trim().toLowerCase().replace(/\s+/g, ''),
        role: role,
        active: true,
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_super_admin: false
      });

      if (error) throw error;

      showToast({ title: 'Maintainer invited successfully', type: 'success' });
      setUid('');
      setName('');
      setEmail('');
    } catch (error: any) {
      console.error('Error inviting maintainer:', error);
      showToast({ title: error.message || 'Failed to invite maintainer', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SpotlightCard className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
      <h3 className="text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-4 flex items-center gap-2">
        <UserPlus size={14} /> INVITE MAINTAINER
      </h3>
      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#787567] dark:text-[#BDB8A4] mb-1">User UID</label>
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#121212] dark:text-[#F4EFE6] outline-none focus:border-[#FDE694]"
            placeholder="Enter User UID"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#787567] dark:text-[#BDB8A4] mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#121212] dark:text-[#F4EFE6] outline-none focus:border-[#FDE694]"
            placeholder="maintainer@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#787567] dark:text-[#BDB8A4] mb-1">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#121212] dark:text-[#F4EFE6] outline-none focus:border-[#FDE694]"
            placeholder="Enter Name"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#787567] dark:text-[#BDB8A4] mb-1">Assigned Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#121212] dark:text-[#F4EFE6] outline-none focus:border-[#FDE694] cursor-pointer"
          >
            <option value="maintainer" className="dark:bg-[#181712]">Maintainer</option>
            <option value="developer" className="dark:bg-[#181712]">Developer</option>
            <option value="moderator" className="dark:bg-[#181712]">Moderator</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#FDE694] text-[#121212] font-black rounded-xl hover:bg-[#FCE076] transition-all disabled:opacity-50 text-sm shadow-xs cursor-pointer"
        >
          {loading ? 'INVITING...' : 'INVITE MAINTAINER'}
        </button>
      </form>
    </SpotlightCard>
  );
};
