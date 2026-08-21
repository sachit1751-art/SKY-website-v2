import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedLayers: React.FC<AnimatedIconProps> = ({
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
      <motion.path
        d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
        variants={{
          idle: { y: 0 },
          hover: { y: -2.5, transition: { duration: 0.2, ease: 'easeOut' } },
          tap: { y: -1, transition: { duration: 0.15 } }
        }}
      />
      <motion.path
        d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"
        variants={{
          idle: { y: 0 },
          hover: { y: 0, transition: { duration: 0.2 } },
          tap: { y: 0 }
        }}
      />
      <motion.path
        d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"
        variants={{
          idle: { y: 0 },
          hover: { y: 2, transition: { duration: 0.2, ease: 'easeOut' } },
          tap: { y: 0.5, transition: { duration: 0.15 } }
        }}
      />
    </motion.svg>
  );
};
