import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Services | Corstack',
  description: 'Comprehensive web solutions for modern brands, including Custom Web Design, E-Commerce, UI/UX Strategy, and Maintenance.',
};

export default function ServicesPage() {
  return (
    <>
      <section className="hero-section" style={{ minHeight: '60vh' }}>
        <span className="hero-eyebrow">Our Expertise</span>
        <h1 className="hero-title">Comprehensive web solutions for modern brands.</h1>
        <p className="hero-subtitle">
          We combine technical precision with creative design to build websites that don&apos;t just look good—they perform.
        </p>
      </section>

      <section className="features-section">
        <div className="features-grid">
          
          <article className="feature-card">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            </svg>
            <h3 className="card-title">Custom Web Design & Development</h3>
            <p className="card-text">
              Every business has a unique story. We ensure yours is told through a bespoke design that sets you apart from competitors. We build on modern platforms to ensure your site is fast, secure, and easy for you to manage.
            </p>
            <ul className="pricing-features" style={{ marginTop: '1.5rem' }}>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg> 
                Fully Responsive (Mobile + Tablet)
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg> 
                Clean, SEO-Friendly Code
              </li>
            </ul>
          </article>

          <article className="feature-card">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3 className="card-title">E-Commerce Solutions</h3>
            <p className="card-text">
              Turn your website into a revenue-generating machine. We build intuitive, secure, and high-converting online stores that make shopping a breeze for your customers. From inventory management to seamless payment gateways, we handle the tech so you can sell.
            </p>
            <ul className="pricing-features" style={{ marginTop: '1.5rem' }}>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg> 
                Paystack & Global Payments
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg> 
                Inventory & Order Tracking
              </li>
            </ul>
          </article>

          <article className="feature-card">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 className="card-title">UI/UX Strategy</h3>
            <p className="card-text">
              Design is how it works, not just how it looks. We study your users&apos; behavior to create frictionless journeys from the landing page to the checkout. We focus on conversion rate optimization (CRO) to ensure your visitors stay engaged and take action.
            </p>
            <ul className="pricing-features" style={{ marginTop: '1.5rem' }}>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg> 
                User Journey Mapping
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg> 
                High-Fidelity Figma Mockups
              </li>
            </ul>
          </article>

          <article className="feature-card">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h3 className="card-title">1 Year Maintenance & Hosting</h3>
            <p className="card-text">
              A website needs regular care to stay fast and secure. We provide premium managed hosting and monthly maintenance packages that include security updates, cloud backups, and performance monitoring. You focus on the business; we keep the lights on.
            </p>
            <ul className="pricing-features" style={{ marginTop: '1.5rem' }}>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg> 
                24/7 Uptime Monitoring
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg> 
                Monthly Performance Reports
              </li>
            </ul>
          </article>

        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Need something custom?</h2>
        <p className="cta-subtitle">
          If you have a unique project that doesn&apos;t fit into our standard packages, we&apos;d love to chat and build a custom solution for you.
        </p>
        <div className="cta-actions">
          <Link href="/#contact" className="btn btn-white">
            Get a Custom Quote
          </Link>
        </div>
      </section>
    </>
  );
}