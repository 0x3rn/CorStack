"use client";

import { useState } from 'react';
import { ExternalLink, ArrowDown } from 'lucide-react';
import { PortfolioItem } from '../lib/types';

interface PortfolioCardProps {
  item: PortfolioItem;
}

export default function PortfolioCard({ item }: PortfolioCardProps) {
  const [hasHovered, setHasHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const triggerScroll = () => {
    if (isScrolling) return;
    setIsScrolling(true);
    // The animation takes 10s (5s down, 5s up)
    setTimeout(() => {
      setIsScrolling(false);
    }, 10000);
  };

  const handleMouseEnter = () => {
    if (!hasHovered) {
      setHasHovered(true);
      triggerScroll();
    }
  };

  return (
    <article className="portfolio-card group" onMouseEnter={handleMouseEnter}>
      {/* Fake Mac Browser Header */}
      <div className="w-full bg-[#f8fafc] px-4 py-3 flex gap-2 border-b border-black/5 relative z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
      </div>
      
      <div className="relative overflow-hidden w-full h-[320px] bg-[#f8fafc] flex items-center justify-center">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className={`w-[115%] max-w-none h-full object-cover hover-scroll-img ${isScrolling ? 'animate-scroll-portfolio' : ''}`} 
        />
        
        {/* Transparent Overlay Button at bottom */}
        <button 
          onClick={triggerScroll}
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500 z-20 
            flex items-center gap-1.5 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full 
            text-white/90 text-xs font-bold uppercase tracking-wider border border-white/10
            ${isScrolling ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}
          `}
        >
          <span>Tap to scroll</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="portfolio-info flex flex-col gap-3">
        <div>
          <h4 className="portfolio-title">{item.title}</h4>
          <p className="portfolio-category">{item.category}</p>
          {item.description && (
            <p className="text-[0.95rem] text-text-muted mt-3 leading-relaxed">{item.description}</p>
          )}
        </div>
        {item.websiteUrl && (
          <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-primary hover:underline mt-auto">
            Visit Website
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </article>
  );
}
