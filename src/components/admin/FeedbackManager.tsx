import React, { useState, useEffect, useMemo } from 'react';
import { SpotlightCard } from '../SpotlightCard';
import { FeedbackItem } from '../../../shared/types';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { 
  MessageSquarePlus, Bug, Sparkles, HelpCircle, CheckCircle2, 
  Clock, XCircle, Trash2, Search, RefreshCw, Smartphone, 
  ExternalLink, Send, ChevronDown, ChevronUp, UserCheck, Filter,
  ThumbsUp, ArrowUp, ArrowDownUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Format timestamp into human-readable relative time (e.g., '2 hours ago', 'just now')
const formatRelativeTime = (timestamp: string | Date | undefined): string => {
  if (!timestamp) return 'recently';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'just now';
  if (diffInSeconds < 60) return 'just now';
  
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

export const FeedbackManager: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'bug' | 'feature' | 'general'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved' | 'dismissed'>('all');
  const [sortBy, setSortBy] = useState<'upvotes' | 'newest' | 'oldest'>('upvotes');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/feedback', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load feedback');
      setFeedbackList(data.feedback || []);
    } catch (err: any) {
      console.warn('Feedback fetch notice:', err);
      showToast({ title: 'Failed to fetch feedback from Supabase', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: FeedbackItem['status'], adminResponse?: string) => {
    setUpdatingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: newStatus,
          adminResponse: adminResponse !== undefined ? adminResponse : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setFeedbackList(prev => prev.map(f => f.id === id ? data.feedback : f));
      showToast({ title: `Feedback marked as ${newStatus}`, type: 'success' });
    } catch (err: any) {
      console.error('Update status error:', err);
      showToast({ title: err.message || 'Failed to update feedback status', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpvote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVotingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upvote failed');

      setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, upvotes: data.upvotes } : f));
      showToast({ title: 'Upvote recorded!', type: 'success' });
    } catch (err: any) {
      console.error('Upvote error:', err);
      showToast({ title: 'Failed to record vote', type: 'error' });
    } finally {
      setVotingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this feedback entry?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setFeedbackList(prev => prev.filter(f => f.id !== id));
      showToast({ title: 'Feedback entry deleted', type: 'success' });
    } catch (err: any) {
      console.error('Delete feedback error:', err);
      showToast({ title: err.message || 'Failed to delete entry', type: 'error' });
    }
  };

  const filteredFeedback = useMemo(() => {
    const list = feedbackList.filter(item => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = (item.title || '').toLowerCase().includes(q);
        const inDesc = (item.description || '').toLowerCase().includes(q);
        const inContact = (item.contact || '').toLowerCase().includes(q);
        const inCat = (item.category || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inContact && !inCat) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'upvotes') {
        const votesA = typeof a.upvotes === 'number' ? a.upvotes : 0;
        const votesB = typeof b.upvotes === 'number' ? b.upvotes : 0;
        if (votesB !== votesA) return votesB - votesA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [feedbackList, typeFilter, statusFilter, searchQuery, sortBy]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug size={14} className="text-red-500" />;
      case 'feature': return <Sparkles size={14} className="text-amber-500" />;
      default: return <HelpCircle size={14} className="text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span 
            id={`status-badge-${status}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <CheckCircle2 size={12} className="stroke-[2.5]" />
            <span>Resolved</span>
          </span>
        );
      case 'in_progress':
        return (
          <span 
            id={`status-badge-${status}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <Clock size={12} className="stroke-[2.5]" />
            <span>In Progress</span>
          </span>
        );
      case 'dismissed':
        return (
          <span 
            id={`status-badge-${status}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-500/15 text-stone-600 dark:text-stone-400 border border-stone-500/30"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
            <XCircle size={12} className="stroke-[2.5]" />
            <span>Dismissed</span>
          </span>
        );
      default:
        return (
          <span 
            id={`status-badge-pending`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <Clock size={12} className="stroke-[2.5]" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Type & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#EBE4CF]/40 dark:bg-[#151410]/80 rounded-xl">
            {(['all', 'bug', 'feature', 'general'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-white dark:bg-[#2C2A22] text-[#121212] dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                }`}
              >
                {t === 'all' ? 'All Types' : t === 'bug' ? 'Bugs' : t === 'feature' ? 'Features' : 'General'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#EBE4CF]/40 dark:bg-[#151410]/80 rounded-xl">
            {(['all', 'pending', 'resolved', 'dismissed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white dark:bg-[#2C2A22] text-[#121212] dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                }`}
              >
                {s === 'all' ? 'All Status' : s === 'pending' ? 'Pending' : s === 'resolved' ? 'Resolved' : 'Dismissed'}
              </button>
            ))}
          </div>

          {/* Sort By Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#EBE4CF]/40 dark:bg-[#151410]/80 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] px-2 flex items-center gap-1">
              <ArrowDownUp size={11} /> Sort:
            </span>
            {(['upvotes', 'newest', 'oldest'] as const).map(sort => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  sortBy === sort
                    ? 'bg-white dark:bg-[#2C2A22] text-[#121212] dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                }`}
              >
                {sort === 'upvotes' ? 'Most Upvoted' : sort === 'newest' ? 'Newest' : 'Oldest'}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-medium outline-none focus:border-[#FDE694]"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
          </div>

          <button
            onClick={fetchFeedback}
            className="p-2 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[#787567] dark:text-[#BDB8A4]"
            title="Refresh Feedback from Supabase"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Feedback Count Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-[#181712] border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl">
          <div className="text-[11px] font-bold text-[#787567] dark:text-[#BDB8A4] uppercase">Total Reports</div>
          <div className="text-xl font-black text-[#121212] dark:text-[#F4EFE6]">{feedbackList.length}</div>
        </div>
        <div className="p-3 bg-white dark:bg-[#181712] border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl">
          <div className="text-[11px] font-bold text-yellow-600 dark:text-yellow-400 uppercase">Pending Action</div>
          <div className="text-xl font-black text-yellow-600 dark:text-yellow-400">
            {feedbackList.filter(f => f.status === 'pending').length}
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-[#181712] border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
            <ThumbsUp size={11} /> Total Upvotes
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            {feedbackList.reduce((acc, f) => acc + (typeof f.upvotes === 'number' ? f.upvotes : 0), 0)}
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-[#181712] border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl">
          <div className="text-[11px] font-bold text-green-500 uppercase">Resolved</div>
          <div className="text-xl font-black text-green-500">
            {feedbackList.filter(f => f.status === 'resolved').length}
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-[#787567] dark:text-[#BDB8A4] flex flex-col items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#FDE694]" />
            <span className="text-xs font-mono">Syncing feedback with Supabase database...</span>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <SpotlightCard className="p-12 text-center border border-[#EBE4CF] dark:border-[#2C2A22] bg-[#FFFDF7] dark:bg-[#181712]">
            <div className="w-12 h-12 rounded-full bg-[#EBE4CF]/40 dark:bg-[#36342A]/40 flex items-center justify-center mx-auto mb-4 text-[#787567] dark:text-[#BDB8A4]">
              <MessageSquarePlus size={24} />
            </div>
            <h4 className="text-lg font-bold text-[#121212] dark:text-[#F4EFE6] mb-1">No Feedback Entries</h4>
            <p className="text-xs text-[#787567] dark:text-[#BDB8A4] max-w-sm mx-auto">
              {searchQuery ? 'No results matched your search criteria.' : 'No user reports or feedback submissions found in this category.'}
            </p>
          </SpotlightCard>
        ) : (
          filteredFeedback.map((item) => {
            const isExpanded = expandedId === item.id;
            const voteCount = typeof item.upvotes === 'number' ? item.upvotes : 0;
            const isVoting = votingId === item.id;

            return (
              <SpotlightCard 
                key={item.id}
                className="p-5 border border-[#EBE4CF] dark:border-[#2C2A22] bg-white dark:bg-[#181712] transition-all hover:border-[#FDE694]/50"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Upvote Button Component */}
                    <button
                      onClick={(e) => handleUpvote(item.id, e)}
                      disabled={isVoting}
                      className="group/vote flex flex-col items-center justify-center p-2 min-w-[48px] rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-700 dark:text-amber-300 border border-amber-500/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                      title="Click to Upvote this report/request"
                    >
                      <ArrowUp size={16} className={`stroke-[2.5] transition-transform group-hover/vote:-translate-y-0.5 ${isVoting ? 'animate-bounce' : ''}`} />
                      <span className="text-xs font-black tracking-tight">{voteCount}</span>
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[#787567] dark:text-[#BDB8A4] uppercase">
                          {item.category.replace('_', ' ')}
                        </span>
                        {getStatusBadge(item.status)}
                        <span 
                          className="text-[11px] text-[#787567] dark:text-[#BDB8A4] font-mono flex items-center gap-1 cursor-help"
                          title={new Date(item.createdAt).toLocaleString(undefined, { 
                            dateStyle: 'full', 
                            timeStyle: 'medium' 
                          })}
                        >
                          <Clock size={11} className="opacity-70" />
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#121212] dark:text-[#F4EFE6] leading-snug">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-start">
                    {/* Quick 1-Click Status Toggles */}
                    {item.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'resolved')}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Mark Resolved directly"
                      >
                        <CheckCircle2 size={13} />
                        <span className="hidden sm:inline">Resolve</span>
                      </button>
                    )}
                    {item.status !== 'in_progress' && item.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Mark In Progress directly"
                      >
                        <Clock size={13} />
                        <span className="hidden sm:inline">In Progress</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Less' : 'Details'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Delete feedback entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Description Body */}
                <p className="text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed mb-3 whitespace-pre-wrap">
                  {item.description}
                </p>

                {/* Submitter & Diagnostic Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#787567] dark:text-[#BDB8A4] pt-2 border-t border-[#EBE4CF]/60 dark:border-[#36342A]/60">
                  {item.contact && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#121212] dark:text-[#F4EFE6]">Contact:</span>
                      <span className="text-blue-500 select-all">{item.contact}</span>
                    </div>
                  )}
                  {item.deviceInfo && (
                    <div className="flex items-center gap-1.5">
                      <Smartphone size={13} />
                      <span>{item.deviceInfo.platform || 'Device'} ({item.deviceInfo.screenSize || 'N/A'})</span>
                    </div>
                  )}
                </div>

                {/* Expanded Management Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-[#EBE4CF] dark:border-[#36342A] space-y-3"
                    >
                      {/* Diagnostic Deep Dive */}
                      {item.deviceInfo && (
                        <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#EBE4CF] dark:border-[#36342A] text-xs font-mono space-y-1 text-[#787567] dark:text-[#BDB8A4]">
                          <div className="font-bold text-[#121212] dark:text-[#F4EFE6] mb-1">Diagnostic Context:</div>
                          {item.deviceInfo.url && <div>URL: <span className="text-[#121212] dark:text-[#F4EFE6]">{item.deviceInfo.url}</span></div>}
                          {item.deviceInfo.userAgent && <div className="break-all">UserAgent: {item.deviceInfo.userAgent}</div>}
                          {item.deviceInfo.deviceMemory && <div>RAM: {item.deviceInfo.deviceMemory}</div>}
                        </div>
                      )}

                      {/* Admin Note / Response */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] mb-1">
                          Maintainer Note / Resolution Status
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText[item.id] !== undefined ? replyText[item.id] : (item.adminResponse || '')}
                            onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                            placeholder="Add maintainer notes or action taken..."
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-medium outline-none focus:border-[#FDE694]"
                          />
                          <button
                            onClick={() => handleUpdateStatus(item.id, item.status, replyText[item.id])}
                            disabled={updatingId === item.id}
                            className="px-4 py-1.5 bg-[#FDE694] text-[#121212] font-bold text-xs rounded-xl hover:bg-[#FCE076] transition-all cursor-pointer shrink-0"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-xs font-bold text-[#787567] dark:text-[#BDB8A4] mr-2">
                          Set Status:
                        </span>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'resolved')}
                          disabled={updatingId === item.id || item.status === 'resolved'}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                          disabled={updatingId === item.id || item.status === 'in_progress'}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Mark In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'pending')}
                          disabled={updatingId === item.id || item.status === 'pending'}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Mark Pending
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'dismissed')}
                          disabled={updatingId === item.id || item.status === 'dismissed'}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border border-gray-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SpotlightCard>
            );
          })
        )}
      </div>
    </div>
  );
};
