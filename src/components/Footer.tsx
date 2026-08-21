import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Send, MessageSquare, ShieldCheck, Unlock, Code, ArrowUpRight, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { StatusIndicator } from './StatusIndicator';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#FFF8E1] dark:bg-[#12110D] border-t border-[#EBE4CF] dark:border-[#36342A] py-16 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 mb-12">
        
        {/* Left Column - Brand & Info */}
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-4xl font-bold tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">SKY</span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#FDE694]" />
            <span className="ml-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-[#787567] dark:text-[#9C9888] bg-white/50 dark:bg-black/20">
              OPEN SOURCE
            </span>
          </div>
          
          <p className="font-semibold text-lg text-[#1C1B17] dark:text-[#F4EFE6] mb-4">
            Built for everyone.
          </p>
          
          <p className="text-sm text-[#787567] dark:text-[#9C9888] mb-6 leading-relaxed">
            A community-driven Android smartphone designed with purposeful minimalism, unlocked bootloaders, and transparent hardware engineering.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-[#49473E] dark:text-[#A8A8A8] bg-white/50 dark:bg-[#1A1914]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Telemetry
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-[#49473E] dark:text-[#A8A8A8] bg-white/50 dark:bg-[#1A1914]">
              <Unlock className="w-3.5 h-3.5" />
              Unlocked Bootloader
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-[#49473E] dark:text-[#A8A8A8] bg-white/50 dark:bg-[#1A1914]">
              <Code className="w-3.5 h-3.5" />
              GPLv2 & Apache 2.0
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="w-full sm:w-auto min-w-0 sm:min-w-[140px]">
          <h4 className="text-xs font-bold tracking-widest text-[#49473E] dark:text-[#A8A8A8] mb-4 uppercase flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#787567] dark:bg-[#9C9888]" />
            NAVIGATION
          </h4>
          <ul className="space-y-1">
            <li><Link to="/" className="inline-flex items-center min-h-[44px] px-2 py-1 -ml-2 rounded-xl text-sm text-[#787567] dark:text-[#9C9888] hover:text-[#1C1B17] dark:hover:text-[#FDE694] transition-colors">{t('home')}</Link></li>
            <li><Link to="/device" className="inline-flex items-center min-h-[44px] px-2 py-1 -ml-2 rounded-xl text-sm text-[#787567] dark:text-[#9C9888] hover:text-[#1C1B17] dark:hover:text-[#FDE694] transition-colors">{t('deviceSpecs')}</Link></li>
            <li><Link to="/roms" className="inline-flex items-center min-h-[44px] px-2 py-1 -ml-2 rounded-xl text-sm text-[#787567] dark:text-[#9C9888] hover:text-[#1C1B17] dark:hover:text-[#FDE694] transition-colors">{t('roms')}</Link></li>
            <li><Link to="/team" className="inline-flex items-center min-h-[44px] px-2 py-1 -ml-2 rounded-xl text-sm text-[#787567] dark:text-[#9C9888] hover:text-[#1C1B17] dark:hover:text-[#FDE694] transition-colors">{t('team')}</Link></li>
            <li><Link to="/community" className="inline-flex items-center min-h-[44px] px-2 py-1 -ml-2 rounded-xl text-sm text-[#787567] dark:text-[#9C9888] hover:text-[#1C1B17] dark:hover:text-[#FDE694] transition-colors">{t('community')}</Link></li>
          </ul>
        </div>
  
        {/* Connect & Contribute */}
        <div className="w-full lg:max-w-[400px]">
          <h4 className="text-xs font-bold tracking-widest text-[#49473E] dark:text-[#A8A8A8] mb-6 uppercase flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#787567] dark:bg-[#9C9888]" />
            CONNECT & CONTRIBUTE
          </h4>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a href="https://github.com/sm4450-development" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between min-h-[44px] px-3.5 py-2.5 border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl text-xs font-medium text-[#49473E] dark:text-[#A8A8A8] hover:bg-white dark:hover:bg-[#1A1914] transition-colors group">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 shrink-0" />
                  <span className="truncate">GitHub Repos</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
              
              <a href="https://t.me/Redmi125GChannel" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between min-h-[44px] px-3.5 py-2.5 border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl text-xs font-medium text-[#49473E] dark:text-[#A8A8A8] hover:bg-white dark:hover:bg-[#1A1914] transition-colors group">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 shrink-0" />
                  <span className="truncate">Telegram Group</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a href="https://t.me/Redmi125GChannel" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between min-h-[44px] px-3.5 py-2.5 border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl text-xs font-medium text-[#49473E] dark:text-[#A8A8A8] hover:bg-white dark:hover:bg-[#1A1914] transition-colors group">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 shrink-0" />
                  <span className="truncate">Announcements</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>

              <a href="https://t.me/Redmi125GSupport" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between min-h-[44px] px-3.5 py-2.5 border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl text-xs font-medium text-[#49473E] dark:text-[#A8A8A8] hover:bg-white dark:hover:bg-[#1A1914] transition-colors group">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">Developer Chat</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#EBE4CF] dark:border-[#36342A] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 text-xs text-[#787567] dark:text-[#9C9888]">
          <span>© 2026 SKY Project. Open Source & Community Owned.</span>
          <span className="hidden md:inline w-1 h-1 rounded-full bg-[#EBE4CF] dark:bg-[#36342A]" />
          <span className="font-medium text-[#1C1B17] dark:text-[#FDE694]">Website built & engineered by <a href="https://t.me/someone3_124" target="_blank" rel="noopener noreferrer" className="hover:underline">Sachit (@someone3_124)</a></span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <LanguageSelector />
          <StatusIndicator />
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center justify-center min-h-[44px] gap-1.5 px-4 py-2 border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-xs font-medium text-[#49473E] dark:text-[#A8A8A8] hover:bg-white dark:hover:bg-[#1A1914] transition-colors bg-white/50 dark:bg-[#1A1914] cursor-pointer">
            Top <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
