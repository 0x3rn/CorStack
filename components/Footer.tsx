"use client";

import Link from 'next/link';
import { useCurrency } from '../hooks/useCurrency';
import { Settings } from '../lib/types';

interface FooterProps {
  settings?: Settings;
}

export default function Footer({ settings }: FooterProps) {
  const { currency } = useCurrency();

  return (
    <footer className="footer bg-brand-dark text-white pt-16 pb-8 border-t border-white/10">
      <div className="footer-top max-w-[1400px] mx-auto px-[5%] grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="footer-brand md:col-span-1 flex flex-col items-start gap-4">
          <h2 className="footer-logo text-2xl font-bold flex items-center gap-3">
            <img src="/logo.png" alt="Corstack Logo" className="w-8 h-8 object-contain" />
            corstack.
          </h2>
          <p className="text-gray-400 text-[0.95rem] leading-relaxed max-w-[280px]">Reliable web design and development made for you.</p>
        </div>

        <div className="footer-links flex flex-col gap-5">
          <h3 className="font-bold text-[1.1rem]">Company</h3>
          <ul className="flex flex-col gap-3">
            <li><Link href="#portfolio" className="text-gray-400 hover:text-white transition-colors">Portfolio</Link></li>
            <li><Link href="#services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
            <li><Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
            <li><Link href="#process" className="text-gray-400 hover:text-white transition-colors">Process</Link></li>
          </ul>
        </div>

        <div className="footer-links flex flex-col gap-5">
          <h3 className="font-bold text-[1.1rem]">Legal</h3>
          <ul className="flex flex-col gap-3">
            <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="footer-contact flex flex-col gap-5 md:col-span-1">
          <h3 className="font-bold text-[1.1rem]">Contact</h3>
          <ul className="flex flex-col gap-3">
            <li>
              <a href={`mailto:${currency === 'ngn' ? settings?.contact?.ngnEmail || 'hello@corstack.dev' : settings?.contact?.usdEmail || 'hello@corstack.dev'}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                {currency === 'ngn' ? settings?.contact?.ngnEmail || 'hello@corstack.dev' : settings?.contact?.usdEmail || 'hello@corstack.dev'}
              </a>
            </li>
            {(currency === 'ngn' ? settings?.contact?.ngnPhone : settings?.contact?.usdPhone) && (
              <li>
                <a href={`tel:${currency === 'ngn' ? settings?.contact?.ngnPhone : settings?.contact?.usdPhone }`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  {currency === 'ngn' ? settings?.contact?.ngnPhone : settings?.contact?.usdPhone }
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="footer-bottom text-center text-gray-500 text-sm border-t border-white/10 pt-8 mt-8">
        <p>&copy; {new Date().getFullYear()} Corstack. All rights reserved.</p>
      </div>
    </footer>
  );
}