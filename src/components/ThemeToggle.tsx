import React from 'react';
import { AnimatedSunMoon } from './icons';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className={`relative inline-flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] p-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
        isDark
          ? 'bg-[#1F1E18] text-[#FDE694] border-[#36342A] hover:bg-[#2B2921] hover:border-[#FDE694]/50'
          : 'bg-[#FAF3DD] text-[#49473E] border-[#EBE4CF] hover:bg-[#FAF0CF] hover:text-[#121212]'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <AnimatedSunMoon isDark={isDark} size={16} />
      </div>

      {showLabel && (
        <span className="text-xs">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
