import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedCircleHelp: React.FC<AnimatedIconProps> = ({
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
      <circle cx="12" cy="12" r="10" />
      <motion.path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        variants={{
          idle: { rotate: 0, y: 0 },
          hover: {
            rotate: [0, -8, 8, 0],
            y: -0.5,
            transition: { duration: 0.24, ease: 'easeInOut' }
          },
          tap: { y: 0 }
        }}
        style={{ originX: '12px', originY: '10px' }}
      />
      <motion.path
        d="M12 17h.01"
        variants={{
          idle: { scale: 1 },
          hover: { scale: 1.5, transition: { duration: 0.2 } },
          tap: { scale: 1 }
        }}
      />
    </motion.svg>
  );
};
