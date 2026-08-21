import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, CheckCircle2, Info, AlertCircle, X, ExternalLink } from 'lucide-react';
import { usePerformanceTier } from './PerformanceContext';

export type ToastType = 'success' | 'download' | 'info' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  actionUrl?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'> | string) => string;
  showDownloadToast: (itemName: string, url?: string) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { tier } = usePerformanceTier();
  const isVeryLowEnd = tier === 'low';

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toastInput: Omit<ToastItem, 'id'> | string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem =
        typeof toastInput === 'string'
          ? {
              id,
              title: toastInput,
              type: 'info',
              duration: 4000,
            }
          : {
              ...toastInput,
              id,
              type: toastInput.type || 'info',
              duration: toastInput.duration ?? 4000,
            };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Limit to max 4 active toasts

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [dismissToast]
  );

  const showDownloadToast = useCallback(
    (itemName: string, url?: string) => {
      return showToast({
        title: 'Download Started',
        message: `Connecting to mirror for ${itemName}. Check your browser downloads tab.`,
        type: 'download',
        duration: 4500,
        actionUrl: url,
        actionLabel: url ? 'Open Link' : undefined,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, showDownloadToast, dismissToast }}>
      {children}

      {/* Global Toast Stack Overlay */}
      <aside
        aria-live="polite"
        aria-label="Notification Center"
        className="fixed bottom-5 sm:bottom-6 right-0 sm:right-6 left-0 sm:left-auto z-[9999] flex flex-col items-center sm:items-end gap-2.5 px-4 sm:px-0 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 15, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`pointer-events-auto w-full max-w-sm sm:max-w-md bg-[#FAF3DD]/95 dark:bg-[#1A1914]/95  border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl shadow-xl p-3.5 sm:p-4 flex items-start gap-3 transform-gpu relative overflow-hidden group`}
            >
              {/* Left Accent Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  toast.type === 'download'
                    ? 'bg-[#FDE694]/80 text-[#121212] border-[#EBE4CF] dark:border-transparent'
                    : toast.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : toast.type === 'error'
                    ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
                    : 'bg-[#FAF0CF] dark:bg-[#2B2921] text-[#49473E] dark:text-[#F4EFE6] border-[#EBE4CF] dark:border-[#36342A]'
                }`}
              >
                {toast.type === 'download' && <Download className="w-4 h-4 animate-bounce" />}
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {toast.type === 'info' && <Info className="w-4 h-4" />}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#49473E] dark:text-[#F4EFE6] truncate">
                    {toast.title}
                  </h4>
                  {toast.type === 'download' && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FDE694]/60 text-[#121212]">
                      Active
                    </span>
                  )}
                </div>
                {toast.message && (
                  <p className="text-xs text-[#787567] dark:text-[#BDB8A4] mt-0.5 leading-relaxed break-words">
                    {toast.message}
                  </p>
                )}
                {toast.actionUrl && (
                  <a
                    href={toast.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#49473E] dark:text-[#FDE694] hover:underline mt-1.5"
                  >
                    <span>{toast.actionLabel || 'Visit Link'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {toast.onAction && !toast.actionUrl && (
                  <button
                    onClick={toast.onAction}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#49473E] dark:text-[#FDE694] hover:underline mt-1.5 cursor-pointer"
                  >
                    <span>{toast.actionLabel || 'Action'}</span>
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-lg text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#36342A]/60 transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Bottom Subtle Progress Auto-Dismiss Bar */}
              {toast.duration && toast.duration > 0 && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  style={{ originX: 0 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FDE694] dark:bg-[#FDE694]/80 opacity-70"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
