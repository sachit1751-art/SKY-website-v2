import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SpotlightCard } from '../../components/SpotlightCard';
import { Shield, Check, X, Search, ChevronLeft, UserX, UserCheck, Trash2, Users, Clock, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from '../../components/SEO';
import { supabase } from '../../lib/supabase';

export const ApproveAdminsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [requests, setRequests] = useState<any[]>([]);
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const fetchRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      const [reqRes, allRes] = await Promise.all([
        fetch('/api/admin/requests', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/admins', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || reqData);
      }
      if (allRes.ok) {
        const allData = await allRes.json();
        setAllAdmins(allData.admins || allData);
      }
    } catch (e: any) {
      console.warn('Fetch Requests Error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});

  const handleAction = async (adminUid: string, action: 'approve' | 'reject' | 'deactivate' | 'reactivate' | 'delete-admin', overrideRole?: string) => {
    if (action === 'delete-admin' && !window.confirm('Are you sure you want to permanently delete this administrator account?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const payload: any = { adminUid };
      if (action === 'approve') {
        payload.role = overrideRole || selectedRoles[adminUid] || 'maintainer';
      }

      const response = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to perform ${action}`);
      
      showToast({ title: data.message || `Action completed successfully`, type: 'success' });
      fetchRequests();
    } catch (e: any) {
      showToast({ 
        title: 'Action Error', 
        message: e.message, 
        type: 'error' 
      });
    }
  };

  const listToDisplay = activeTab === 'pending' ? requests : allAdmins;
  const filteredList = listToDisplay.filter(req => 
    (req.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (req.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.userId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const approveTitle = activeTab === 'pending'
    ? `Pending Maintainer Applications (${requests.length}) | Admin Console`
    : `Maintainer Directory & Roles (${allAdmins.length}) | Admin Console`;

  const approveDesc = activeTab === 'pending'
    ? `Review, triage, and grant maintainer credentials for ${requests.length} pending candidate applications.`
    : `Manage role assignments, access privileges, and active statuses across ${allAdmins.length} registered maintainers and staff.`;

  return (
    <>
      <SEO
        title={approveTitle}
        description={approveDesc}
        canonicalUrl="/admin/approve"
        noIndex={true}
      />

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <header className="mb-10">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-2 text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-6 hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tighter">
                MANAGE <span className="text-[#FDE694]">ADMINISTRATORS</span>
              </h1>
              <p className="text-[#787567] dark:text-[#BDB8A4] mt-2 font-medium">
                Approve new maintainer requests, manage permissions, and govern administrative access.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-gradient-to-b from-white/90 to-white/70 dark:from-[#151410]/90 dark:to-[#151410]/70 rounded-2xl border border-[#EBE4CF] dark:border-[#36342A]">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'pending'
                    ? 'bg-[#FDE694] text-[#121212] shadow-sm'
                    : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                }`}
              >
                <Clock size={14} />
                Pending ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#FDE694] text-[#121212] shadow-sm'
                    : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                }`}
              >
                <Users size={14} />
                All Admins ({allAdmins.length})
              </button>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="relative mb-8">
          <input 
            type="text" 
            placeholder="Search administrators by name, username, or UID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 dark:bg-[#151410]/50 border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#121212] dark:text-[#F4EFE6] focus:ring-2 focus:ring-[#FDE694] outline-none transition-all font-medium"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
        </div>

        {/* Admin List */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-24 w-full bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-2xl animate-pulse" />
            ))
          ) : filteredList.length === 0 ? (
            <SpotlightCard className="p-16 border border-dashed border-[#EBE4CF] dark:border-[#36342A] bg-transparent flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#EBE4CF]/30 dark:bg-[#36342A]/30 flex items-center justify-center mb-6">
                <Users size={32} className="text-[#787567] dark:text-[#BDB8A4]" />
              </div>
              <h4 className="text-lg font-bold text-[#121212] dark:text-[#F4EFE6] mb-2">
                {activeTab === 'pending' ? 'No pending registration requests' : 'No administrators found'}
              </h4>
              <p className="text-[#787567] dark:text-[#BDB8A4] text-sm max-w-xs">
                {activeTab === 'pending' 
                  ? 'All maintainer registration applications have been processed.' 
                  : 'No admin accounts match the current search query.'}
              </p>
            </SpotlightCard>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredList.map(req => {
                const isSuper = req.role === 'superadmin' || req.isSuperAdmin === true;
                const isApproved = req.active === true && req.approvalStatus === 'approved';

                return (
                  <motion.div
                    key={req.id || req.userId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <SpotlightCard className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-center overflow-hidden shrink-0">
                          {req.avatarUrl ? (
                            <img src={req.avatarUrl} alt={req.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-black text-[#121212] dark:text-[#FDE694]">
                              {(req.name || 'A').charAt(0)}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-[#121212] dark:text-[#F4EFE6]">{req.name}</h3>
                            <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-black uppercase tracking-wider ${
                              isSuper ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                              req.role === 'maintainer' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                            }`}>
                              {req.role || 'maintainer'}
                            </span>
                            <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-black uppercase tracking-wider ${
                              isApproved ? 'bg-green-500/10 text-green-500' :
                              req.approvalStatus === 'rejected' ? 'bg-red-500/10 text-red-500' :
                              'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {req.approvalStatus || (req.active ? 'approved' : 'pending')}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#787567] dark:text-[#BDB8A4]">
                            <span>@{req.username || 'unknown'}</span>
                            {req.telegramUsername && <span>• TG: @{req.telegramUsername}</span>}
                            <span>• UID: <span className="font-mono text-[11px]">{req.userId || req.id}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {req.approvalStatus === 'pending' || !req.active ? (
                          <>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-[#151410] px-2.5 py-1.5 rounded-xl border border-[#EBE4CF] dark:border-[#36342A]">
                              <span className="text-[10px] font-black uppercase text-[#787567] dark:text-[#BDB8A4]">Assign Role:</span>
                              <select
                                value={selectedRoles[req.id || req.userId] || (req.role !== 'pending' ? req.role : 'maintainer')}
                                onChange={(e) => setSelectedRoles(prev => ({ ...prev, [req.id || req.userId]: e.target.value }))}
                                className="bg-transparent text-xs font-bold text-[#121212] dark:text-[#F4EFE6] outline-none cursor-pointer"
                              >
                                <option value="maintainer" className="dark:bg-[#181712]">Maintainer</option>
                                <option value="developer" className="dark:bg-[#181712]">Developer</option>
                                <option value="moderator" className="dark:bg-[#181712]">Moderator</option>
                              </select>
                            </div>
                            <button 
                              onClick={() => handleAction(req.id || req.userId, 'approve')} 
                              className="px-4 py-2.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-green-500/20 transition-all cursor-pointer"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => handleAction(req.id || req.userId, 'reject')} 
                              className="px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-red-500/20 transition-all cursor-pointer"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        ) : (
                          <>
                            {!isSuper && (
                              <button 
                                onClick={() => handleAction(req.id || req.userId, 'deactivate')} 
                                className="px-4 py-2.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-black font-bold rounded-xl text-xs flex items-center gap-2 border border-yellow-500/20 transition-all"
                                title="Temporarily disable admin privileges"
                              >
                                <UserX size={14} /> Deactivate
                              </button>
                            )}
                          </>
                        )}

                        {!isSuper && (
                          <button 
                            onClick={() => handleAction(req.id || req.userId, 'delete-admin')} 
                            className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"
                            title="Delete Account Permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ApproveAdminsPage;


