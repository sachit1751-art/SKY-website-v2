import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const RouteProgressBar: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset and start
    setIsVisible(true);
    setProgress(0);

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    // Let the browser paint first, then trigger progress to 75% smoothly
    const startTimer = setTimeout(() => {
      setProgress(75);
    }, 10);

    // After route change settles, jump to 100% and then hide
    const completeTimer = setTimeout(() => {
      setProgress(100);
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        resetTimer = setTimeout(() => {
          setProgress(0);
        }, 150);
      }, 200);
    }, 180);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(completeTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [location.pathname, location.search]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none overflow-hidden bg-transparent transform-gpu transition-opacity duration-150"
      style={{ opacity: progress === 100 ? 0 : 1 }}
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#FDE694] via-[#F4D068] to-[#121212] dark:from-[#FDE694] dark:via-[#F3D369] dark:to-[#FAF3DD] shadow-[0_0_12px_rgba(253,230,148,0.85)] rounded-r-full"
        style={{
          width: `${progress}%`,
          transition: progress === 100
            ? 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'width 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  );
};

