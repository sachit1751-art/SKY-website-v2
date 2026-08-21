import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Info, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if dismissed recently in localStorage
    const dismissedAt = localStorage.getItem('sky_pwa_banner_dismissed');
    if (dismissedAt) {
      const now = Date.now();
      if (now - parseInt(dismissedAt, 10) < 86400000) { // 24 hours
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleCustomTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the PWA install prompt');
          }
          setDeferredPrompt(null);
        });
      }
      setShowDialog(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('trigger-sky-install', handleCustomTrigger);

    // Show banner after 3 seconds on mobile or desktop if standalone is false
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    const timer = setTimeout(() => {
      if (!isStandalone && !isDismissed) {
        setShowBanner(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('trigger-sky-install', handleCustomTrigger);
      clearTimeout(timer);
    };
  }, [isDismissed]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        }
        setDeferredPrompt(null);
      });
    }
    // Show dialog as requested
    setShowDialog(true);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('sky_pwa_banner_dismissed', Date.now().toString());
  };

  if (!showBanner && !showDialog) return null;

  return (
    <>
      {/* Non-intrusive Corner PWA Install Pill Banner */}
      {showBanner && !showDialog && (
        <div className="fixed bottom-5 right-5 z-[90] pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2.5 p-2.5 pl-3 bg-[#1C1B17] dark:bg-[#121210] text-[#FAF3DD] rounded-2xl border border-[#36342A] shadow-xl shadow-black/50 hover:border-[#FDE694]/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-[#FDE694]/15 border border-[#FDE694]/30 flex items-center justify-center shrink-0 text-[#FDE694]">
              <Smartphone className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#FAF3DD] leading-none">Install SKY App</span>
              <span className="text-[10px] text-[#9C9888] mt-0.5">Fast offline access</span>
            </div>

            <div className="flex items-center gap-1 ml-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FDE694] text-[#121210] hover:bg-[#F4D068] transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 text-[#9C9888] hover:text-[#FAF3DD] rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss install banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Dialog Box */}
      {showDialog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#1C1B17] border border-[#36342A] rounded-3xl p-6 text-center text-[#FAF3DD] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowDialog(false);
                setShowBanner(false);
              }}
              className="absolute top-4 right-4 text-[#9C9888] hover:text-[#FAF3DD] p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#FDE694]/15 border border-[#FDE694]/30 flex items-center justify-center mx-auto text-[#FDE694]">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#FAF3DD]">SKY App Installation</h3>
              <p className="text-xs text-[#9C9888] mt-1.5 leading-relaxed">
                Full native APK installer & play store distribution integration will be added in a future update!
              </p>
            </div>

            <div className="bg-[#121210] p-3.5 rounded-2xl border border-[#36342A] text-left text-xs text-[#BDB8A4] space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FDE694] shrink-0 mt-0.5" />
                <span>Web App / PWA shortcut is enabled for offline caching.</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#F4D068] shrink-0 mt-0.5" />
                <span>For iOS or Android browser: tap <strong>Share / Menu</strong> &rarr; <strong>"Add to Home Screen"</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDialog(false);
                setShowBanner(false);
                setIsDismissed(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FDE694] text-[#121210] hover:bg-[#F4D068] transition-all cursor-pointer shadow-md"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
