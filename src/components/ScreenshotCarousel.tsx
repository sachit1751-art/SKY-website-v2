import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Maximize2,
} from 'lucide-react';
import { AnimatedChevronLeft, AnimatedChevronRightCar } from './icons';
import { usePerformanceTier } from '../context/PerformanceContext';

interface ShowcaseSlide {
  id: number;
  src?: string;
  alt: string;
  title: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentBg: string;
  renderScreen: () => React.ReactNode;
}

// Static slide data hoisted outside component to avoid allocations on each render
const slides: ShowcaseSlide[] = [
  {
    id: 1,
    src: '/screenshots/AxionOS.jpg',
    alt: 'AxionOS Screenshot',
    title: 'AxionOS',
    subtitle: 'Custom ROM Showcase',
    description: 'High-performance custom ROM with advanced customization and fluid animations.',
    themeColor: '#3B82F6',
    accentBg: 'from-blue-500/20 to-sky-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">AxionOS</div>
  },
  {
    id: 2,
    src: '/screenshots/AxionOS2.jpg',
    alt: 'AxionOS Settings',
    title: 'AxionOS Settings',
    subtitle: 'Customization Hub',
    description: 'Granular controls for status bar, quick settings, and theming.',
    themeColor: '#3B82F6',
    accentBg: 'from-blue-500/20 to-sky-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">AxionOS 2</div>
  },
  {
    id: 3,
    src: '/screenshots/InfinityX.jpg',
    alt: 'InfinityX Screenshot',
    title: 'InfinityX',
    subtitle: 'Sleek Experience',
    description: 'Feature-rich custom ROM focused on stability and modern UI aesthetics.',
    themeColor: '#8B5CF6',
    accentBg: 'from-purple-500/20 to-indigo-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">InfinityX</div>
  },
  {
    id: 4,
    src: '/screenshots/InfinityX2.jpg',
    alt: 'InfinityX Features',
    title: 'InfinityX Features',
    subtitle: 'Advanced Tweaks',
    description: 'Extensive customization options and optimized battery performance.',
    themeColor: '#8B5CF6',
    accentBg: 'from-purple-500/20 to-indigo-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">InfinityX 2</div>
  },
  {
    id: 5,
    src: '/screenshots/MistOS.jpg',
    alt: 'MistOS Screenshot',
    title: 'MistOS',
    subtitle: 'Minimalist & Fast',
    description: 'Clean, bloatware-free Android experience with lightning-fast response times.',
    themeColor: '#06B6D4',
    accentBg: 'from-cyan-500/20 to-teal-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">MistOS</div>
  },
  {
    id: 6,
    src: '/screenshots/MistOS2.jpg',
    alt: 'MistOS UI',
    title: 'MistOS UI',
    subtitle: 'Refined Design',
    description: 'Carefully crafted interface elements for a distraction-free workflow.',
    themeColor: '#06B6D4',
    accentBg: 'from-cyan-500/20 to-teal-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">MistOS 2</div>
  },
  {
    id: 7,
    src: '/screenshots/ascp.jpg',
    alt: 'ASCP OS Screenshot',
    title: 'ASCP OS',
    subtitle: 'Community Build',
    description: 'Specialized community build optimized for maximum efficiency and device longevity.',
    themeColor: '#10B981',
    accentBg: 'from-emerald-500/20 to-green-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">ASCP OS</div>
  },
  {
    id: 8,
    src: '/screenshots/iodeOS.jpg',
    alt: 'iodéOS Screenshot',
    title: 'iodéOS',
    subtitle: 'Privacy Focused',
    description: 'Privacy-first operating system with integrated ad blocker and tracker protection.',
    themeColor: '#10B981',
    accentBg: 'from-emerald-500/20 to-teal-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">iodéOS</div>
  },
  {
    id: 9,
    src: '/screenshots/iodeOS2.jpg',
    alt: 'iodéOS Privacy Dashboard',
    title: 'iodéOS Privacy',
    subtitle: 'Blocker & Firewall',
    description: 'Real-time network monitoring and tracker blocking statistics.',
    themeColor: '#10B981',
    accentBg: 'from-emerald-500/20 to-teal-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">iodéOS 2</div>
  },
  {
    id: 10,
    src: '/screenshots/lineageos.jpg',
    alt: 'LineageOS Screenshot',
    title: 'LineageOS',
    subtitle: 'The Gold Standard',
    description: 'Industry-leading free and open-source Android distribution with unmatched reliability.',
    themeColor: '#F97316',
    accentBg: 'from-orange-500/20 to-amber-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">LineageOS</div>
  },
  {
    id: 11,
    src: '/screenshots/pixelOS.jpg',
    alt: 'PixelOS Screenshot',
    title: 'PixelOS',
    subtitle: 'Google Pixel Experience',
    description: 'Pure Pixel UI experience ported with extra stability and essential features.',
    themeColor: '#3B82F6',
    accentBg: 'from-blue-500/20 to-indigo-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">PixelOS</div>
  },
  {
    id: 12,
    src: '/screenshots/pixelOS2.jpg',
    alt: 'PixelOS Settings',
    title: 'PixelOS Extras',
    subtitle: 'Clean & Familiar',
    description: 'Smooth animations and authentic Google look and feel.',
    themeColor: '#3B82F6',
    accentBg: 'from-blue-500/20 to-indigo-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">PixelOS 2</div>
  },
  {
    id: 13,
    src: '/screenshots/voltageos.jpg',
    alt: 'VoltageOS Screenshot',
    title: 'VoltageOS',
    subtitle: 'Speed & Stamina',
    description: 'Optimized for high benchmark scores and exceptional battery backup.',
    themeColor: '#EAB308',
    accentBg: 'from-yellow-500/20 to-amber-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">VoltageOS</div>
  },
  {
    id: 14,
    src: '/screenshots/voltageos2.jpg',
    alt: 'VoltageOS Settings',
    title: 'VoltageOS Settings',
    subtitle: 'Power Control',
    description: 'Deep kernel tuning and advanced power management options.',
    themeColor: '#EAB308',
    accentBg: 'from-yellow-500/20 to-amber-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">VoltageOS 2</div>
  },
  {
    id: 15,
    src: '/screenshots/Lumine OS.jpg',
    alt: 'Lumine OS Screenshot',
    title: 'Lumine OS',
    subtitle: 'Luminescent UI',
    description: 'Fluid, modern operating system experience with ethereal design language and custom themes.',
    themeColor: '#EC4899',
    accentBg: 'from-pink-500/20 to-rose-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">Lumine OS</div>
  },
  {
    id: 16,
    src: '/screenshots/Lumini OS2.jpg',
    alt: 'Lumine OS Settings & Features',
    title: 'Lumine OS Settings',
    subtitle: 'Advanced Control',
    description: 'Comprehensive personalization hub and performance toggles designed for fluid interaction.',
    themeColor: '#EC4899',
    accentBg: 'from-pink-500/20 to-rose-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">Lumine OS 2</div>
  },
];

export const ScreenshotCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { tier } = usePerformanceTier();
  const isLowEnd = tier === 'low' || tier === 'medium';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }
  };

  // Preload only next/prev adjacent slides to keep network clean and fast
  useEffect(() => {
    const nextIdx = (index + 1) % slides.length;
    const prevIdx = (index - 1 + slides.length) % slides.length;
    [slides[nextIdx], slides[prevIdx]].forEach((slide) => {
      if (slide && slide.src && !imageErrorMap[slide.id]) {
        const img = new Image();
        img.src = slide.src;
      }
    });
  }, [index, imageErrorMap]);

  const currentSlide = slides[index];

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLightbox) {
        if (e.key === 'Escape') setShowLightbox(false);
      }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  // Auto-cycle timer
  useEffect(() => {
    if (isPaused || showLightbox || !isInView) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isPaused, showLightbox, isInView]);

  const handleImageError = (id: number) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto select-none px-12 sm:px-16" role="region" aria-label="SKY Interface Showcase">
      {/* External Left Navigation Button */}
      <button
        aria-label="Previous screenshot"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-0 sm:left-2 top-[44%] -translate-y-1/2 min-w-[44px] min-h-[44px] p-3 rounded-full bg-[#FAF3DD]/90 dark:bg-[#1F1E18]/90 text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] shadow-md hover:scale-105 hover:bg-[#FAF3DD] dark:hover:bg-[#2A2820] active:scale-95 transition-all cursor-pointer z-30 group flex items-center justify-center"
      >
        <AnimatedChevronLeft size={22} />
      </button>

      {/* Clean Screenshot Container without Phone Outline */}
      <div
        className="relative w-full max-w-[240px] xs:max-w-[260px] sm:max-w-[300px] md:max-w-[320px] aspect-[9/18.5] mx-auto rounded-[32px] overflow-hidden bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] shadow-xl transition-all duration-300 group transform-gpu"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={isLowEnd ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={isLowEnd ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={isLowEnd ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: isLowEnd ? 0.2 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative cursor-pointer flex items-center justify-center bg-[#FAF3DD] dark:bg-[#151410] transform-gpu"
            onClick={() => setShowLightbox(true)}
          >
            {currentSlide.src && !imageErrorMap[currentSlide.id] ? (
              <img
                src={currentSlide.src}
                alt={currentSlide.alt}
                referrerPolicy="no-referrer"
                decoding="async"
                onError={() => handleImageError(currentSlide.id)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              currentSlide.renderScreen()
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick Enlarge Prompt on Hover */}
        <button
          onClick={() => setShowLightbox(true)}
          className="absolute bottom-3 right-3 z-25 min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer shadow-md flex items-center justify-center"
          title="View Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* External Right Navigation Button */}
      <button
        aria-label="Next screenshot"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-0 sm:right-2 top-[44%] -translate-y-1/2 min-w-[44px] min-h-[44px] p-3 rounded-full bg-[#FAF3DD]/90 dark:bg-[#1F1E18]/90 text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] shadow-md hover:scale-105 hover:bg-[#FAF3DD] dark:hover:bg-[#2A2820] active:scale-95 transition-all cursor-pointer z-30 group flex items-center justify-center"
      >
        <AnimatedChevronRightCar size={22} />
      </button>

      {/* Feature Captions & Descriptions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="text-center mt-6 space-y-1 px-4"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4]">
            {currentSlide.subtitle}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] tracking-tight">
            {currentSlide.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] max-w-sm mx-auto leading-relaxed">
            {currentSlide.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicator Dots with Accessible Touch Target */}
      <div className="flex justify-center items-center gap-0.5 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Jump to slide ${i + 1}`}
            className="group min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] hover:scale-110 active:scale-95 hover:shadow-md transition-all duration-200"
          >
            <span
              className={`h-2 rounded-full transition-all duration-300 block group-hover:shadow-md group-hover:shadow-[#49473E]/20 dark:group-hover:shadow-[#FDE694]/30 ${
                i === index
                  ? 'w-7 bg-[#49473E] dark:bg-[#FDE694] shadow-sm'
                  : 'w-2 bg-[#EBE4CF] dark:bg-[#36342A] group-hover:bg-[#787567] dark:group-hover:bg-[#BDB8A4]'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setShowLightbox(false)}
        >
          <button
            aria-label="Close lightbox"
            onClick={() => setShowLightbox(false)}
            className="absolute top-5 right-5 text-white min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="w-full max-w-xs sm:max-w-sm aspect-[9/18.5] rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {currentSlide.src && !imageErrorMap[currentSlide.id] ? (
              <img
                src={currentSlide.src}
                alt={currentSlide.alt}
                referrerPolicy="no-referrer"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              currentSlide.renderScreen()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

