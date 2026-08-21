import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SpotlightCard } from '../../components/SpotlightCard';
import { Shield, Search, Filter, Calendar, Download, ChevronLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from '../../components/SEO';
import { supabase } from '../../lib/supabase';

export const SecurityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'LOGIN', label: 'Logins' },
    { value: 'REGISTER', label: 'Registrations' },
    { value: 'CREATE_ROM', label: 'ROM Creation' },
    { value: 'UPDATE_ROM', label: 'ROM Updates' },
    { value: 'DELETE_ROM', label: 'ROM Deletion' },
    { value: 'APPROVE_ADMIN', label: 'Admin Approval' },
    { value: 'REJECT_ADMIN', label: 'Admin Rejection' },
    { value: 'DEACTIVATE_ADMIN', label: 'Admin Deactivation' },
  ];

  const filteredLogs = logs.filter(log => {
    const action = log.action || '';
    const adminUid = log.adminUid || '';
    const details = JSON.stringify(log.details || {}).toLowerCase();
    
    const matchesSearch = action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          adminUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          details.includes(searchTerm.toLowerCase());
    
    const matchesType = activityType === 'all' || action.toUpperCase().includes(activityType.toUpperCase());

    const logDate = log.timestamp && typeof log.timestamp.toDate === 'function' 
      ? log.timestamp.toDate() 
      : (log.timestamp ? new Date(log.timestamp) : null);
      
    let matchesDate = true;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && logDate && logDate >= start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && logDate && logDate <= end;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        let { data: { session } } = await supabase.auth.getSession();
        
        // Refresh token if needed
        if (!session?.access_token) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          session = refreshed?.session ?? null;
        }

        const token = session?.access_token;
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        const response = await fetch('/api/admin/logs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted) setLogs(data.logs || data || []);
        } else {
          // If server rejects with 401, attempt one session refresh
          if (response.status === 401) {
            const { data: refreshed } = await supabase.auth.refreshSession();
            if (refreshed?.session?.access_token) {
              const retryRes = await fetch('/api/admin/logs', {
                headers: { Authorization: `Bearer ${refreshed.session.access_token}` },
              });
              if (retryRes.ok) {
                const retryData = await retryRes.json();
                if (isMounted) {
                  setLogs(retryData.logs || retryData || []);
                  setLoading(false);
                }
                return;
              }
            }
          }

          // Fallback: try client-side Supabase direct query if session allows
          const { data: clientLogs, error: clientErr } = await supabase
            .from('admin_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

          if (!clientErr && clientLogs && isMounted) {
            const formatted = clientLogs.map((log: any) => ({
              id: log.id,
              adminUid: log.admin_uid,
              adminEmail: log.admin_email,
              action: log.action,
              details: log.details,
              timestamp: log.created_at
            }));
            setLogs(formatted);
          }
        }
      } catch (e: any) {
        console.warn('Fetch Logs Notice:', e?.message || e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const downloadCSV = () => {
    const headers = ['Action', 'Admin UID', 'Timestamp', 'Details'];
    const rows = filteredLogs.map(log => [
      log.action,
      log.adminUid,
      log.timestamp && typeof log.timestamp.toDate === 'function' 
        ? log.timestamp.toDate().toLocaleString() 
        : (log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'),
      JSON.stringify(log.details).replace(/"/g, '""')
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sky_security_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionColor = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes('DELETE') || a.includes('REJECT') || a.includes('DEACTIVATE')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (a.includes('CREATE') || a.includes('APPROVE')) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (a.includes('UPDATE')) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    return 'text-[#787567] bg-[#787567]/10 border-[#787567]/20';
  };

  const logsTitle = filteredLogs.length > 0
    ? `Security Audit Logs (${filteredLogs.length} Events) | Admin Console`
    : "Security Audit Logs | Admin Console";

  const logsDesc = `Real-time security audit trails, maintainer authentication events, and administrative action histories for the POCO M6 Pro 5G / Redmi 12 5G (sky) infrastructure.`;

  return (
    <>
      <SEO
        title={logsTitle}
        description={logsDesc}
        canonicalUrl="/admin/logs"
        noIndex={true}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <header className="mb-12">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-2 text-xs font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase mb-6 hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tighter flex items-center gap-4">
                SECURITY <span className="text-blue-500">AUDIT</span>
              </h1>
              <p className="text-[#787567] dark:text-[#BDB8A4] mt-2 font-medium">
                Comprehensive record of all administrative activities and system changes.
              </p>
            </div>
            
            <button 
              onClick={downloadCSV}
              disabled={filteredLogs.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#121212] dark:bg-[#F4EFE6] text-white dark:text-[#121212] font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-black/5"
            >
              <Download size={18} />
              EXPORT AUDIT (CSV)
            </button>
          </div>
        </header>

        {/* Filters Section */}
        <SpotlightCard className="p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest flex items-center gap-2">
                <Search size={12} /> Search
              </label>
              <input 
                type="text"
                placeholder="UID, action, or details..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-sm focus:border-[#FDE694] transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest flex items-center gap-2">
                <Filter size={12} /> Action Type
              </label>
              <select 
                value={activityType}
                onChange={e => setActivityType(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-sm focus:border-[#FDE694] transition-all outline-none appearance-none"
              >
                {activityTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Start Date
              </label>
              <input 
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-sm focus:border-[#FDE694] transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> End Date
              </label>
              <input 
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-sm focus:border-[#FDE694] transition-all outline-none"
              />
            </div>
          </div>
        </SpotlightCard>

        {/* Logs List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] tracking-widest uppercase">
              Found {filteredLogs.length} activity entries
            </p>
            {searchTerm || activityType !== 'all' || startDate || endDate ? (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setActivityType('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[10px] font-black text-red-500 tracking-widest uppercase hover:underline"
              >
                Clear All Filters
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 w-full bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-2xl animate-pulse" />
              ))
            ) : filteredLogs.length === 0 ? (
              <SpotlightCard className="p-20 border border-dashed border-[#EBE4CF] dark:border-[#36342A] bg-transparent flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#EBE4CF]/30 dark:bg-[#36342A]/30 flex items-center justify-center mb-6">
                  <AlertCircle size={32} className="text-[#787567] dark:text-[#BDB8A4]" />
                </div>
                <h4 className="text-lg font-bold text-[#121212] dark:text-[#F4EFE6] mb-2">No results found</h4>
                <p className="text-[#787567] dark:text-[#BDB8A4] text-sm max-w-xs leading-relaxed">
                  Adjust your search or filters to locate specific system records.
                </p>
              </SpotlightCard>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <SpotlightCard className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs group overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center gap-2 shrink-0 md:w-32">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${getActionColor(log.action)}`}>
                            {log.action}
                          </div>
                          <span className="text-[10px] font-mono text-[#787567] dark:text-[#BDB8A4]">
                            {log.timestamp && typeof log.timestamp.toDate === 'function' 
                              ? log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : (log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                            <div className="flex items-center gap-2">
                              <Shield size={14} className="text-blue-500" />
                              <span className="text-sm font-bold text-[#121212] dark:text-[#F4EFE6] truncate">
                                Admin UID: <span className="font-mono text-xs font-normal text-[#787567] dark:text-[#BDB8A4] ml-1">{log.adminUid}</span>
                              </span>
                            </div>
                            <span className="text-xs font-medium text-[#787567] dark:text-[#BDB8A4]">
                              {log.timestamp && typeof log.timestamp.toDate === 'function' 
                                ? log.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'N/A')}
                            </span>
                          </div>

                          <div className="bg-[#FAF8F1]/60 dark:bg-[#0A0908]/60 rounded-xl p-4 border border-[#EBE4CF] dark:border-[#36342A]">
                            <pre className="text-[11px] font-mono text-[#787567] dark:text-[#F4EFE6] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default SecurityLogsPage;


