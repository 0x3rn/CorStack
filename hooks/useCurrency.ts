"use client";
import { useState, useEffect } from "react";

export function useCurrency() {
  const [currency, setCurrency] = useState<"usd" | "ngn">("usd");
  const [isCurrencyLoaded, setIsCurrencyLoaded] = useState(false);

  useEffect(() => {
    const detectLocation = async () => {
      const stored = localStorage.getItem("agencyCurrency") as "usd" | "ngn";
      if (stored) {
        setCurrency(stored);
        setIsCurrencyLoaded(true);
        return;
      }

      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Rate limited");
        const data = await response.json();
        
        const detected = data.country === "NG" ? "ngn" : "usd";
        setCurrency(detected);
        localStorage.setItem("agencyCurrency", detected);
      } catch (error) {
        setCurrency("usd");
      } finally {
        setIsCurrencyLoaded(true);
      }
    };

    detectLocation();
  }, []);

  return { 
    currency, 
    symbol: currency === 'ngn' ? '₦' : '$',
    isCurrencyLoaded 
  };
}
