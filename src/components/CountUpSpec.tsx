import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'motion/react';
import { Battery, Zap, Cpu, Camera } from 'lucide-react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  formatter?: (val: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  duration = 1.8,
  formatter = (val) => Math.round(val).toLocaleString(),
}) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState<string>(formatter(from));

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1], // snappy easeOutExpo-like curve
      onUpdate: (latest) => {
        setDisplayValue(formatter(latest));
      },
    });

    return () => controls.stop();
  }, [isInView, from, to, duration, formatter]);

  return <span ref={nodeRef}>{displayValue}</span>;
};

const specs = [
  {
    id: 'battery',
    targetNumber: 5000,
    unit: 'mAh',
    title: 'Massive Battery',
    subtitle: '18W Fast Charging • 2-Day Endurance',
    icon: <Battery className="w-6 h-6 text-[#121212]" />,
    accentColor: 'bg-[#FDE694]',
    badge: '5,000 mAh Li-Po',
    formatter: (v: number) => Math.round(v).toLocaleString(),
  },
  {
    id: 'refresh',
    targetNumber: 90,
    unit: 'Hz',
    title: 'Adaptive Sync',
    subtitle: '6.79" FHD+ (2460×1080) IPS LCD',
    icon: <Zap className="w-6 h-6 text-[#121212]" />,
    accentColor: 'bg-[#FDE694]',
    badge: 'Adaptive 36/48/60/90Hz',
    formatter: (v: number) => Math.round(v).toString(),
  },
  {
    id: 'process',
    targetNumber: 4,
    unit: 'nm',
    title: 'Snapdragon 4 Gen 2',
    subtitle: 'Samsung 4nm LPE • 2.2 GHz Octa-Core',
    icon: <Cpu className="w-6 h-6 text-[#121212]" />,
    accentColor: 'bg-[#FDE694]',
    badge: 'Qualcomm SM4450',
    formatter: (v: number) => Math.round(v).toString(),
  },
  {
    id: 'camera',
    targetNumber: 50,
    unit: 'MP',
    title: 'Main Sensor',
    subtitle: 'Samsung JN1 (f/1.8) • 1080p@30fps',
    icon: <Camera className="w-6 h-6 text-[#121212]" />,
    accentColor: 'bg-[#FDE694]',
    badge: 'ISOCELL JN1',
    formatter: (v: number) => Math.round(v).toString(),
  },
];

export const SpecCountersSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#787567] dark:text-[#BDB8A4] mb-1 block">
            Verified Hardware Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] tracking-tight">
            Key Performance Metrics
          </h2>
        </div>
        <div className="text-xs text-[#787567] dark:text-[#BDB8A4] font-mono bg-[#FAF3DD] dark:bg-[#1F1E18] px-3.5 py-1.5 rounded-full border border-[#EBE4CF] dark:border-[#36342A] self-start sm:self-auto">
          Codename: <span className="font-bold text-[#49473E] dark:text-[#FDE694]">sky / 23076RN4BI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {specs.map((spec, index) => (
          <motion.div
            key={spec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-[#FAF3DD] dark:bg-[#1F1E18] p-7 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#49473E]/30 dark:hover:border-[#FDE694]/40 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
          >
            {/* Top Icon & Badge */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FDE694] flex items-center justify-center border border-[#EBE4CF] dark:border-transparent group-hover:scale-105 group-hover:rotate-2 transition-transform shadow-2xs">
                  {spec.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF0CF] dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A]">
                  {spec.badge}
                </span>
              </div>

              {/* Numerical Stat with Count-up Physics */}
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#49473E] dark:text-[#F4EFE6]">
                  <AnimatedCounter
                    to={spec.targetNumber}
                    duration={1.8 + index * 0.15}
                    formatter={spec.formatter}
                  />
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#787567] dark:text-[#FDE694]">
                  {spec.unit}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#49473E] dark:text-[#F4EFE6] mb-1">
                {spec.title}
              </h3>
              <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                {spec.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
