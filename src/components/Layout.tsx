import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { GeometricBackground } from './GeometricBackground';
import { OfflineToast } from './OfflineToast';
import { DecorativeBackground } from './DecorativeBackground';
import { RouteProgressBar } from './RouteProgressBar';
import { ScrollProgressBar } from './ScrollProgressBar';
import { BreadcrumbNav } from './BreadcrumbNav';
import { PullToRefresh } from './PullToRefresh';
import { FeedbackModal } from './FeedbackModal';

export const Layout: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col relative bg-[#FFF8E1] dark:bg-[#12110D] text-[#121212] dark:text-[#F4EFE6] font-sans antialiased selection:bg-[#FDE694] selection:text-[#121212] transition-colors duration-300 overflow-x-hidden w-full">
      <PullToRefresh />
      <ScrollProgressBar />
      <RouteProgressBar />
      <ScrollToTop />
      <FeedbackModal />
      {!isOnline && <OfflineToast />}

      {/* Global Ambient Silk Background & Lighting */}
      <DecorativeBackground />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <GeometricBackground />
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] max-w-[100vw] h-[500px] rounded-full transition-opacity duration-300 transform-gpu pointer-events-none" 
          style={{ background: 'radial-gradient(ellipse at center, rgba(253, 230, 148, 0.15) 0%, rgba(253, 230, 148, 0) 70%)' }}
        />
      </div>

      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow flex flex-col relative z-10 pt-20 sm:pt-24 pb-24 md:pb-0">
        <BreadcrumbNav />
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
