import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Terminal, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { AnimatedChevronDown, AnimatedDownload } from './icons';
import { motion, AnimatePresence } from 'motion/react';

export const FlashingGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'clean' | 'dirty' | 'checklist' | 'firmware'>('clean');

  const [checklist, setChecklist] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem('skyroms_guide_checklist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [false, false, false, false, false, false];
  });

  useEffect(() => {
    try {
      localStorage.setItem('skyroms_guide_checklist', JSON.stringify(checklist));
    } catch {}
  }, [checklist]);

  const toggleChecklistStep = (index: number) => {
    setChecklist(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const resetChecklist = () => {
    setChecklist([false, false, false, false, false, false]);
  };

  const checklistProgress = Math.round((checklist.filter(Boolean).length / checklist.length) * 100);

  return (
    <div className="bg-[#FAF3DD]/60 dark:bg-[#1F1E18]/70 border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl overflow-hidden transition-all duration-300 shadow-xs" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
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
                  onClick={() => setActiveTab('checklist')}
                  className={`flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] ${
                    activeTab === 'checklist'
                      ? 'bg-[#FDE694] text-[#121212] shadow-2xs'
                      : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#49473E] dark:hover:text-[#F4EFE6] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                  }`}
                >
                  <CheckCircle2 size={14} className={checklistProgress === 100 ? 'text-emerald-600' : ''} />
                  <span>Interactive Checklist ({checklistProgress}%)</span>
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

              {/* Tab 3: Interactive Flashing Companion Checklist */}
              {activeTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF0CF]/40 dark:bg-[#14130F]/60 border border-[#EBE4CF] dark:border-[#36342A]">
                    <div>
                      <h4 className="text-sm font-bold text-[#49473E] dark:text-[#F4EFE6] flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Interactive Flashing Companion Checklist
                      </h4>
                      <p className="text-xs text-[#787567] dark:text-[#BDB8A4] mt-0.5">
                        Follow each step carefully on your device. Progress is saved locally in your browser.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-[#49473E] dark:text-[#F4EFE6]">{checklistProgress}%</span>
                        <span className="text-[10px] text-[#787567] dark:text-[#BDB8A4] block">Completed</span>
                      </div>
                      {checklistProgress > 0 && (
                        <button
                          onClick={resetChecklist}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#EBE4CF] dark:bg-[#2C2A22] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${checklistProgress}%` }}
                    />
                  </div>

                  {/* Checklist Steps */}
                  <div className="space-y-2.5">
                    {[
                      {
                        title: "1. Unlock Bootloader & Backup",
                        description: "Ensure device bootloader is unlocked and all crucial personal files are backed up safely off-device."
                      },
                      {
                        title: "2. Boot into Custom Recovery",
                        description: "Power off device, then hold Power + Volume Up until OrangeFox / TWRP / PBRP screen appears."
                      },
                      {
                        title: "3. Wipe Cache & Metadata Partitions",
                        description: "Under Wipe menu, select Dalvik/ART Cache, Metadata, and Cache. Do not wipe internal storage yet."
                      },
                      {
                        title: "4. Flash Firmware (if needed)",
                        description: "If your ROM does not include firmware, flash region-matching HyperOS firmware (Global / India / EEA / China)."
                      },
                      {
                        title: "5. Flash ROM Package & Format Data",
                        description: "Select the downloaded ROM zip and swipe to flash. Then go to Wipe -> Format Data and type 'yes'."
                      },
                      {
                        title: "6. (Optional) Flash GApps & Reboot",
                        description: "For Vanilla ROMs requiring GApps: reboot to recovery first, flash GApps zip (e.g. NikGApps), then Reboot System."
                      }
                    ].map((step, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          checklist[idx]
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-[#49473E] dark:text-[#F4EFE6]'
                            : 'bg-[#FAF0CF]/30 dark:bg-[#14130F]/40 border-[#EBE4CF] dark:border-[#36342A] text-[#787567] dark:text-[#BDB8A4] hover:bg-[#FAF0CF]/70 dark:hover:bg-[#1C1B15]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checklist[idx]}
                          onChange={() => toggleChecklistStep(idx)}
                          className="w-4 h-4 mt-0.5 rounded border-[#EBE4CF] dark:border-[#36342A] text-emerald-500 focus:ring-emerald-400 accent-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                            <span className={checklist[idx] ? 'line-through text-[#787567] dark:text-[#BDB8A4]' : ''}>
                              {step.title}
                            </span>
                            {checklist[idx] && (
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed opacity-80">
                            {step.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Recommended Firmware & GApps */}
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
