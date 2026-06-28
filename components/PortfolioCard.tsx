"use client";

import { useState, useRef, useEffect } from 'react';
import { ExternalLink, ArrowDown } from 'lucide-react';
import { PortfolioItem } from '../lib/types';

function PortfolioSlide({ imageUrl, isActive }: { imageUrl: string, isActive: boolean }) {
  const [hasHovered, setHasHovered] = useState(false);
  const [isScrollingUI, setIsScrollingUI] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollDirectionRef = useRef<1 | -1>(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopAutoScroll();
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
  }, [isActive]);

  const stopAutoScroll = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isScrollingRef.current = false;
    setIsScrollingUI(false);
  };

  const startAutoScroll = () => {
    if (!scrollContainerRef.current || isScrollingRef.current) return;
    
    const container = scrollContainerRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;
    
    if (maxScroll <= 0) return; // Image fits perfectly, no need to scroll
    
    isScrollingRef.current = true;
    setIsScrollingUI(true);
    const durationDown = 7500;
    const durationUp = 7500;
    const totalDuration = durationDown + durationUp;
    
    let y = container.scrollTop / maxScroll;
    if (y < 0) y = 0;
    if (y > 1) y = 1;
    
    if (y >= 0.99) scrollDirectionRef.current = -1;
    if (y <= 0.01) scrollDirectionRef.current = 1;
    
    let simulatedElapsed = 0;
    
    if (scrollDirectionRef.current === 1) {
      let t = y < 0.5 
        ? Math.sqrt(y / 2) 
        : 1 - 0.5 * Math.sqrt(Math.max(0, 2 - 2 * y));
      simulatedElapsed = t * durationDown;
    } else {
      let y_up = 1 - y;
      let t = y_up < 0.5 
        ? Math.sqrt(y_up / 2) 
        : 1 - 0.5 * Math.sqrt(Math.max(0, 2 - 2 * y_up));
      simulatedElapsed = durationDown + (t * durationUp);
    }
    
    let startTime: number | null = null;
    
    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp - simulatedElapsed;
      const elapsed = timestamp - startTime;
      
      if (elapsed < durationDown) {
        scrollDirectionRef.current = 1;
        const progress = elapsed / durationDown;
        container.scrollTop = maxScroll * easeInOut(progress);
        animationRef.current = requestAnimationFrame(animate);
      } else if (elapsed < totalDuration) {
        scrollDirectionRef.current = -1;
        const progress = (elapsed - durationDown) / durationUp;
        container.scrollTop = maxScroll * (1 - easeInOut(progress));
        animationRef.current = requestAnimationFrame(animate);
      } else {
        container.scrollTop = 0;
        isScrollingRef.current = false;
        setIsScrollingUI(false);
        scrollDirectionRef.current = 1;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleInteraction = () => {
    if (isScrollingRef.current) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  };

  const handleMouseEnter = () => {
    if (!hasHovered && isActive) {
      setHasHovered(true);
      startAutoScroll();
    }
  };

  // Determine if we should show the tap to scroll indicator at all
  // It should only show if the image is tall enough to be scrolled
  const [canScroll, setCanScroll] = useState(true);
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setCanScroll(container.scrollHeight > container.clientHeight);
    }
  }, [imageUrl]);

  return (
    <div 
      className="relative min-w-full w-full flex-none h-full overflow-hidden bg-[#f8fafc] cursor-pointer snap-center"
      onMouseEnter={handleMouseEnter}
      onClick={handleInteraction}
    >
      <div 
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden hide-scroll block"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        onWheel={stopAutoScroll}
        onTouchMove={stopAutoScroll}
      >
        <div className="min-h-full w-full flex flex-col justify-center">
          <img 
            src={imageUrl} 
            alt="Portfolio Screenshot" 
            className="w-full h-auto block" 
            draggable={false}
            onLoad={(e) => {
              const container = scrollContainerRef.current;
              if (container) setCanScroll(container.scrollHeight > container.clientHeight);
            }}
          />
        </div>
      </div>
      
      {/* Tap to scroll indicator */}
      {canScroll && (
        <button 
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 z-20 
            flex items-center gap-1.5 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full 
            text-white/90 text-xs font-bold uppercase tracking-wider border border-white/10 pointer-events-none
            ${isScrollingUI ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
          `}
        >
          <span>Tap to scroll</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

interface PortfolioCardProps {
  item: PortfolioItem;
}

export default function PortfolioCard({ item }: PortfolioCardProps) {
  const images = item.imageUrls && item.imageUrls.length > 0 
    ? item.imageUrls 
    : (item.imageUrl ? [item.imageUrl] : []);
    
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle scroll snapping to determine active image
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const width = Math.max(1, carouselRef.current.clientWidth);
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <article className="portfolio-card group">
      {/* Fake Mac Browser Header */}
      <div className="w-full bg-[#f8fafc] px-4 py-3 flex gap-2 border-b border-black/5 relative z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
      </div>
      
      <div className="relative w-full h-[320px] overflow-hidden">
        <style>{`
          .hide-scroll::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `}</style>
        
        {/* Horizontal Swiping Carousel */}
        <div 
          ref={carouselRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {images.map((url, idx) => (
            <PortfolioSlide key={idx} imageUrl={url} isActive={idx === activeIndex} />
          ))}
        </div>

        {/* Carousel Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 pointer-events-none">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-white w-3' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
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
