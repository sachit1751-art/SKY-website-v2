import React from 'react';
import { motion, useScroll } from 'motion/react';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#FDE694] dark:bg-[#FDE694] shadow-[0_0_10px_rgba(253,230,148,0.5)] origin-left z-[150] pointer-events-none transform-gpu"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
};

