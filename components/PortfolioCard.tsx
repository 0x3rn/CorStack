"use client";

import { useState, useRef, useEffect } from 'react';
import { ExternalLink, ArrowDown } from 'lucide-react';
import { PortfolioItem } from '../lib/types';

function PortfolioSlide({ imageUrl, isActive }: { imageUrl: string, isActive: boolean }) {
  const [isScrollingUI, setIsScrollingUI] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollDirectionRef = useRef<1 | -1>(1);
  const animationRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only enable hover auto-scroll on devices with a real mouse
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');

    const handleEnter = () => {
      if (mql.matches) startAutoScroll();
    };
    const handleLeave = () => {
      if (mql.matches) stopAutoScroll();
    };

    // On mobile: tap to toggle auto-scroll
    const handleClick = (e: MouseEvent) => {
      if (mql.matches) return; // Desktop uses hover, not click
      e.stopPropagation();
      if (isScrollingRef.current) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    };

    container.addEventListener('mouseenter', handleEnter);
    container.addEventListener('mouseleave', handleLeave);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('mouseenter', handleEnter);
      container.removeEventListener('mouseleave', handleLeave);
      container.removeEventListener('click', handleClick);
    };
  }, []);

  // Reset scroll position when the image changes (e.g. switching tabs)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    // Also stop any ongoing auto-scroll
    stopAutoScroll();
  }, [imageUrl]);

  return (
    <div className="w-full h-full flex-shrink-0 snap-center relative" style={{ touchAction: 'pan-x pan-y', overscrollBehavior: 'none' }}>
      <div 
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto hide-scroll relative z-20 cursor-ns-resize"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'none' }}
      >
        <div className="min-h-full flex flex-col">
          <img 
            src={imageUrl} 
            alt="Portfolio item"
            className="w-full object-cover select-none pointer-events-none"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              const container = scrollContainerRef.current;
              if (container && img.clientHeight > container.clientHeight) {
                setCanScroll(true);
              }
            }}
          />
        </div>
      </div>
      
      {/* Tap to scroll indicator - only show on touch devices */}
      {canScroll && (
        <div 
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 z-20 
            flex items-center gap-1.5 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full 
            text-white/90 text-xs font-bold uppercase tracking-wider border border-white/10 pointer-events-none
            md:hidden
            ${isScrollingUI ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
          `}
        >
          <span>Tap to scroll</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}

interface PortfolioCardProps {
  item: PortfolioItem;
  globalActiveView?: 'desktop' | 'mobile';
}

function CarouselWrapper({ images, viewName }: { images: string[], viewName: string }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [viewName, images]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold uppercase tracking-wider text-sm">
        {viewName} view coming soon
      </div>
    );
  }

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
    <>
      <div 
        ref={carouselRef}
        onScroll={handleScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scroll relative z-20"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none', touchAction: 'pan-x pan-y' }}
      >
        {images.map((url, idx) => (
          <PortfolioSlide key={idx} imageUrl={url} isActive={idx === activeIndex} />
        ))}
      </div>

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
    </>
  );
}

export default function PortfolioCard({ item, globalActiveView = 'desktop' }: PortfolioCardProps) {
  // Desktop and Mobile image arrays
  const desktopImages = item.desktopImageUrls || (item.imageUrl ? [item.imageUrl] : []);
  const mobileImages = item.mobileImageUrls || [];

  // Local state for mobile
  const [localActiveView, setLocalActiveView] = useState<'desktop' | 'mobile'>(
    mobileImages.length > 0 ? 'mobile' : 'desktop'
  );

  const hasBoth = desktopImages.length > 0 && mobileImages.length > 0;

  return (
    <article className="portfolio-card group flex flex-col">

      {/* Browser Header — single bar for both mobile and desktop */}
      <div className="w-full bg-[#f8fafc] px-4 py-3 flex gap-2 border-b border-black/5 relative z-10 rounded-t-xl">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
      </div>

      {/* Mobile-only tab switcher — sits between browser header and image, outside scroll container */}
      {hasBoth && (
        <div className="md:hidden flex justify-center py-3 bg-[#f8fafc] border-b border-black/5 relative z-40">
          <div className="inline-flex bg-gray-100 border border-black/5 rounded-full p-1 shadow-inner" style={{ touchAction: 'manipulation' }}>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); setLocalActiveView('desktop'); }}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                localActiveView === 'desktop'
                  ? 'bg-accent-primary text-white shadow-md'
                  : 'text-gray-500'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              Desktop View
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); setLocalActiveView('mobile'); }}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                localActiveView === 'mobile'
                  ? 'bg-accent-primary text-white shadow-md'
                  : 'text-gray-500'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              Mobile View
            </button>
          </div>
        </div>
      )}
      
      <div className="relative w-full h-[320px] overflow-hidden bg-white">
        <style>{`
          .hide-scroll::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `}</style>

        {/* Desktop View container */}
        <div className="hidden md:block w-full h-full">
          <CarouselWrapper 
            images={globalActiveView === 'desktop' ? desktopImages : mobileImages} 
            viewName={globalActiveView === 'desktop' ? 'Desktop' : 'Mobile'}
          />
        </div>

        {/* Mobile View container */}
        <div className="block md:hidden w-full h-full">
          <CarouselWrapper 
            images={localActiveView === 'desktop' ? desktopImages : mobileImages} 
            viewName={localActiveView === 'desktop' ? 'Desktop' : 'Mobile'}
          />
        </div>
      </div>
      
      <div className="portfolio-info flex flex-col gap-3 mt-4">
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
