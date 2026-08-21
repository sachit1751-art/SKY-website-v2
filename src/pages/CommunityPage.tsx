import React, { useEffect, useRef } from 'react';
import { COMMUNITY_CHANNELS, CORE_VALUES } from '../data';
import { 
  ArrowUpRight, 
  Github, 
  Send, 
  MessageSquare, 
  Globe, 
  Users, 
  Sparkles, 
  Code, 
  Compass, 
  Heart, 
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ScrollReveal } from '../components/ScrollReveal';
import { MagneticButton } from '../components/MagneticButton';
import { CommunityFAQSection } from '../components/CommunityFAQSection';
import { TextLoop } from '../components/TextLoop';
import { usePerformanceTier } from '../context/PerformanceContext';
import { motion } from 'motion/react';
import { staggerItemVariants } from '../components/PageTransition';

export const CommunityPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { tier, prefersReducedMotion } = usePerformanceTier();

  // Ecosystem Constellation Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Skip heavy canvas entirely on low-end for battery/perf
    if (tier === 'low' || prefersReducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 200);
    let isVisible = false;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = 200;
    };
    window.addEventListener('resize', handleResize);

    const nodeCount = tier === 'high' ? 30 : 15;
    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (tier === 'high' ? 0.4 : 0.2), // Slower on medium
        vy: (Math.random() - 0.5) * (tier === 'high' ? 0.4 : 0.2),
      });
    }

    const draw = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.classList.contains('dark');

      for (let i = 0; i < nodeCount; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;

        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        for (let j = i + 1; j < nodeCount; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = isDark
              ? `rgba(253, 230, 148, ${0.2 * (1 - dist / 100)})`
              : `rgba(73, 71, 62, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(n1.x, n1.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(253, 230, 148, 1)' : 'rgba(253, 230, 148, 0.9)';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0 }
    );
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [tier, prefersReducedMotion]);

  const getChannelIcon = (icon: string) => {
    switch (icon) {
      case 'github':
        return <Github className="w-6 h-6 text-[#121212]" />;
      case 'telegram':
        return <Send className="w-6 h-6 text-[#121212]" />;
      case 'chat':
        return <MessageSquare className="w-6 h-6 text-[#121212]" />;
      default:
        return <Globe className="w-6 h-6 text-[#121212]" />;
    }
  };

  const getPrincipleIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Code className="w-5 h-5 text-[#121212]" />;
      case 1:
        return <Compass className="w-5 h-5 text-[#121212]" />;
      case 2:
        return <Users className="w-5 h-5 text-[#121212]" />;
      default:
        return <Heart className="w-5 h-5 text-[#121212]" />;
    }
  };

  return (
    <div className="py-12 md:py-20 px-6 md:px-12 max-w-5xl mx-auto space-y-16 pb-28">
      <SEO
        title="Community & About SKY"
        description="Join official SKY channels on Telegram, explore open-source GitHub repositories, follow flashing guides, and learn about the core philosophy driving the SKY smartphone."
        canonicalUrl="/community"
        ogImage="/screenshot1.jpg"
        ogImageAlt="SKY Smartphone Community & Ecosystem"
        keywords={['SKY Community', 'Telegram', 'GitHub', 'Open Source', 'Device Tree', 'Philosophy', 'Android Development', 'Custom ROMs']}
        ogType="website"
      />

      {/* Header */}
      <motion.div variants={staggerItemVariants} className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#49473E] dark:text-[#121212] bg-[#FDE694] px-3.5 py-1 rounded-full inline-block border border-[#EBE4CF] dark:border-transparent">
          Ecosystem & Philosophy
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase text-[#121212] dark:text-[#F4EFE6]">
          <span className="shimmer-accent">COMMUNITY & ABOUT</span>
        </h1>
        <p className="text-base sm:text-lg text-[#787567] dark:text-[#BDB8A4] leading-relaxed max-w-2xl font-normal">
          Connect directly with{' '}
          <TextLoop
            words={['developers,', 'maintainers,', 'kernel devs,', 'enthusiasts,']}
            className="text-[#49473E] dark:text-[#F4EFE6] font-semibold"
          />{' '}
          and discover the open-hardware principles behind SKY.
        </p>
      </motion.div>

      {/* Constellation Canvas Banner */}
      <motion.div variants={staggerItemVariants} className="relative w-full h-44 rounded-3xl bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] overflow-hidden flex items-center justify-center shadow-xs">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="relative z-10 text-center px-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDE694] text-[#121212] border border-[#EBE4CF] dark:border-transparent text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" /> Open Contributor Network
          </span>
          <p className="text-xs text-[#787567] dark:text-[#BDB8A4] font-mono">
            Direct access to official project channels, trees & resources
          </p>
        </div>
      </motion.div>

      {/* Section 1: Community Channels */}
      <motion.div variants={staggerItemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] tracking-tight">
              Official Project Channels
            </h2>
            <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] mt-1">
              Join active discussions, get device support, and download verified builds.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {COMMUNITY_CHANNELS.map((channel, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 50} distance={12}>
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-[#FAF3DD] dark:bg-[#1F1E18] p-6 sm:p-7 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#49473E]/40 dark:hover:border-[#FDE694]/50 hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921] transition-all cursor-pointer shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#FDE694] border border-[#EBE4CF] dark:border-transparent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getChannelIcon(channel.icon)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-1">
                        <h3 className="text-lg sm:text-xl font-bold text-[#49473E] dark:text-[#F4EFE6] group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-colors">
                          {channel.name}
                        </h3>
                        {channel.badge && (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EBE4CF] dark:bg-[#36342A] text-[#49473E] dark:text-[#F4EFE6] border border-[#dcd3b8] dark:border-[#474438]">
                            {channel.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                        {channel.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-[#49473E] dark:text-[#F4EFE6] self-end sm:self-center bg-[#FFF8E1] dark:bg-[#12110D] px-4 py-2 rounded-full border border-[#EBE4CF] dark:border-[#36342A] group-hover:bg-[#FDE694] dark:group-hover:bg-[#FDE694] group-hover:text-[#121212] dark:group-hover:text-[#121212] transition-colors shrink-0">
                    <span>Open Channel</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </motion.div>

      {/* Section 2: Core Principles */}
      <motion.div variants={staggerItemVariants} className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] tracking-tight">
            Core Principles
          </h2>
          <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] mt-1">
            The foundational commitments guiding our codebases, hardware decisions, and community.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CORE_VALUES.map((val, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 50} distance={12} className="h-full">
              <div className="bg-[#FAF3DD] dark:bg-[#1F1E18] p-7 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] flex flex-col justify-between h-full group shadow-xs">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#FDE694] border border-[#EBE4CF] dark:border-transparent flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    {getPrincipleIcon(idx)}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#49473E] dark:text-[#F4EFE6] mb-2">
                    {val.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </motion.div>

      {/* Section 4: Collapsible Knowledge Base & FAQ */}
      <motion.div variants={staggerItemVariants}>
        <ScrollReveal distance={16}>
          <CommunityFAQSection />
        </ScrollReveal>
      </motion.div>

      {/* Developer Contribution & Hardware Gateway */}
      <motion.div variants={staggerItemVariants}>
        <ScrollReveal distance={16}>
          <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase text-[#787567] dark:text-[#BDB8A4] mb-1.5 block">
                Developer Contribution & Device Specs
              </span>
              <h4 className="text-xl sm:text-2xl font-bold text-[#49473E] dark:text-[#F4EFE6] mb-2">
                Want to contribute or explore specs?
              </h4>
              <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                Our repositories are 100% open source on GitHub. Explore device trees, submit pull requests, or check out full technical specifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <MagneticButton strength={0.2}>
                <Link
                  to="/device"
                  className="px-5 py-2.5 rounded-full bg-[#FAF0CF] dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] font-bold text-xs border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>View Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.25}>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-[#FDE694] text-[#121212] font-bold text-xs border border-[#EBE4CF] dark:border-transparent hover:bg-[#fbdc70] transition-colors inline-flex items-center gap-2 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#121212]" />
                  <span>GitHub Repos</span>
                </a>
              </MagneticButton>
            </div>
          </div>
        </ScrollReveal>
      </motion.div>
    </div>
  );
};

export default CommunityPage;

