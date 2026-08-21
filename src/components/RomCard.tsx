import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpotlightCard } from './SpotlightCard';
import { RomItem } from '../../shared/types';
import {
  Layers,
  Star,
  Sparkles,
  Send,
  FileText,
  Check,
  Copy,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';

interface RomCardProps {
  rom: RomItem;
  isSaved: boolean;
  isCompared: boolean;
  isThisCopied: boolean;
  isExpanded: boolean;
  mirrorLabel: string;
  staggerItemVariants?: any;
  onToggleCompare: (rom: RomItem, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectRom: (rom: RomItem) => void;
  onCopyLink: (url: string, e: React.MouseEvent) => void;
  onToggleExpand: (id: string, e: React.MouseEvent) => void;
  onShowDownloadToast: (name: string, url: string) => void;
}

export const RomCard: React.FC<RomCardProps> = memo(({
  rom,
  isSaved,
  isCompared,
  isThisCopied,
  isExpanded,
  mirrorLabel,
  staggerItemVariants,
  onToggleCompare,
  onToggleSave,
  onSelectRom,
  onCopyLink,
  onToggleExpand,
  onShowDownloadToast,
}) => {
  const isBeta = rom.description?.toLowerCase().includes('beta');
  const isOfficial = rom.status === 'Official';
  const romId = rom.id || rom.name;

  return (
    <motion.div
      variants={staggerItemVariants}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 350px' }}
    >
      <SpotlightCard className="rounded-3xl">
        <div 
          className="group bg-[#FAF3DD]/50 dark:bg-[#1F1E18]/60 hover:bg-[#FAF3DD] dark:hover:bg-[#1F1E18] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#EBE4CF] dark:border-[#36342A] transition-all duration-300 shadow-xs hover:shadow-md hover:border-[#FDE694]/60 dark:hover:border-[#FDE694]/40 relative"
        >
          {/* Quick Action Buttons (Top-Right: Compare & Bookmark) */}
          <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 flex items-center gap-1.5 z-10">
            <button
              onClick={(e) => onToggleCompare(rom, e)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 border ${
                isCompared
                  ? 'bg-[#FDE694] text-[#121210] border-[#FDE694] shadow-xs'
                  : 'text-[#787567] bg-[#FAF0CF]/60 dark:bg-[#151410] border-[#EBE4CF] dark:border-[#36342A] hover:text-[#121212] dark:hover:text-[#FAF3DD] hover:border-[#FDE694]/50'
              }`}
              title={isCompared ? "Remove from compare" : "Add to comparison"}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isCompared ? 'Compared' : '+ Compare'}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(romId, e);
              }}
              className={`p-2 rounded-xl transition-all active:scale-90 cursor-pointer ${
                isSaved
                  ? 'text-amber-500 bg-amber-500/15'
                  : 'text-[#787567] bg-[#FAF0CF]/60 dark:bg-[#151410] hover:text-amber-500 hover:bg-amber-500/10'
              }`}
              title={isSaved ? "Remove from saved" : "Save ROM"}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Main Card Content: Stacks vertically on mobile, horizontal on lg+ */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            
            {/* Left / Top Section: ROM Identity & Metadata */}
            <div 
              onClick={() => onSelectRom(rom)}
              className="cursor-pointer flex-1 min-w-0 pr-8 sm:pr-10 lg:pr-0"
            >
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                {/* ROM Logo */}
                {rom.logoUrl ? (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 aspect-square rounded-2xl overflow-hidden border border-[#EBE4CF] dark:border-[#36342A] shadow-xs shrink-0 group-hover:scale-105 transition-transform bg-white/20">
                    <img
                      src={rom.logoUrl}
                      alt={rom.name}
                      referrerPolicy="no-referrer"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#FDE694] flex items-center justify-center text-[#121212] font-black text-lg sm:text-2xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    {rom.name.charAt(0)}
                  </div>
                )}

                {/* Title & Badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#121212] dark:text-[#F4EFE6] tracking-tight group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-colors truncate">
                      {rom.name}
                    </h2>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                      isBeta 
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isBeta ? 'Beta' : 'Stable'}
                    </span>

                    {rom.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDE694]/60 text-[#121212] border border-[#FDE694]">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-[#49473E] dark:text-[#F4EFE6] bg-[#FAF3DD] dark:bg-[#151410] px-2 py-0.5 rounded-md border border-[#EBE4CF] dark:border-[#36342A] text-[11px]">
                      {rom.androidVersion}
                    </span>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        isOfficial
                          ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20'
                          : 'bg-[#EBE4CF]/60 dark:bg-[#36342A]/60 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A]'
                      }`}
                    >
                      {rom.status}
                    </span>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EBE4CF]/50 dark:bg-[#36342A]/50 text-[#787567] dark:text-[#BDB8A4]">
                      {mirrorLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specs & Maintainer Details */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#787567] dark:text-[#BDB8A4]">
                {/* Maintainer */}
                <div 
                  className="inline-flex items-center gap-1.5" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#787567]/80 dark:text-[#BDB8A4]/80">By:</span>
                  {rom.maintainerUrl ? (
                    <a
                      href={rom.maintainerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] bg-[#FAF0CF]/70 dark:bg-[#2B2921]/80 hover:bg-[#FDE694] dark:hover:bg-[#36342A] px-2 py-0.5 rounded-lg border border-[#EBE4CF] dark:border-[#36342A] transition-all text-xs"
                      title={`Visit ${rom.maintainer}'s Profile`}
                    >
                      <Send className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                      <span>{rom.maintainer}</span>
                    </a>
                  ) : (
                    <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6] bg-[#FAF0CF]/50 dark:bg-[#2B2921]/50 px-2 py-0.5 rounded-lg border border-[#EBE4CF] dark:border-[#36342A] text-xs">
                      {rom.maintainer}
                    </span>
                  )}
                </div>

                {/* Device / Variant */}
                {(rom.device || rom.variant) && (
                  <div className="inline-flex items-center gap-1.5">
                    {rom.device && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#FDE694]/20 text-[#49473E] dark:text-[#FDE694] border border-[#FDE694]/30 text-[10px] font-bold uppercase tracking-wider">
                        {rom.device}
                      </span>
                    )}
                    {rom.variant && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#FAF0CF]/40 dark:bg-[#2B2921]/40 text-[#787567] dark:text-[#BDB8A4] border border-[#EBE4CF] dark:border-[#36342A] text-[10px] font-bold uppercase tracking-wider">
                        {rom.variant}
                      </span>
                    )}
                  </div>
                )}

                {/* Download Count */}
                {rom.downloadCount !== undefined && (
                  <div className="inline-flex items-center gap-1 bg-[#FAF0CF]/40 dark:bg-[#2B2921]/40 px-2 py-0.5 rounded-lg border border-[#EBE4CF] dark:border-[#36342A] text-xs">
                    <svg className="w-3.5 h-3.5 text-[#787567] dark:text-[#BDB8A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="font-bold text-[#49473E] dark:text-[#F4EFE6]">
                      {rom.downloadCount >= 1000 ? `${(rom.downloadCount / 1000).toFixed(1)}K` : rom.downloadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right / Bottom Section: Action Controls */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 sm:pt-0 border-t border-[#EBE4CF]/70 dark:border-[#36342A]/70 lg:border-t-0 shrink-0"
            >
              {/* Changelog Modal Trigger Button */}
              <button
                onClick={() => onSelectRom(rom)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF0CF]/80 dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] dark:hover:bg-[#FDE694] dark:hover:text-[#121212] transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Open detailed release notes modal"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Changelog</span>
              </button>

              {/* Copy Link Button */}
              <button
                onClick={(e) => onCopyLink(rom.url, e)}
                className={`inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isThisCopied
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-[#FAF0CF]/60 dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                }`}
                title="Copy download URL"
              >
                {isThisCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Quick Inline Expand Toggle */}
              <button
                onClick={(e) => onToggleExpand(romId, e)}
                className={`inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isExpanded
                    ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent'
                    : 'bg-[#FAF0CF]/40 dark:bg-[#25231C]/60 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                }`}
                title="Toggle quick preview"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Primary CTA: Get ROM Button */}
              <a
                href={rom.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onShowDownloadToast(rom.name, rom.url)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              >
                <span>GET ROM</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#121212]" />
              </a>
            </div>
          </div>

          {/* Expandable Changelog Drawer Motion with Staggered Fade-in */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-[#EBE4CF] dark:border-[#36342A] space-y-4">
                  {/* Overview banner */}
                  {rom.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.05 }}
                      className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed bg-[#FFF8E1] dark:bg-[#12110D] p-4 rounded-2xl border border-[#EBE4CF] dark:border-[#36342A]"
                    >
                      {rom.description}
                    </motion.p>
                  )}

                  {/* Staggered Changelog Bullets */}
                  {rom.changelog && rom.changelog.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] block">
                        Build Highlights & Changes
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rom.changelog.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.25,
                              delay: 0.08 + i * 0.04,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="flex items-start gap-2 text-xs text-[#49473E] dark:text-[#F4EFE6] bg-[#FAF0CF]/40 dark:bg-[#25231C]/60 p-3 rounded-xl border border-[#EBE4CF] dark:border-[#36342A]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FDE694] mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Maintainer notes / Community quick link */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-2 text-[#787567] dark:text-[#BDB8A4]" onClick={(e) => e.stopPropagation()}>
                      <span>Built by</span>
                      {rom.maintainerUrl ? (
                        <a
                          href={rom.maintainerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-sky-600 dark:hover:text-[#FDE694] underline decoration-dotted underline-offset-2"
                          title={`Open ${rom.maintainer}'s Telegram profile`}
                        >
                          <Send className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                          <span>{rom.maintainer}</span>
                        </a>
                      ) : (
                        <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6]">
                          {rom.maintainer}
                        </span>
                      )}
                      <span>•</span>
                      <span>Verified on <code className="font-mono font-bold">sky</code></span>
                    </div>

                    <button
                      onClick={() => onSelectRom(rom)}
                      className="text-xs font-bold text-[#49473E] dark:text-[#FDE694] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Open complete modal</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SpotlightCard>
    </motion.div>
  );
});

RomCard.displayName = 'RomCard';
