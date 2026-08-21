import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
  className?: string;
  isHovered?: boolean;
}

export const AnimatedHome: React.FC<AnimatedIconProps> = ({
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
        d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        variants={{
          idle: { y: 0 },
          hover: { y: -1.5, transition: { duration: 0.2, ease: 'easeOut' } },
          tap: { y: -0.5, transition: { duration: 0.15 } }
        }}
      />
      <motion.path
        d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
        variants={{
          idle: { scaleY: 1, originY: 1 },
          hover: { scaleY: 1.12, originY: 1, transition: { duration: 0.2, ease: 'easeOut' } },
          tap: { scaleY: 1.05, originY: 1, transition: { duration: 0.15 } }
        }}
      />
    </motion.svg>
  );
};
