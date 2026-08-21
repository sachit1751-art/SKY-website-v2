import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { AnimatedHome, AnimatedChevronRight } from './icons';
import { AOSP_ROMS } from '../data';

const SEGMENT_NAME_MAP: Record<string, string> = {
  'admin': 'Admin Portal',
  'device': 'Device Specs',
  'roms': 'AOSP ROMs',
  'team': 'Team & Contributors',
  'community': 'Community & Support',
  'approve': 'Approve Maintainers',
  'logs': 'Security Audit Logs',
  'new': 'Create Release',
  'edit': 'Edit Release',
  'profile': 'Maintainer Profile',
  'login': 'Admin Login',
  'register': 'Register Maintainer',
  'reset-password': 'Reset Password',
};

export const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Do not render breadcrumbs on home page
  if (path === '/' || !path) {
    return null;
  }

  const getRomName = (idOrSlug: string) => {
    try {
      const stored = localStorage.getItem('aosp_roms_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const matched = parsed.find(r => (r.id || r.name || '').toLowerCase() === idOrSlug.toLowerCase());
          if (matched?.name) return matched.name;
        }
      }
    } catch (e) {
      // Ignore
    }

    const matched = AOSP_ROMS.find(r => (r.id || r.name || '').toLowerCase() === idOrSlug.toLowerCase());
    return matched?.name || null;
  };

  const rawSegments = path.split('/').filter(Boolean);
  const breadcrumbs = rawSegments.map((segment, index) => {
    const url = '/' + rawSegments.slice(0, index + 1).join('/');
    const isLast = index === rawSegments.length - 1;
    
    let label = SEGMENT_NAME_MAP[segment];
    if (!label) {
      const prevSegment = rawSegments[index - 1];
      if (prevSegment === 'roms') {
        label = getRomName(segment) || segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      } else {
        label = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }

    return { url, isLast, label };
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-1">
      <motion.nav 
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        aria-label="Breadcrumb"
        className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-[#787567] dark:text-[#BDB8A4] bg-[#FAF0CF]/90 dark:bg-[#1A1913]/90 px-3.5 py-1.5 rounded-2xl sm:rounded-full border border-[#EBE4CF] dark:border-[#36342A] shadow-2xs"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors focus:outline-hidden rounded-xs group"
          title="Back to Home"
        >
          <AnimatedHome size={13} className="text-[#787567] dark:text-[#BDB8A4] group-hover:text-[#121212] dark:group-hover:text-[#F4EFE6]" />
          <span className="font-medium">Home</span>
        </Link>

        {breadcrumbs.map((crumb) => (
          <React.Fragment key={crumb.url}>
            <AnimatedChevronRight size={12} className="text-[#BDB8A4] dark:text-[#524F43] shrink-0" />
            {crumb.isLast ? (
              <span 
                className="font-semibold text-[#49473E] dark:text-[#F4EFE6] bg-[#FAF3DD] dark:bg-[#25231C] px-2.5 py-0.5 rounded-full border border-[#EBE4CF] dark:border-[#36342A] tracking-wide truncate max-w-[180px] sm:max-w-none"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.url}
                className="hover:text-[#121212] dark:hover:text-[#F4EFE6] font-medium transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </motion.nav>
    </div>
  );
};
