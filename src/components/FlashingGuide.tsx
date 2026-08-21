import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Terminal, RefreshCw } from 'lucide-react';
import { AnimatedChevronDown, AnimatedDownload } from './icons';
import { motion, AnimatePresence } from 'motion/react';

export const FlashingGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'clean' | 'dirty' | 'firmware'>('clean');

  return (
    <div className="bg-[#FAF3DD]/60 dark:bg-[#1F1E18]/70 border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl overflow-hidden transition-all duration-300 shadow-xs">
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FAF0CF]/60 dark:hover:bg-[#2A2820]/60 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#FDE694] dark:bg-[#FDE694] flex items-center justify-center text-[#121212] shrink-0 font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#49473E] dark:text-[#F4EFE6]">
                Flashing Guide & Prerequisites
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#787567] dark:text-[#BDB8A4]">
                Redmi 12 5G / POCO M6 Pro 5G (sky)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] mt-0.5">
              Step-by-step installation instructions, recommended firmware, and partition formatting guidelines.
            </p>
          </div>
        </div>

        <div className={`p-2 rounded-full bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <AnimatedChevronDown size={16} className="text-[#49473E] dark:text-[#F4EFE6]" />
        </div>
      </button>

      {/* Accordion Content Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-[#EBE4CF] dark:border-[#36342A]"
          >
            <div className="p-6 sm:p-8 space-y-6">
              {/* Important Caution Notice */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs sm:text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong className="font-semibold">Unlock Bootloader & Backup Data:</strong> Custom ROM installation requires an unlocked bootloader and formatting user data. Back up all crucial personal files prior to flashing.
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#EBE4CF] dark:border-[#36342A] pb-3">
                <button
                  onClick={() => setActiveTab('clean')}
                  className={`flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] ${
                    activeTab === 'clean'
                      ? 'bg-[#FDE694] text-[#121212] shadow-2xs'
                      : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#49473E] dark:hover:text-[#F4EFE6] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                  }`}
                >
                  Clean Flash (First Time)
                </button>
                <button
                  onClick={() => setActiveTab('dirty')}
                  className={`flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] ${
                    activeTab === 'dirty'
                      ? 'bg-[#FDE694] text-[#121212] shadow-2xs'
                      : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#49473E] dark:hover:text-[#F4EFE6] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                  }`}
                >
                  Dirty Flash (OTA / Update)
                </button>
                <button
                  onClick={() => setActiveTab('firmware')}
                  className={`flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] ${
                    activeTab === 'firmware'
                      ? 'bg-[#FDE694] text-[#121212] shadow-2xs'
                      : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#49473E] dark:hover:text-[#F4EFE6] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                  }`}
                >
                  Recommended Firmware & GApps
                </button>
              </div>

              {/* Tab 1: Clean Flash */}
              {activeTab === 'clean' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#49473E] dark:text-[#F4EFE6]">
                    Clean Installation Steps (Coming from HyperOS/MIUI or Another ROM)
                  </h4>
                  <ol className="space-y-3 text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4]">
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div>
                        <strong>Boot into Custom Recovery:</strong> Hold <code className="px-1.5 py-0.5 rounded bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] font-mono text-[11px]">Power + Volume Up</code> to boot OrangeFox, TWRP, or PBRP recovery on your device.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div>
                        <strong>Wipe Partitions:</strong> Navigate to <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6]">Wipe</span> → Select <code className="px-1.5 py-0.5 rounded bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] font-mono text-[11px]">Dalvik/ART Cache</code> and <code className="px-1.5 py-0.5 rounded bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] font-mono text-[11px]">Metadata / Cache</code>.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div>
                        <strong>Flash ROM Package:</strong> Select the downloaded ROM zip file. If the ROM does not bundle firmware, flash the regional HyperOS FW first.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <div>
                        <strong>Format Data:</strong> Go to <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6]">Wipe → Format Data</span> and type <code className="px-1.5 py-0.5 rounded bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] font-mono text-[11px]">yes</code> to un-encrypt and format internal storage cleanly.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">5</span>
                      <div>
                        <strong>(Optional) Flash GApps for Vanilla ROMs:</strong> If flashing a Vanilla build with separate GApps: after formatting data, select <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6]">Reboot → Recovery</span>. Once rebooted back into recovery, flash the GApps package (e.g. NikGApps Core/Basic).
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">6</span>
                      <div>
                        <strong>Reboot to System:</strong> Select <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6]">Reboot System</span>. First boot typically takes 2-3 minutes.
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* Tab 2: Dirty Flash */}
              {activeTab === 'dirty' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#49473E] dark:text-[#F4EFE6]">
                    Dirty Flash Steps (Upgrading an Existing Same-ROM Build)
                  </h4>
                  <ol className="space-y-3 text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4]">
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div>
                        <strong>Boot into Recovery:</strong> Reboot device into custom recovery.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div>
                        <strong>Flash Update Zip:</strong> Flash the latest updated build zip file directly over your existing installation.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div>
                        <strong>Wipe Cache & Dalvik:</strong> Perform a simple cache wipe (do NOT format data).
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <div>
                        <strong>Reboot System:</strong> All your user apps, accounts, and data are retained.
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* Tab 3: Recommended Firmware & GApps */}
              {activeTab === 'firmware' && (
                <div className="space-y-4 text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4]">
                  <div className="p-4 rounded-xl bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] space-y-2">
                    <div className="flex items-center gap-2 text-[#49473E] dark:text-[#F4EFE6] font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Recommended Firmware (FW) for Redmi 12 5G / POCO M6 Pro 5G (sky)</span>
                    </div>
                    <p className="leading-relaxed">
                      Always flash the latest official HyperOS region-matching firmware for <code className="px-1 py-0.5 rounded bg-[#EBE4CF]/60 dark:bg-[#36342A]/60 font-mono text-[11px]">sky</code> (Global / India / EEA / China) before flashing builds that do not have firmware included in the zip.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] space-y-2">
                    <div className="flex items-center gap-2 text-[#49473E] dark:text-[#F4EFE6] font-bold">
                      <AnimatedDownload size={16} className="text-[#FDE694] dark:text-[#FDE694]" />
                      <span>Vanilla vs. GApps Builds</span>
                    </div>
                    <p className="leading-relaxed">
                      <strong className="text-[#49473E] dark:text-[#F4EFE6]">GApps Builds:</strong> Come preloaded with Google Play Services and core Google apps.<br />
                      <strong className="text-[#49473E] dark:text-[#F4EFE6]">Vanilla Builds:</strong> Clean, de-Googled, lightweight installations. If you want Google apps on Vanilla: flash the ROM zip &rarr; wipe/format data &rarr; reboot to recovery again &rarr; flash the GApps package (e.g. NikGApps) &rarr; reboot to system.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
