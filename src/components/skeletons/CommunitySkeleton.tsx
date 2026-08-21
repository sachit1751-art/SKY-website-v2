import React from 'react';
import { TextSkeleton } from './TextSkeleton';

export const CommunitySkeleton: React.FC = () => {
  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-6 md:px-12 pt-12">
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="h-6 w-48 mx-auto rounded-full shimmer-skeleton" />
        <div className="h-12 w-3/4 mx-auto rounded-2xl shimmer-skeleton" />
        <div className="h-4 w-5/6 mx-auto rounded-full shimmer-skeleton" />
      </div>

      <div className="space-y-6 max-w-3xl mx-auto pt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 sm:p-8 rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] space-y-4">
            <TextSkeleton hasHeading={true} lines={3} />
          </div>
        ))}
      </div>
    </div>
  );
};
