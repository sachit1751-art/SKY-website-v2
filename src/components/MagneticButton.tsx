import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { usePerformanceTier } from '../context/PerformanceContext';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  strength?: number; // 0.1 to 0.5 recommended
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  onClick,
  strength = 0.28,
  href,
  target,
  rel,
  title,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { tier, isTouchOnly } = usePerformanceTier();
  const shouldDisablePhysics = isTouchOnly || tier === 'low' || tier === 'medium';

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for magnetic effect
  const springConfig = { damping: 15, stiffness: 180, mass: 0.2 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || shouldDisablePhysics || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    if (shouldDisablePhysics) return;
    x.set(0);
    y.set(0);
  };

  const innerContent = (
    <motion.div
      ref={ref}
      style={shouldDisablePhysics ? undefined : { x: springX, y: springY }}
      onMouseMove={shouldDisablePhysics ? undefined : handleMouseMove}
      onMouseLeave={shouldDisablePhysics ? undefined : handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`inline-block cursor-pointer select-none transition-shadow transform-gpu ${className} ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
      title={title}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
        className="inline-block"
      >
        {innerContent}
      </a>
    );
  }

  return innerContent;
};

