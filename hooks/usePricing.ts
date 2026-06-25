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
  order: number;
}

export function usePricing() {
  const [currency, setCurrency] = useState<"usd" | "ngn">("usd");
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          setPricingTiers(data.pricing || []);
          setPortfolioItems(data.portfolio || []);
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

  return { currency, symbol: currency === 'ngn' ? '₦' : '$', pricingTiers, portfolioItems, isLoaded };
}