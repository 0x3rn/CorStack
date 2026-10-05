'use client';
import { useSyncExternalStore } from 'react';
type Currency = 'usd' | 'ngn';
const initial = { currency: 'usd' as Currency, isCurrencyLoaded: false };
let snapshot = initial;
let started = false;
const listeners = new Set<() => void>();
async function detectCurrency() {
  let currency: Currency = 'usd';
  try {
    let stored: string | null = null;
    try { stored = localStorage.getItem('agencyCurrency'); } catch { /* Storage may be unavailable. */ }
    if (stored === 'usd' || stored === 'ngn') currency = stored;
    else {
      const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Location unavailable');
      currency = (await response.json()).country === 'NG' ? 'ngn' : 'usd';
      try { localStorage.setItem('agencyCurrency', currency); } catch { /* Currency still works without storage. */ }
    }
  } catch { /* Use USD if location lookup fails. */ }
  snapshot = { currency, isCurrencyLoaded: true };
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) { started = true; void detectCurrency(); }
  return () => { listeners.delete(listener); };
}
export function useCurrency() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => initial);
  return { ...state, symbol: state.currency === 'ngn' ? '₦' : '$' };
}
