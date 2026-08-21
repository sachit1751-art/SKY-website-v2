import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AnimatedIconProps } from './AnimatedHome';

export interface AnimatedSunMoonProps extends AnimatedIconProps {
  isDark?: boolean;
}

export const AnimatedSunMoon: React.FC<AnimatedSunMoonProps> = ({
  size = 18,
  strokeWidth = 2,
  className = '',
  isDark = false,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg
            key="sun"
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={shouldReduceMotion ? { opacity: 0 } : { rotate: -45, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { rotate: 45, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: '12px', originY: '12px' }}
            {...(props as any)}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={shouldReduceMotion ? { opacity: 0 } : { rotate: 45, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { rotate: -45, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: '12px', originY: '12px' }}
            {...(props as any)}
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
};
