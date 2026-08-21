import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-xs font-medium text-[#49473E] dark:text-[#A8A8A8] hover:bg-white dark:hover:bg-[#1A1914] transition-colors bg-white/50 dark:bg-[#1A1914]"
    >
      <Globe className="w-3.5 h-3.5" />
      {i18n.language === 'en' ? 'English' : 'हिन्दी'}
    </button>
  );
};
