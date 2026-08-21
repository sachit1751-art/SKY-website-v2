export interface TeamMember {
  id: string;
  name: string;
  role: string;
  type: 'core' | 'developer' | 'maintainer' | 'moderator' | 'tester' | 'ex' | 'admin';
  handle: string;
  avatarUrl?: string;
  githubUrl?: string;
  telegramUrl?: string;
  bio?: string;
}

export interface SpecCategory {
  id: 'display' | 'performance' | 'camera' | 'battery' | 'storage' | 'protection' | 'software';
  title: string;
  tagline: string;
  highlights: {
    label: string;
    value: string;
    description: string;
  }[];
  details: string;
}

export interface CoreValue {
  title: string;
  description: string;
}

export interface CommunityChannel {
  name: string;
  description: string;
  url: string;
  icon: 'github' | 'telegram' | 'chat' | 'globe';
  badge?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'flashing' | 'compatibility' | 'troubleshooting';
  tags?: string[];
}

export interface Admin {
  id: string;
  userId: string;
  name: string;
  email?: string;
  username: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  githubUrl?: string;
  telegramUrl?: string;
  telegramUsername?: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isSuperAdmin?: boolean;
}

export interface RomScreenshot {
  id: string;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
  createdAt: string;
}

export interface RomItem {
  id?: string;
  name: string;
  title?: string;
  androidVersion: string;
  status: 'Official' | 'Unofficial' | 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  maintainer: string;
  maintainerUrl?: string;
  maintainerHandle?: string;
  maintainerId?: string; // Reference to Admin.userId
  url: string;
  description?: string;
  changelog?: string[];
  createdAt?: string;
  updatedAt?: string;
  isPinned?: boolean;
  logoUrl?: string;
  extraLinks?: { label: string; url: string }[];
  downloadCount?: number;
  stabilityTrends?: number[];
  batteryEfficiency?: number; // 1-4
  screenshots?: RomScreenshot[];
  device?: string;
  variant?: string;
  version?: string;
  sourceUrl?: string;
  communityUrl?: string;
}

export interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'general';
  category: 'roms' | 'device_info' | 'website' | 'guide' | 'other';
  title: string;
  description: string;
  contact?: string | null;
  deviceInfo?: {
    url?: string;
    userAgent?: string;
    screenSize?: string;
    deviceMemory?: string;
    platform?: string;
  } | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
  adminResponse?: string | null;
  upvotes?: number;
  isPinned?: boolean;
  ip?: string | null;
  createdAt: string;
  updatedAt?: string;
}
