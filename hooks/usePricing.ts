"use client";
import { useState, useEffect } from "react";

export const pricingData = {
  usd: { symbol: "$", basic: 300, growth: 600 },
  ngn: { symbol: "₦", basic: 350000, growth: 650000 },
};

export function usePricing() {
  const [currency, setCurrency] = useState<"usd" | "ngn">("usd");
  const [isLoaded, setIsLoaded] = useState(false);

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

  return { currency, pricing: pricingData[currency], isLoaded };
}