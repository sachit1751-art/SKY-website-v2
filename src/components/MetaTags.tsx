import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article' | 'profile' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

interface RouteMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogType?: 'website' | 'article' | 'profile' | 'product';
  ogImage?: string;
  noIndex?: boolean;
}

export const DEFAULT_KEYWORDS = [
  'SKY',
  'POCO M6 Pro 5G',
  'Xiaomi Redmi 12 5G',
  'sky',
  'sm4450',
  'Snapdragon 4 Gen 2',
  'AOSP ROMs',
  'Custom ROMs',
  'Android 16',
  'Android 17',
  'PixelOS',
  'EvolutionX',
  'crDroid',
  'LineageOS',
  'Open Source Android',
  'Device Tree',
  'Kernel SM4450',
];

export const ROUTE_METADATA_MAP: Record<string, RouteMetadata> = {
  '/': {
    title: 'Built for Everyone',
    description:
      'A community-driven Android device built to be different. Unthrottled Snapdragon 4 Gen 2 performance, open hardware philosophy, and transparent community collaboration.',
    keywords: [...DEFAULT_KEYWORDS, 'Community Hub', 'Android Ecosystem', 'Custom ROMs'],
    ogType: 'website',
    ogImage: '/screenshot1.jpg',
  },
  '/device': {
    title: 'Hardware & Specifications',
    description:
      'Comprehensive technical specifications of Xiaomi Redmi 12 5G / POCO M6 Pro 5G (sky): 6.79" FHD+ IPS LCD 90Hz, Snapdragon 4 Gen 2 (4nm) with Adreno 613 GPU, 50MP camera, 5000mAh battery with 18W charging.',
    keywords: [
      ...DEFAULT_KEYWORDS,
      'Hardware Specs',
      'Display 90Hz',
      'Adreno 613',
      '5000mAh Battery',
      '50MP Camera',
      'IP53 Splash Resistance',
    ],
    ogType: 'website',
    ogImage: '/screenshot2.jpg',
  },
  '/roms': {
    title: 'AOSP ROMs & Firmware Builds',
    description:
      'Browse official & community-tested custom ROMs, recoveries, and kernels for POCO M6 Pro 5G / Redmi 12 5G (sky). Search Android 16 & 17 builds, view changelogs, and download directly.',
    keywords: [
      ...DEFAULT_KEYWORDS,
      'ROM Downloads',
      'Recovery',
      'Custom Kernel',
      'Flashing Firmware',
      'Changelogs',
      'Fastboot Images',
    ],
    ogType: 'website',
    ogImage: '/screenshot3.jpg',
  },
  '/team': {
    title: 'Core Team & Maintainers',
    description:
      'Meet the core administrators, kernel engineers, and device maintainers bringing the open-source SKY smartphone ecosystem to life.',
    keywords: [
      ...DEFAULT_KEYWORDS,
      'Maintainers',
      'Kernel Developers',
      'Contributors',
      'Admins',
      'Open Source Leads',
    ],
    ogType: 'profile',
    ogImage: '/screenshot1.jpg',
  },
  '/community': {
    title: 'Community & Ecosystem',
    description:
      'Join official SKY channels on Telegram, explore open-source GitHub repositories, follow flashing guides, and learn about the core philosophy driving the SKY smartphone.',
    keywords: [
      ...DEFAULT_KEYWORDS,
      'Telegram Community',
      'Flashing Guide',
      'FAQ',
      'Open Source Philosophy',
      'Developer Discussion',
    ],
    ogType: 'website',
    ogImage: '/screenshot1.jpg',
  },
  '/about': {
    title: 'About SKY',
    description:
      'Learn about the SKY smartphone project, its open philosophy, and community-driven mission for unlocked mobile hardware.',
    keywords: DEFAULT_KEYWORDS,
    ogType: 'website',
    ogImage: '/screenshot1.jpg',
  },
  '/admin/login': {
    title: 'Maintainer Console Login',
    description: 'Log in to your SKY maintainer console to manage ROM releases and device configurations.',
    ogType: 'website',
    noIndex: true,
  },
  '/admin/register': {
    title: 'Register Maintainer Account',
    description: 'Submit an application for maintainer credentials in the SKY device ecosystem.',
    ogType: 'website',
    noIndex: true,
  },
  '/admin': {
    title: 'Maintainer Dashboard',
    description: 'Manage official ROM releases, view analytics, and publish firmware updates for SKY.',
    ogType: 'website',
    noIndex: true,
  },
  '/admin/roms/new': {
    title: 'New ROM Release',
    description: 'Publish a new custom ROM release for Xiaomi Redmi 12 5G / POCO M6 Pro 5G (sky).',
    ogType: 'website',
    noIndex: true,
  },
  '/admin/profile': {
    title: 'Maintainer Profile Settings',
    description: 'Update maintainer profile, avatar, biography, and social links.',
    ogType: 'profile',
    noIndex: true,
  },
  '/admin/approve': {
    title: 'Maintainer Applications',
    description: 'Review and approve pending maintainer applications.',
    ogType: 'website',
    noIndex: true,
  },
  '/admin/logs': {
    title: 'Security Audit Logs',
    description: 'Review administrative security audit trails and action histories.',
    ogType: 'website',
    noIndex: true,
  },
};

/**
 * Hook to dynamically calculate active meta tags based on active route and overrides
 */
export function useMetaTags(props: MetaTagsProps = {}) {
  const location = useLocation();
  const currentPath = location.pathname;

  const matchedRoute = ROUTE_METADATA_MAP[currentPath];
  const routeConfig: RouteMetadata = matchedRoute || {
    title: currentPath === '/' ? 'Built for Everyone' : currentPath.startsWith('/admin') ? 'Admin Console' : 'SKY Project',
    description:
      'SKY is an independent, community-driven Android smartphone built with purposeful minimalism, unlocked hardware, and open collaboration.',
    keywords: DEFAULT_KEYWORDS,
    ogType: 'website',
    ogImage: '/screenshot1.jpg',
    noIndex: currentPath.startsWith('/admin') || (!matchedRoute && currentPath !== '/'),
  };

  const finalTitle = props.title || routeConfig.title;
  const fullTitle = finalTitle.includes('SKY') ? finalTitle : `${finalTitle} | SKY`;
  const finalDescription = props.description || routeConfig.description;
  const finalKeywords = (props.keywords && props.keywords.length > 0 ? props.keywords : routeConfig.keywords || DEFAULT_KEYWORDS).join(', ');
  const finalOgType = props.ogType || routeConfig.ogType || 'website';
  const shouldNoIndex = props.noIndex !== undefined ? props.noIndex : (routeConfig.noIndex || false);

  const siteUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://sachit-brown.vercel.app';

  let computedCanonical = props.canonicalUrl;
  if (!computedCanonical) {
    const cleanPath = currentPath === '/' ? '' : currentPath;
    computedCanonical = `${siteUrl}${cleanPath}`;
  } else if (!computedCanonical.startsWith('http')) {
    computedCanonical = `${siteUrl}${computedCanonical.startsWith('/') ? '' : '/'}${computedCanonical}`;
  }

  const selectedImage = props.ogImage || routeConfig.ogImage || '/screenshot1.jpg';
  const fullOgImage = selectedImage.startsWith('http')
    ? selectedImage
    : `${siteUrl}${selectedImage.startsWith('/') ? '' : '/'}${selectedImage}`;

  // Direct DOM title sync as fallback for immediate browser tab responsiveness
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = fullTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', finalDescription);
      }
    }
  }, [fullTitle, finalDescription]);

  return {
    fullTitle,
    finalDescription,
    finalKeywords,
    finalOgType,
    shouldNoIndex,
    computedCanonical,
    fullOgImage,
    siteUrl,
  };
}

/**
 * MetaTags Component for SEO Management
 */
export const MetaTags: React.FC<MetaTagsProps> = (props) => {
  const {
    author = 'SKY Project Community',
    ogImageAlt = 'SKY Open Source Android Smartphone',
    publishedTime,
    modifiedTime,
    jsonLd,
  } = props;

  const {
    fullTitle,
    finalDescription,
    finalKeywords,
    finalOgType,
    shouldNoIndex,
    computedCanonical,
    fullOgImage,
    siteUrl,
  } = useMetaTags(props);

  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': finalOgType === 'profile' ? 'ProfilePage' : 'WebPage',
    name: fullTitle,
    description: finalDescription,
    url: computedCanonical,
    image: fullOgImage,
    publisher: {
      '@type': 'Organization',
      name: 'SKY Open Source Project',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/screenshot1.jpg`,
      },
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'SKY Project',
      url: siteUrl,
      description: 'Community-driven Android smartphone hub for Redmi 12 5G & POCO M6 Pro 5G (sky)',
    },
  };

  const activeJsonLd = jsonLd || defaultJsonLd;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={author} />
      <meta
        name="robots"
        content={shouldNoIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
      />
      <link rel="canonical" href={computedCanonical} />

      {/* Open Graph Tags */}
      <meta property="og:site_name" content="SKY Project" />
      <meta property="og:type" content={finalOgType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={computedCanonical} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:secure_url" content={fullOgImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      <meta name="twitter:site" content="@SKYProject" />
      <meta name="twitter:creator" content="@SKYProject" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(activeJsonLd)}
      </script>
    </Helmet>
  );
};

export default MetaTags;
