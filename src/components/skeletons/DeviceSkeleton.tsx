import React from 'react';

export const DeviceSkeleton: React.FC = () => {
  return (
    <div className="py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="max-w-3xl space-y-4">
        {/* Pill Tag */}
        <div className="h-6 w-48 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
        {/* Display Title */}
        <div className="h-14 sm:h-16 w-3/4 max-w-lg rounded-2xl bg-[#EBE4CF] dark:bg-[#36342A]" />
        {/* Subtitle Lines */}
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full max-w-2xl rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
          <div className="h-4 w-4/5 max-w-xl rounded-full bg-[#EBE4CF]/60 dark:bg-[#36342A]/60" />
        </div>
      </div>

      {/* Interactive Specifications Explorer Skeleton */}
      <div className="pt-4 space-y-8">
        {/* Specs Section Heading Skeleton */}
        <div className="text-center max-w-md mx-auto space-y-3">
          <div className="h-8 w-64 mx-auto rounded-2xl bg-[#EBE4CF] dark:bg-[#36342A]" />
          <div className="h-3.5 w-80 mx-auto rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
        </div>

        {/* Category Filter Pills Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[100, 120, 95, 90, 110, 105].map((width, idx) => (
            <div
              key={idx}
              style={{ width: `${width}px` }}
              className="h-10 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]"
            />
          ))}
        </div>

        {/* Specs Highlights Card Skeleton */}
        <div className="bg-[#FAF3DD] dark:bg-[#1F1E18] rounded-3xl p-8 sm:p-12 border border-[#EBE4CF] dark:border-[#36342A] space-y-8">
          <div className="pb-6 border-b border-[#EBE4CF] dark:border-[#36342A] space-y-2">
            <div className="h-3.5 w-32 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
            <div className="h-7 w-72 rounded-xl bg-[#EBE4CF] dark:bg-[#36342A]" />
          </div>

          {/* 4 Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#FFF8E1] dark:bg-[#12110D] p-6 rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] space-y-3"
              >
                <div className="h-3.5 w-20 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
                <div className="h-7 w-32 rounded-xl bg-[#EBE4CF] dark:bg-[#36342A]" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 w-full rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
                  <div className="h-3 w-4/5 rounded-full bg-[#EBE4CF]/60 dark:bg-[#36342A]/60" />
                </div>
              </div>
            ))}
          </div>

          {/* Architecture Banner Skeleton */}
          <div className="bg-[#FFF8E1] dark:bg-[#12110D] p-6 rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] flex items-start gap-4">
            <div className="w-5 h-5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] shrink-0 mt-0.5" />
            <div className="space-y-2 flex-grow">
              <div className="h-4 w-44 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
              <div className="h-3.5 w-full rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
