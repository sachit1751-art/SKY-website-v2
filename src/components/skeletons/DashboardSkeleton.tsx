import React from 'react';
import { SpotlightCard } from '../SpotlightCard';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <SpotlightCard key={i} className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#EBE4CF]/20 dark:bg-[#36342A]/20" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-lg" />
                <div className="h-3 w-24 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-lg" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#EBE4CF]/20 dark:bg-[#36342A]/20" />
              <div className="w-10 h-10 rounded-xl bg-[#EBE4CF]/20 dark:bg-[#36342A]/20" />
              <div className="w-10 h-10 rounded-xl bg-[#EBE4CF]/20 dark:bg-[#36342A]/20" />
            </div>
          </div>
        </SpotlightCard>
      ))}
    </div>
  );
};
