import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Cpu } from 'lucide-react';
import {
  AnimatedArrowRight,
  AnimatedGithub,
  AnimatedSmartphone,
  AnimatedUsers,
  AnimatedLayers,
  AnimatedMessageCircle
} from '../components/icons';
import { ScreenshotCarousel } from '../components/ScreenshotCarousel';
import { ScrollReveal } from '../components/ScrollReveal';
import { SEO } from '../components/SEO';
import { MagneticButton } from '../components/MagneticButton';
import { TextLoop } from '../components/TextLoop';

export const HomePage: React.FC = () => {
  const [isFutureModalOpen, setIsFutureModalOpen] = React.useState(false);
  return (
    <div className="space-y-12 md:space-y-24 pb-20">
      <SEO
        title="Built for Everyone"
        description="A community-driven Android device built to be different. Unthrottled performance, open hardware philosophy, and transparent community collaboration."
        canonicalUrl="/"
        ogImage="/screenshot1.jpg"
        ogImageAlt="SKY — Built for Everyone"
        keywords={['SKY', 'POCO M6 Pro 5G', 'Redmi 12 5G', 'Custom ROMs', 'Android 16', 'Android 17', 'Open Source']}
      />
      {/* Hero Section */}
      <section className="px-4 sm:px-6 md:px-12 pt-10 md:pt-20 text-center max-w-5xl mx-auto flex flex-col items-center">
        {/* Brand Name */}
        <ScrollReveal delayMs={0} distance={20}>
          <h1 className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter text-[#49473E] dark:text-text-main mb-3 selection:bg-[#FDE694] transition-colors duration-300">
            SKY
          </h1>
        </ScrollReveal>

        {/* Primary Tagline */}
        <ScrollReveal delayMs={100} distance={16}>
          <p className="text-xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[#49473E] dark:text-text-main mb-4 transition-colors duration-300">
            Built for everyone.
          </p>
        </ScrollReveal>

        {/* Subtitle / Description */}
        <ScrollReveal delayMs={180} distance={14}>
          <p className="text-base sm:text-lg text-[#787567] dark:text-text-muted max-w-xl mx-auto leading-relaxed mb-10 font-normal transition-colors duration-300">
            A community-driven Android device built to be{' '}
            <TextLoop
              words={['different.', 'faster.', 'cleaner.', 'more open.', 'yours.']}
              className="text-[#49473E] dark:text-text-main font-semibold"
            />
          </p>
        </ScrollReveal>

        {/* Hero CTAs */}
        <ScrollReveal delayMs={260} distance={12}>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <MagneticButton strength={0.25}>
              <Link
                to="/device"
                className="min-h-[44px] px-8 py-3.5 rounded-full text-sm font-bold bg-[#FDE694] text-[#121212] hover:bg-[#fbdc70] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#EBE4CF] dark:border-transparent shadow-none group"
              >
                <span>Explore SKY</span>
                <AnimatedArrowRight size={16} className="text-[#121212]" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={0.25}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-8 py-3.5 rounded-full text-sm font-semibold text-[#49473E] dark:text-text-main bg-[#EBE4CF] dark:bg-surface-card border border-[#d9cfb0] dark:border-border hover:bg-[#e2d9bd] dark:hover:bg-surface-hover transition-all cursor-pointer flex items-center justify-center gap-2 shadow-none group"
              >
                <AnimatedGithub size={16} className="text-[#49473E] dark:text-accent" />
                <span>GitHub</span>
              </a>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </section>


      {/* Screenshot Carousel */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto py-12" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
        <ScreenshotCarousel />
      </section>

      {/* SKY App Download & Features Section */}
      <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto py-8" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
        <ScrollReveal distance={16}>
          <div className="bg-gradient-to-br from-[#FAF3DD]/95 to-[#F4ECDC]/95 dark:from-[#1A1914]/95 dark:to-[#151410]/95 border border-[#EBE4CF] dark:border-[#2C2A22] rounded-3xl p-6 sm:p-10 text-[#121212] dark:text-[#FAF3DD] shadow-xl relative overflow-hidden">
            {/* Glowing ambient orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FDE694]/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-1 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212] border border-[#EBE4CF] dark:border-[#FDE694]/30 uppercase tracking-widest shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Official PWA Release
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight">
                  Download the SKY App for instant ROM updates.
                </h3>
                <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed font-medium">
                  Experience lightning-fast custom ROM downloads, offline fastboot flash guides, and direct community support right from your home screen.
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/80 dark:bg-[#121210]/90 border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl p-5 hover:border-[#FDE694] dark:hover:border-[#FDE694]/40 transition-all shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#FDE694] text-[#121212] flex items-center justify-center mb-3 font-bold shadow-xs">
                    ⚡
                  </div>
                  <h4 className="text-base font-bold text-[#121212] dark:text-[#F4EFE6] mb-1">Offline Access & PWA</h4>
                  <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed font-medium">
                    Install SKY App with 1-tap from your browser. Access all essential flashing commands, device specs, and ROM lists even without internet.
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-[#121210]/90 border border-[#EBE4CF] dark:border-[#36342A] rounded-2xl p-5 hover:border-[#FDE694] dark:hover:border-[#FDE694]/40 transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#FDE694] text-[#121212] flex items-center justify-center mb-3 font-bold shadow-xs">
                      📱
                    </div>
                    <h4 className="text-base font-bold text-[#121212] dark:text-[#F4EFE6] mb-1">SKY App Launcher</h4>
                    <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed font-medium">
                      Official companion application for POCO M6 Pro 5G / Redmi 12 5G custom ROMs, fastboot flashing tools, and live changelogs.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('trigger-sky-install'));
                      }}
                      className="w-full py-2 px-4 bg-[#121212] dark:bg-[#FAF3DD] text-[#FAF3DD] dark:text-[#121212] font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Install SKY App</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Future Update Dialog */}
      {isFutureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="bg-[#FAF3DD] dark:bg-[#1C1B17] border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-[#121212] dark:text-[#FAF3DD] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FDE694]/20 border border-[#FDE694]/40 flex items-center justify-center text-[#FDE694] font-bold text-xl mx-auto">
              🚀
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black">Coming in Future Updates!</h3>
              <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                Direct native app package installations and automated one-click OTA updater integration will be available in upcoming SKY OS releases.
              </p>
            </div>
            <button
              onClick={() => setIsFutureModalOpen(false)}
              className="w-full py-2.5 bg-[#FDE694] text-[#121212] font-bold text-xs rounded-xl hover:bg-[#F4D068] transition-all cursor-pointer shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Concise Product Gateway Section */}
      <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-8" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
        {/* Section Heading with ScrollReveal */}
        <ScrollReveal distance={16}>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#49473E] dark:text-[#121212] bg-[#FDE694] px-3.5 py-1 rounded-full inline-block mb-3 border border-[#EBE4CF] dark:border-transparent shadow-xs">
              Ecosystem Overview
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#121212] dark:text-[#F4EFE6]">
              Designed with purpose.
            </h2>
            <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] mt-2 font-medium">
              Discover hardware specifications, community channels, and open-source contributors.
            </p>
          </div>
        </ScrollReveal>

        {/* Gateway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScrollReveal delayMs={50} distance={18} className="h-full">
            <Link
              to="/device"
              className="group bg-gradient-to-br from-[#FAF3DD]/95 to-[#F4ECDC]/95 dark:from-[#1A1914]/95 dark:to-[#151410]/95 p-7 sm:p-8 rounded-3xl border border-[#EBE4CF] dark:border-[#2C2A22] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60 hover:shadow-xl hover:shadow-[#FDE694]/10 dark:hover:shadow-black/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FDE694] dark:bg-[#FDE694]/15 text-[#121212] dark:text-[#FDE694] border border-[#FDE694]/50 dark:border-[#FDE694]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-[#FDE694]/20 transition-all duration-300 shadow-xs">
                  <AnimatedSmartphone size={26} />
                </div>
                <h3 className="text-xl font-black text-[#121212] dark:text-[#F4EFE6] mb-2 flex items-center justify-between tracking-tight">
                  <span>The Device</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#787567] group-hover:text-[#121212] dark:text-[#BDB8A4] dark:group-hover:text-[#FDE694]">
                    <AnimatedArrowRight size={18} />
                  </span>
                </h3>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed font-medium">
                  6.79" FHD+ 90Hz IPS LCD, Snapdragon 4 Gen 2 (4nm), 5000mAh battery, and 50MP camera.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#121212] dark:text-[#FDE694] mt-6 pt-4 border-t border-[#EBE4CF] dark:border-[#2C2A22] group-hover:border-[#FDE694]/40 transition-colors flex items-center justify-between">
                <span>View Full Specs</span>
                <span className="text-sm">→</span>
              </span>
            </Link>
          </ScrollReveal>

          <ScrollReveal delayMs={120} distance={18} className="h-full">
            <Link
              to="/team"
              className="group bg-gradient-to-br from-[#FAF3DD]/95 to-[#F4ECDC]/95 dark:from-[#1A1914]/95 dark:to-[#151410]/95 p-7 sm:p-8 rounded-3xl border border-[#EBE4CF] dark:border-[#2C2A22] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60 hover:shadow-xl hover:shadow-[#FDE694]/10 dark:hover:shadow-black/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FDE694] dark:bg-[#FDE694]/15 text-[#121212] dark:text-[#FDE694] border border-[#FDE694]/50 dark:border-[#FDE694]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-[#FDE694]/20 transition-all duration-300 shadow-xs">
                  <AnimatedUsers size={26} />
                </div>
                <h3 className="text-xl font-black text-[#121212] dark:text-[#F4EFE6] mb-2 flex items-center justify-between tracking-tight">
                  <span>The Team</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#787567] group-hover:text-[#121212] dark:text-[#BDB8A4] dark:group-hover:text-[#FDE694]">
                    <AnimatedArrowRight size={18} />
                  </span>
                </h3>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed font-medium">
                  Meet the admins, core developers, and maintainers driving the SKY smartphone hardware & software.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#121212] dark:text-[#FDE694] mt-6 pt-4 border-t border-[#EBE4CF] dark:border-[#2C2A22] group-hover:border-[#FDE694]/40 transition-colors flex items-center justify-between">
                <span>Explore Maintainers</span>
                <span className="text-sm">→</span>
              </span>
            </Link>
          </ScrollReveal>

          <ScrollReveal delayMs={190} distance={18} className="h-full">
            <Link
              to="/roms"
              className="group bg-gradient-to-br from-[#FAF3DD]/95 to-[#F4ECDC]/95 dark:from-[#1A1914]/95 dark:to-[#151410]/95 p-7 sm:p-8 rounded-3xl border border-[#EBE4CF] dark:border-[#2C2A22] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60 hover:shadow-xl hover:shadow-[#FDE694]/10 dark:hover:shadow-black/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FDE694] dark:bg-[#FDE694]/15 text-[#121212] dark:text-[#FDE694] border border-[#FDE694]/50 dark:border-[#FDE694]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-[#FDE694]/20 transition-all duration-300 shadow-xs">
                  <AnimatedLayers size={26} />
                </div>
                <h3 className="text-xl font-black text-[#121212] dark:text-[#F4EFE6] mb-2 flex items-center justify-between tracking-tight">
                  <span>AOSP ROMs</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#787567] group-hover:text-[#121212] dark:text-[#BDB8A4] dark:group-hover:text-[#FDE694]">
                    <AnimatedArrowRight size={18} />
                  </span>
                </h3>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed font-medium">
                  Browse official and community Android 16 & 17 custom builds, changelogs, and flashing instructions.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#121212] dark:text-[#FDE694] mt-6 pt-4 border-t border-[#EBE4CF] dark:border-[#2C2A22] group-hover:border-[#FDE694]/40 transition-colors flex items-center justify-between">
                <span>Explore Builds</span>
                <span className="text-sm">→</span>
              </span>
            </Link>
          </ScrollReveal>

          <ScrollReveal delayMs={260} distance={18} className="h-full">
            <Link
              to="/community"
              className="group bg-gradient-to-br from-[#FAF3DD]/95 to-[#F4ECDC]/95 dark:from-[#1A1914]/95 dark:to-[#151410]/95 p-7 sm:p-8 rounded-3xl border border-[#EBE4CF] dark:border-[#2C2A22] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60 hover:shadow-xl hover:shadow-[#FDE694]/10 dark:hover:shadow-black/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FDE694] dark:bg-[#FDE694]/15 text-[#121212] dark:text-[#FDE694] border border-[#FDE694]/50 dark:border-[#FDE694]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-[#FDE694]/20 transition-all duration-300 shadow-xs">
                  <AnimatedMessageCircle size={26} />
                </div>
                <h3 className="text-xl font-black text-[#121212] dark:text-[#F4EFE6] mb-2 flex items-center justify-between tracking-tight">
                  <span>Community & About</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#787567] group-hover:text-[#121212] dark:text-[#BDB8A4] dark:group-hover:text-[#FDE694]">
                    <AnimatedArrowRight size={18} />
                  </span>
                </h3>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed font-medium">
                  Join Telegram discussion groups, view GitHub repositories, and learn about the SKY philosophy.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#121212] dark:text-[#FDE694] mt-6 pt-4 border-t border-[#EBE4CF] dark:border-[#2C2A22] group-hover:border-[#FDE694]/40 transition-colors flex items-center justify-between">
                <span>Join & Learn More</span>
                <span className="text-sm">→</span>
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

