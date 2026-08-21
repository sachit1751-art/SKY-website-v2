import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedExternalLink: React.FC<AnimatedIconProps> = ({
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <motion.g
        variants={{
          idle: { x: 0, y: 0 },
          hover: {
            x: [0, 2, 0],
            y: [0, -2, 0],
            transition: { duration: 0.22, ease: 'easeOut' }
          },
          tap: { x: 1, y: -1, transition: { duration: 0.15 } }
        }}
      >
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" x2="21" y1="14" y2="3" />
      </motion.g>
    </motion.svg>
  );
};
