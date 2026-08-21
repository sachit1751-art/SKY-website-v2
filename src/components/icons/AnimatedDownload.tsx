import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedDownload: React.FC<AnimatedIconProps> = ({
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
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        variants={{
          idle: { y: 0 },
          hover: { y: 0.5, transition: { duration: 0.2 } },
          tap: { y: 0 }
        }}
      />
      <motion.g
        variants={{
          idle: { y: 0 },
          hover: {
            y: [0, 2.5, 0],
            transition: { duration: 0.24, ease: 'easeInOut' }
          },
          tap: { y: 1.5, transition: { duration: 0.15 } }
        }}
      >
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </motion.g>
    </motion.svg>
  );
};
