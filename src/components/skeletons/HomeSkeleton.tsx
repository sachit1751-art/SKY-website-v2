import React from 'react';

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="space-y-16 pb-20 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="pt-16 md:pt-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="h-7 w-64 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
        <div className="h-16 sm:h-20 w-full max-w-3xl rounded-3xl bg-[#EBE4CF] dark:bg-[#36342A]" />
        <div className="h-5 w-full max-w-xl rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
        <div className="flex items-center gap-4 pt-4">
          <div className="h-12 w-36 rounded-full bg-[#FDE694]" />
          <div className="h-12 w-36 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
        </div>
      </div>

      {/* Feature Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-8 rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EBE4CF] dark:bg-[#36342A]" />
            <div className="h-6 w-3/4 rounded-xl bg-[#EBE4CF] dark:bg-[#36342A]" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
              <div className="h-4 w-5/6 rounded-full bg-[#EBE4CF]/60 dark:bg-[#36342A]/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
