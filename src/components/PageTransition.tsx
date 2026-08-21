import React from 'react';
import { motion, useReducedMotion, Variants } from 'motion/react';

export type TransitionVariant = 'fade' | 'slideUp' | 'slideRight' | 'zoom' | 'bounce' | 'flip';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: TransitionVariant;
}

const containerVariants: Record<TransitionVariant, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 24 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -12 }
  },
  slideRight: {
    initial: { opacity: 0, x: -32 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, x: 16 }
  },
  zoom: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, scale: 1.04 }
  },
  bounce: {
    initial: { opacity: 0, y: 100 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0, y: -50 }
  },
  flip: {
    initial: { opacity: 0, rotateX: -90 },
    animate: { 
      opacity: 1, 
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, rotateX: 90 }
  }
};

/**
 * Enhanced PageTransition component with support for staggered entrances and multiple animation styles.
 * It uses variants to allow children to automatically participate in the staggered animation.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = "w-full flex-grow flex flex-col transform-gpu",
  variant = 'slideUp'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const activeVariant = containerVariants[variant];

  // If user prefers reduced motion, we force a simple fade transition
  const motionVariants = shouldReduceMotion ? containerVariants.fade : activeVariant;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={motionVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Standard variants for staggered items within a page.
 * Wrap elements in <motion.div variants={staggerItemVariants} /> to participate.
 */
export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: {
      duration: 0.2
    }
  }
};
