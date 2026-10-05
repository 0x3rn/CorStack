'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.08, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    const context = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      document.querySelectorAll('.feature-card, .pricing-card, .portfolio-card, .step-item, .section-title').forEach(element => {
        if (isMobile && element.classList.contains('portfolio-card')) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) return;
        gsap.fromTo(element, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 85%', once: true } });
      });
    });
    const handleAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (!anchor?.hash || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      if (anchor.origin !== location.origin || anchor.pathname !== location.pathname) return;
      let element: HTMLElement | null;
      try { element = document.getElementById(decodeURIComponent(anchor.hash.slice(1))); } catch { return; }
      if (!element) return;
      event.preventDefault();
      lenis.scrollTo(element, { offset: -80, duration: 1.2 });
      history.replaceState(history.state, '', anchor.hash);
    };
    document.addEventListener('click', handleAnchorClick);
    return () => { document.removeEventListener('click', handleAnchorClick); context.revert(); lenis.destroy(); };
  }, [pathname]);
  return children;
}
