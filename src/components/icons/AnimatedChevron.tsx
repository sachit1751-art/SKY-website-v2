import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export interface AnimatedChevronProps extends AnimatedIconProps {
  isExpanded?: boolean;
  direction?: 'down' | 'right' | 'up' | 'left';
}

export const AnimatedChevronDown: React.FC<AnimatedChevronProps> = ({
  size = 20,
  strokeWidth = 2,
  className = '',
  isExpanded = false,
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
      {...(props as any)}
    >
      <motion.path
        d="m6 9 6 6 6-6"
        animate={{
          rotate: isExpanded ? 180 : 0,
          y: !shouldReduceMotion && isHovered && !isExpanded ? 1.5 : 0
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: '12px', originY: '12px' }}
      />
    </motion.svg>
  );
};

export const AnimatedChevronRight: React.FC<AnimatedChevronProps> = ({
  size = 20,
  strokeWidth = 2,
  className = '',
  isExpanded = false,
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
      {...(props as any)}
    >
      <motion.path
        d="m9 18 6-6-6-6"
        animate={{
          rotate: isExpanded ? 90 : 0,
          x: !shouldReduceMotion && isHovered && !isExpanded ? 2 : 0
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: '12px', originY: '12px' }}
      />
    </motion.svg>
  );
};
