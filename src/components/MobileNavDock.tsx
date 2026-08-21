import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AnimatedHome,
  AnimatedSmartphone,
  AnimatedLayers,
  AnimatedUsers,
  AnimatedSearch,
} from './icons';

const MotionLink = motion(Link);

interface MobileNavDockProps {
  onOpenSearch: () => void;
  isSearchOpen: boolean;
  isMenuOpen: boolean;
}

import { useAuth } from '../context/AuthContext';
import { usePerformanceTier } from '../context/PerformanceContext';
import { AlertCircle } from 'lucide-react';

export const MobileNavDock: React.FC<MobileNavDockProps> = ({
  onOpenSearch,
  isSearchOpen,
  isMenuOpen,
}) => {
  const location = useLocation();
  const { isSuperAdmin, isSessionExpiring, isAdmin } = useAuth();
  const { tier } = usePerformanceTier();
  const isVeryLowEnd = tier === 'low';
  const dockBgClass = 'bg-gradient-to-t from-[#FAF3DD] to-[#F4ECDC] dark:from-[#181712] dark:to-[#151410] shadow-lg shadow-black/5 dark:shadow-black/20';
  const [isVisible, setIsVisible] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 359px)').matches;
    }
    return false;
  });

  // Check for very small screens using performant media queries
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 359px)');
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsSmallScreen(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQueryChange);
    } else {
      mediaQuery.addListener(handleMediaQueryChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaQueryChange);
      } else {
        mediaQuery.removeListener(handleMediaQueryChange);
      }
    };
  }, []);

  // Hide on scroll down, show on scroll up with requestAnimationFrame throttling
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY && Math.abs(currentScrollY - lastScrollY) > 8) {
        // Scrolling up
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Hide if search or full menu overlay is open
  if (isSearchOpen || isMenuOpen) {
    return null;
  }

  const items = [
    { name: 'Home', path: '/', icon: AnimatedHome },
    { name: 'Device', path: '/device', icon: AnimatedSmartphone },
    { name: 'ROMs', path: '/roms', icon: AnimatedLayers },
    { name: 'Team', path: '/team', icon: AnimatedUsers },
    { name: 'Admin', path: '/admin', icon: AnimatedUsers },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="md:hidden fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 z-40 max-w-sm mx-auto pointer-events-auto"
        >
          <nav
            aria-label="Mobile Bottom Navigation"
            className={`${dockBgClass} border border-[#EBE4CF] dark:border-[#36342A] rounded-full p-1 sm:p-1.5 flex items-center justify-between gap-1 transform-gpu min-h-[56px]`}
          >
            {items.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const IconComponent = item.icon;

              return (
                <MotionLink
                  key={item.path}
                  to={item.path}
                  className={`relative flex-1 min-h-[44px] min-w-[44px] px-1 py-1 rounded-full flex flex-col items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#121212] font-extrabold'
                      : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                  }`}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(5);
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId={isVeryLowEnd ? undefined : "activeMobileDockItem"}
                      className="absolute inset-0 bg-[#FDE694] rounded-full shadow-xs border border-[#EBE4CF] dark:border-transparent -z-10"
                      transition={isVeryLowEnd ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  <IconComponent size={isSmallScreen ? 16 : 18} />
                  {item.name === 'Admin' && isSessionExpiring && (
                    <AlertCircle size={10} className="absolute top-1.5 right-2 text-red-500 animate-pulse" />
                  )}
                  <span className="mt-0.5 leading-none tracking-tight whitespace-nowrap text-[9px] sm:text-[10px]">{item.name}</span>
                </MotionLink>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
