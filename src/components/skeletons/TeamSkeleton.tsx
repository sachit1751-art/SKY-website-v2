import React from 'react';

export const TeamSkeleton: React.FC = () => {
  return (
    <div className="space-y-12 pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="pt-12 md:pt-16 px-6 md:px-12 max-w-7xl mx-auto space-y-4">
        {/* Badge */}
        <div className="h-6 w-52 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
        {/* Title */}
        <div className="h-12 sm:h-14 w-3/4 max-w-xl rounded-2xl bg-[#EBE4CF] dark:bg-[#36342A]" />
        {/* Subtitle */}
        <div className="space-y-2 pt-1">
          <div className="h-4 w-full max-w-xl rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
          <div className="h-4 w-4/5 max-w-md rounded-full bg-[#EBE4CF]/60 dark:bg-[#36342A]/60" />
        </div>
      </div>

      {/* Carousel Section Container Skeleton */}
      <section className="py-24 md:py-36 bg-[#F7F0D8] dark:bg-[#191813] border-t border-[#EBE4CF] dark:border-[#36342A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          {/* Section Header & Tab Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="h-5 w-44 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
              <div className="h-10 sm:h-12 w-80 rounded-2xl bg-[#EBE4CF] dark:bg-[#36342A]" />
              <div className="h-4 w-96 rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
            </div>

            {/* Filter Toggle Skeleton */}
            <div className="flex p-1.5 rounded-full bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] gap-2">
              <div className="h-9 w-32 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
              <div className="h-9 w-36 rounded-full bg-[#EBE4CF]/50 dark:bg-[#36342A]/50" />
            </div>
          </div>

          {/* 3D Coverflow Deck Skeleton */}
          <div className="relative py-12 min-h-[480px] flex items-center justify-center">
            {/* Left Silhouette Card */}
            <div className="hidden md:block absolute -translate-x-[65%] scale-85 opacity-40 w-[88%] max-w-lg bg-[#FAF3DD] dark:bg-[#1F1E18] rounded-3xl p-8 sm:p-10 border border-[#EBE4CF] dark:border-[#36342A]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-[#EBE4CF] dark:bg-[#36342A]" />
                <div className="h-4 w-24 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
                <div className="h-7 w-40 rounded-xl bg-[#EBE4CF] dark:bg-[#36342A]" />
              </div>
            </div>

            {/* Center Active Card Skeleton */}
            <div className="relative z-20 w-[88%] max-w-lg bg-[#FAF3DD] dark:bg-[#1F1E18] rounded-3xl p-8 sm:p-10 border border-[#EBE4CF] dark:border-[#36342A] shadow-md flex flex-col items-center text-center space-y-4">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#EBE4CF] dark:bg-[#36342A]" />
              {/* Role Badge */}
              <div className="h-5 w-28 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
              {/* Name */}
              <div className="h-8 w-48 rounded-xl bg-[#EBE4CF] dark:bg-[#36342A]" />
              {/* Role Title */}
              <div className="h-4 w-36 rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
              {/* Bio Lines */}
              <div className="space-y-2 w-full max-w-md pt-2">
                <div className="h-3.5 w-full rounded-full bg-[#EBE4CF]/70 dark:bg-[#36342A]/70" />
                <div className="h-3.5 w-5/6 mx-auto rounded-full bg-[#EBE4CF]/60 dark:bg-[#36342A]/60" />
                <div className="h-3.5 w-4/6 mx-auto rounded-full bg-[#EBE4CF]/50 dark:bg-[#36342A]/50" />
              </div>
              {/* Social Buttons Skeleton */}
              <div className="flex items-center gap-3 pt-3">
                <div className="w-9 h-9 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
                <div className="w-9 h-9 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
                <div className="h-6 w-24 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
              </div>
            </div>

            {/* Right Silhouette Card */}
            <div className="hidden md:block absolute translate-x-[65%] scale-85 opacity-40 w-[88%] max-w-lg bg-[#FAF3DD] dark:bg-[#1F1E18] rounded-3xl p-8 sm:p-10 border border-[#EBE4CF] dark:border-[#36342A]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-[#EBE4CF] dark:bg-[#36342A]" />
                <div className="h-4 w-24 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
                <div className="h-7 w-40 rounded-xl bg-[#EBE4CF] dark:bg-[#36342A]" />
              </div>
            </div>
          </div>

          {/* Carousel Controls Skeleton */}
          <div className="flex items-center justify-center gap-6">
            <div className="w-11 h-11 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
            <div className="h-4 w-16 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
            <div className="w-11 h-11 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
          </div>

          {/* Quick-select track pills skeleton */}
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto">
            {[80, 95, 75, 110, 85, 90].map((width, idx) => (
              <div
                key={idx}
                style={{ width: `${width}px` }}
                className="h-8 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
