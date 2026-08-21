import React from 'react';
import { SpotlightCard } from '../SpotlightCard';

export const HeaderSkeleton: React.FC = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 animate-pulse">
    <div>
      <div className="h-10 w-48 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-xl mb-2" />
      <div className="h-4 w-64 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-lg" />
    </div>
    <div className="h-12 w-32 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-2xl" />
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <SpotlightCard className="p-8 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs animate-pulse">
    <div className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-3xl bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 mb-6" />
      <div className="h-8 w-40 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-xl mb-2" />
      <div className="h-4 w-24 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-lg mb-4" />
      <div className="h-12 w-full bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-xl mb-6" />
      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-[#EBE4CF]/20 dark:bg-[#36342A]/20" />)}
      </div>
      <div className="h-12 w-full bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-xl" />
    </div>
  </SpotlightCard>
);

export const ActionSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-pulse">
    {[1, 2, 3].map(i => (
      <SpotlightCard key={i} className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EBE4CF]/20 dark:bg-[#36342A]/20" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-lg" />
            <div className="h-3 w-40 bg-[#EBE4CF]/20 dark:bg-[#36342A]/20 rounded-lg" />
          </div>
        </div>
      </SpotlightCard>
    ))}
  </div>
);
