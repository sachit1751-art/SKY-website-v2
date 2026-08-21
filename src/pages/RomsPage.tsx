import { SpotlightCard } from '../components/SpotlightCard';
import { Sparkline } from '../components/Sparkline';
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import PullToRefresh from 'react-pull-to-refresh';
import { AOSP_ROMS } from '../data';
import { RomItem } from '../../shared/types';
import { ScrollReveal } from '../components/ScrollReveal';
import { SEO } from '../components/SEO';
import { FlashingGuide } from '../components/FlashingGuide';
import { RomDetailsModal } from '../components/RomDetailsModal';
import { TextLoop } from '../components/TextLoop';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

import { 
  ArrowUpRight, 
  Cpu, 
  X, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  Layers,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  Send,
  ArrowUp,
  Share2,
  Battery,
  Star,
  ExternalLink
} from 'lucide-react';
import {
  AnimatedSearch,
  AnimatedDownload,
  AnimatedExternalLink,
  AnimatedSmartphone,
  AnimatedChevronDown
} from '../components/icons';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import { staggerItemVariants } from '../components/PageTransition';

import { useSavedRoms } from '../hooks/useSavedRoms';

type FilterCategory = 'all' | 'android-17' | 'android-16' | 'official' | 'unofficial' | 'saved';
type StabilityType = 'Stable' | 'Beta';

// In-memory cache for Firestore ROMs
let cachedFirebaseRoms: RomItem[] | null = null;
let lastRomsFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export const RomsPage: React.FC = () => {
  const { showDownloadToast, showToast } = useToast();
  const { savedIds, toggleSave, isSaved } = useSavedRoms();
  const [searchParams] = useSearchParams();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  
  const initialSearchParam = searchParams.get('search') || '';
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('aosp_roms_search_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [roms, setRoms] = useState<RomItem[]>(() => {
    try {
      const saved = localStorage.getItem('aosp_roms_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedNames = new Set(parsed.map((r: any) => (r.name || '').toLowerCase().trim()));
          const missing = AOSP_ROMS.filter(c => !savedNames.has((c.name || '').toLowerCase().trim()));
          return [...parsed, ...missing];
        }
      }
    } catch (e) {}
    return AOSP_ROMS;
  });
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchParam);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');

  // New multi-select filters
  const [selectedAndroidVersions, setSelectedAndroidVersions] = useState<Set<string>>(new Set());
  const [selectedStabilities, setSelectedStabilities] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const param = searchParams.get('search');
    if (param !== null) {
      setSearchQuery(param);
    }
  }, [searchParams]);

  // Handle deep-linked ROM ID from route or query param
  useEffect(() => {
    const deepLinkId = routeId || searchParams.get('id');
    if (deepLinkId && roms.length > 0) {
      const rom = roms.find(r => (r.id === deepLinkId || r.name.toLowerCase() === deepLinkId.toLowerCase() || r.name.toLowerCase().replace(/\s+/g, '-') === deepLinkId.toLowerCase()));
      if (rom) {
        setSelectedRom(rom);
      }
    }
  }, [routeId, searchParams, roms]);
  const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');
  const [selectedRom, setSelectedRom] = useState<RomItem | null>(null);
  const [expandedRomId, setExpandedRomId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  const fetchFirebaseRoms = async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cachedFirebaseRoms && (now - lastRomsFetchTime < CACHE_TTL_MS)) {
      setRoms(() => {
        const merged = [...cachedFirebaseRoms!];
        const dbNames = new Set(merged.map(r => (r.name || '').toLowerCase().trim()));
        AOSP_ROMS.forEach(localRom => {
          if (!dbNames.has((localRom.name || '').toLowerCase().trim())) {
            merged.push(localRom);
          }
        });
        return merged;
      });
      setIsFirebaseLoading(false);
      return;
    }

    setIsFirebaseLoading(true);
    try {
      // Fetch all valid ROMs from Supabase database
      const { data, error } = await supabase
        .from('roms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const firebaseRoms = (data || [])
        .filter((r: any) => (r.status || '').toLowerCase() !== 'draft')
        .map((rom: any) => ({
          id: rom.id,
          name: rom.name,
          title: rom.title,
          version: rom.version,
          androidVersion: rom.android_version,
          status: rom.status,
          maintainer: rom.maintainer,
          maintainerUrl: rom.maintainer_url,
          maintainerHandle: rom.maintainer_handle,
          maintainerId: rom.maintainer_id,
          url: rom.url,
          description: rom.description,
          changelog: rom.changelog || [],
          isPinned: rom.is_pinned,
          logoUrl: rom.logo_url,
          extraLinks: rom.extra_links || [],
          downloadCount: rom.download_count,
          stabilityTrends: rom.stability_trends || [],
          batteryEfficiency: rom.battery_efficiency,
          screenshots: rom.screenshots || [],
          device: rom.device || 'sky',
          variant: rom.variant || 'Official',
          sourceUrl: rom.source_url,
          communityUrl: rom.community_url,
          createdAt: rom.created_at,
          updatedAt: rom.updated_at
        })) as RomItem[];
      
      cachedFirebaseRoms = firebaseRoms;
      lastRomsFetchTime = Date.now();

      // Merge supabase records with local catalog, prioritizing database records
      const dbNames = new Set(firebaseRoms.map(r => (r.name || '').toLowerCase().trim()));
      const missingCatalog = AOSP_ROMS.filter(c => !dbNames.has((c.name || '').toLowerCase().trim()));
      const merged = [...firebaseRoms, ...missingCatalog];
      setRoms(merged);
      try {
        localStorage.setItem('aosp_roms_data', JSON.stringify(merged));
      } catch (e) {}
    } catch (error) {
      console.warn('Error fetching ROMs from Supabase, using local catalog:', error);
      // Fallback already handled by initial state
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  useEffect(() => {
    fetchFirebaseRoms();
  }, []);

  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter(item => item !== query);
      const updated = [query, ...filtered].slice(0, 5);
      localStorage.setItem('aosp_roms_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (!localStorage.getItem('aosp_roms_data')) {
      localStorage.setItem('aosp_roms_data', JSON.stringify(AOSP_ROMS));
      localStorage.setItem('aosp_roms_timestamp', new Date().toISOString());
    }
  }, []);

  const lastUpdated = useMemo(() => {
    const savedTimestamp = localStorage.getItem('aosp_roms_timestamp');
    const latestRom = [...roms].sort((a, b) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime())[0];
    return latestRom ? new Date(latestRom.createdAt || savedTimestamp || new Date()).toLocaleDateString() : 'N/A';
  }, [roms]);

  useEffect(() => {
    let lastShow = false;
    const handleScroll = () => {
      const isPastLimit = window.scrollY > 400;
      if (isPastLimit !== lastShow) {
        lastShow = isPastLimit;
        setShowBackToTop(isPastLimit);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleExpandRom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRomId((prev) => (prev === id ? null : id));
  };

  // Helper to determine mirror host name
  const getMirrorLabel = (url: string): string => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('sourceforge')) return 'SourceForge';
      if (parsed.hostname.includes('t.me') || parsed.hostname.includes('telegram')) return 'Telegram';
      if (parsed.hostname.includes('luasup')) return 'CDN Mirror';
      if (parsed.hostname.includes('projectinfinity')) return 'Official Web';
      return 'Direct';
    } catch {
      return 'Direct';
    }
  };

  // Copy Link Handler with feedback timer
  const handleCopyLink = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => {
      setCopiedUrl((prev) => (prev === url ? null : prev));
    }, 2000);
  };

  const handleShare = async (rom: RomItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/roms/${rom.id || rom.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${rom.name} for sky`,
          text: `Check out the latest ${rom.name} build for Redmi 12 5G / Poco M6 Pro 5G (sky).`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink(shareUrl);
        }
      }
    } else {
      handleCopyLink(shareUrl);
      showToast({
        title: "Link Copied",
        message: "ROM direct link copied to clipboard.",
        type: "success"
      });
    }
  };

  const availableAndroidVersions = useMemo(() => {
    const versions = new Set<string>();
    roms.forEach(r => {
      const v = r.androidVersion.replace('Android ', 'A');
      versions.add(v);
    });
    return Array.from(versions).sort((a, b) => b.localeCompare(a));
  }, [roms]);

  const toggleAndroidVersion = (version: string) => {
    setSelectedAndroidVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) next.delete(version);
      else next.add(version);
      return next;
    });
  };

  const toggleStability = (stability: string) => {
    setSelectedStabilities(prev => {
      const next = new Set(prev);
      if (next.has(stability)) next.delete(stability);
      else next.add(stability);
      return next;
    });
  };

  const isStabilityMatch = (rom: RomItem, stabilities: Set<string>) => {
    if (stabilities.size === 0) return true;
    const searchString = `${rom.name} ${rom.description || ''}`.toLowerCase();
    const isBeta = searchString.includes('beta');
    const romStability = isBeta ? 'Beta' : 'Stable';
    return stabilities.has(romStability);
  };

  const isAndroidVersionMatch = (rom: RomItem, versions: Set<string>) => {
    if (versions.size === 0) return true;
    const romV = (rom.androidVersion || '').replace(/Android\s*/i, 'A').trim().toUpperCase();
    return Array.from(versions).some(v => {
      const cleanV = v.replace(/Android\s*/i, 'A').trim().toUpperCase();
      return romV.includes(cleanV) || (rom.androidVersion || '').toUpperCase().includes(v.toUpperCase());
    });
  };

  // Filter and Sort calculations
  const sortedAndFilteredRoms = useMemo(() => {
    let baseRoms = roms;

    // Filter by category first (legacy top pills)
    if (selectedFilter !== 'all') {
      baseRoms = baseRoms.filter((rom) => {
        if (selectedFilter === 'saved') return isSaved(rom.id || rom.name);
        if (selectedFilter === 'android-17') return (rom.androidVersion || '').toLowerCase().includes('17');
        if (selectedFilter === 'android-16') return (rom.androidVersion || '').toLowerCase().includes('16');
        if (selectedFilter === 'official') {
          const st = (rom.status || '').toLowerCase();
          return st === 'official' || st === 'published' || st === 'approved';
        }
        if (selectedFilter === 'unofficial') {
          const st = (rom.status || '').toLowerCase();
          return st === 'unofficial' || st === 'draft' || st === 'pending' || st === 'beta';
        }
        return true;
      });
    }

    // Apply new sidebar filters
    baseRoms = baseRoms.filter(rom => 
      isAndroidVersionMatch(rom, selectedAndroidVersions) && 
      isStabilityMatch(rom, selectedStabilities)
    );

    let result = baseRoms;

    // Use Fuse.js for robust fuzzy search
    if (searchQuery.trim()) {
      const fuse = new Fuse(baseRoms, {
        keys: [
          { name: 'name', weight: 1 },
          { name: 'maintainer', weight: 0.7 },
          { name: 'androidVersion', weight: 0.5 },
          { name: 'description', weight: 0.4 },
          { name: 'changelog', weight: 0.3 }
        ],
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true
      });
      result = fuse.search(searchQuery).map(r => r.item);
    }

    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime());
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return result;
  }, [searchQuery, selectedFilter, sortBy, roms, savedIds, selectedAndroidVersions, selectedStabilities]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        if (selectedRom) {
          setSelectedRom(null);
        } else if (expandedRomId) {
          setExpandedRomId(null);
        }
      }

      // Arrow Navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); // Prevent page scroll

        const currentIndex = sortedAndFilteredRoms.findIndex(
          (r) => (r.id || r.name) === expandedRomId
        );

        let nextIndex;
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, sortedAndFilteredRoms.length - 1);
        } else {
          nextIndex = currentIndex === -1 ? sortedAndFilteredRoms.length - 1 : Math.max(currentIndex - 1, 0);
        }

        const nextRom = sortedAndFilteredRoms[nextIndex];
        if (nextRom) {
          setExpandedRomId(nextRom.id || nextRom.name);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRom, expandedRomId, sortedAndFilteredRoms]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: roms.length,
      a17: roms.filter((r) => (r.androidVersion || '').toLowerCase().includes('17')).length,
      a16: roms.filter((r) => (r.androidVersion || '').toLowerCase().includes('16')).length,
      official: roms.filter((r) => {
        const st = (r.status || '').toLowerCase();
        return st === 'official' || st === 'published' || st === 'approved';
      }).length,
      unofficial: roms.filter((r) => {
        const st = (r.status || '').toLowerCase();
        return st === 'unofficial' || st === 'draft' || st === 'pending' || st === 'beta';
      }).length,
      saved: roms.filter((r) => isSaved(r.id || r.name)).length
    };
  }, [roms, savedIds]);

  // Dynamic SEO metadata calculation for maximum search indexing and relevancy
  const seoMeta = useMemo(() => {
    if (selectedRom) {
      const verString = selectedRom.version ? `v${selectedRom.version}` : '';
      const androidStr = selectedRom.androidVersion ? `Android ${selectedRom.androidVersion}` : 'Android';
      const statusStr = selectedRom.status ? `${selectedRom.status.toUpperCase()}` : 'Official';
      const title = `${selectedRom.name} ${verString} (${androidStr}) for POCO M6 Pro 5G / Redmi 12 5G`;
      const description = `Download ${selectedRom.name} ${verString} for POCO M6 Pro 5G & Redmi 12 5G (sky / sm4450) by ${selectedRom.maintainer}. ${androidStr}, ${statusStr} release. ${selectedRom.description ? selectedRom.description.slice(0, 140) : 'Includes latest security patches, kernel source, and installation guide.'}`;
      const canonicalUrl = `/roms/${selectedRom.id || selectedRom.name.toLowerCase().replace(/\s+/g, '-')}`;
      const keywords = [
        selectedRom.name,
        selectedRom.maintainer,
        'POCO M6 Pro 5G',
        'Redmi 12 5G',
        'sky',
        'sm4450',
        androidStr,
        'Custom ROM',
        'Fastboot',
        'Recovery',
        'Download'
      ];
      return {
        title,
        description,
        canonicalUrl,
        ogImage: selectedRom.logoUrl || '/screenshot3.jpg',
        ogImageAlt: `${selectedRom.name} Custom ROM for SKY`,
        keywords,
        ogType: 'article' as const
      };
    }

    if (searchQuery.trim()) {
      return {
        title: `Search "${searchQuery.trim()}" - ROMs & Firmware for POCO M6 Pro 5G / Redmi 12 5G`,
        description: `Explore search results for "${searchQuery.trim()}" custom ROMs, recoveries, and kernels for Xiaomi Redmi 12 5G & POCO M6 Pro 5G (sky). ${sortedAndFilteredRoms.length} builds available.`,
        canonicalUrl: `/roms?search=${encodeURIComponent(searchQuery.trim())}`,
        ogImage: '/screenshot3.jpg',
        ogImageAlt: `Search results for ${searchQuery}`,
        keywords: [searchQuery.trim(), 'POCO M6 Pro 5G ROMs', 'Redmi 12 5G AOSP', 'sky custom ROMs'],
        ogType: 'website' as const
      };
    }

    if (selectedFilter !== 'all') {
      const filterNames: Record<string, string> = {
        official: 'Official AOSP ROMs',
        unofficial: 'Community & Unofficial ROMs',
        port: 'Ported Firmware Builds',
        kernel: 'Custom Kernels & Performance Modules',
        recovery: 'Custom Recoveries (TWRP & OrangeFox)',
        saved: 'Your Saved Bookmarks'
      };
      const label = filterNames[selectedFilter] || `${selectedFilter} Builds`;
      return {
        title: `${label} - POCO M6 Pro 5G & Redmi 12 5G (sky)`,
        description: `Browse ${sortedAndFilteredRoms.length} tested ${label.toLowerCase()} for Xiaomi Redmi 12 5G and POCO M6 Pro 5G (sky / sm4450). High-speed download mirrors, full changelogs, and step-by-step guides.`,
        canonicalUrl: `/roms?filter=${selectedFilter}`,
        ogImage: '/screenshot3.jpg',
        ogImageAlt: `${label} for SKY`,
        keywords: [label, 'sky ROMs', 'POCO M6 Pro 5G', 'Redmi 12 5G', 'sm4450', 'Firmware'],
        ogType: 'website' as const
      };
    }

    if (selectedAndroidVersions.size > 0) {
      const versions = Array.from(selectedAndroidVersions).join(', ');
      return {
        title: `Android ${versions} Custom ROMs - POCO M6 Pro 5G / Redmi 12 5G`,
        description: `Download verified Android ${versions} custom ROMs for POCO M6 Pro 5G & Xiaomi Redmi 12 5G (sky). ${sortedAndFilteredRoms.length} builds with latest Android features and security updates.`,
        canonicalUrl: '/roms',
        ogImage: '/screenshot3.jpg',
        ogImageAlt: `Android ${versions} ROMs for SKY`,
        keywords: [`Android ${versions}`, 'AOSP', 'Custom ROMs', 'POCO M6 Pro 5G', 'Redmi 12 5G', 'sky'],
        ogType: 'website' as const
      };
    }

    return {
      title: `AOSP ROMs & Firmware Catalog (${roms.length} Builds) - POCO M6 Pro 5G / Redmi 12 5G`,
      description: `Browse ${roms.length} official and community custom ROMs, recoveries, and kernels for POCO M6 Pro 5G / Redmi 12 5G (sky / sm4450). Tested Android 14, 15, 16 & 17 releases with direct download links.`,
      canonicalUrl: '/roms',
      ogImage: '/screenshot3.jpg',
      ogImageAlt: 'SKY AOSP Custom ROMs & Firmware',
      keywords: ['AOSP ROMs', 'POCO M6 Pro 5G', 'Redmi 12 5G', 'sky', 'Android 16', 'Android 17', 'PixelOS', 'EvolutionX', 'crDroid', 'LineageOS', 'TWRP'],
      ogType: 'website' as const
    };
  }, [selectedRom, searchQuery, selectedFilter, selectedAndroidVersions, sortedAndFilteredRoms.length, roms.length]);

  const romJsonLd = selectedRom
    ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${selectedRom.name} for SKY`,
        operatingSystem: `Android ${selectedRom.androidVersion}`,
        applicationCategory: 'OperatingSystem',
        softwareVersion: selectedRom.version,
        description: selectedRom.description || `${selectedRom.name} custom ROM build for Xiaomi Redmi 12 5G / POCO M6 Pro 5G (sky)`,
        downloadUrl: selectedRom.url,
        author: {
          '@type': 'Person',
          name: selectedRom.maintainer,
        },
      }
    : undefined;

  return (
    <div className="py-6 sm:py-10 md:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-6 md:space-y-10 pb-28 w-full overflow-hidden">
      <SEO
        title={seoMeta.title}
        description={seoMeta.description}
        canonicalUrl={seoMeta.canonicalUrl}
        ogImage={seoMeta.ogImage}
        ogImageAlt={seoMeta.ogImageAlt}
        ogType={seoMeta.ogType}
        keywords={seoMeta.keywords}
        jsonLd={romJsonLd}
      />

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-gradient-to-b from-black/80 to-black/60 z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-[#FAF8F1] dark:bg-[#0F0E0C] z-[101] p-8 lg:hidden shadow-2xl border-l border-[#EBE4CF] dark:border-[#1F1E18] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-black text-[#49473E] dark:text-[#F4EFE6] tracking-tighter uppercase">Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full bg-[#EBE4CF] dark:bg-[#1F1E18]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest mb-4">Android Version</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {availableAndroidVersions.map(version => (
                      <button
                        key={version}
                        onClick={() => toggleAndroidVersion(version)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                          selectedAndroidVersions.has(version)
                            ? 'bg-[#49473E] text-[#FAF3DD] border-transparent dark:bg-[#FDE694] dark:text-[#121212]'
                            : 'bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A]'
                        }`}
                      >
                        <span>{version.replace('A', 'Android ')}</span>
                        {selectedAndroidVersions.has(version) && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest mb-4">ROM Stability</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {['Stable', 'Beta'].map(type => (
                      <button
                        key={type}
                        onClick={() => toggleStability(type)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                          selectedStabilities.has(type)
                            ? 'bg-[#49473E] text-[#FAF3DD] border-transparent dark:bg-[#FDE694] dark:text-[#121212]'
                            : 'bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A]'
                        }`}
                      >
                        <span>{type}</span>
                        {selectedStabilities.has(type) && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAndroidVersions(new Set());
                    setSelectedStabilities(new Set());
                    setIsSidebarOpen(false);
                  }}
                  className="w-full py-4 bg-[#FDE694] text-[#121212] font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg cursor-pointer"
                >
                  Apply & Reset
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="space-y-3 w-full">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase text-[#121212] dark:text-[#F4EFE6]">
          <span className="shimmer-accent">AOSP ROMS</span>
        </h1>
        <div className="text-xs text-[#787567] dark:text-[#BDB8A4]">
          Last updated: {lastUpdated}
        </div>
        <p className="text-base sm:text-lg text-[#787567] dark:text-[#BDB8A4] max-w-3xl">
          Curated custom{' '}
          <TextLoop
            words={['Android 16 & 17 builds,', 'security patches,', 'daily driver ROMs,', 'AOSP distributions,']}
            className="text-[#49473E] dark:text-[#F4EFE6] font-semibold"
          />{' '}
          maintained for the <code className="px-1.5 py-0.5 rounded bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] font-mono text-xs font-bold">sky</code> ecosystem.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 pt-2 w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full">
          {/* Live Search Input */}
          <div className="relative flex-1 min-w-0">
            <AnimatedSearch size={16} className="text-[#787567] dark:text-[#BDB8A4] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveToHistory(searchQuery);
                }
              }}
              placeholder="Search ROMs by name, maintainer, or features..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FAF3DD]/60 dark:bg-[#1F1E18]/60 border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#49473E] dark:text-[#F4EFE6] placeholder-[#787567]/70 dark:placeholder-[#BDB8A4]/70 focus:outline-none focus:ring-2 focus:ring-[#FDE694] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#787567] hover:text-[#49473E] dark:text-[#BDB8A4] dark:hover:text-[#F4EFE6] cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchHistory.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs px-1">
              <span className="text-[#787567] dark:text-[#BDB8A4]">Recent:</span>
              {searchHistory.map((query) => (
                <button
                  key={query}
                  onClick={() => setSearchQuery(query)}
                  className="text-[#49473E] dark:text-[#F4EFE6] underline decoration-dotted hover:text-[#FDE694] transition-colors cursor-pointer"
                >
                  {query}
                </button>
              ))}
            </div>
          )}
          {/* Sorting and Refresh Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'name')}
              className="px-4 py-3 rounded-2xl bg-[#FAF3DD]/60 dark:bg-[#1F1E18]/60 border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#49473E] dark:text-[#F4EFE6] focus:outline-none focus:ring-2 focus:ring-[#FDE694] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
            
            <button
              onClick={() => window.location.reload()}
              className="p-3 rounded-2xl bg-[#FAF3DD]/60 dark:bg-[#1F1E18]/60 border border-[#EBE4CF] dark:border-[#36342A] text-[#787567] dark:text-[#BDB8A4] hover:text-[#49473E] dark:hover:text-[#F4EFE6] transition-all cursor-pointer"
              title="Refresh builds"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Pills Deck - Responsive auto-fitting grid that spans 100% of any screen width */}
        <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'all'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">All Builds</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('saved')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'saved'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            <Star className={`w-3.5 h-3.5 shrink-0 ${selectedFilter === 'saved' ? 'fill-current' : ''}`} />
            <span className="truncate">Saved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.saved}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('android-17')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'android-17'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">Android 17</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.a17}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('android-16')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'android-16'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">Android 16</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.a16}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('official')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'official'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">Official</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.official}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('unofficial')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'unofficial'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">Community</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.unofficial}
            </span>
          </button>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 xl:w-64 sticky top-28 space-y-6 shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest mb-4">Android Version</h3>
              <div className="space-y-2">
                {availableAndroidVersions.map(version => (
                  <button
                    key={version}
                    onClick={() => toggleAndroidVersion(version)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedAndroidVersions.has(version)
                        ? 'bg-[#49473E] text-[#FAF3DD] border-transparent dark:bg-[#FDE694] dark:text-[#121212]'
                        : 'bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                    }`}
                  >
                    <span>{version.replace('A', 'Android ')}</span>
                    {selectedAndroidVersions.has(version) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest mb-4">ROM Stability</h3>
              <div className="space-y-2">
                {['Stable', 'Beta'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleStability(type)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedStabilities.has(type)
                        ? 'bg-[#49473E] text-[#FAF3DD] border-transparent dark:bg-[#FDE694] dark:text-[#121212]'
                        : 'bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                    }`}
                  >
                    <span>{type}</span>
                    {selectedStabilities.has(type) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {(selectedAndroidVersions.size > 0 || selectedStabilities.size > 0) && (
              <button
                onClick={() => {
                  setSelectedAndroidVersions(new Set());
                  setSelectedStabilities(new Set());
                }}
                className="w-full py-2.5 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline cursor-pointer"
              >
                Clear Sidebar Filters
              </button>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-[#FDE694]/10 border border-[#FDE694]/20 space-y-2">
            <h4 className="text-[10px] font-black text-[#49473E] dark:text-[#FDE694] uppercase tracking-widest">Sky Audit</h4>
            <p className="text-[10px] text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
              All builds are verified by the SKY maintainer group before appearing in this list.
            </p>
          </div>
        </aside>

        <div className="flex-1 w-full min-w-0 space-y-6 md:space-y-8">
          {/* Results Header */}
          <div className="flex items-center justify-between text-xs text-[#787567] dark:text-[#BDB8A4] px-1">
            <span>
              Showing <strong className="text-[#49473E] dark:text-[#F4EFE6] font-semibold">{sortedAndFilteredRoms.length}</strong> {sortedAndFilteredRoms.length === 1 ? 'build' : 'builds'}
            </span>
            {(searchQuery || selectedFilter !== 'all' || selectedAndroidVersions.size > 0 || selectedStabilities.size > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                  setSortBy('newest');
                  setSelectedAndroidVersions(new Set());
                  setSelectedStabilities(new Set());
                }}
                className="font-semibold text-[#49473E] dark:text-[#FDE694] hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

      {/* ROM List */}
      <motion.div 
        className="space-y-4"
      >
        {sortedAndFilteredRoms.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FDE694]/50 flex items-center justify-center mx-auto text-[#49473E] dark:text-[#121212]">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#49473E] dark:text-[#F4EFE6]">
              No ROM builds match your criteria
            </h3>
            <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] max-w-sm mx-auto">
              Try adjusting your search terms or selecting 'All Builds' to browse the complete list.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212] hover:bg-[#FDE694]/80 transition-all cursor-pointer mt-2"
            >
              Show All ROMs
            </button>
          </div>
        ) : (
          sortedAndFilteredRoms.map((rom) => {
            const isThisCopied = copiedUrl === rom.url;
            const mirrorLabel = getMirrorLabel(rom.url);
            const isExpanded = expandedRomId === (rom.id || rom.name);
            const isBeta = rom.description?.toLowerCase().includes('beta');
            const isOfficial = rom.status === 'Official';

            return (
              <motion.div
                key={rom.id || rom.name}
                variants={staggerItemVariants}
              >
                <SpotlightCard className="rounded-3xl">
                  <div 
                    className="group bg-[#FAF3DD]/50 dark:bg-[#1F1E18]/60 hover:bg-[#FAF3DD] dark:hover:bg-[#1F1E18] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#EBE4CF] dark:border-[#36342A] transition-all duration-300 shadow-xs hover:shadow-md hover:border-[#FDE694]/60 dark:hover:border-[#FDE694]/40 relative"
                  >
                    {/* Quick Bookmark Button (Top-Right) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(rom.id || rom.name);
                      }}
                      className={`absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-xl z-10 transition-all active:scale-90 ${
                        isSaved(rom.id || rom.name)
                          ? 'text-amber-500 bg-amber-500/15'
                          : 'text-[#787567] bg-[#FAF0CF]/60 dark:bg-[#151410] hover:text-amber-500 hover:bg-amber-500/10'
                      }`}
                      title={isSaved(rom.id || rom.name) ? "Remove from saved" : "Save ROM"}
                    >
                      <Star className={`w-4 h-4 ${isSaved(rom.id || rom.name) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Main Card Content: Stacks vertically on mobile, horizontal on lg+ */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                      
                      {/* Left / Top Section: ROM Identity & Metadata */}
                      <div 
                        onClick={() => setSelectedRom(rom)}
                        className="cursor-pointer flex-1 min-w-0 pr-8 sm:pr-10 lg:pr-0"
                      >
                        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                          {/* ROM Logo */}
                          {rom.logoUrl ? (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-[#EBE4CF] dark:border-[#36342A] shadow-xs shrink-0 group-hover:scale-105 transition-transform bg-white/20">
                              <img
                                src={rom.logoUrl}
                                alt={rom.name}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#FDE694] flex items-center justify-center text-[#121212] font-black text-lg sm:text-2xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                              {rom.name.charAt(0)}
                            </div>
                          )}

                          {/* Title & Badges */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                              <h2 className="text-lg sm:text-xl font-extrabold text-[#121212] dark:text-[#F4EFE6] tracking-tight group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-colors truncate">
                                {rom.name}
                              </h2>

                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                                isBeta 
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              }`}>
                                {isBeta ? 'Beta' : 'Stable'}
                              </span>

                              {rom.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDE694]/60 text-[#121212] border border-[#FDE694]">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>Featured</span>
                                </span>
                              )}
                            </div>

                            {/* Tags Row */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="font-bold text-[#49473E] dark:text-[#F4EFE6] bg-[#FAF3DD] dark:bg-[#151410] px-2 py-0.5 rounded-md border border-[#EBE4CF] dark:border-[#36342A] text-[11px]">
                                {rom.androidVersion}
                              </span>

                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                  isOfficial
                                    ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20'
                                    : 'bg-[#EBE4CF]/60 dark:bg-[#36342A]/60 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A]'
                                }`}
                              >
                                {rom.status}
                              </span>

                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EBE4CF]/50 dark:bg-[#36342A]/50 text-[#787567] dark:text-[#BDB8A4]">
                                {mirrorLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Specs & Maintainer Details */}
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#787567] dark:text-[#BDB8A4]">
                          {/* Maintainer */}
                          <div 
                            className="inline-flex items-center gap-1.5" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#787567]/80 dark:text-[#BDB8A4]/80">By:</span>
                            {rom.maintainerUrl ? (
                              <a
                                href={rom.maintainerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] bg-[#FAF0CF]/70 dark:bg-[#2B2921]/80 hover:bg-[#FDE694] dark:hover:bg-[#36342A] px-2 py-0.5 rounded-lg border border-[#EBE4CF] dark:border-[#36342A] transition-all text-xs"
                                title={`Visit ${rom.maintainer}'s Profile`}
                              >
                                <Send className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                                <span>{rom.maintainer}</span>
                              </a>
                            ) : (
                              <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6] bg-[#FAF0CF]/50 dark:bg-[#2B2921]/50 px-2 py-0.5 rounded-lg border border-[#EBE4CF] dark:border-[#36342A] text-xs">
                                {rom.maintainer}
                              </span>
                            )}
                          </div>

                          {/* Device / Variant */}
                          {(rom.device || rom.variant) && (
                            <div className="inline-flex items-center gap-1.5">
                              {rom.device && (
                                <span className="px-2 py-0.5 rounded-lg bg-[#FDE694]/20 text-[#49473E] dark:text-[#FDE694] border border-[#FDE694]/30 text-[10px] font-bold uppercase tracking-wider">
                                  {rom.device}
                                </span>
                              )}
                              {rom.variant && (
                                <span className="px-2 py-0.5 rounded-lg bg-[#FAF0CF]/40 dark:bg-[#2B2921]/40 text-[#787567] dark:text-[#BDB8A4] border border-[#EBE4CF] dark:border-[#36342A] text-[10px] font-bold uppercase tracking-wider">
                                  {rom.variant}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Download Count */}
                          {rom.downloadCount !== undefined && (
                            <div className="inline-flex items-center gap-1 bg-[#FAF0CF]/40 dark:bg-[#2B2921]/40 px-2 py-0.5 rounded-lg border border-[#EBE4CF] dark:border-[#36342A] text-xs">
                              <svg className="w-3.5 h-3.5 text-[#787567] dark:text-[#BDB8A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              <span className="font-bold text-[#49473E] dark:text-[#F4EFE6]">
                                {rom.downloadCount >= 1000 ? `${(rom.downloadCount / 1000).toFixed(1)}K` : rom.downloadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right / Bottom Section: Action Controls */}
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 sm:pt-0 border-t border-[#EBE4CF]/70 dark:border-[#36342A]/70 lg:border-t-0 shrink-0"
                      >
                        {/* Changelog Modal Trigger Button */}
                        <button
                          onClick={() => setSelectedRom(rom)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF0CF]/80 dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] dark:hover:bg-[#FDE694] dark:hover:text-[#121212] transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Open detailed release notes modal"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Changelog</span>
                        </button>

                        {/* Copy Link Button */}
                        <button
                          onClick={(e) => handleCopyLink(rom.url, e)}
                          className={`inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            isThisCopied
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-[#FAF0CF]/60 dark:bg-[#25231C] text-[#49473E] dark:text-[#F4EFE6] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                          }`}
                          title="Copy download URL"
                        >
                          {isThisCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Quick Inline Expand Toggle */}
                        <button
                          onClick={(e) => toggleExpandRom(rom.id || rom.name, e)}
                          className={`inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            isExpanded
                              ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent'
                              : 'bg-[#FAF0CF]/40 dark:bg-[#25231C]/60 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                          }`}
                          title="Toggle quick preview"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Primary CTA: Get ROM Button */}
                        <a
                          href={rom.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => showDownloadToast(rom.name, rom.url)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                        >
                          <span>GET ROM</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#121212]" />
                        </a>
                      </div>
                    </div>

                  {/* Expandable Changelog Drawer Motion with Staggered Fade-in */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-5 border-t border-[#EBE4CF] dark:border-[#36342A] space-y-4">
                          {/* Overview banner */}
                          {rom.description && (
                            <motion.p
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25, delay: 0.05 }}
                              className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed bg-[#FFF8E1] dark:bg-[#12110D] p-4 rounded-2xl border border-[#EBE4CF] dark:border-[#36342A]"
                            >
                              {rom.description}
                            </motion.p>
                          )}

                          {/* Staggered Changelog Bullets */}
                          {rom.changelog && rom.changelog.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4] block">
                                Build Highlights & Changes
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {rom.changelog.map((item, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.25,
                                      delay: 0.08 + i * 0.04,
                                      ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="flex items-start gap-2 text-xs text-[#49473E] dark:text-[#F4EFE6] bg-[#FAF0CF]/40 dark:bg-[#25231C]/60 p-3 rounded-xl border border-[#EBE4CF] dark:border-[#36342A]"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FDE694] mt-1.5 shrink-0" />
                                    <span>{item}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Maintainer notes / Community quick link */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                            <div className="flex items-center gap-2 text-[#787567] dark:text-[#BDB8A4]" onClick={(e) => e.stopPropagation()}>
                              <span>Built by</span>
                              {rom.maintainerUrl ? (
                                <a
                                  href={rom.maintainerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-sky-600 dark:hover:text-[#FDE694] underline decoration-dotted underline-offset-2"
                                  title={`Open ${rom.maintainer}'s Telegram profile`}
                                >
                                  <Send className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                                  <span>{rom.maintainer}</span>
                                </a>
                              ) : (
                                <span className="font-semibold text-[#49473E] dark:text-[#F4EFE6]">
                                  {rom.maintainer}
                                </span>
                              )}
                              <span>•</span>
                              <span>Verified on <code className="font-mono font-bold">sky</code></span>
                            </div>

                            <button
                              onClick={() => setSelectedRom(rom)}
                              className="text-xs font-bold text-[#49473E] dark:text-[#FDE694] hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Open complete modal</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                </SpotlightCard>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  </div>

  {/* Flashing Guide & Prerequisites Section (Bottom) */}
      <div className="pt-6 border-t border-[#EBE4CF] dark:border-[#36342A]">
        <FlashingGuide />
      </div>

      {/* Details & Changelog Modal */}
      <RomDetailsModal
        rom={selectedRom}
        onClose={() => setSelectedRom(null)}
        onCopyUrl={(url) => handleCopyLink(url)}
        isCopied={selectedRom ? copiedUrl === selectedRom.url : false}
      />

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-[#FDE694] text-[#121212] shadow-lg hover:scale-110 transition-all z-50"
            aria-label="Back to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RomsPage;

