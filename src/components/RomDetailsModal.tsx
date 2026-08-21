import React, { useEffect, useState } from 'react';
import { RomItem } from '../../shared/types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Copy, Check, ShieldCheck, Sparkles, AlertCircle, Send, FileText, CheckCircle2, Star } from 'lucide-react';
import { AnimatedDownload, AnimatedExternalLink } from './icons';
import { useToast } from '../context/ToastContext';
import { useSavedRoms } from '../hooks/useSavedRoms';
import Markdown from 'react-markdown';

import { usePerformanceTier } from '../context/PerformanceContext';
import { supabase } from '../lib/supabase';

interface RomDetailsModalProps {
  rom: RomItem | null;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  isCopied: boolean;
}

export const RomDetailsModal: React.FC<RomDetailsModalProps> = ({
  rom: initialRom,
  onClose,
  onCopyUrl,
  isCopied
}) => {
  const { showDownloadToast } = useToast();
  const { tier } = usePerformanceTier();
  const { toggleSave, isSaved } = useSavedRoms();
  const isVeryLowEnd = tier === 'low';

  const [rom, setRom] = useState<RomItem | null>(initialRom);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const romId = rom?.id || rom?.name || '';
  const [checklist, setChecklist] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(`skyroms_checklist_${romId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [false, false, false, false, false, false];
  });

  useEffect(() => {
    if (romId) {
      try {
        const saved = localStorage.getItem(`skyroms_checklist_${romId}`);
        if (saved) setChecklist(JSON.parse(saved));
        else setChecklist([false, false, false, false, false, false]);
      } catch {
        setChecklist([false, false, false, false, false, false]);
      }
    }
  }, [romId]);

  const toggleChecklistStep = (index: number) => {
    const updated = [...checklist];
    updated[index] = !updated[index];
    setChecklist(updated);
    try {
      localStorage.setItem(`skyroms_checklist_${romId}`, JSON.stringify(updated));
    } catch {}
  };

  const resetChecklist = () => {
    const updated = [false, false, false, false, false, false];
    setChecklist(updated);
    try {
      localStorage.setItem(`skyroms_checklist_${romId}`, JSON.stringify(updated));
    } catch {}
  };

  const checklistProgress = Math.round((checklist.filter(Boolean).length / checklist.length) * 100);

  useEffect(() => {
    setRom(initialRom);
    
    if (initialRom && initialRom.id && initialRom.id.length > 5) {
      const fetchFullDetails = async () => {
        setIsLoadingDetails(true);
        try {
          const { data, error } = await supabase
            .from('roms')
            .select('description, changelog, screenshots, extra_links, stability_trends')
            .eq('id', initialRom.id)
            .single();
            
          if (!error && data) {
            setRom((prev) => prev ? { 
              ...prev, 
              description: data.description || prev.description,
              changelog: data.changelog || prev.changelog,
              screenshots: data.screenshots || prev.screenshots,
              extraLinks: data.extra_links || prev.extraLinks,
              stabilityTrends: data.stability_trends || prev.stabilityTrends
            } : prev);
          }
        } catch (e) {
          // Silent fallback
        } finally {
          setIsLoadingDetails(false);
        }
      };
      
      if (initialRom.changelog === undefined || initialRom.changelog.length === 0) {
        fetchFullDetails();
      }
    }
  }, [initialRom]);
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!rom) return null;

  // Format date if provided
  const formattedDate = rom.createdAt
    ? new Date(rom.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`fixed inset-0 bg-gradient-to-b from-black/80 to-black/60 transition-opacity`}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl shadow-xl overflow-hidden z-10 my-8"
        >
          {/* Header Bar */}
          <div className="p-6 sm:p-8 border-b border-[#EBE4CF] dark:border-[#36342A] flex items-start justify-between gap-4 bg-[#FAF0CF]/40 dark:bg-[#14130F]/60">
            <div className="flex items-center gap-4">
              {rom.logoUrl ? (
                <div className="w-14 h-14 aspect-square rounded-2xl overflow-hidden border border-[#EBE4CF] dark:border-[#36342A] shadow-xs shrink-0">
                  <img
                    src={rom.logoUrl}
                    alt={rom.name}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#FDE694] dark:bg-[#FDE694] flex items-center justify-center text-[#121212] font-black text-xl shadow-xs shrink-0">
                  {rom.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] tracking-tight">
                    {rom.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${
                      rom.status === 'Official'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-[#EBE4CF]/60 dark:bg-[#36342A]/60 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A]'
                    }`}
                  >
                    {rom.status}
                  </span>
                  {rom.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDE694]/70 text-[#121212] border border-[#FDE694]">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4]">
                  <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6]">{rom.androidVersion}</span>
                  {(rom.device || rom.variant) && (
                    <>
                      <span>•</span>
                      <span className="flex gap-1.5">
                        {rom.device && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDE694]/20 text-[#49473E] dark:text-[#FDE694] border border-[#FDE694]/30 text-[10px] font-bold uppercase tracking-wider">
                            {rom.device}
                          </span>
                        )}
                        {rom.variant && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF0CF]/40 dark:bg-[#2B2921]/40 text-[#787567] dark:text-[#BDB8A4] border border-[#EBE4CF] dark:border-[#36342A] text-[10px] font-bold uppercase tracking-wider">
                            {rom.variant}
                          </span>
                        )}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span>Maintainer:</span>
                    {rom.maintainerUrl ? (
                      <a
                        href={rom.maintainerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#49473E] dark:text-[#FDE694] hover:underline"
                        title={`Open ${rom.maintainer}'s Telegram / Profile page`}
                      >
                        <Send className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                        <span>{rom.maintainer}</span>
                        <AnimatedExternalLink size={10} className="opacity-60" />
                      </a>
                    ) : (
                      <strong className="font-medium text-[#49473E] dark:text-[#F4EFE6]">{rom.maintainer}</strong>
                    )}
                  </span>
                  {formattedDate && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] hover:bg-[#EBE4CF] dark:hover:bg-[#36342A] transition-colors cursor-pointer shrink-0"
              aria-label="Close details modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">
            {/* Description */}
            {rom.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4]">
                  Overview & Build Details
                </h4>
                <div className="p-4 rounded-2xl bg-[#FAF0CF]/50 dark:bg-[#14130F]/60 border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#49473E] dark:text-[#F4EFE6] leading-relaxed markdown-body">
                  <Markdown>{rom.description}</Markdown>
                </div>
              </div>
            )}

            {/* Changelog */}
            {rom.changelog && rom.changelog.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FDE694] dark:text-[#FDE694]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4]">
                    Detailed Release Notes & Changelog
                  </h4>
                </div>
                <ul className="space-y-2.5 p-4 sm:p-5 rounded-2xl bg-[#FAF0CF]/50 dark:bg-[#14130F]/60 border border-[#EBE4CF] dark:border-[#36342A]">
                  {rom.changelog.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-[#49473E] dark:text-[#F4EFE6] leading-relaxed markdown-body">
                      <span className="w-2 h-2 rounded-full bg-[#FDE694] dark:bg-[#FDE694] mt-1.5 shrink-0 shadow-xs" />
                      <div className="flex-1">
                        <Markdown>{item}</Markdown>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Screenshots Gallery */}
            {rom.screenshots && rom.screenshots.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FDE694] dark:text-[#FDE694]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4]">
                    Screenshots & Visuals
                  </h4>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#FDE694]/20 scrollbar-track-transparent">
                  {rom.screenshots.sort((a, b) => a.sortOrder - b.sortOrder).map((screenshot) => (
                    <div 
                      key={screenshot.id} 
                      className="shrink-0 w-48 aspect-[9/16] rounded-2xl overflow-hidden border border-[#EBE4CF] dark:border-[#36342A] bg-black/5"
                    >
                      <img 
                        src={screenshot.imageUrl} 
                        alt={screenshot.caption || "Screenshot"} 
                        className="w-full h-full object-cover"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stateful Interactive Flashing Checklist Companion */}
            <div className="space-y-3.5 p-5 rounded-3xl bg-[#FAF3DD]/50 dark:bg-[#1C1A14]/70 border border-[#EBE4CF] dark:border-[#36342A]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBE4CF] dark:border-[#36342A]">
                <div>
                  <h4 className="text-sm font-bold text-[#49473E] dark:text-[#F4EFE6] flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    FLASHING COMPANION CHECKLIST
                  </h4>
                  <p className="text-xs text-[#787567] dark:text-[#BDB8A4] mt-0.5">
                    Track your installation steps safely. Leftover steps are saved locally.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-[#49473E] dark:text-[#F4EFE6]">{checklistProgress}%</span>
                    <span className="text-[10px] text-[#787567] dark:text-[#BDB8A4] block">Completed</span>
                  </div>
                  {checklistProgress > 0 && (
                    <button 
                      onClick={resetChecklist} 
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Reset Steps
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#EBE4CF] dark:bg-[#2C2A22] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>

              {/* Step Items */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    title: "Boot into Recovery",
                    description: "Hold Power + Vol Up to boot OrangeFox or custom recovery."
                  },
                  {
                    title: "Wipe System Partitions",
                    description: "Wipe Dalvik/ART Cache, Metadata, and Cache cleanly."
                  },
                  {
                    title: "Flash Firmware (If needed)",
                    description: "Flash region-appropriate firmware package (e.g., HyperOS FW)."
                  },
                  {
                    title: "Sideload/Flash ROM Zip",
                    description: "Select the downloaded ROM zip package and swipe to flash."
                  },
                  {
                    title: "Format Data Partitions",
                    description: "Perform Format Data (type 'yes') to fully decrypt storage."
                  },
                  {
                    title: "Reboot & Initialise",
                    description: "Reboot system and enjoy. First boot takes 2-3 minutes."
                  }
                ].map((step, idx) => (
                  <label 
                    key={idx}
                    className={`flex items-start gap-3.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                      checklist[idx] 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-[#49473E] dark:text-[#F4EFE6]' 
                        : 'bg-black/5 dark:bg-white/2 border-transparent text-[#787567] dark:text-[#BDB8A4] hover:bg-black/10 dark:hover:bg-white/5'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => toggleChecklistStep(idx)}
                      className="w-4 h-4 mt-0.5 rounded border-[#EBE4CF] dark:border-[#36342A] text-emerald-500 focus:ring-emerald-400 accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                          checklist[idx] ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#787567] dark:text-[#BDB8A4]'
                        }`}>
                          0{idx + 1}
                        </span>
                        <span className={checklist[idx] ? 'line-through text-[#787567] dark:text-[#BDB8A4]' : ''}>{step.title}</span>
                      </div>
                      <p className="text-[11px] mt-0.5 leading-relaxed opacity-80">{step.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Community Links & Maintainer */}
            {(rom.maintainerUrl || (rom.extraLinks && rom.extraLinks.length > 0)) && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4]">
                  Maintainer & Community Channels
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {rom.maintainerUrl && (
                    <a
                      href={rom.maintainerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF0CF] dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] transition-colors"
                    >
                      <Send className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                      <span>Maintainer ({rom.maintainer})</span>
                      <AnimatedExternalLink size={12} />
                    </a>
                  )}
                  {rom.extraLinks?.filter(link => link.url !== rom.maintainerUrl).map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF0CF] dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] transition-colors"
                    >
                      <span>{link.label}</span>
                      <AnimatedExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 sm:p-8 border-t border-[#EBE4CF] dark:border-[#36342A] bg-[#FAF0CF]/40 dark:bg-[#14130F]/60 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (rom) toggleSave(rom.id || rom.name);
                }}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  rom && isSaved(rom.id || rom.name)
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    : 'bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF]'
                }`}
              >
                <Star className={`w-4 h-4 ${rom && isSaved(rom.id || rom.name) ? 'fill-current' : ''}`} />
                <span>{rom && isSaved(rom.id || rom.name) ? 'Saved to Bookmarks' : 'Save for Later'}</span>
              </button>

              <button
                onClick={() => onCopyUrl(rom.url)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-all cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={rom.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => showDownloadToast(rom.name, rom.url)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212] hover:bg-[#fbdc70] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <AnimatedDownload size={16} />
              <span>Download ROM</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
