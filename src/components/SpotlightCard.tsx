import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { usePerformanceTier } from '../context/PerformanceContext';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  style?: React.CSSProperties;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(253, 230, 148, 0.15)',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { tier, isTouchOnly } = usePerformanceTier();
  const disableSpotlight = isTouchOnly || tier === 'low' || tier === 'medium';

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the motion
  const smoothX = useSpring(mouseX, { stiffness: 350, damping: 35 });
  const smoothY = useSpring(mouseY, { stiffness: 350, damping: 35 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableSpotlight || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      style={style}
      onMouseMove={disableSpotlight ? undefined : handleMouseMove}
      onMouseEnter={() => !disableSpotlight && setIsFocused(true)}
      onMouseLeave={() => !disableSpotlight && setIsFocused(false)}
      className={`relative overflow-hidden transform-gpu rounded-3xl ${className}`}
    >
      {!disableSpotlight && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 transform-gpu"
          style={{
            background: `radial-gradient(400px circle at ${smoothX}px ${smoothY}px, ${spotlightColor}, transparent 80%)`,
            opacity: isFocused ? 1 : 0,
          }}
        />
      )}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};

