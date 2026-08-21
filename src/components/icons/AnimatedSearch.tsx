import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedSearch: React.FC<AnimatedIconProps> = ({
  size = 20,
  strokeWidth = 2,
  className = '',
  isHovered,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="idle"
      whileHover={shouldReduceMotion ? undefined : 'hover'}
      whileTap={shouldReduceMotion ? undefined : 'tap'}
      animate={!shouldReduceMotion && isHovered ? 'hover' : 'idle'}
      {...(props as any)}
    >
      <motion.circle
        cx="11"
        cy="11"
        r="8"
        variants={{
          idle: { scale: 1 },
          hover: { scale: 1.08, transition: { duration: 0.2, ease: 'easeOut' } },
          tap: { scale: 0.95 }
        }}
      />
      <motion.path
        d="m21 21-4.3-4.3"
        variants={{
          idle: { x: 0, y: 0 },
          hover: { x: 1.5, y: 1.5, transition: { duration: 0.2, ease: 'easeOut' } },
          tap: { x: 0.5, y: 0.5 }
        }}
      />
    </motion.svg>
  );
};
