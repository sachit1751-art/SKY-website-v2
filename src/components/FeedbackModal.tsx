import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquarePlus, Bug, Sparkles, HelpCircle, Send, X, 
  CheckCircle2, AlertCircle, Loader2, ExternalLink, ShieldCheck,
  Smartphone, Info, ArrowUp, ThumbsUp, Search, Clock, PlusCircle, Pin
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export type FeedbackType = 'bug' | 'feature' | 'general';
export type FeedbackCategory = 'roms' | 'device_info' | 'website' | 'guide' | 'other';

interface PublicFeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'general';
  category: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
  adminResponse?: string | null;
  upvotes: number;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface FeedbackModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Relative time formatter helper
const formatRelativeTime = (timestamp: string | Date | undefined): string => {
  if (!timestamp) return 'recently';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'just now';
  if (diffInSeconds < 60) return 'just now';
  
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

export const FeedbackModal: React.FC<FeedbackModalProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'submit'>('browse');

  // Form State
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('feature');
  const [category, setCategory] = useState<FeedbackCategory>('roms');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  // Browse & Upvote State
  const [publicFeedback, setPublicFeedback] = useState<PublicFeedbackItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'bug' | 'feature'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [votingId, setVotingId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Load upvoted IDs from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sky_upvoted_feedback');
      if (stored) {
        setUpvotedIds(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Fetch public feedback feed when modal opens or switch tab
  const fetchPublicFeedback = async () => {
    setLoadingFeed(true);
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (res.ok && data.success) {
        setPublicFeedback(data.feedback || []);
      }
    } catch (err) {
      console.warn('Failed to load feedback feed:', err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPublicFeedback();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Upvoting a Feedback Entry
  const handleUpvote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (votingId === id) return;

    const hasVoted = upvotedIds.includes(id);
    const action = hasVoted ? 'downvote' : 'upvote';

    setVotingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record upvote');

      // Update in-memory state
      setPublicFeedback(prev => 
        prev.map(item => item.id === id ? { ...item, upvotes: data.upvotes } : item)
      );

      // Update local storage
      const newUpvoted = hasVoted 
        ? upvotedIds.filter(itemId => itemId !== id)
        : [...upvotedIds, id];
      setUpvotedIds(newUpvoted);
      localStorage.setItem('sky_upvoted_feedback', JSON.stringify(newUpvoted));

      showToast({ 
        title: hasVoted ? 'Upvote removed' : 'Upvoted! Thank you for supporting this request.', 
        type: 'success' 
      });
    } catch (err: any) {
      console.error('Upvote error:', err);
      showToast({ title: err.message || 'Failed to upvote. Please try again.', type: 'error' });
    } finally {
      setVotingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast({ title: 'Please fill in both title and description', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const diagnostics = includeDiagnostics ? {
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        deviceMemory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'unknown',
        platform: navigator.platform
      } : null;

      const payload = {
        type: feedbackType,
        category,
        title: title.trim(),
        description: description.trim(),
        contact: contact.trim() || null,
        deviceInfo: diagnostics
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmittedId(data.id || 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setIsSuccess(true);
      showToast({ title: 'Feedback submitted successfully', type: 'success' });

      // Automatically register upvote for creator's item
      if (data.id) {
        const nextVoted = [...upvotedIds, data.id];
        setUpvotedIds(nextVoted);
        localStorage.setItem('sky_upvoted_feedback', JSON.stringify(nextVoted));
      }

      // Refresh list
      fetchPublicFeedback();
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      showToast({ title: err.message || 'Failed to submit feedback. Try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContact('');
    setIsSuccess(false);
    setSubmittedId('');
    setActiveTab('browse');
  };

  // Filtered & Sorted Feed
  const filteredFeed = useMemo(() => {
    return publicFeedback
      .filter(item => {
        if (feedFilter !== 'all' && item.type !== feedFilter) return false;
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase().trim();
          const inTitle = (item.title || '').toLowerCase().includes(q);
          const inDesc = (item.description || '').toLowerCase().includes(q);
          const inCat = (item.category || '').toLowerCase().includes(q);
          if (!inTitle && !inDesc && !inCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aPinned = a.isPinned ? 1 : 0;
        const bPinned = b.isPinned ? 1 : 0;
        if (aPinned !== bPinned) return bPinned - aPinned;
        const votesA = typeof a.upvotes === 'number' ? a.upvotes : 0;
        const votesB = typeof b.upvotes === 'number' ? b.upvotes : 0;
        if (votesB !== votesA) return votesB - votesA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [publicFeedback, feedFilter, searchFilter]);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        id="floating-feedback-btn"
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Submit Feedback or Upvote Community Requests"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 group flex items-center gap-2.5 px-4 py-3 bg-[#121212] dark:bg-[#FDE694] text-[#FAF5E6] dark:text-[#121212] rounded-full shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 border border-[#36342A]/30 dark:border-[#FCE076] transition-all duration-200 cursor-pointer"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FDE694] dark:bg-[#121212] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FDE694] dark:bg-[#121212]"></span>
        </span>
        <MessageSquarePlus size={18} className="text-[#FDE694] dark:text-[#121212]" />
        <span className="text-xs font-bold tracking-wide uppercase pr-1 hidden sm:inline-block">
          Feedback & Ideas
        </span>
      </motion.button>

      {/* Modal Backdrop & Container */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setIsOpen(false)}
              className="fixed inset-0 bg-black/80 transition-opacity"
            />

            {/* Modal Dialog */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-[#FFFDF7] dark:bg-[#181712] border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-[#121212] dark:text-[#F4EFE6] max-h-[90vh] flex flex-col"
            >
              {/* Top Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#FDE694] via-[#F5D76E] to-[#E5C158] shrink-0" />

              {/* Modal Header */}
              <div className="px-6 pt-5 pb-3 border-b border-[#EBE4CF]/60 dark:border-[#36342A]/60 shrink-0">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FDE694]/20 dark:bg-[#FDE694]/10 border border-[#FDE694]/40 flex items-center justify-center text-[#9E7A1C] dark:text-[#FDE694]">
                      <MessageSquarePlus size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-[#121212] dark:text-[#F4EFE6]">
                        Community Feedback & Requests
                      </h3>
                      <p className="text-xs text-[#787567] dark:text-[#BDB8A4]">
                        Upvote favorite features or report issues for POCO M6 Pro 5G / Redmi 12 5G (sky)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => !submitting && setIsOpen(false)}
                    disabled={submitting}
                    className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                  <button
                    onClick={() => { setActiveTab('browse'); setIsSuccess(false); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'browse'
                        ? 'bg-[#121212] dark:bg-[#FDE694] text-white dark:text-[#121212] shadow-xs'
                        : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                    }`}
                  >
                    <ThumbsUp size={13} />
                    <span>Upvote Ideas & Reports ({publicFeedback.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'submit'
                        ? 'bg-[#121212] dark:bg-[#FDE694] text-white dark:text-[#121212] shadow-xs'
                        : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                    }`}
                  >
                    <PlusCircle size={13} />
                    <span>Submit New Report / Request</span>
                  </button>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {activeTab === 'browse' ? (
                  /* Browse & Upvote Feed Tab */
                  <div className="space-y-4">
                    {/* Search & Filter sub-bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#EBE4CF]/40 dark:border-[#36342A]/40">
                      <div className="flex items-center gap-1">
                        {(['all', 'feature', 'bug'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setFeedFilter(t)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                              feedFilter === t
                                ? 'bg-[#FDE694] text-[#121212]'
                                : 'bg-black/5 dark:bg-white/5 text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212]'
                            }`}
                          >
                            {t === 'all' ? 'All' : t === 'feature' ? '✨ Features' : '🐛 Bugs'}
                          </button>
                        ))}
                      </div>

                      <div className="relative flex-1 sm:max-w-xs">
                        <input
                          type="text"
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          placeholder="Search community ideas..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-medium outline-none focus:border-[#FDE694]"
                        />
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#787567] dark:text-[#BDB8A4]" />
                      </div>
                    </div>

                    {/* Feed List */}
                    {loadingFeed ? (
                      <div className="py-12 text-center text-[#787567] dark:text-[#BDB8A4] flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-[#FDE694]" />
                        <span className="text-xs">Loading community feedback...</span>
                      </div>
                    ) : filteredFeed.length === 0 ? (
                      <div className="py-10 text-center text-[#787567] dark:text-[#BDB8A4]">
                        <p className="text-sm font-medium mb-3">No submissions found matching your filter.</p>
                        <button
                          onClick={() => setActiveTab('submit')}
                          className="px-4 py-2 bg-[#FDE694] text-[#121212] rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Be the first to submit one!
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredFeed.map(item => {
                          const hasVoted = upvotedIds.includes(item.id);
                          const isVotingThis = votingId === item.id;
                          const voteCount = typeof item.upvotes === 'number' ? item.upvotes : 0;

                          return (
                            <div 
                              key={item.id}
                              className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                                item.isPinned
                                  ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/5'
                                  : 'border-[#EBE4CF] dark:border-[#2C2A22] bg-white dark:bg-[#151410] hover:border-[#FDE694]/50'
                              }`}
                            >
                              {/* Interactive Upvote Button */}
                              <button
                                onClick={(e) => handleUpvote(item.id, e)}
                                disabled={isVotingThis}
                                className={`flex flex-col items-center justify-center p-2.5 min-w-[50px] rounded-xl border transition-all cursor-pointer shrink-0 ${
                                  hasVoted
                                    ? 'bg-[#FDE694] border-[#FCE076] text-[#121212] shadow-xs scale-105 font-black'
                                    : 'bg-black/5 dark:bg-white/5 border-transparent text-[#787567] dark:text-[#BDB8A4] hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30'
                                }`}
                                title={hasVoted ? 'You upvoted this! Click to remove vote.' : 'Click to upvote this item'}
                              >
                                <ArrowUp size={16} className={`stroke-[2.5] ${isVotingThis ? 'animate-bounce' : ''}`} />
                                <span className="text-xs font-black">{voteCount}</span>
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  {item.isPinned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                      <Pin size={10} className="fill-current" />
                                      <span>PINNED</span>
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[#787567] dark:text-[#BDB8A4] uppercase">
                                    {item.type === 'bug' ? '🐛 Bug' : item.type === 'feature' ? '✨ Feature' : '💬 General'}
                                  </span>

                                  {item.status === 'resolved' && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20">
                                      Resolved
                                    </span>
                                  )}
                                  {item.status === 'in_progress' && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-500 border border-blue-500/20">
                                      In Progress
                                    </span>
                                  )}

                                  <span className="text-[10px] text-[#787567] dark:text-[#BDB8A4] font-mono flex items-center gap-1 ml-auto">
                                    <Clock size={10} />
                                    {formatRelativeTime(item.createdAt)}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-[#121212] dark:text-[#F4EFE6] leading-snug mb-1">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed line-clamp-2">
                                  {item.description}
                                </p>

                                {item.adminResponse && (
                                  <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                                    <span className="font-bold">Maintainer Response: </span>
                                    {item.adminResponse}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : isSuccess ? (
                  /* Success View */
                  <div className="py-6 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 mb-4">
                      <CheckCircle2 size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-[#121212] dark:text-[#F4EFE6] mb-2">
                      Feedback Received!
                    </h4>
                    <p className="text-sm text-[#787567] dark:text-[#BDB8A4] max-w-md mb-6 leading-relaxed">
                      Thank you for contributing to the POCO M6 Pro 5G / Redmi 12 5G (sky) ecosystem. Your submission is now available for community upvoting!
                    </p>

                    {submittedId && (
                      <div className="px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl border border-[#EBE4CF] dark:border-[#36342A] text-xs font-mono text-[#787567] dark:text-[#BDB8A4] mb-6">
                        Reference ID: <span className="font-bold text-[#121212] dark:text-[#FDE694]">{submittedId}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={resetForm}
                        className="px-6 py-2.5 bg-[#FDE694] text-[#121212] font-bold text-xs rounded-xl hover:bg-[#FCE076] transition-all cursor-pointer"
                      >
                        View in Community Feed
                      </button>
                      <a
                        href="https://t.me/PocoM6Pro5G_Community"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] text-xs font-bold rounded-xl hover:border-[#FDE694] flex items-center gap-1.5 transition-all"
                      >
                        Join Telegram Group <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Main Submission Form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Feedback Type Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] mb-2">
                        Feedback Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setFeedbackType('bug')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            feedbackType === 'bug'
                              ? 'bg-[#FDE694]/15 border-[#FDE694] text-[#121212] dark:text-[#FDE694]'
                              : 'bg-white dark:bg-[#151410] border-[#EBE4CF] dark:border-[#36342A] text-[#787567] dark:text-[#BDB8A4] hover:border-[#FDE694]/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-black">
                            <Bug size={14} className="text-red-500" /> Bug Report
                          </div>
                          <span className="text-[10px] opacity-75 line-clamp-1">Glitch, broken link, crash</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFeedbackType('feature')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            feedbackType === 'feature'
                              ? 'bg-[#FDE694]/15 border-[#FDE694] text-[#121212] dark:text-[#FDE694]'
                              : 'bg-white dark:bg-[#151410] border-[#EBE4CF] dark:border-[#36342A] text-[#787567] dark:text-[#BDB8A4] hover:border-[#FDE694]/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-black">
                            <Sparkles size={14} className="text-amber-500" /> Feature
                          </div>
                          <span className="text-[10px] opacity-75 line-clamp-1">New ROM, tool, idea</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFeedbackType('general')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            feedbackType === 'general'
                              ? 'bg-[#FDE694]/15 border-[#FDE694] text-[#121212] dark:text-[#FDE694]'
                              : 'bg-white dark:bg-[#151410] border-[#EBE4CF] dark:border-[#36342A] text-[#787567] dark:text-[#BDB8A4] hover:border-[#FDE694]/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-black">
                            <HelpCircle size={14} className="text-blue-500" /> Question
                          </div>
                          <span className="text-[10px] opacity-75 line-clamp-1">General query or feedback</span>
                        </button>
                      </div>
                    </div>

                    {/* Topic Category */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] mb-1.5">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-medium outline-none focus:border-[#FDE694] cursor-pointer"
                      >
                        <option value="roms">ROMs Catalog & Download Links</option>
                        <option value="device_info">Device Specs & Hardware Info</option>
                        <option value="guide">Flashing Guides & Bootloader Unlocking</option>
                        <option value="website">Website UI / Mobile Performance</option>
                        <option value="other">Other / General Ecosystem</option>
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] mb-1.5">
                        Subject / Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                          feedbackType === 'bug'
                            ? 'e.g., PixelOS 14 download mirror link is 404'
                            : feedbackType === 'feature'
                            ? 'e.g., Add Evolution X 15 Android 16 release'
                            : 'e.g., Question regarding HyperOS bootloader unlock'
                        }
                        maxLength={150}
                        required
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-medium outline-none focus:border-[#FDE694]"
                      />
                    </div>

                    {/* Detailed Message */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] mb-1.5">
                        Detailed Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details, steps to reproduce, or suggestions so maintainers can act quickly..."
                        rows={4}
                        maxLength={2000}
                        required
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-medium outline-none focus:border-[#FDE694] resize-none"
                      />
                    </div>

                    {/* Contact (Optional) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] mb-1.5 flex items-center justify-between">
                        <span>Your Contact (Optional)</span>
                        <span className="text-[10px] font-normal text-[#787567] dark:text-[#BDB8A4]">For follow-ups</span>
                      </label>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Telegram @handle, GitHub username, or Email"
                        maxLength={100}
                        className="w-full px-3.5 py-2 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-medium outline-none focus:border-[#FDE694]"
                      />
                    </div>

                    {/* Include Diagnostics Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#EBE4CF]/80 dark:border-[#36342A]/80">
                      <div className="flex items-center gap-2">
                        <Smartphone size={15} className="text-[#787567] dark:text-[#BDB8A4]" />
                        <span className="text-xs text-[#787567] dark:text-[#BDB8A4]">
                          Include browser & device diagnostic context
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeDiagnostics}
                        onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                        className="w-4 h-4 rounded text-[#FDE694] accent-[#FDE694] cursor-pointer"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('browse')}
                        disabled={submitting}
                        className="px-5 py-2.5 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] text-xs font-bold rounded-xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={submitting || !title.trim() || !description.trim()}
                        className="px-6 py-2.5 bg-[#FDE694] border border-[#FCE076] text-[#121212] font-bold text-xs rounded-xl hover:bg-[#FCE076] transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Submitting...
                          </>
                        ) : (
                          <>
                            <Send size={14} /> Send Feedback
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
