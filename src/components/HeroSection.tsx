import React from 'react';
import { ArrowDown, Github, Sparkles } from 'lucide-react';
import { usePerformanceTier } from '../context/PerformanceContext';

interface HeroSectionProps {
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => {
  const { tier } = usePerformanceTier();
  const isLowEnd = tier === 'low';

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between pt-28 pb-16 px-4 sm:px-6 md:px-12 overflow-hidden bg-transparent">
      {/* Subtle static background gradient */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-60 dark:opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 65%)'
        }}
      />

      {/* Hero Header Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center pt-8">
        {/* Badge / Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#1C1A14]/80 border border-[#EBE4CF] dark:border-[#36342A] text-xs font-extrabold uppercase tracking-widest text-[#49473E] dark:text-[#F4EFE6] mb-6 shadow-xs">
          <Sparkles size={14} className="text-amber-500" />
          <span>Open-Source Android Ecosystem</span>
        </div>

        {/* Brand Name */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter text-[#121212] dark:text-[#F4EFE6] mb-4 selection:bg-[#FDE694]">
          <span className="shimmer-accent">SKY</span>
        </h1>

        {/* Primary Tagline */}
        <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#49473E] dark:text-[#F4EFE6] mb-5">
          Built for everyone.
        </p>

        {/* Subtitle / Description */}
        <p className="text-base sm:text-lg text-[#787567] dark:text-[#BDB8A4] max-w-xl mx-auto leading-relaxed mb-10 font-normal">
          A community-driven Android device platform engineered for freedom, performance, and customization.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExplore}
            className="px-8 py-4 rounded-2xl text-sm font-extrabold bg-[#FDE694] text-[#121212] hover:bg-[#fbdc70] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 shadow-sm border border-[#EBE4CF] dark:border-transparent"
          >
            Explore Ecosystem
            <ArrowDown className="w-4 h-4 text-[#121212]" />
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl text-sm font-bold text-[#49473E] dark:text-[#F4EFE6] bg-[#FFFDF7] dark:bg-[#1C1A14] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF5E6] dark:hover:bg-[#25231C] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Github className="w-4 h-4" />
            GitHub Repository
          </a>
        </div>
      </div>

      {/* Subtle Scroll Down Prompt */}
      <div className="text-center pt-8 relative z-10">
        <button
          onClick={onExplore}
          className="text-xs font-bold uppercase tracking-widest text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          Scroll to discover
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
