import { useEffect, useRef } from 'react';

type ScrollCallback = (scrollY: number, direction: 'up' | 'down') => void;

class ScrollManager {
  private callbacks: Set<ScrollCallback> = new Set();
  private ticking: boolean = false;
  private lastScrollY: number = 0;
  private initialized: boolean = false;

  public init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    this.lastScrollY = window.scrollY;
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.initialized = true;
  }

  public destroy() {
    if (!this.initialized || typeof window === 'undefined') return;
    
    window.removeEventListener('scroll', this.handleScroll);
    this.initialized = false;
  }

  private handleScroll = () => {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const direction = currentScrollY > this.lastScrollY ? 'down' : 'up';
        
        this.callbacks.forEach(callback => callback(currentScrollY, direction));
        
        this.lastScrollY = currentScrollY;
        this.ticking = false;
      });
      this.ticking = true;
    }
  };

  public subscribe(callback: ScrollCallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  public getScrollY() {
    return typeof window !== 'undefined' ? window.scrollY : 0;
  }
}

// Singleton instance
export const globalScrollManager = new ScrollManager();

// Initialize globally if in browser
if (typeof window !== 'undefined') {
  globalScrollManager.init();
}

/**
 * A centralized, debounced scroll manager hook using requestAnimationFrame.
 * Ensures expensive state updates occur only once per animation frame.
 */
export function useScrollManager(callback: ScrollCallback) {
  // Use a ref to always point to the latest callback without re-subscribing
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const wrappedCallback: ScrollCallback = (scrollY, direction) => {
      callbackRef.current(scrollY, direction);
    };
    
    const unsubscribe = globalScrollManager.subscribe(wrappedCallback);
    
    return () => {
      unsubscribe();
    };
  }, []);
}
