import React from 'react';

export const RomsSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 pb-20 animate-pulse max-w-7xl mx-auto px-6 md:px-12 pt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-6 w-40 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
          <div className="h-10 w-72 rounded-2xl bg-[#EBE4CF] dark:bg-[#36342A]" />
        </div>
        <div className="h-12 w-64 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-28 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
              <div className="h-6 w-20 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
            </div>
            <div className="h-8 w-3/4 rounded-xl bg-[#EBE4CF] dark:bg-[#36342A]" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
              <div className="h-4 w-4/5 rounded-full bg-[#EBE4CF]/60 dark:bg-[#36342A]/60" />
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-[#EBE4CF] dark:border-[#36342A]">
              <div className="h-4 w-24 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
              <div className="h-10 w-28 rounded-xl bg-[#EBE4CF] dark:bg-[#36342A]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
