import React, { useState, useEffect } from 'react';
import { FAQItem } from '../../shared/types';
import { COMMUNITY_FAQS } from '../data';
import { 
  Plus, 
  Minus, 
  Sparkles, 
  Flame, 
  Cpu, 
  Wrench, 
  Layers, 
  X,
  ExternalLink,
  Copy,
  Check,
  Send
} from 'lucide-react';
import {
  AnimatedSearch,
  AnimatedCircleHelp,
  AnimatedMessageCircle
} from './icons';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal } from './ScrollReveal';
import { useToast } from '../context/ToastContext';

interface FAQBlockProps {
  initialOpenId?: string;
}

export const CommunityFAQSection: React.FC<FAQBlockProps> = ({
  initialOpenId
}) => {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Handle direct hash navigation (e.g., #faq-bootloader-unlock)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#faq-')) {
        const id = hash.replace('#faq-', '');
        setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setTimeout(() => {
          const el = document.getElementById(`faq-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      } else if (initialOpenId) {
        setOpenIds((prev) => (prev.includes(initialOpenId) ? prev : [...prev, initialOpenId]));
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [initialOpenId]);

  const categories = [
    { id: 'all', label: 'All Questions', icon: AnimatedCircleHelp },
    { id: 'flashing', label: 'Flashing & Unlocking', icon: Flame },
    { id: 'compatibility', label: 'Compatibility & GApps', icon: Layers },
    { id: 'troubleshooting', label: 'Troubleshooting & Recovery', icon: Wrench },
    { id: 'general', label: 'Banking & Daily Use', icon: Cpu },
  ];

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenIds(filteredFaqs.map((f) => f.id));
  };

  const collapseAll = () => {
    setOpenIds([]);
  };

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#faq-${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast({
      title: 'Link Copied',
      message: 'Direct link copied to clipboard',
      type: 'success'
    });
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 2000);
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setSearchQuery(tag);
    setSelectedCategory('all');
  };

  const filteredFaqs = COMMUNITY_FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesSearch =
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.tags?.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="space-y-8" id="community-faq" aria-labelledby="faq-heading">
      {/* FAQ Block Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0CF] dark:bg-[#25231C] text-[#49473E] dark:text-[#FDE694] text-xs font-bold uppercase tracking-wider border border-[#EBE4CF] dark:border-[#36342A]">
            <AnimatedMessageCircle size={14} className="text-[#121212] dark:text-[#FDE694]" />
            <span>Knowledge Base & FAQs</span>
          </div>

          <h2 
            id="faq-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] tracking-tight"
          >
            Frequently Asked Questions
          </h2>

          <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
            Essential answers on bootloader unlocking, custom recoveries, Play Integrity banking support, GApps compatibility, and troubleshooting.
          </p>
        </div>

        {/* Global Expand/Collapse Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] hover:border-[#FDE694] transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (FAQ Block Style) */}
      <div className="bg-[#FAF3DD] dark:bg-[#1F1E18] p-4 sm:p-6 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] space-y-4 shadow-xs">
        {/* Search Input */}
        <div className="relative">
          <AnimatedSearch size={16} className="text-[#787567] dark:text-[#BDB8A4] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g., bootloader, banking, bootloop, recovery, GApps)..."
            aria-label="Search frequently asked questions"
            className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FFF8E1] dark:bg-[#151410] text-[#49473E] dark:text-[#F4EFE6] placeholder-[#787567]/60 dark:placeholder-[#BDB8A4]/50 text-xs sm:text-sm border border-[#EBE4CF] dark:border-[#36342A] focus:outline-none focus:ring-2 focus:ring-[#FDE694] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#787567] dark:text-[#BDB8A4] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1" role="tablist" aria-label="FAQ categories">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const categoryCount = COMMUNITY_FAQS.filter((f) => cat.id === 'all' || f.category === cat.id).length;
            
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FDE694] text-[#121212] border-[#EBE4CF] dark:border-transparent shadow-xs scale-[1.02]'
                    : 'bg-[#FFF8E1] dark:bg-[#151410] text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:text-[#121212] dark:hover:text-[#F4EFE6] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected 
                    ? 'bg-[#121212]/10 text-[#121212] font-extrabold' 
                    : 'bg-[#EBE4CF] dark:bg-[#2B2921] text-[#787567] dark:text-[#BDB8A4]'
                }`}>
                  {categoryCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 21st.dev FAQ Block Accordion List */}
      <div className="space-y-3.5" role="region" aria-label="Questions list">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-14 px-6 rounded-3xl bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A]">
            <AnimatedCircleHelp size={40} className="mx-auto text-[#787567] dark:text-[#BDB8A4] mb-3 opacity-40" />
            <h3 className="text-base sm:text-lg font-bold text-[#49473E] dark:text-[#F4EFE6]">
              No matching FAQs found
            </h3>
            <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] mt-1.5 max-w-sm mx-auto">
              We couldn't find any questions matching "{searchQuery}". Try a different keyword or view all categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-5 px-5 py-2 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212] hover:bg-[#fbdc70] transition-all shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIds.includes(faq.id);
            const indexStr = (index + 1).toString().padStart(2, '0');

            return (
              <ScrollReveal key={faq.id} delayMs={index * 30} distance={8}>
                <div
                  id={`faq-${faq.id}`}
                  style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 120px' }}
                  className={`group rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-[#FAF3DD] dark:bg-[#1F1E18] border-[#49473E]/30 dark:border-[#FDE694]/50 shadow-md ring-1 ring-[#FDE694]/30'
                      : 'bg-[#FAF3DD]/85 dark:bg-[#1F1E18]/85 border-[#EBE4CF] dark:border-[#36342A] hover:border-[#49473E]/25 dark:hover:border-[#FDE694]/30 hover:bg-[#FAF3DD] dark:hover:bg-[#1F1E18]'
                  }`}
                >
                  {/* Header / Question Accordion Trigger */}
                  <button
                    type="button"
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694]"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                      {/* Numeral Index Pill / Tag */}
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl shrink-0 transition-colors ${
                          isOpen
                            ? 'bg-[#FDE694] text-[#121212] shadow-xs'
                            : 'bg-[#FFF8E1] dark:bg-[#151410] text-[#787567] dark:text-[#BDB8A4] border border-[#EBE4CF] dark:border-[#36342A] group-hover:border-[#FDE694]/40'
                        }`}
                      >
                        {indexStr}
                      </span>

                      {/* Question Title */}
                      <h3 className="text-sm sm:text-base font-bold text-[#49473E] dark:text-[#F4EFE6] leading-snug group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-colors">
                        {faq.question}
                      </h3>
                    </div>

                    {/* Interactive Plus/Minus Toggle (21st.dev signature motion) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? 'bg-[#FDE694] text-[#121212] rotate-90 shadow-xs'
                            : 'bg-[#FFF8E1] dark:bg-[#151410] text-[#787567] dark:text-[#BDB8A4] border border-[#EBE4CF] dark:border-[#36342A] group-hover:bg-[#FAF0CF] dark:group-hover:bg-[#25231C]'
                        }`}
                      >
                        {isOpen ? (
                          <Minus className="w-4 h-4 transition-transform" />
                        ) : (
                          <Plus className="w-4 h-4 transition-transform" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expandable Body */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: 'auto', 
                          opacity: 1,
                          transition: {
                            height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.2, delay: 0.05 }
                          }
                        }}
                        exit={{ 
                          height: 0, 
                          opacity: 0,
                          transition: {
                            height: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.15 }
                          }
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed border-t border-[#EBE4CF]/80 dark:border-[#36342A]/80 space-y-4">
                          {/* Answer Text with proper code formatting if present */}
                          <div className="whitespace-pre-line pt-3 font-normal">
                            {faq.answer}
                          </div>

                          {/* Related Tags and Direct Link Sharing */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EBE4CF]/50 dark:border-[#36342A]/50">
                            {faq.tags && faq.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#49473E]/70 dark:text-[#F4EFE6]/70 mr-1">
                                  Tags:
                                </span>
                                {faq.tags.map((tag, tIdx) => (
                                  <button
                                    key={tIdx}
                                    type="button"
                                    onClick={(e) => handleTagClick(e, tag)}
                                    className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8E1] dark:bg-[#151410] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] hover:border-[#FDE694] transition-colors cursor-pointer"
                                  >
                                    #{tag}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Copy Link Button */}
                            <button
                              type="button"
                              onClick={(e) => handleCopyLink(e, faq.id)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#FFF8E1] dark:bg-[#151410] text-[#787567] dark:text-[#BDB8A4] border border-[#EBE4CF] dark:border-[#36342A] hover:text-[#121212] dark:hover:text-[#F4EFE6] hover:bg-[#FAF0CF] dark:hover:bg-[#25231C] transition-colors cursor-pointer ml-auto"
                              title="Copy link to this question"
                            >
                              {copiedId === faq.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Share</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })
        )}
      </div>

      {/* 21st.dev Callout / Bottom Support Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF0CF]/70 dark:bg-[#23211A] border border-[#EBE4CF] dark:border-[#36342A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FDE694] flex items-center justify-center shrink-0 text-[#121212] shadow-2xs">
            <Sparkles className="w-5 h-5 fill-[#121212]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#49473E] dark:text-[#F4EFE6]">
              Still have questions not covered here?
            </h4>
            <p className="text-[11px] sm:text-xs text-[#787567] dark:text-[#BDB8A4] mt-0.5">
              Ask device maintainers and power users directly in our community groups.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <a
            href="https://t.me/Redmi125GSupport"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-[#787567] dark:text-[#BDB8A4]" />
            <span>Ask on Telegram</span>
          </a>

          <a
            href="https://github.com/sm4450-development"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FDE694] text-[#121212] font-bold text-xs hover:bg-[#fbdc70] transition-colors shadow-2xs"
          >
            <span>GitHub Issues</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
