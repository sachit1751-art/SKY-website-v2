import React, { useState, useEffect } from 'react';
import { SPEC_CATEGORIES } from '../data';
import { Smartphone, Cpu, Camera, Battery, HardDrive, ShieldCheck, CheckCircle2, Sparkles, RefreshCw, Github, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DeviceSkeleton } from '../components/skeletons/DeviceSkeleton';
import { SEO } from '../components/SEO';
import { SpecCountersSection } from '../components/CountUpSpec';
import { MagneticButton } from '../components/MagneticButton';
import { TextLoop } from '../components/TextLoop';
import { staggerItemVariants } from '../components/PageTransition';

export const DevicePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(SPEC_CATEGORIES[0].id);

  const handleSimulateReload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 180);
  };

  const selectedCategory = SPEC_CATEGORIES.find((c) => c.id === activeTab) || SPEC_CATEGORIES[0];

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'display':
        return <Smartphone className="w-5 h-5" />;
      case 'performance':
        return <Cpu className="w-5 h-5" />;
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'battery':
        return <Battery className="w-5 h-5" />;
      case 'storage':
        return <HardDrive className="w-5 h-5" />;
      case 'protection':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const deviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'POCO M6 Pro 5G / Redmi 12 5G (sky)',
    model: 'sky / SM4450',
    description: 'Xiaomi Redmi 12 5G / POCO M6 Pro 5G with Snapdragon 4 Gen 2 (4nm), Adreno 613 GPU, 6.79" 90Hz FHD+ display, 50MP camera, 5000mAh battery.',
    brand: {
      '@type': 'Brand',
      name: 'Xiaomi / POCO',
    },
  };

  if (isLoading) {
    return (
      <>
        <SEO
          title="Hardware Specifications"
          description="Explore technical specifications for the SKY smartphone (Xiaomi Redmi 12 5G / POCO M6 Pro 5G): 6.79 inch 90Hz FHD+ display, Snapdragon 4 Gen 2 (4nm), Adreno 613 GPU, 5000mAh battery, and 50MP camera."
          canonicalUrl="/device"
          ogImage="/screenshot2.jpg"
          ogImageAlt="SKY Device Specifications and Hardware Architecture"
          jsonLd={deviceJsonLd}
        />
        <DeviceSkeleton />
      </>
    );
  }

  return (
    <div className="py-6 sm:py-10 md:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-8 md:space-y-16">
      <SEO
        title="Hardware & Specifications"
        description="Comprehensive technical specifications of Xiaomi Redmi 12 5G / POCO M6 Pro 5G (sky): 6.79 inch FHD+ IPS LCD 90Hz, Snapdragon 4 Gen 2 (4nm) with Adreno 613 GPU, 50MP camera, 5000mAh battery with 18W charging."
        canonicalUrl="/device"
        ogImage="/screenshot2.jpg"
        ogImageAlt="SKY Smartphone Hardware & Specifications"
        keywords={['Hardware Specs', 'Display 90Hz', 'Adreno 613', '5000mAh Battery', '50MP Camera', 'Snapdragon 4 Gen 2', 'sky', 'POCO M6 Pro 5G', 'Redmi 12 5G']}
        jsonLd={deviceJsonLd}
      />
      {/* Header Section */}
      <motion.div variants={staggerItemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#49473E] dark:text-[#121212] bg-[#FDE694] px-3.5 py-1 rounded-full inline-block mb-3 border border-[#EBE4CF] dark:border-transparent">
            Hardware & Specifications
          </span>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#49473E] dark:text-[#F4EFE6] mb-4 sm:mb-6">
            Xiaomi Redmi 12 5G / POCO M6 Pro 5G
          </h1>
          <p className="text-base md:text-xl text-[#787567] dark:text-[#BDB8A4] leading-relaxed font-normal">
            6.79" FHD+ 90Hz IPS LCD display, Qualcomm Snapdragon 4 Gen 2 (4nm) processor with Adreno 613 GPU, 50MP camera, 5000mAh battery with 18W fast charging, 5G connectivity, and Corning Gorilla Glass with IP53 protection.
          </p>
        </div>

        {/* Action button to re-trigger / test loading state */}
        <MagneticButton strength={0.2}>
          <button
            onClick={handleSimulateReload}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694]"
            title="Simulate data fetch to view skeleton loader"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </MagneticButton>
      </motion.div>

      {/* Animated Spec Counters (5000 mAh, 90Hz, 4nm, 50MP) */}
      <motion.div variants={staggerItemVariants} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 300px' }}>
        <SpecCountersSection />
      </motion.div>

      {/* Interactive Specifications Explorer */}
      <motion.div variants={staggerItemVariants} className="pt-2 sm:pt-4 w-full" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] mb-3">Technical Specifications</h2>
          <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4]">
            Explore real hardware parameters verified by our{' '}
            <TextLoop
              words={['engineering team.', 'device maintainers.', 'community experts.', 'kernel developers.']}
              className="text-[#49473E] dark:text-[#F4EFE6] font-semibold"
            />
          </p>
        </div>

        {/* Category Tabs - Grid-responsive segmented deck that fits 100% of any screen width */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 mb-8 sm:mb-10">
          {SPEC_CATEGORIES.map((category) => {
            const isActive = category.id === activeTab;
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center justify-center min-h-[44px] gap-2 px-3 sm:px-4 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer border w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] ${
                  isActive
                    ? 'bg-[#FDE694] text-[#121212] border-[#EBE4CF] dark:border-transparent shadow-xs scale-[1.02]'
                    : 'bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:text-[#121212] dark:hover:text-[#F4EFE6] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                }`}
              >
                <div className={isActive ? 'text-[#121212]' : 'text-[#787567] dark:text-[#BDB8A4]'}>
                  {getCategoryIcon(category.id)}
                </div>
                <span className="truncate">{category.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Details Display with smooth animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-[#FAF3DD] dark:bg-[#1F1E18] rounded-3xl p-5 sm:p-8 md:p-12 border border-[#EBE4CF] dark:border-[#36342A] shadow-xs"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-[#EBE4CF] dark:border-[#36342A]">
              <div>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#787567] dark:text-[#BDB8A4] mb-1 block">
                  {selectedCategory.title} Module
                </span>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] leading-tight">
                  {selectedCategory.tagline}
                </h3>
              </div>
            </div>

            {/* Specs Highlights Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 w-full">
              {selectedCategory.highlights.map((highlight, idx) => (
                <div key={idx} className="bg-[#FFF8E1] dark:bg-[#12110D] p-4 sm:p-5 md:p-6 rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] sm:text-xs font-semibold text-[#787567] dark:text-[#BDB8A4] block mb-0.5 sm:mb-1">
                      {highlight.label}
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] block mb-1 sm:mb-2 leading-tight">
                      {highlight.value}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Extra Details */}
            <div className="w-full bg-[#FFF8E1] dark:bg-[#12110D] p-4 sm:p-6 rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] flex items-start gap-3 text-xs text-[#49473E] dark:text-[#F4EFE6] leading-relaxed shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-[#49473E] dark:text-[#FDE694] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm mb-1 text-[#49473E] dark:text-[#F4EFE6]">Architecture & Verification Note</span>
                <p className="text-[#787567] dark:text-[#BDB8A4]">{selectedCategory.details}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Device Development & Device Tree Section */}
      <motion.div variants={staggerItemVariants} className="bg-[#FAF3DD] dark:bg-[#1F1E18] p-6 sm:p-12 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 300px' }}>
        <div className="space-y-3 max-w-2xl">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#49473E] dark:text-[#121212] bg-[#FDE694] px-3.5 py-1 rounded-full inline-block border border-[#EBE4CF] dark:border-transparent">
            Open Source Device Tree
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#49473E] dark:text-[#F4EFE6]">
            Device Development & Source Trees
          </h2>
          <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
            The hardware adaptation for Xiaomi Redmi 12 5G / POCO M6 Pro 5G (codename <code className="bg-[#FFF8E1] dark:bg-[#12110D] px-1.5 py-0.5 font-mono text-xs">sky</code>) is developed entirely in the open. Access the official device source repository to review device trees, make contributions, or build custom ROMs.
          </p>
        </div>

        <MagneticButton strength={0.25}>
          <a
            href="https://github.com/sm4450-development/device_xiaomi_sky"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold bg-[#FDE694] text-[#121212] hover:bg-[#fbdc70] active:scale-[0.98] transition-all cursor-pointer border border-[#EBE4CF] dark:border-transparent w-full sm:w-auto text-center shadow-none"
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5 text-[#121212] shrink-0" />
            <span>View Device Tree Repository</span>
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#121212] shrink-0" />
          </a>
        </MagneticButton>
      </motion.div>
    </div>
  );
};

export default DevicePage;

