import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { motion, useReducedMotion, Variants } from 'motion/react';
import { SEO } from '../components/SEO';
import { MagneticButton } from '../components/MagneticButton';
import { usePerformanceTier } from '../context/PerformanceContext';

export const NotFoundPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { tier } = usePerformanceTier();
  const isVeryLowEnd = tier === 'low';

  // Staggered motion variants honoring prefers-reduced-motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.45,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-[65vh] sm:min-h-[72vh] flex flex-col items-center justify-center px-6 text-center py-12 my-auto relative z-10 selection:bg-[#FDE694] selection:text-[#121212]">
      <SEO
        title="404 — Page Not Found"
        description="The requested page could not be found on the SKY smartphone website."
        noIndex={true}
      />

      {/* Subtle ambient motion backdrop glow */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.55, 0.35],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(253, 230, 148, 0.12) 0%, transparent 65%)'
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8"
      >
        {/* Brand Label */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-[#49473E] dark:text-[#F4EFE6] uppercase bg-[#FAF3DD] dark:bg-[#1F1E18] px-4 py-1.5 rounded-full border border-[#EBE4CF] dark:border-[#36342A] shadow-2xs">
            SKY
          </span>
        </motion.div>

        {/* Large Expressive 404 Number */}
        <motion.div variants={itemVariants} className="relative">
          <h1 className="text-8xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-extrabold tracking-tighter leading-none text-[#49473E] dark:text-[#F4EFE6] select-none">
            404
          </h1>
          {/* Subtle accent dot on 404 */}
          <span className="absolute bottom-3 sm:bottom-6 right-1 sm:right-3 w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#FDE694] border border-[#EBE4CF] dark:border-transparent animate-pulse" />
        </motion.div>

        {/* Understated Text */}
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="text-base sm:text-lg md:text-xl font-medium text-[#787567] dark:text-[#BDB8A4] tracking-tight">
            This page doesn't exist.
          </p>
        </motion.div>

        {/* Return to SKY Action Button */}
        <motion.div variants={itemVariants} className="pt-2">
          <MagneticButton strength={0.25}>
            <Link
              to="/"
              className="px-8 py-3.5 rounded-full text-sm font-bold bg-[#FDE694] text-[#121212] hover:bg-[#fbdc70] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#EBE4CF] dark:border-transparent shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694]"
            >
              <span>Return to SKY</span>
              <ArrowRight className="w-4 h-4 text-[#121212]" />
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;

