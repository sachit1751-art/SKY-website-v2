import React, { useState, useEffect } from 'react';
import { TeamSection } from '../components/TeamSection';
import { TeamSkeleton } from '../components/skeletons/TeamSkeleton';
import { SEO } from '../components/SEO';
import { motion } from 'motion/react';

export const TeamPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (isLoading) {
    return (
      <>
        <SEO
          title="The Team"
          description="Meet the core admins, kernel engineers, and device maintainers driving the SKY smartphone project."
          canonicalUrl="/team"
          ogImage="/screenshot1.jpg"
          ogImageAlt="SKY Smartphone Core Team & Maintainers"
          ogType="profile"
        />
        <TeamSkeleton />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="pb-20"
    >
      <SEO
        title="Core Team & Maintainers"
        description="Meet the administrators, kernel engineers, and device maintainers bringing the open-source SKY smartphone to life."
        canonicalUrl="/team"
        ogImage="/screenshot1.jpg"
        ogImageAlt="SKY Smartphone Core Team & Maintainers"
        keywords={['Maintainers', 'Kernel Developers', 'Contributors', 'Admins', 'SKY Team', 'Open Source']}
        ogType="profile"
      />
      
      {/* Header Section */}
      <div className="pt-8 sm:pt-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#49473E] dark:text-[#121212] bg-[#FDE694] px-3.5 py-1 rounded-full inline-block border border-[#EBE4CF] dark:border-transparent">
          Contributors & Maintainers
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase text-[#121212] dark:text-[#F4EFE6]">
          <span className="shimmer-accent">TEAM & CONTRIBUTORS</span>
        </h1>
        <p className="text-base sm:text-lg text-[#787567] dark:text-[#BDB8A4] leading-relaxed max-w-2xl font-normal">
          Meet the kernel developers, device maintainers, and community contributors building the SKY open-source ecosystem.
        </p>
      </div>

      {/* Team Members Grid Section */}
      <TeamSection />
    </motion.div>
  );
};

export default TeamPage;


