import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, X, Command, Search, Shield, Layers, Home, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ShortcutGroup {
  category: string;
  shortcuts: {
    keyCombination: string[];
    description: string;
    action: () => void;
    adminOnly?: boolean;
  }[];
}

export const GlobalKeyboardShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputActive = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      // 1. Toggle Shortcuts Help Modal: '?' or 'Shift+?' when not in input
      if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !isInputActive) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // 2. Escape closes help modal
      if (e.key === 'Escape') {
        if (isHelpOpen) {
          e.preventDefault();
          setIsHelpOpen(false);
          return;
        }
      }

      // 3. Quick Navigation & Admin shortcuts using Ctrl+Shift+<Key> or Alt+<Key>
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const key = e.key.toUpperCase();
        switch (key) {
          case 'H':
            e.preventDefault();
            navigate('/');
            showToast({ title: 'Navigated to Home', type: 'info', duration: 2000 });
            break;
          case 'R':
            e.preventDefault();
            navigate('/roms');
            showToast({ title: 'Navigated to ROMs Catalog', type: 'info', duration: 2000 });
            break;
          case 'D':
            if (isAdmin || isSuperAdmin) {
              e.preventDefault();
              navigate('/admin/dashboard');
              showToast({ title: 'Navigated to Admin Dashboard', type: 'info', duration: 2000 });
            }
            break;
          case 'A':
            if (isSuperAdmin) {
              e.preventDefault();
              navigate('/admin/approve');
              showToast({ title: 'Navigated to Maintainer Approvals', type: 'info', duration: 2000 });
            }
            break;
          case 'S':
            if (isSuperAdmin) {
              e.preventDefault();
              navigate('/admin/logs');
              showToast({ title: 'Navigated to Security Logs', type: 'info', duration: 2000 });
            }
            break;
          case 'F':
            if (isAdmin || isSuperAdmin) {
              e.preventDefault();
              navigate('/admin/feedback');
              showToast({ title: 'Navigated to Feedback Manager', type: 'info', duration: 2000 });
            }
            break;
          case 'P':
            if (isAdmin || isSuperAdmin) {
              e.preventDefault();
              navigate('/admin/profile');
              showToast({ title: 'Navigated to Admin Profile', type: 'info', duration: 2000 });
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isAdmin, isSuperAdmin, isHelpOpen, showToast]);

  const shortcutGroups: ShortcutGroup[] = [
    {
      category: 'General & Navigation',
      shortcuts: [
        { keyCombination: ['Ctrl', 'K'], description: 'Open global search & navigation modal', action: () => {} },
        { keyCombination: ['/'], description: 'Quick focus search (when not in input)', action: () => {} },
        { keyCombination: ['Esc'], description: 'Close modals, drawers, or dialogs', action: () => {} },
        { keyCombination: ['?'], description: 'Toggle this keyboard shortcuts cheat sheet', action: () => setIsHelpOpen(true) },
      ]
    },
    {
      category: 'Page Shortcuts (Ctrl + Shift + Key)',
      shortcuts: [
        { keyCombination: ['Ctrl', 'Shift', 'H'], description: 'Go to Home overview', action: () => { navigate('/'); setIsHelpOpen(false); } },
        { keyCombination: ['Ctrl', 'Shift', 'R'], description: 'Go to ROMs repository', action: () => { navigate('/roms'); setIsHelpOpen(false); } },
      ]
    },
    {
      category: 'Admin & Power Actions (Ctrl + Shift + Key)',
      shortcuts: [
        { keyCombination: ['Ctrl', 'Shift', 'D'], description: 'Go to Admin Dashboard', action: () => { navigate('/admin/dashboard'); setIsHelpOpen(false); }, adminOnly: true },
        { keyCombination: ['Ctrl', 'Shift', 'A'], description: 'Go to Maintainer Approvals', action: () => { navigate('/admin/approve'); setIsHelpOpen(false); }, adminOnly: true },
        { keyCombination: ['Ctrl', 'Shift', 'S'], description: 'Go to Security Audit Logs', action: () => { navigate('/admin/logs'); setIsHelpOpen(false); }, adminOnly: true },
        { keyCombination: ['Ctrl', 'Shift', 'F'], description: 'Go to Feedback & Upvote Manager', action: () => { navigate('/admin/feedback'); setIsHelpOpen(false); }, adminOnly: true },
        { keyCombination: ['Ctrl', 'Shift', 'P'], description: 'Go to Admin Profile & Settings', action: () => { navigate('/admin/profile'); setIsHelpOpen(false); }, adminOnly: true },
      ]
    }
  ];

  return (
    <>
      {/* Floating Keyboard Shortcut Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:flex items-center">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#1A1915]/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 transition-all group"
          title="Keyboard Shortcuts (?)"
          type="button"
        >
          <Keyboard size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
          <span>Shortcuts</span>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 font-mono">
            ?
          </kbd>
        </button>
      </div>

      {/* Shortcuts Cheat Sheet Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-[#FDFBF7] dark:bg-[#141310] border border-[#EBE4CF] dark:border-[#2C2A22] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#EBE4CF] dark:border-[#2C2A22] bg-white/50 dark:bg-[#1A1915]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Keyboard size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#121212] dark:text-[#F4EFE6] tracking-tight">
                      Power User Keyboard Shortcuts
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Navigate the dashboard and admin console instantly using hotkeys
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {shortcutGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {group.category}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {group.shortcuts.map((shortcut, sIdx) => {
                        if (shortcut.adminOnly && !isAdmin && !isSuperAdmin) return null;
                        return (
                          <div
                            key={sIdx}
                            onClick={() => {
                              shortcut.action();
                            }}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-[#1A1915]/70 border border-[#EBE4CF]/60 dark:border-[#2C2A22]/60 hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:bg-amber-500/[0.02] transition-all cursor-pointer group"
                          >
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              {shortcut.description}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {shortcut.keyCombination.map((key, kIdx) => (
                                <kbd
                                  key={kIdx}
                                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-300/80 dark:border-zinc-700 shadow-sm"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[#EBE4CF] dark:border-[#2C2A22] bg-white/50 dark:bg-[#1A1915]/50 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">Esc</kbd> anytime to close</span>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors shadow-sm"
                  type="button"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
