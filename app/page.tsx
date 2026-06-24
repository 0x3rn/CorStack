"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePricing } from '../hooks/usePricing';
import ContactForm from '../components/ContactForm';
import CheckoutModal from '../components/CheckouModal';

export default function HomePage() {
  const { currency, pricing, isLoaded } = usePricing();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');

  const handleBuyClick = (tier: string) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="home" className="hero-section">
        <span className="hero-eyebrow">Custom Web Design & Development</span>
        <h1 className="hero-title">We Build Websites That Define Your Business.</h1>
        <p className="hero-subtitle">
          Stunning, fast, and conversion-driven websites tailored for modern brands. Elevate your online presence with CorStack.
        </p>
        
        <div className="hero-actions">
          <Link href="#pricing" className="btn btn-primary">View Pricing</Link>
          <Link href="#portfolio" className="btn btn-outline">See Recent Work</Link>
        </div>

        <p className="hero-trust">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span>5-Star Rated Agency | Honest, Upfront Pricing</span>
        </p>
      </section>

      <section id="problem" className="problem-section">
        <div className="problem-content">
          <h2 className="section-title">Why most small business websites fail.</h2>
          <p className="section-text">
            Many businesses struggle with sites that load slowly, look broken on mobile phones, or simply fail to drive inquiries. Here is what we fix:
          </p>
          
          <ul className="problem-list">
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span><strong>Traffic but no leads:</strong> Visitors land on your site but leave without contacting you.</span>
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span><strong>Frustrating on mobile:</strong> Hard to read, click, or navigate on smartphones.</span>
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span><strong>Hard to find on Google:</strong> Buried on page 5 where no potential clients are looking.</span>
            </li>
          </ul>
          <p className="strong-text">Let&apos;s build a reliable foundation for your online presence.</p>
        </div>
        <div className="problem-image">
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" alt="Website Analytics Problem" />
        </div>
      </section>

      <section id="services" className="features-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Expertise</span>
          <h2 className="section-title">Web solutions built for modern brands.</h2>
          <p className="section-subtitle">We combine technical precision with creative design to build websites that don&apos;t just look good—they perform.</p>
        </div>
        
        <div className="features-grid">
          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>
            <h3 className="card-title">Custom Design & Development</h3>
            <p className="card-text">Stand out with a fully custom, beautifully designed website. We build on modern platforms to ensure your site is fast, secure, and easily manageable for your team.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <h3 className="card-title">E-Commerce Solutions</h3>
            <p className="card-text">Turn your website into a revenue-generating machine. We build intuitive, secure, and high-converting online stores that make shopping a breeze for your customers.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            <h3 className="card-title">UI/UX Strategy</h3>
            <p className="card-text">We design with your user in mind. Through intuitive navigation and engaging layouts, we ensure your visitors enjoy a frictionless journey from landing page to checkout.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <h3 className="card-title">1 Year Maintenance & Hosting</h3>
            <p className="card-text">Never worry about updates, backups, or downtime again. Let us handle the technical heavy lifting and security while you focus on running your business.</p>
          </article>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <h2 className="section-title centered">Clear, upfront pricing.</h2>
        <p className="section-subtitle centered">Know exactly what you&apos;re paying for. No hidden fees or surprise maintenance costs.</p>

        <div className="pricing-grid">
          <article className="pricing-card">
            <h3 className="pricing-name">Standard Package</h3>
            <p className="pricing-desc">Ideal for startups and local shops needing a professional online presence.</p>
            <h4 id="price-basic" className="pricing-price">
              {isLoaded ? (
                <>
                  {pricing.symbol}{pricing.basic.toLocaleString()} <span>/one-time</span>
                </>
              ) : (
                <span className="block h-[48px] w-[180px] bg-black/10 animate-pulse rounded-md"></span>
              )}
            </h4>
            <ul className="pricing-features">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Up to 5 Custom Pages</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Mobile Responsive Design</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Basic On-Page SEO</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Contact Form Integration</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> 1 Round of Revisions</li>
            </ul>
            {isLoaded ? (
              <button onClick={() => handleBuyClick('basic')} className="btn btn-secondary block-btn">
                Choose Standard
              </button>
            ) : (
              <div className="h-[64px] w-full bg-black/10 animate-pulse rounded-btn"></div>
            )}
          </article>

          <article className="pricing-card popular-tier">
            <span className="badge">Most Popular</span>
            <h3 className="pricing-name">Premium Package</h3>
            <p className="pricing-desc">For growing businesses that need more pages and lead generation tools.</p>
            <h4 id="price-growth" className="pricing-price">
              {isLoaded ? (
                <>
                  {pricing.symbol}{pricing.growth.toLocaleString()} <span>/one-time</span>
                </>
              ) : (
                <span className="block h-[48px] w-[180px] bg-white/20 animate-pulse rounded-md"></span>
              )}
            </h4>
            <ul className="pricing-features">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Up to 10 Custom Pages</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Advanced SEO Setup</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Lead Magnet Integration</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Google Analytics Setup</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> 3 Rounds of Revisions</li>
            </ul>
            {isLoaded ? (
              <button onClick={() => handleBuyClick('growth')} className="btn btn-primary block-btn inverse-btn">
                Choose Premium
              </button>
            ) : (
              <div className="h-[64px] w-full bg-white/20 animate-pulse rounded-btn"></div>
            )}
          </article>

          <article className="pricing-card">
            <h3 className="pricing-name">E-Commerce/Enterprise</h3>
            <p className="pricing-desc">Ideal for online retailers or large organizations needing complex functionalities.</p>
            <h4 className="pricing-price">Custom <span>Pricing</span></h4>
            <ul className="pricing-features">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Unlimited Scalable Pages</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Full Online Store Setup</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Secure Payment Gateway</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Initial Product Uploads</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Premium Animations</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> 90 Days Free Support Post-Launch</li>
            </ul>
            <Link href="#contact" className="btn btn-secondary block-btn">Request Quote</Link>
          </article>
        </div>

        <div className="centered" style={{ marginTop: '4.5rem', padding: '0 1rem' }}>
          <p className="section-text" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--text-main)', lineHeight: '1.8' }}>
            <span style={{ fontWeight: 700, fontSize: 'clamp(1.15rem, 3vw, 1.35rem)', display: 'block', marginBottom: '0.5rem' }}>Looking for something simpler?</span>
            If these packages offer more than you currently need, or if you just want a streamlined 1 to 3-page website, we&apos;ve got you covered. This is perfect for <strong>personal portfolios/digital resumes, single landing pages, local business &ldquo;brochures&rdquo;, or coming-soon waitlists.</strong> We can build a high-quality, scaled-down solution that perfectly fits your current budget.
            
            <span style={{ display: 'block', marginTop: '1.5rem' }}>
              <Link href="#contact" className="text-accent-primary" style={{fontWeight: 700, textDecoration: 'underline' }}>Get a budget-friendly custom quote &rarr;</Link>
            </span>
          </p>
        </div>
      </section>

      <section id="process" className="process-section">
        <h2 className="section-title centered">A straightforward process.</h2>
        <p className="section-subtitle centered">No technical jargon or endless delays. Here is how we work together.</p>
        
        <ol className="process-steps">
          <li className="step-item">
            <h4 className="step-title">Planning</h4>
            <p className="step-text">We discuss your goals, map out the required pages, and gather your text and photos.</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">Design Review</h4>
            <p className="step-text">We create a visual mockup of your site for your honest feedback and approval.</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">Development</h4>
            <p className="step-text">We write the code, optimize the images, and ensure everything is mobile-responsive.</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">Launch & Handoff</h4>
            <p className="step-text">We push the site live and show you exactly how to edit your own content moving forward.</p>
          </li>
        </ol>
      </section>

      <section id="portfolio" className="portfolio-section">
        <h2 className="section-title centered">Recent Work.</h2>
        <p className="section-subtitle centered">A look at some of the websites we&apos;ve worked on recently.</p>
        
        <div className="portfolio-grid">
          <article className="portfolio-card">
            <img src="/hirehook.png" alt="Tech Consulting Firm" />
            <div className="portfolio-info">
              <h4 className="portfolio-title">Tech Consulting Firm</h4>
              <p className="portfolio-category">SaaS</p>
            </div>
          </article>
          
          <article className="portfolio-card">
            <img src="/omnimart.png" alt="Omnimart E-Commerce Site" />
            <div className="portfolio-info">
              <h4 className="portfolio-title">Omnimart</h4>
              <p className="portfolio-category">E-Commerce Setup</p>
            </div>
          </article>
        </div>
      </section>

      <section id="contact" className="cta-section">
        <h2 className="cta-title">Let&apos;s discuss your next project.</h2>
        <p className="cta-subtitle">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
        <ContactForm />
      </section>

      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tier={selectedTier} 
        currency={currency} 
      />
    </>
  );
}