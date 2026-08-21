import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PULL_THRESHOLD = 70; // pixels to drag before triggering

export const PullToRefresh: React.FC = () => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    let ticking = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when scrolled to top
      if (window.scrollY <= 2) {
        startYRef.current = e.touches[0].clientY;
      } else {
        startYRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startYRef.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diffY = currentY - startYRef.current;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (diffY > 0 && window.scrollY <= 2) {
            // Apply resistance physics formula
            const damped = Math.min(Math.pow(diffY, 0.82) * 2.2, 110);
            setPullDistance(damped);
          } else {
            setPullDistance(0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleTouchEnd = () => {
      if (startYRef.current === null) return;

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        triggerRefresh();
      } else {
        setPullDistance(0);
      }
      startYRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setPullDistance(PULL_THRESHOLD);

    // Dispatch global event for listeners to re-fetch dynamic state
    window.dispatchEvent(new CustomEvent('app-pull-refresh'));

    // Show feedback toast and reset after delay
    setTimeout(() => {
      showToast({ title: 'Page content updated', type: 'success' });
      setIsRefreshing(false);
      setPullDistance(0);
    }, 1100);
  };

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const isReadyToRelease = pullDistance >= PULL_THRESHOLD;

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: pullDistance * 0.4 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[140] pointer-events-none"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFDF7]/95 dark:bg-[#1A1914]/95 border border-[#EBE4CF] dark:border-[#36342A] rounded-full shadow-lg text-xs font-bold text-[#121212] dark:text-[#F4EFE6]">
          {isRefreshing ? (
            <>
              <RefreshCw size={15} className="animate-spin text-[#FDE694]" />
              <span>Refreshing content...</span>
            </>
          ) : (
            <>
              <motion.div
                style={{ rotate: progress * 180 }}
                className="text-[#787567] dark:text-[#BDB8A4]"
              >
                <ArrowDown size={15} />
              </motion.div>
              <span>{isReadyToRelease ? 'Release to refresh' : 'Pull down to refresh'}</span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
