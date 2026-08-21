import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'none';
  distance?: number;
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  distance = 16,
  threshold = 0.15,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      setIsTransitionComplete(true);
      return;
    }

    let transitionTimer: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we unobserve to keep the animation clean and high performance
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
          // Clear willChange after animation finishes to free GPU memory
          transitionTimer = setTimeout(() => {
            setIsTransitionComplete(true);
          }, delayMs + 750);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (transitionTimer) clearTimeout(transitionTimer);
      if (currentEl) {
        observer.unobserve(currentEl);
      }
      observer.disconnect();
    };
  }, [threshold, delayMs]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    if (direction === 'up') return `translate3d(0, ${distance}px, 0)`;
    if (direction === 'down') return `translate3d(0, -${distance}px, 0)`;
    return 'translate3d(0, 0, 0)';
  };

  return (
    <div
      ref={elementRef}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: isTransitionComplete ? 'auto' : 'opacity, transform',
      }}
      className={`transform-gpu ${className}`}
    >
      {children}
    </div>
  );
};

