import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface TextLoopProps {
  words: string[];
  interval?: number;
  className?: string;
  staticText?: string;
  staticClassName?: string;
}

export const TextLoop: React.FC<TextLoopProps> = ({
  words,
  interval = 3000,
  className = "",
  staticText,
  staticClassName = ""
}) => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (words.length <= 1 || !isInView) return;
    
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [words, interval, isInView]);

  const variants = {
    initial: { y: 15, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -15, opacity: 0 }
  };

  return (
    <span ref={containerRef} className={`inline-flex items-center flex-wrap gap-x-1.5 ${className}`}>
      {staticText && <span className={staticClassName}>{staticText}</span>}
      <span className="relative inline-flex items-center h-[1.4em] overflow-hidden align-middle px-0.5">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={index}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="block whitespace-nowrap leading-tight"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
};
