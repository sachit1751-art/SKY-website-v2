import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AnimatedHome,
  AnimatedSmartphone,
  AnimatedLayers,
  AnimatedUsers,
  AnimatedMessageCircle,
  AnimatedSearch,
  AnimatedGithub,
  AnimatedExternalLink,
  AnimatedMenuX,
  AnimatedChevronRight
} from './icons';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { MagneticButton } from './MagneticButton';
import { usePerformanceTier } from '../context/PerformanceContext';
import { useAuth } from '../context/AuthContext';
import { GlobalSearchModal } from './GlobalSearchModal';
import { MobileNavDock } from './MobileNavDock';
import { StatusIndicator } from './StatusIndicator';
import { Shield, Plus } from 'lucide-react';
import { useScrollManager } from '../hooks/useScrollManager';
import { prefetchAdminPages, prefetchRomEditorPage } from '../utils/prefetchAdmin';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();
  const { tier } = usePerformanceTier();
  const { isAdmin } = useAuth();
  const isLowEnd = tier === 'low' || tier === 'medium';
  const isVeryLowEnd = tier === 'low';

  useEffect(() => {
    // Initial check
    setScrolled(window.scrollY > 20);
  }, []);

  useScrollManager((scrollY) => {
    const isPastLimit = scrollY > 20;
    if (isPastLimit !== scrolled) {
      setScrolled(isPastLimit);
    }
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
      // Global Keyboard listener for Cmd+K / Ctrl+K / '/'
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: AnimatedHome, 
      description: 'Overview & featured updates' 
    },
    { 
      name: 'Device', 
      path: '/device', 
      icon: AnimatedSmartphone, 
      description: 'Snapdragon 4 Gen 2 & hardware specs' 
    },
    { 
      name: 'ROMs', 
      path: '/roms', 
      icon: AnimatedLayers, 
      description: 'Official & Unofficial Android 17 / 16 builds',
      badge: 'Catalog'
    },
    { 
      name: 'Team', 
      path: '/team', 
      icon: AnimatedUsers, 
      description: 'Maintainers, developers & credits' 
    },
    { 
      name: 'Community', 
      path: '/community', 
      icon: AnimatedMessageCircle, 
      description: 'FAQ, guides & discussions' 
    },
    {
      name: 'Admin',
      path: '/admin',
      icon: (props: any) => <Shield {...props} />,
      description: 'Maintainer Console'
    }
  ];

  const headerBgClass = scrolled
    ? 'bg-gradient-to-r from-[#FFF8E1]/95 to-[#FAF3DD]/95 dark:from-[#151410]/95 dark:to-[#181712]/95 border-b border-[#EBE4CF]/50 dark:border-[#36342A]/50 shadow-sm'
    : 'bg-gradient-to-r from-[#FAF3DD]/90 to-[#FAF3DD]/80 dark:from-[#1A1914]/90 dark:to-[#1A1914]/80 border-transparent';

  const drawerBgClass = 'bg-gradient-to-b from-[#FAF3DD] to-[#F4ECDC] dark:from-[#181712] dark:to-[#151410]';

  return (
    <>
      <header className="fixed top-2.5 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none transition-all duration-300 will-change-transform">
        <div
          className={`pointer-events-auto w-full max-w-6xl rounded-full transition-all duration-300 flex items-center justify-between px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 border transform-gpu gap-1.5 lg:gap-4 ${headerBgClass} ${
            scrolled
              ? 'border-[#EBE4CF] dark:border-[#36342A] shadow-lg dark:shadow-2xl sm:scale-[0.99]'
              : 'border-[#EBE4CF] dark:border-[#36342A] shadow-xs'
          }`}
        >
          {/* Left: Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 min-h-[44px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] rounded-full px-2.5 py-1 shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#49473E] dark:text-[#F4EFE6] group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-colors">
              SKY
            </span>
          </Link>

          {/* Center: Desktop Navigation Pills */}
          <nav className={`hidden md:flex items-center gap-0.5 lg:gap-1 bg-[#F4ECDC]/70 dark:bg-[#23211A]/80 p-1 rounded-full border border-[#EBE4CF] dark:border-[#36342A] relative transform-gpu shrink-0 `}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              const isAdminPath = item.path === '/admin' || item.path.startsWith('/admin');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={isAdminPath ? prefetchAdminPages : undefined}
                  onTouchStart={isAdminPath ? prefetchAdminPages : undefined}
                  onFocus={isAdminPath ? prefetchAdminPages : undefined}
                  className={`relative min-h-[40px] px-2.5 lg:px-4.5 py-2 rounded-full text-xs font-bold transition-colors z-10 flex items-center justify-center ${
                    isActive
                      ? 'text-[#121212]'
                      : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId={isVeryLowEnd ? undefined : "activePill"}
                      className="absolute inset-0 bg-[#FDE694] rounded-full shadow-xs border border-[#EBE4CF] dark:border-transparent -z-10"
                      transition={isVeryLowEnd ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Navigation Search Bar Trigger (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs lg:max-w-sm">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-full text-xs bg-[#FAF0CF]/60 dark:bg-[#25231C]/70 hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] text-[#787567] dark:text-[#BDB8A4] hover:text-[#49473E] dark:hover:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] transition-all cursor-pointer shadow-2xs group"
              title="Search documentation, ROMs, hardware specs, guides"
            >
              <AnimatedSearch size={14} className="text-[#787567] dark:text-[#BDB8A4] group-hover:text-[#49473E] dark:group-hover:text-[#FDE694] transition-colors shrink-0" />
              <span className="truncate text-xs">Search ROMs & docs...</span>
            </button>
          </div>

          {/* Right: Integrated Control Deck */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 pl-1.5 pr-1 py-1 rounded-full bg-[#FAF3DD]/80 dark:bg-[#1F1E18]/80 border border-[#EBE4CF]/40 dark:border-[#36342A]/40 shadow-xs shrink-0">
            <ThemeToggle className="!border-transparent !bg-transparent hover:!bg-[#FAF0CF]/50 dark:hover:!bg-[#2B2921]/50" />
            
            {isAdmin && (
              <MagneticButton strength={0.2}>
                <Link
                  to="/admin/roms/new"
                  onMouseEnter={prefetchRomEditorPage}
                  onTouchStart={prefetchRomEditorPage}
                  onFocus={prefetchRomEditorPage}
                  className="group relative overflow-hidden inline-flex items-center justify-center min-h-[44px] gap-1.5 px-3.5 lg:px-4 py-2.5 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212] hover:shadow-md hover:shadow-[#FDE694]/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694]"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  <Plus size={14} className="text-[#121212]" />
                  <span className="hidden lg:inline">Add ROM</span>
                </Link>
              </MagneticButton>
            )}
            
            <MagneticButton strength={0.2}>
              <a
                href="https://t.me/Redmi125GSupport"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden inline-flex items-center justify-center min-h-[44px] gap-1.5 px-4 lg:px-5 py-2.5 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212] hover:shadow-md hover:shadow-[#FDE694]/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <Send size={14} className="text-[#121212]" />
                <span className="hidden lg:inline">Telegram</span>
                <AnimatedExternalLink size={12} className="text-[#121212]" />
              </a>
            </MagneticButton>
          </div>

          {/* Mobile Controls Deck */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* Mobile Search Quick Trigger */}
            <button
              id="mobile-search-btn"
              onClick={() => setSearchModalOpen(true)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] border border-[#EBE4CF] dark:border-[#36342A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] active:scale-95 transition-transform"
              aria-label="Search ROMs and documentation"
              title="Search ROMs & docs"
            >
              <AnimatedSearch size={18} />
            </button>

            {/* Mobile Theme Switcher */}
            <ThemeToggle className="!w-11 !h-11 !min-w-[44px] !min-h-[44px] !p-0 !rounded-full" />

            {/* Mobile Hamburger / Close Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] active:scale-95 ${
                mobileMenuOpen
                  ? 'bg-[#FDE694] text-[#121212] border-[#EBE4CF] dark:border-[#FDE694]'
                  : 'bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] border-[#EBE4CF] dark:border-[#36342A] hover:text-[#121212] dark:hover:text-[#FDE694]'
              }`}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <AnimatedMenuX isOpen={mobileMenuOpen} size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Floating Drawer & Backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Dimmed Blurred Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 pointer-events-auto touch-none"
                aria-hidden="true"
              />

              {/* Mobile Drawer Panel */}
              <motion.div 
                id="mobile-navigation-drawer"
                role="dialog"
                aria-label="Mobile Navigation"
                initial={{ opacity: 0, y: -14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className={`md:hidden fixed top-[66px] sm:top-20 inset-x-3 sm:inset-x-6 max-w-md mx-auto max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain ${drawerBgClass} border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl p-3.5 sm:p-5 flex flex-col gap-3 shadow-2xl pointer-events-auto origin-top transform-gpu z-50 will-change-transform`}
              >
                {/* Search Quick Action inside Menu */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="flex items-center justify-between w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#FAF0CF]/70 dark:bg-[#23211A] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] text-sm font-medium hover:border-[#FDE694]/70 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <AnimatedSearch size={18} className="text-[#787567] dark:text-[#BDB8A4] group-hover:text-[#121212] dark:group-hover:text-[#FDE694]" />
                    <span className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4]">Search ROMs, specs, guides...</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6]">
                    Search
                  </span>
                </button>

                {isAdmin && (
                  <Link
                    to="/admin/roms/new"
                    onMouseEnter={prefetchRomEditorPage}
                    onTouchStart={prefetchRomEditorPage}
                    onFocus={prefetchRomEditorPage}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#FDE694] text-[#121212] border border-[#EBE4CF] dark:border-transparent text-sm font-bold shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Plus size={18} />
                      <span>Add New ROM Release</span>
                    </div>
                    <AnimatedChevronRight size={14} />
                  </Link>
                )}

                {/* Section Header */}
                <div className="flex items-center justify-between px-2 pt-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4]">
                    Explore Pages
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF0CF] dark:bg-[#25231C] text-[#787567] dark:text-[#BDB8A4] font-semibold">
                    sky device
                  </span>
                </div>

                {/* Navigation Items List */}
                <nav className="flex flex-col gap-1.5" aria-label="Mobile Pages">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    const isAdminPath = item.path === '/admin' || item.path.startsWith('/admin');
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onMouseEnter={isAdminPath ? prefetchAdminPages : undefined}
                        onTouchStart={isAdminPath ? prefetchAdminPages : undefined}
                        onFocus={isAdminPath ? prefetchAdminPages : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`relative min-h-[48px] px-3.5 py-3 rounded-2xl text-sm font-semibold flex items-center justify-between transition-all active:scale-[0.98] z-10 border ${
                          isActive
                            ? 'text-[#121212] bg-[#FDE694] border-[#EBE4CF] dark:border-transparent shadow-xs'
                            : 'text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] border-[#EBE4CF]/40 dark:border-[#36342A]/40 bg-[#FAF0CF]/40 dark:bg-[#201E18]/40 hover:bg-[#FAF0CF]/80 dark:hover:bg-[#26241D]'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            isActive
                              ? 'bg-[#121212] text-[#FDE694] border-black/10'
                              : 'bg-[#FAF3DD] dark:bg-[#2A2820] text-[#49473E] dark:text-[#F4EFE6] border-[#EBE4CF] dark:border-[#36342A]'
                          }`}>
                            <IconComponent size={16} />
                          </div>
                          <div className="flex flex-col min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm leading-tight truncate">{item.name}</span>
                              {item.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                  isActive ? 'bg-[#121212]/15 text-[#121212]' : 'bg-[#FDE694]/50 dark:bg-[#FDE694]/20 text-[#121212] dark:text-[#FDE694]'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className={`text-[11px] leading-tight truncate mt-0.5 ${
                              isActive ? 'text-[#121212]/70 font-medium' : 'text-[#787567] dark:text-[#BDB8A4]'
                            }`}>
                              {item.description}
                            </span>
                          </div>
                        </div>

                        <AnimatedChevronRight size={16} className={`shrink-0 transition-transform ${
                          isActive ? 'text-[#121212] translate-x-0.5' : 'text-[#787567] dark:text-[#BDB8A4] opacity-50'
                        }`} />
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Quick Community Actions */}
                <div className="pt-2 border-t border-[#EBE4CF] dark:border-[#36342A] mt-1 grid grid-cols-2 gap-2">
                  <a
                    href="https://t.me/Redmi125G_Updates"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center min-h-[44px] gap-1.5 py-2.5 px-3 rounded-2xl bg-[#FAF0CF] dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF]/90 active:scale-[0.98] transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                    <span>Telegram</span>
                  </a>

                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center min-h-[44px] gap-1.5 py-2.5 px-3 rounded-2xl bg-[#FDE694] text-[#121212] font-bold text-xs border border-[#EBE4CF] dark:border-transparent active:scale-[0.98] transition-all shadow-xs"
                  >
                    <AnimatedGithub size={14} className="text-[#121212]" />
                    <span>GitHub</span>
                    <AnimatedExternalLink size={12} className="text-[#121212]" />
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Floating Bottom Dock */}
      <MobileNavDock
        onOpenSearch={() => setSearchModalOpen(true)}
        isSearchOpen={searchModalOpen}
        isMenuOpen={mobileMenuOpen}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};


