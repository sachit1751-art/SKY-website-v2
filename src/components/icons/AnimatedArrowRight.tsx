import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedArrowRight: React.FC<AnimatedIconProps> = ({
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
      <motion.g
        variants={{
          idle: { x: 0 },
          hover: {
            x: [0, 3, 0],
            transition: { duration: 0.22, ease: 'easeOut' }
          },
          tap: { x: 2, transition: { duration: 0.15 } }
        }}
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </motion.g>
    </motion.svg>
  );
};
