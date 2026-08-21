import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export interface AnimatedMenuXProps extends AnimatedIconProps {
  isOpen?: boolean;
}

export const AnimatedMenuX: React.FC<AnimatedMenuXProps> = ({
  size = 20,
  strokeWidth = 2,
  className = '',
  isOpen = false,
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
      {...(props as any)}
    >
      {/* Top line -> Diagonal X line */}
      <motion.line
        x1="4"
        y1="6"
        x2="20"
        y2="6"
        animate={
          isOpen
            ? { x1: 5, y1: 5, x2: 19, y2: 19 }
            : { x1: 4, y1: 6, x2: 20, y2: 6 }
        }
        transition={{
          duration: shouldReduceMotion ? 0.05 : 0.22,
          ease: [0.16, 1, 0.3, 1]
        }}
      />
      {/* Middle line -> Fades out when open */}
      <motion.line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        animate={
          isOpen
            ? { opacity: 0, scaleX: 0 }
            : { opacity: 1, scaleX: 1 }
        }
        transition={{
          duration: shouldReduceMotion ? 0.05 : 0.16,
          ease: 'easeOut'
        }}
        style={{ originX: '12px', originY: '12px' }}
      />
      {/* Bottom line -> Diagonal X line */}
      <motion.line
        x1="4"
        y1="18"
        x2="20"
        y2="18"
        animate={
          isOpen
            ? { x1: 5, y1: 19, x2: 19, y2: 5 }
            : { x1: 4, y1: 18, x2: 20, y2: 18 }
        }
        transition={{
          duration: shouldReduceMotion ? 0.05 : 0.22,
          ease: [0.16, 1, 0.3, 1]
        }}
      />
    </motion.svg>
  );
};
