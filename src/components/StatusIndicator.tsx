import React, { useState, useEffect } from 'react';

export const StatusIndicator: React.FC = () => {
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const syncDate = localStorage.getItem('aosp_roms_timestamp');
    if (syncDate) {
      setLastSync(new Date(syncDate).toLocaleDateString());
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-[#49473E] dark:text-[#BDB8A4] select-none">
      <div className="relative w-2 h-2 rounded-full flex items-center justify-center">
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {isOnline && (
          <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
        )}
      </div>
      <span className="hidden lg:inline tracking-wider uppercase text-[9px] opacity-80">{isOnline ? 'Online' : 'Offline'}</span>
      <span className="hidden lg:inline text-[#787567]/30">|</span>
      <span className="hidden lg:inline font-semibold opacity-70">Sync: {lastSync || 'Never'}</span>
    </div>
  );
};
