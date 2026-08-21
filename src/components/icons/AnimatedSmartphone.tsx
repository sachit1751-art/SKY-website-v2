import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export const AnimatedSmartphone: React.FC<AnimatedIconProps> = ({
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
      <motion.rect
        width="14"
        height="20"
        x="5"
        y="2"
        rx="2"
        ry="2"
        variants={{
          idle: { rotate: 0, scale: 1 },
          hover: {
            rotate: [0, -3, 3, -1.5, 0],
            scale: 1.04,
            transition: { duration: 0.24, ease: 'easeInOut' }
          },
          tap: { scale: 0.98, transition: { duration: 0.15 } }
        }}
      />
      <motion.path
        d="M12 18h.01"
        variants={{
          idle: { scale: 1 },
          hover: { scale: 1.5, transition: { duration: 0.2 } },
          tap: { scale: 1 }
        }}
      />
    </motion.svg>
  );
};
