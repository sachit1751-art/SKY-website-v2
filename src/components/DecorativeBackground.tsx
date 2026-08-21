import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../context/PerformanceContext';

export const DecorativeBackground: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion();
  const { tier } = usePerformanceTier();
  
  // We keep motion disabled on low/medium to save performance, but we completely remove 
  // blur filters on all tiers, replacing them with fast radial gradients.
  const disableAnimation = shouldReduceMotion || tier === 'low' || tier === 'medium';
  
  // High-performance radial gradients to simulate the blur without the GPU cost
  const gradient1 = {
    background: 'radial-gradient(circle at 50% 50%, var(--color-accent-soft), transparent 70%)',
    opacity: 0.6
  };
  
  const gradient2 = {
    background: 'radial-gradient(ellipse at 50% 50%, rgba(150, 150, 150, 0.1), transparent 70%)',
    opacity: 0.8
  };
  
  const gradient3 = {
    background: 'radial-gradient(circle at 50% 50%, var(--color-accent-soft), transparent 70%)',
    opacity: 0.5
  };

  if (tier === 'low') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px]" style={gradient1} />
        <div className="absolute top-1/4 -right-20 w-[700px] h-[500px]" style={gradient2} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px]" style={gradient3} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      <motion.div
        className="absolute -top-20 -left-20 w-[600px] h-[600px]"
        style={gradient1}
        animate={disableAnimation ? undefined : {
          x: [0, 40, 0],
          y: [0, 25, 0],
          rotate: [0, 8, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        className="absolute top-1/4 -right-20 w-[700px] h-[500px]"
        style={gradient2}
        animate={disableAnimation ? undefined : {
          x: [0, -35, 0],
          y: [0, 45, 0],
          rotate: [0, -8, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute bottom-0 left-1/4 w-[500px] h-[500px]"
        style={gradient3}
        animate={disableAnimation ? undefined : {
          x: [0, 25, 0],
          y: [0, -35, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
});

