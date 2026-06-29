export interface PricingTier {
  id?: string;
  name: string;
  desc: string;
  priceUsd: string;
  priceNgn: string;
  features: string[];
  isPopular: boolean;
  order: number;
}

export interface PortfolioItem {
  id?: string;
  title: string;
  category: string;
  description?: string;
  imageUrl?: string; // Legacy fallback
  desktopImageUrls?: string[];
  mobileImageUrls?: string[];
  websiteUrl?: string;
  order: number;
}
export interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  iconName: string;
  order: number;
}

export interface ClientTypeItem {
  id?: string;
  title: string;
  description: string;
  iconName: string;
  order: number;
}

export interface ProcessItem {
  id?: string;
  title: string;
  description: string;
  order: number;
}

export interface Settings {
  general?: {
    heroHeadline: string;
    heroSubtitle: string;
    isAcceptingProjects: boolean;
    socialTwitter: string;
    socialInstagram: string;
    socialLinkedIn: string;
  };
  contact?: {
    ngnPhone: string;
    ngnEmail: string;
    usdPhone: string;
    usdEmail: string;
  };
}
