import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff } from 'lucide-react';

export const OfflineToast: React.FC = () => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
      >
        <WifiOff className="w-5 h-5" />
        <span className="font-medium text-sm">You are currently offline.</span>
      </motion.div>
    </AnimatePresence>
  );
};
