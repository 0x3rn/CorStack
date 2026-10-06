"use client";
import Image from "next/image";

import { useState, useRef, useEffect, useCallback } from 'react';
import { ExternalLink, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioItem, PortfolioImage } from '../lib/types';

function PortfolioSlide({ image, title, active, isHome, isMobileMockup }: { image: PortfolioImage, title: string, active: boolean, isHome?: boolean, isMobileMockup?: boolean }) {
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

  const stopAutoScroll = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isScrollingRef.current = false;
    setIsScrollingUI(false);
  }, []);

  const startAutoScroll = useCallback(() => {
    if (isHome || !active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
      const t = y < 0.5
        ? Math.sqrt(y / 2) 
        : 1 - 0.5 * Math.sqrt(Math.max(0, 2 - 2 * y));
      simulatedElapsed = t * durationDown;
    } else {
      const y_up = 1 - y;
      const t = y_up < 0.5
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
  }, [isHome, active]);

  useEffect(() => {
    if (isHome || !active) return;
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
      // Runs when this slide becomes inactive (or unmounts), halting any in-progress scroll.
      stopAutoScroll();
    };
  }, [isHome, active, startAutoScroll, stopAutoScroll]);

  return (
    <div className="w-full h-full flex-shrink-0 snap-center relative" style={{ touchAction: 'pan-x pan-y', overscrollBehavior: 'none' }}>
      <div 
        ref={scrollContainerRef}
        tabIndex={isHome || !active ? -1 : 0}
        role={isHome ? undefined : 'region'}
        aria-label={isHome ? undefined : `${title} screenshot, scroll to explore`}
        className={`w-full h-full relative z-20 ${isHome ? 'overflow-hidden pointer-events-none' : 'overflow-y-auto cursor-ns-resize'} hide-scroll`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'none' }}
      >
        <Image unoptimized width={isMobileMockup ? 1200 : 1600} height={isMobileMockup ? 1600 : 1200}
          src={image.url}
          alt={`${title} ${isMobileMockup ? 'mobile' : 'desktop'} preview${image.description ? ': ' + image.description : ''}`}
          className={`portfolio-mockup-image select-none pointer-events-none ${isHome ? "" : "portfolio-mockup-image-scrollable"}`}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            const container = scrollContainerRef.current;
            if (container && img.clientHeight > container.clientHeight) {
              setCanScroll(true);
            }
          }}
        />
      </div>
      
      {canScroll && !isHome && (
        <div 
          className={`absolute top-4 left-1/2 -translate-x-1/2 transition-all duration-500 z-20 
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

function CarouselWrapper({ images, title, isHome, isMobileMockup }: { images: PortfolioImage[], title: string, isHome?: boolean, isMobileMockup?: boolean }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasControls = !isHome && images.length > 1;

  const handleScroll = () => {
    const container = carouselRef.current;
    if (container) setActiveIndex(Math.min(images.length - 1, Math.max(0, Math.round(container.scrollLeft / Math.max(1, container.clientWidth)))));
  };

  const showSlide = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollTo({ left: index * container.clientWidth, behavior: reduceMotion ? 'instant' : 'smooth' });
  };

  if (!images.length) return null;

  return (
    <div className="portfolio-carousel">
      <div className="portfolio-mockup" data-device={isMobileMockup ? 'phone' : 'desktop'}>
        <div className={`portfolio-mockup-toolbar relative ${isMobileMockup ? 'justify-center' : ''}`}>
          <div aria-hidden="true" className="flex items-center gap-2">
            {isMobileMockup ? <div className="w-12 h-1.5 rounded-full bg-black/10" /> : <>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </>}
          </div>
          {hasControls && (
            <div className="absolute right-2 inset-y-0 flex items-center gap-1" aria-label={`${title} images`}>
              <button type="button" onClick={() => showSlide((activeIndex - 1 + images.length) % images.length)} className="portfolio-gallery-control" aria-label="Previous image">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-text-muted tabular-nums min-w-8 text-center" aria-live="polite">{activeIndex + 1} / {images.length}</span>
              <button type="button" onClick={() => showSlide((activeIndex + 1) % images.length)} className="portfolio-gallery-control" aria-label="Next image">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="portfolio-mockup-viewport">
          <div ref={carouselRef} onScroll={handleScroll} className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar z-20" style={{ overscrollBehaviorX: 'contain' }}>
            {images.map((image, index) => (
              <PortfolioSlide key={`${index}:${image.url}`} image={image} title={title} active={activeIndex === index} isHome={isHome} isMobileMockup={isMobileMockup} />
            ))}
          </div>
          {!isHome && images[activeIndex]?.description && (
            <p className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/75 to-transparent px-5 pt-8 pb-4 text-sm text-white pointer-events-none">{images[activeIndex].description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyMockup({ isMobile }: { isMobile?: boolean }) {
  return (
    <div className="portfolio-mockup" data-device={isMobile ? 'phone' : 'desktop'}>
      <div className="portfolio-mockup-toolbar" aria-hidden="true" />
      <div className="portfolio-mockup-viewport"><span className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">Preview coming soon</span></div>
    </div>
  );
}

interface PortfolioCardProps {
  item: PortfolioItem;
  isHome?: boolean;
}

export default function PortfolioCard({ item, isHome = false }: PortfolioCardProps) {
  const desktopImages = item.desktopImages?.length ? item.desktopImages : (item.desktopImageUrls?.map(url => ({ url })) || (item.imageUrl ? [{ url: item.imageUrl }] : []));
  const mobileImages = item.mobileImages?.length ? item.mobileImages : (item.mobileImageUrls?.map(url => ({ url })) || []);
  const desktopPreview = desktopImages.length ? desktopImages : mobileImages;
  const mobilePreview = mobileImages.length ? mobileImages : desktopImages;

  return (
    <article className="portfolio-card group flex flex-col min-w-0">
      <div className="hidden md:block">
        {desktopPreview.length ? <CarouselWrapper key={desktopPreview.map(image => image.url).join('|')} images={desktopPreview} title={item.title} isHome={isHome} /> : <EmptyMockup />}
      </div>
      <div className="md:hidden">
        {mobilePreview.length ? <CarouselWrapper key={mobilePreview.map(image => image.url).join('|')} images={mobilePreview} title={item.title} isHome={isHome} isMobileMockup /> : <EmptyMockup isMobile />}
      </div>
      <div className="portfolio-info flex flex-col gap-3 flex-1">
        <div>
          <h3 className="portfolio-title">{item.title}</h3>
          <p className="portfolio-category">{item.category}</p>
          {item.description && <p className="text-[0.95rem] text-text-muted mt-3 leading-relaxed">{item.description}</p>}
        </div>
        {item.websiteUrl && (
          <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex self-start items-center gap-1.5 text-sm font-bold text-accent-primary hover:underline mt-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary">
            Visit Website <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </article>
  );
}
