export type ResourceLinkType = 'website' | 'github' | 'discord' | 'api' | 'download';
export interface ResourceLink {
  type: ResourceLinkType;
  url: string;
}
export interface ResourceGuideConfig {
  steps: number;
  tips: number;
  faq: number;
}
export interface Resource {
  slug: string;
  logo: string | null;
  hasGuide: boolean;
  guide?: ResourceGuideConfig;
  links: ResourceLink[];
  featured?: boolean;
}
export const RESOURCES: Resource[] = [
  {
    slug: 'tarkovtracker',
    logo: '/img/logos/tarkovtrackerlogo-light.webp',
    hasGuide: false,
    featured: true,
    links: [
      { type: 'website', url: 'https://tarkovtracker.org' },
      { type: 'github', url: 'https://github.com/tarkovtracker-org/TarkovTracker' },
      { type: 'discord', url: 'https://discord.gg/M8nBgA2sT6' },
    ],
  },
  {
    slug: 'tarkovdev',
    logo: '/img/logos/tarkovdevlogo.webp',
    hasGuide: true,
    guide: { steps: 3, tips: 2, faq: 2 },
    links: [
      { type: 'website', url: 'https://tarkov.dev/' },
      { type: 'api', url: 'https://api.tarkov.dev/' },
      { type: 'github', url: 'https://github.com/the-hideout' },
      { type: 'discord', url: 'https://discord.gg/bgpejCuFDf' },
    ],
  },
  {
    slug: 'tarkovmonitor',
    logo: '/img/logos/tarkovmonitorlogo.avif',
    hasGuide: true,
    guide: { steps: 4, tips: 3, faq: 3 },
    links: [
      { type: 'github', url: 'https://github.com/the-hideout/TarkovMonitor' },
      { type: 'website', url: 'https://tarkov.dev/tarkov-monitor' },
      { type: 'discord', url: 'https://discord.gg/bgpejCuFDf' },
    ],
  },
  {
    slug: 'ratscanner',
    logo: '/img/logos/ratscannerlogo.webp',
    hasGuide: true,
    guide: { steps: 4, tips: 3, faq: 3 },
    links: [
      { type: 'github', url: 'https://github.com/RatScanner/RatScanner' },
      { type: 'website', url: 'https://ratscanner.com' },
      { type: 'discord', url: 'https://discord.gg/VagecDrcsW' },
    ],
  },
  {
    slug: 'cultistcircle',
    logo: null,
    hasGuide: true,
    guide: { steps: 2, tips: 2, faq: 2 },
    links: [{ type: 'website', url: 'https://cultistcircle.com' }],
  },
  {
    slug: 'tarkovchanges',
    logo: '/img/logos/tarkovchangeslogo.svg',
    hasGuide: false,
    links: [{ type: 'website', url: 'https://tarkov-changes.com/' }],
  },
];
export const getResourceBySlug = (slug: string): Resource | undefined =>
  RESOURCES.find((r) => r.slug === slug);
export const LINK_ICONS: Record<ResourceLinkType, string> = {
  website: 'i-mdi-web',
  github: 'i-mdi-github',
  discord: 'i-mdi-discord',
  api: 'i-mdi-api',
  download: 'i-mdi-download',
};
export const LINK_LABEL_FALLBACKS: Record<ResourceLinkType, string> = {
  website: 'Website',
  github: 'GitHub',
  discord: 'Discord',
  api: 'API',
  download: 'Download',
};
