import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedMessageCircle: React.FC<AnimatedIconProps> = ({
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
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
        variants={{
          idle: { scale: 1, rotate: 0 },
          hover: {
            scale: [1, 1.08, 1],
            rotate: [0, -3, 3, 0],
            transition: { duration: 0.24, ease: 'easeInOut' }
          },
          tap: { scale: 0.95, transition: { duration: 0.15 } }
        }}
      />
    </motion.svg>
  );
};
