"use client";

import { useState, useRef, useEffect } from 'react';
import { ExternalLink, ArrowDown } from 'lucide-react';
import { PortfolioItem, PortfolioImage } from '../lib/types';

function PortfolioSlide({ image, isActive, isHome }: { image: PortfolioImage, isActive: boolean, isHome?: boolean }) {
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
    if (isHome) return;
    if (!scrollContainerRef.current || isScrollingRef.current) return;
    
    const container = scrollContainerRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;
    
    if (maxScroll <= 0) return; 
    
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
    if (isHome) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');

    const handleEnter = () => {
      if (mql.matches) startAutoScroll();
    };
    const handleLeave = () => {
      if (mql.matches) stopAutoScroll();
    };

    const handleClick = (e: MouseEvent) => {
      if (mql.matches) return; 
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
  }, [isHome]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    stopAutoScroll();
  }, [image.url]);

  return (
    <div className="w-full h-full flex-shrink-0 snap-center relative" style={{ touchAction: 'pan-x pan-y', overscrollBehavior: 'none' }}>
      <div 
        ref={scrollContainerRef}
        className={`w-full h-full relative z-20 ${isHome ? 'overflow-hidden pointer-events-none' : 'overflow-y-auto cursor-ns-resize'} hide-scroll`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'none' }}
      >
        <div className="min-h-full flex flex-col">
          <img 
            src={image.url} 
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
      
      {canScroll && !isHome && (
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

function CarouselWrapper({ images, isHome, isMobileMockup }: { images: PortfolioImage[], isHome?: boolean, isMobileMockup?: boolean }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [images]);

  if (images.length === 0) {
    return null;
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
    <div className="flex flex-col h-full">
      {/* Header Mockup */}
      <div className={`w-full bg-[#f8fafc] px-4 py-3 flex gap-2 border border-black/5 relative z-10 ${isMobileMockup ? 'rounded-t-[2rem] justify-center items-center h-10' : 'rounded-t-xl'}`}>
        {isMobileMockup ? (
          <div className="w-12 h-1.5 rounded-full bg-black/10"></div>
        ) : (
          <>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
          </>
        )}
      </div>

      {/* Image Container */}
      <div className={`relative w-full ${isHome ? 'h-[320px]' : (isMobileMockup ? 'h-[480px]' : 'h-[320px] sm:h-[480px]')} overflow-hidden bg-white border-x border-b border-black/5 ${isMobileMockup ? 'rounded-b-[2rem]' : 'rounded-b-xl'}`}>
        <div 
          ref={carouselRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scroll relative z-20"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none', touchAction: 'pan-x pan-y' }}
        >
          {images.map((img, idx) => (
            <PortfolioSlide key={idx} image={img} isActive={idx === activeIndex} isHome={isHome} />
          ))}
        </div>
      </div>

      {/* Image Description */}
      {!isHome && images[activeIndex]?.description && (
        <p className="mt-3 text-[0.9rem] text-text-muted px-2 italic border-l-2 border-accent-primary/30">
          {images[activeIndex].description}
        </p>
      )}

      {/* Dots Indicator */}
      {!isHome && images.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-accent-primary w-3' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PortfolioCardProps {
  item: PortfolioItem;
  globalActiveView?: 'desktop' | 'mobile'; // Kept for interface compatibility but unused in side-by-side
  isHome?: boolean;
}

export default function PortfolioCard({ item, isHome = false }: PortfolioCardProps) {
  // Extract images, falling back to legacy fields if needed
  const desktopImages: PortfolioImage[] = item.desktopImages 
    || (item.desktopImageUrls?.map(url => ({ url })) || (item.imageUrl ? [{ url: item.imageUrl }] : []));
  const mobileImages: PortfolioImage[] = item.mobileImages 
    || (item.mobileImageUrls?.map(url => ({ url })) || []);

  const hasDesktop = desktopImages.length > 0;
  const hasMobile = mobileImages.length > 0;

  // On homepage, we only show desktop images, and we show them full width (simple)
  if (isHome) {
    return (
      <article className="portfolio-card group flex flex-col">
        {hasDesktop ? (
          <CarouselWrapper images={desktopImages} isHome={true} />
        ) : (
          <div className="w-full h-[320px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">No Image</div>
        )}
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

  // Full Portfolio Page: Side-by-Side layout
  return (
    <article className="portfolio-card group flex flex-col mb-16 last:mb-0">
      <style>{`
        .hide-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
        <p className="text-accent-primary font-semibold text-sm tracking-wide uppercase">{item.category}</p>
        {item.description && (
          <p className="text-[1rem] text-text-muted mt-4 max-w-3xl leading-relaxed">{item.description}</p>
        )}
        {item.websiteUrl && (
          <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-black hover:text-accent-primary mt-4 transition-colors">
            Visit Live Project
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className={`grid gap-8 items-start ${hasDesktop && hasMobile ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {hasDesktop && (
          <div className={`${hasMobile ? 'lg:col-span-8' : ''}`}>
            <CarouselWrapper images={desktopImages} isHome={false} isMobileMockup={false} />
          </div>
        )}
        
        {hasMobile && (
          <div className={`${hasDesktop ? 'lg:col-span-4' : 'max-w-sm mx-auto w-full'}`}>
            <CarouselWrapper images={mobileImages} isHome={false} isMobileMockup={true} />
          </div>
        )}
      </div>
    </article>
  );
}
