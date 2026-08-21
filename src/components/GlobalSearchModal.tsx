import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import {
  X,
  Cpu,
  ArrowRight,
  Sparkles,
  Hash,
  BookOpen
} from 'lucide-react';
import {
  AnimatedSearch,
  AnimatedSmartphone,
  AnimatedLayers,
  AnimatedCircleHelp,
  AnimatedUsers,
  AnimatedMessageCircle,
  AnimatedDownload,
  AnimatedExternalLink,
  AnimatedChevronRight
} from './icons';
import { AOSP_ROMS, SPEC_CATEGORIES, COMMUNITY_FAQS, TEAM_MEMBERS, COMMUNITY_CHANNELS } from '../data';
import { RomItem, SpecCategory, FAQItem, TeamMember, CommunityChannel } from '../../shared/types';

export interface SearchResultItem {
  id: string;
  type: 'rom' | 'spec' | 'faq' | 'team' | 'channel' | 'page';
  title: string;
  subtitle: string;
  categoryBadge: string;
  badgeColor?: string;
  url: string;
  external?: boolean;
  metadata?: string;
  romData?: RomItem;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRom?: (rom: RomItem) => void;
}

// Build searchable index once at module load
const generateAllSearchItems = (): SearchResultItem[] => {
  const items: SearchResultItem[] = [];

  // 1. Primary Pages & Documentation Hubs
  items.push(
    {
      id: 'page-home',
      type: 'page',
      title: 'Home Overview',
      subtitle: 'SKY Project presentation, open-hardware philosophy & highlights',
      categoryBadge: 'Overview',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      url: '/'
    },
    {
      id: 'page-device',
      type: 'page',
      title: 'Device Specifications & Hardware',
      subtitle: 'Comprehensive hardware breakdown for Snapdragon 4 Gen 2 (SM4450)',
      categoryBadge: 'Hardware',
      badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      url: '/device'
    },
    {
      id: 'page-roms',
      type: 'page',
      title: 'Custom ROMs Repository',
      subtitle: 'Explore all Android 16 & 17 official and unofficial builds',
      categoryBadge: 'Repository',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      url: '/roms'
    },
    {
      id: 'page-team',
      type: 'page',
      title: 'Developers & Core Maintainers',
      subtitle: 'Ecosystem developers, device maintainers, and community leaders',
      categoryBadge: 'Team',
      badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      url: '/team'
    },
    {
      id: 'page-community',
      type: 'page',
      title: 'Community Channels & FAQ Guides',
      subtitle: 'Flashing instructions, bootloader unlock guides & troubleshooting',
      categoryBadge: 'Guides',
      badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
      url: '/community'
    }
  );

  // 2. Custom ROMs
  AOSP_ROMS.forEach((rom) => {
    const changelogSnippet = rom.changelog ? rom.changelog.join(' • ') : '';
    items.push({
      id: `rom-${rom.id || rom.name}`,
      type: 'rom',
      title: rom.name,
      subtitle: `${rom.androidVersion} • ${rom.status} • By ${rom.maintainer} ${rom.description ? `• ${rom.description}` : ''}`,
      categoryBadge: rom.status === 'Official' ? 'Official ROM' : 'Unofficial ROM',
      badgeColor: rom.status === 'Official' 
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
        : 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
      url: `/roms?search=${encodeURIComponent(rom.name)}`,
      metadata: `${rom.androidVersion} ${rom.maintainer} ${changelogSnippet} ${rom.description || ''}`,
      romData: rom
    });
  });

  // 3. Device Specs
  SPEC_CATEGORIES.forEach((spec) => {
    const highlightsText = spec.highlights.map((h) => `${h.label}: ${h.value}`).join(' • ');
    items.push({
      id: `spec-${spec.id}`,
      type: 'spec',
      title: `${spec.title} — ${spec.tagline}`,
      subtitle: `${spec.details} • ${highlightsText}`,
      categoryBadge: 'Hardware Spec',
      badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      url: `/device#${spec.id}`,
      metadata: `${spec.details} ${highlightsText}`
    });
  });

  // 4. FAQs & Flashing Guides
  COMMUNITY_FAQS.forEach((faq) => {
    const tagsText = faq.tags ? faq.tags.join(' ') : '';
    items.push({
      id: `faq-${faq.id}`,
      type: 'faq',
      title: faq.question,
      subtitle: faq.answer,
      categoryBadge: `Guide: ${faq.category}`,
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      url: `/community#faq-${faq.id}`,
      metadata: `${faq.answer} ${tagsText}`
    });
  });

  // 5. Team Members
  TEAM_MEMBERS.forEach((member) => {
    items.push({
      id: `team-${member.id}`,
      type: 'team',
      title: `${member.name} (${member.handle})`,
      subtitle: `${member.role} • ${member.bio || 'Maintainer for SKY project ecosystem'}`,
      categoryBadge: member.role,
      badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      url: '/team',
      metadata: `${member.handle} ${member.role} ${member.bio || ''}`
    });
  });

  // 6. Community Channels
  COMMUNITY_CHANNELS.forEach((channel, idx) => {
    items.push({
      id: `channel-${idx}`,
      type: 'channel',
      title: channel.name,
      subtitle: channel.description,
      categoryBadge: channel.badge || 'Community',
      badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
      url: channel.url,
      external: true,
      metadata: `${channel.description}`
    });
  });

  return items;
};

const STATIC_SEARCH_ITEMS = generateAllSearchItems();

import { usePerformanceTier } from '../context/PerformanceContext';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRom
}) => {
  const { tier } = usePerformanceTier();
  const isVeryLowEnd = tier === 'low';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'roms' | 'specs' | 'guides' | 'community'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    let focusTimer: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
    return () => {
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [isOpen]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, filteredResults.length - 1)));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelectResult(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  // Filter items according to search query and selected filter tab
  const filteredResults = useMemo(() => {
    if (!isOpen) return [];
    const cleanQuery = query.trim();

    const baseItems = STATIC_SEARCH_ITEMS.filter((item) => {
      // Category filter check
      if (activeCategory === 'roms' && item.type !== 'rom') return false;
      if (activeCategory === 'specs' && item.type !== 'spec') return false;
      if (activeCategory === 'guides' && item.type !== 'faq') return false;
      if (activeCategory === 'community' && !['team', 'channel', 'page'].includes(item.type)) return false;
      return true;
    });

    if (!cleanQuery) return baseItems;

    const fuse = new Fuse(baseItems, {
      keys: [
        { name: 'title', weight: 1 },
        { name: 'subtitle', weight: 0.6 },
        { name: 'categoryBadge', weight: 0.4 },
        { name: 'metadata', weight: 0.3 }
      ],
      threshold: 0.35,
      distance: 100,
      ignoreLocation: true,
      includeScore: true
    });

    return fuse.search(cleanQuery).map(r => r.item);
  }, [isOpen, query, activeCategory]);


  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectResult = (item: SearchResultItem) => {
    onClose();
    if (item.external) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.url);
    }
  };

  const getResultIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'rom':
        return <AnimatedDownload size={16} className="text-emerald-600 dark:text-emerald-400" />;
      case 'spec':
        return <AnimatedSmartphone size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'faq':
        return <AnimatedCircleHelp size={16} className="text-amber-600 dark:text-amber-400" />;
      case 'team':
        return <AnimatedUsers size={16} className="text-purple-600 dark:text-purple-400" />;
      case 'channel':
        return <AnimatedMessageCircle size={16} className="text-cyan-600 dark:text-cyan-400" />;
      case 'page':
      default:
        return <AnimatedLayers size={16} className="text-[#787567] dark:text-[#BDB8A4]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`fixed inset-0 bg-gradient-to-b from-black/80 to-black/60 transition-opacity`}
        />

        {/* Command Palette Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl shadow-xl overflow-hidden z-10 my-4"
        >
          {/* Top Search Input Bar */}
          <div className="p-4 sm:p-5 border-b border-[#EBE4CF] dark:border-[#36342A] flex items-center gap-3 bg-[#FAF0CF]/40 dark:bg-[#14130F]/60">
            <AnimatedSearch size={20} className="text-[#787567] dark:text-[#BDB8A4] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documentation, ROMs, specs, or guides..."
              className="w-full bg-transparent text-base sm:text-lg font-semibold text-[#49473E] dark:text-[#F4EFE6] placeholder-[#787567]/60 dark:placeholder-[#BDB8A4]/60 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-[#787567] hover:text-[#121212] dark:text-[#BDB8A4] dark:hover:text-[#F4EFE6] cursor-pointer"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#EBE4CF]/70 dark:bg-[#36342A]/70 text-[#787567] dark:text-[#BDB8A4] border border-[#EBE4CF] dark:border-[#36342A]">
              ESC
            </kbd>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 py-2.5 border-b border-[#EBE4CF] dark:border-[#36342A] flex items-center gap-1.5 overflow-x-auto bg-[#FAF0CF]/20 dark:bg-[#14130F]/30 no-scrollbar">
            {[
              { id: 'all', label: 'All Results' },
              { id: 'roms', label: 'ROMs' },
              { id: 'specs', label: 'Hardware Specs' },
              { id: 'guides', label: 'Guides & FAQ' },
              { id: 'community', label: 'Team & Community' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] shadow-2xs'
                    : 'text-[#787567] dark:text-[#BDB8A4] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#36342A]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2 sm:p-3 space-y-1">
            {filteredResults.length > 0 ? (
              filteredResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    data-index={index}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex items-start gap-3.5 p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FAF0CF] dark:bg-[#25231C] border border-[#EBE4CF] dark:border-[#36342A] shadow-xs'
                        : 'hover:bg-[#FAF0CF]/50 dark:hover:bg-[#25231C]/50 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      {getResultIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#49473E] dark:text-[#F4EFE6] group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-colors">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-[#EBE4CF]/60 text-[#787567]'}`}
                        >
                          {item.categoryBadge}
                        </span>
                      </div>
                      <p className="text-xs text-[#787567] dark:text-[#BDB8A4] line-clamp-2 leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.external ? (
                        <AnimatedExternalLink size={16} className="text-[#787567] dark:text-[#BDB8A4]" />
                      ) : (
                        <AnimatedChevronRight size={16} className="text-[#787567] dark:text-[#BDB8A4]" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 px-4 text-center space-y-2">
                <p className="text-sm font-semibold text-[#49473E] dark:text-[#F4EFE6]">
                  No matching documentation or ROMs found for "{query}"
                </p>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] max-w-sm mx-auto">
                  Try searching for keywords like <span className="font-semibold text-[#49473E] dark:text-[#FDE694]">/e/os, Axion, Infinity, Snapdragon, Display, Unlock Bootloader, or Kernel</span>.
                </p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts Guide */}
          <div className="p-3 sm:px-5 sm:py-3 border-t border-[#EBE4CF] dark:border-[#36342A] bg-[#FAF0CF]/40 dark:bg-[#14130F]/60 flex items-center justify-between text-[11px] text-[#787567] dark:text-[#BDB8A4]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#EBE4CF]/70 dark:bg-[#36342A]/70 font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[#EBE4CF]/70 dark:bg-[#36342A]/70 font-mono text-[10px]">↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#EBE4CF]/70 dark:bg-[#36342A]/70 font-mono text-[10px]">↵</kbd>
                <span>to select</span>
              </span>
            </div>
            <div className="hidden sm:block">
              <span>{filteredResults.length} items indexed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
