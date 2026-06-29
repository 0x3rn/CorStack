"use client";

import { useState } from 'react';
import PortfolioCard from './PortfolioCard';
import { PortfolioItem } from '../lib/types';

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
}

export default function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  const [globalActiveView, setGlobalActiveView] = useState<'desktop' | 'mobile'>('desktop');

  const hasDesktopImages = portfolio?.some(item => (item.desktopImageUrls?.length || 0) > 0) || false;
  const hasMobileImages = portfolio?.some(item => (item.mobileImageUrls?.length || 0) > 0) || false;
  const showGlobalSwitcher = hasDesktopImages && hasMobileImages;

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="centered">
        <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Portfolio</span>
        <h2 className="section-title">Selected Work</h2>
        <p className="section-subtitle">Explore some of our recent projects and see how thoughtful design and development can tranform an online presence.</p>
        
        {/* Global Tab Switcher (Hidden on mobile) */}
        {showGlobalSwitcher && (
          <div className="hidden md:flex justify-center mt-8">
            <div className="inline-flex bg-gray-100 border border-black/5 rounded-full p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setGlobalActiveView('desktop')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  globalActiveView === 'desktop'
                    ? 'bg-accent-primary text-white shadow-md'
                    : 'text-gray-500 hover:text-black hover:bg-gray-200/50'
                }`}
              >
                Web View
              </button>
              <button
                type="button"
                onClick={() => setGlobalActiveView('mobile')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  globalActiveView === 'mobile'
                    ? 'bg-accent-primary text-white shadow-md'
                    : 'text-gray-500 hover:text-black hover:bg-gray-200/50'
                }`}
              >
                Mobile View
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="portfolio-grid mt-12">
        {portfolio && portfolio.length > 0 ? (
          portfolio.map(item => (
            <PortfolioCard key={item.id} item={item} globalActiveView={globalActiveView} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            Portfolio items will appear here once added in the admin dashboard.
          </div>
        )}
      </div>
    </section>
  );
}
