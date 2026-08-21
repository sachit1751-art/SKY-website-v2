import React, { createContext, useContext, useEffect, useState } from 'react';

export type PerformanceTier = 'high' | 'medium' | 'low';

interface PerformanceContextProps {
  tier: PerformanceTier;
  isTouchOnly: boolean;
  prefersReducedMotion: boolean;
  saveData: boolean;
}

const PerformanceContext = createContext<PerformanceContextProps>({
  tier: 'high',
  isTouchOnly: false,
  prefersReducedMotion: false,
  saveData: false,
});

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTier] = useState<PerformanceTier>('high');
  const [isTouchOnly, setIsTouchOnly] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const initialSaveData = connection ? connection.saveData === true : false;
    setSaveData(initialSaveData);

    const checkReducedMotion = () => {
      const match = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(match.matches);
    };
    checkReducedMotion();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', checkReducedMotion);

    // --- Initial heuristic based detection ---
    const detectInitialTier = () => {
      let score = 0;
      
      const deviceMemory = nav.deviceMemory; // Typically up to 8
      const cores = nav.hardwareConcurrency;

      if (deviceMemory) {
        if (deviceMemory >= 8) score += 2;
        else if (deviceMemory >= 4) score += 1;
      } else {
        score += 1; // Assume medium if unknown
      }

      if (cores) {
        if (cores >= 8) score += 2;
        else if (cores >= 4) score += 1;
      } else {
        score += 1;
      }

      if (initialSaveData) {
        score -= 1;
      }

      if (score <= 2) {
        return 'low';
      } else if (score <= 3) {
        return 'medium';
      }
      return 'high';
    };

    setTier(detectInitialTier());

    // --- Pointer capability ---
    const checkPointer = () => {
      const match = window.matchMedia('(pointer: fine)');
      setIsTouchOnly(!match.matches);
    };
    checkPointer();

    const mediaQuery = window.matchMedia('(pointer: fine)');
    mediaQuery.addEventListener('change', checkPointer);

    return () => {
      mediaQuery.removeEventListener('change', checkPointer);
      motionQuery.removeEventListener('change', checkReducedMotion);
    };
  }, []);

  return (
    <PerformanceContext.Provider value={{ tier, isTouchOnly, prefersReducedMotion, saveData }}>
      {children}
    </PerformanceContext.Provider>  );
};

export const usePerformanceTier = () => useContext(PerformanceContext);
