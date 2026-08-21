import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedUsers: React.FC<AnimatedIconProps> = ({
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
      {/* Front user body & head */}
      <motion.path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        variants={{
          idle: { y: 0 },
          hover: { y: -0.5, transition: { duration: 0.2 } },
          tap: { y: 0 }
        }}
      />
      <motion.circle
        cx="9"
        cy="7"
        r="4"
        variants={{
          idle: { y: 0 },
          hover: { y: -1.5, transition: { duration: 0.2, ease: 'easeOut' } },
          tap: { y: 0 }
        }}
      />
      {/* Back user body & head */}
      <motion.path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        variants={{
          idle: { x: 0, y: 0 },
          hover: { x: 1.5, y: -1, transition: { duration: 0.22, ease: 'easeOut' } },
          tap: { x: 0, y: 0 }
        }}
      />
      <motion.path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        variants={{
          idle: { x: 0, y: 0 },
          hover: { x: 1.5, y: -1.5, transition: { duration: 0.22, ease: 'easeOut' } },
          tap: { x: 0, y: 0 }
        }}
      />
    </motion.svg>
  );
};
