"use client";
import { useEffect, useRef } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    // Detect mobile viewport — skip portfolio-card animations on mobile
    // to prevent conflicts with the CSS transform lock
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    const elementsToAnimate = document.querySelectorAll(
      ".feature-card, .pricing-card, .portfolio-card, .step-item, .section-title"
    );

    elementsToAnimate.forEach((el) => {
      // Skip portfolio-card GSAP transforms on mobile
      // (CSS locks transform to prevent hover shift, GSAP would fight it)
      if (isMobile && el.classList.contains('portfolio-card')) return;

      // Only animate elements that are below the initial viewport to prevent hydration flashes
      const rect = el.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (!inViewport) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    });

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a") as HTMLAnchorElement | null;

      if (anchor && anchor.hash && anchor.hash !== "") {
        const isLocal =
          anchor.origin === window.location.origin &&
          anchor.pathname === window.location.pathname;

        if (isLocal) {
          e.preventDefault();
          
          lenisRef.current?.lenis?.scrollTo(anchor.hash, {
            offset: -80,
            duration: 2.5,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  // Disable smooth scrolling on touch devices to prevent flicker/repaint loops
  const isTouchSSR = false; // SSR safe default
  
  return (
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.08, smoothWheel: true, touchMultiplier: 0 }}>
      {children as any}
    </ReactLenis>
  );
}