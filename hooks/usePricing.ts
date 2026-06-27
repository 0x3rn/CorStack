"use client";
import { useState, useEffect } from "react";

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
  imageUrl: string;
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

export function usePricing() {
  const [currency, setCurrency] = useState<"usd" | "ngn">("usd");
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [servicesItems, setServicesItems] = useState<ServiceItem[]>([]);
  const [clientTypes, setClientTypes] = useState<ClientTypeItem[]>([]);
  const [processItems, setProcessItems] = useState<ProcessItem[]>([]);
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          setPricingTiers(data.pricing || []);
          setPortfolioItems(data.portfolio || []);
          setServicesItems(data.services || []);
          setClientTypes(data.clientTypes || []);
          setProcessItems(data.process || []);
          setSettings(data.settings || {});
        }
      } catch (e) {
        console.error("Failed to fetch CMS content:", e);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    const detectLocation = async () => {
      const stored = localStorage.getItem("agencyCurrency") as "usd" | "ngn";
      if (stored) {
        setCurrency(stored);
        setIsLoaded(true);
        return;
      }

      try {
        const startTime = Date.now();
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Rate limited");
        const data = await response.json();
        
        const detected = data.country === "NG" ? "ngn" : "usd";
        setCurrency(detected);
        localStorage.setItem("agencyCurrency", detected);

        const elapsed = Date.now() - startTime;
        if (elapsed < 1500) {
          await new Promise(resolve => setTimeout(resolve, 1500 - elapsed));
        }
      } catch (error) {
        setCurrency("usd");
      } finally {
        setIsLoaded(true);
      }
    };

    detectLocation();
  }, []);

  return { 
    currency, 
    symbol: currency === 'ngn' ? '₦' : '$',
    setCurrency, 
    pricingTiers, 
    portfolioItems,
    servicesItems,
    clientTypes,
    processItems,
    settings,
    isLoaded 
  };
}