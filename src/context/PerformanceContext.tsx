import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

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
  
  const fpsMeasurements = useRef<number[]>([]);
  const lastChangeTime = useRef<number>(Date.now());

  useEffect(() => {
    let unmounted = false;

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

    // --- 1. Initial heuristic based detection ---
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

      // WebGL/GPU capability check
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          score += 1;
        }
      } catch (e) {
        // Ignore errors
      }

      // Max score is 5 (2 + 2 + 1)
      if (score <= 2) {
        return 'low';
      } else if (score <= 4) {
        return 'medium';
      }
      return 'high';
    };

    setTier(detectInitialTier());

    // --- 2. Pointer capability ---
    const checkPointer = () => {
      const match = window.matchMedia('(pointer: fine)');
      setIsTouchOnly(!match.matches);
    };
    checkPointer();
    const mediaQuery = window.matchMedia('(pointer: fine)');
    mediaQuery.addEventListener('change', checkPointer);

    // --- 3. Dynamic FPS Monitoring ---
    let frameId: number;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    
    // Sample FPS over 1-second intervals
    const measureFPS = (time: number) => {
      if (unmounted) return;
      
      frameCount++;
      const elapsed = time - lastFrameTime;
      
      if (elapsed >= 1000) {
        const fps = (frameCount * 1000) / elapsed;
        frameCount = 0;
        lastFrameTime = time;
        
        fpsMeasurements.current.push(fps);
        if (fpsMeasurements.current.length > 5) {
          fpsMeasurements.current.shift(); // Keep last 5 samples
        }
        
        evaluatePerformance();
      }
      
      // Keep monitoring, but could pause if tab is hidden
      if (!document.hidden) {
        frameId = requestAnimationFrame(measureFPS);
      } else {
        // Stop measuring while hidden
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
      } else {
        lastFrameTime = performance.now();
        frameCount = 0;
        frameId = requestAnimationFrame(measureFPS);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    frameId = requestAnimationFrame(measureFPS);

    const evaluatePerformance = () => {
      const now = Date.now();
      // Cooldown of 5 seconds between adjustments
      if (now - lastChangeTime.current < 5000) return;
      if (fpsMeasurements.current.length < 3) return;

      const avgFps = fpsMeasurements.current.reduce((a, b) => a + b, 0) / fpsMeasurements.current.length;
      
      setTier((currentTier) => {
        let newTier = currentTier;
        
        if (avgFps < 30 && currentTier === 'high') {
          newTier = 'medium';
        } else if (avgFps < 20 && currentTier !== 'low') {
          newTier = 'low';
        } else if (avgFps > 55 && currentTier === 'medium') {
          newTier = 'high'; // Upgrade cautiously
        } else if (avgFps > 50 && currentTier === 'low') {
          newTier = 'medium'; 
        }

        if (newTier !== currentTier) {
          lastChangeTime.current = now;
          // Clear history on shift
          fpsMeasurements.current = [];
        }
        
        return newTier;
      });
    };

    return () => {
      unmounted = true;
      mediaQuery.removeEventListener('change', checkPointer);
      motionQuery.removeEventListener('change', checkReducedMotion);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <PerformanceContext.Provider value={{ tier, isTouchOnly, prefersReducedMotion, saveData }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceTier = () => useContext(PerformanceContext);
