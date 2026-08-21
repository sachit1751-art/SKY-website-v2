import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedGithub: React.FC<AnimatedIconProps> = ({
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
        d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
        variants={{
          idle: { rotate: 0 },
          hover: {
            rotate: [0, -6, 6, -3, 0],
            transition: { duration: 0.25, ease: 'easeInOut' }
          },
          tap: { scale: 0.95 }
        }}
      />
      <motion.path
        d="M9 18c-4.51 2-5-2-7-2"
        variants={{
          idle: { x: 0 },
          hover: { x: [0, -1.5, 0], transition: { duration: 0.2 } },
          tap: { x: 0 }
        }}
      />
    </motion.svg>
  );
};
