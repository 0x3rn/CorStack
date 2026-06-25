"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePricing } from '../hooks/usePricing';
import ContactForm from '../components/ContactForm';
import ProjectModal from '../components/ProjectModal';

export default function HomePage() {
  const { currency, symbol, pricingTiers, portfolioItems, isLoaded } = usePricing();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');

  const handleBuyClick = (tier: string, priceText: string) => {
    setSelectedTier(`${tier} (${symbol}${priceText})`);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="home" className="hero-section">
        <span className="hero-eyebrow">Custom Web Design & Development</span>
        <h1 className="hero-title">Your Next Website Should Do More Than Look Good.</h1>
        <p className="hero-subtitle">
          Custom websites built for brands, creators, startups, professionals, and organizations that want to make stronger online impression. We combine thoughtful design, modern development, and user-focused strategy to create websites that are fast, engaging, and built around your goals.
        </p>
        
        <div className="hero-actions">
          <Link href="#pricing" className="btn btn-primary">Start Your Project</Link>
          <Link href="#portfolio" className="btn btn-outline">View Our Work</Link>
        </div>

        <p className="hero-trust">
          {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> */}
          <span>Fast Delivery | Mobile Optimized |Transparent Pricing</span>
        </p>
      </section>

      <section id="client-types" className="features-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Who We Work With</span>
          <h2 className="section-title">Built For More Than Just Businesses.</h2>
          <p className="section-subtitle">Whether you&apos;re launching a startup, growing a personal brand, running an organization, selling products online, or upgrading an existing presence, your website should represent you professionally and help you achieve your goals. We build digital experiences tailored to your goals.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            <h3 className="card-title">Startups</h3>
            <p className="card-text">Launch with professional online presence that builds credibility from day one and helps you attract customers, investors, and partners.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <h3 className="card-title">Creators & Personal Brands</h3>
            <p className="card-text">Showcase your work, tell your story, and create a platform that reflects your unique identity.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <h3 className="card-title">Small Businesses</h3>
            <p className="card-text">Build trust, generate inquiries, and create a seamless experience for potential customers.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <h3 className="card-title">Online Stores</h3>
            <p className="card-text">Turn visitors into customers with a shopping experience designed for potential customers.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <h3 className="card-title">Professionals & Consultants</h3>
            <p className="card-text">Position yourself as an authority in your field with a website that highlights your expertise and services.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <h3 className="card-title">Organizations & Nonprofits</h3>
            <p className="card-text">Communicate your mission clearly and connect with supporters, donors, volunteers and communities.</p>
          </article>
        </div>
      </section>

      <section id="problem" className="problem-section">
        <div className="problem-content max-w-[800px] mx-auto flex flex-col items-center">
          <span className="hero-eyebrow text-center w-full" style={{ display: 'block', marginBottom: '1rem' }}>The Problem</span>
          <h2 className="section-title text-center w-full" style={{ marginLeft: 0 }}>Your website should be working for you</h2>
          <div className="w-full">
            <p className="section-text text-left" style={{ marginTop: '1rem' }}>
              Many websites fail to deliver meaningful results. They look outdated, perform poorly on mobile devices, or make it difficult for visitors to take action. A website should be one of your most valuable digital assets. <br/>Here are common issues we fix:
            </p>
            
            <ul className="problem-list" style={{ marginTop: '1rem' }}>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span><strong>Slow loading speeds & Outdated design:</strong> Visitors land on your site but leave without contacting you.</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span><strong>Poor mobile design & experience:</strong> Hard to read, click, or navigate on smartphones.</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span><strong>Low visibility on search engines:</strong> Buried on page 5 of search results where no potential clients are looking.</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span><strong>Your website not reflecting the quality of your work/brand.</strong></span>
              </li>
            </ul>
            <p className="strong-text text-center w-full" style={{ marginTop: '2rem' }}>Let&apos;s build a reliable foundation for your online presence.</p>
          </div>
        </div>
      </section>

      <section id="trust" className="features-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Why Choose Corstack</span>
          <h2 className="section-title">Designed With Purpose. Built for Results.</h2>
          <p className="section-subtitle">We don't believe in one-size-fits-all solutions. Every project is approached with careful planning, thoughtful design, and a focus on long-term value.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <h3 className="card-title">Custom Built</h3>
            <p className="card-text">Every website is tailored to your goals, audience, and brand identity.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            <h3 className="card-title">Mobile First</h3>
            <p className="card-text">Your website will look and perform beautifully on phones, tablets, and desktops.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <h3 className="card-title">Fast Performance</h3>
            <p className="card-text">Optimized for speed, usability, and a smooth browsing experience.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3 className="card-title">SEO Ready</h3>
            <p className="card-text">Built with clean structure and best practices that help search engines understand your content.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            <h3 className="card-title">Ongoing Support</h3>
            <p className="card-text">We&apos;re available after launch to assist with updates, maintenance, and future improvements.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <h3 className="card-title">Clear Pricing</h3>
            <p className="card-text">No hidden costs, confusing packages, or unexpected invoices.</p>
          </article>
        </div>
      </section>

      <section id="services" className="features-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Services</span>
          <h2 className="section-title">Everything You Need To Build a Strong Online Presence</h2>
          <p className="section-subtitle">From simple landing pages to complex e-commerce platforms, we create websites that combine attractive design with reliable functionality.</p>
        </div>
        
        <div className="features-grid">
          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <h3 className="card-title">Custom Website Design</h3>
            <p className="card-text">Unique, professionally crafted designs that help you stand out online.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <h3 className="card-title">Website Development</h3>
            <p className="card-text">Modern, responsive, secure, fast, and scalable web applications built with the latest technologies.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            <h3 className="card-title">Website Redesigns</h3>
            <p className="card-text">Transform outdated websites into modern experiences that better represent your brand.</p>
          </article>

          <article className="feature-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <h3 className="card-title">Hosting & Maintenance</h3>
            <p className="card-text">Reliable hosting, security updates, backups, and ongoing technical support.</p>
          </article>
        </div>
      </section>

      <section id="portfolio" className="portfolio-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Portfolio</span>
          <h2 className="section-title">Selected Work</h2>
          <p className="section-subtitle">Explore some of our recent projects and see how thoughtful design and development can tranform an online presence.</p>
        </div>
        
        <div className="portfolio-grid">
          {portfolioItems && portfolioItems.length > 0 ? (
            portfolioItems.map(item => (
              <article key={item.id} className="portfolio-card">
                <img src={item.imageUrl} alt={item.title} />
                <div className="portfolio-info">
                  <h4 className="portfolio-title">{item.title}</h4>
                  <p className="portfolio-category">{item.category}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              Portfolio items will appear here once added in the admin dashboard.
            </div>
          )}
        </div>
      </section>

      <section id="process" className="process-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Process</span>
          <h2 className="section-title">A straightforward process.</h2>
          <p className="section-subtitle">Great projects come from collaboration, transparency, and clear communication. Here's how we bring your website to life</p>
        </div>
        
        <ol className="process-steps">
          <li className="step-item">
            <h4 className="step-title">Discovery</h4>
            <p className="step-text">We learn about your goals, audience, requirements, and vision for the project.</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">Design & Wireframing</h4>
            <p className="step-text">We ceate a visual direction and gather feedback to ensure everything aligns with your expectations.</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">Development</h4>
            <p className="step-text">The approved design is transormed into a fully functional, responsive website.</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">Testing & Launch</h4>
            <p className="step-text">We thoroughly test every aspect of the website to ensure it is bug-free and fully functional before launching it to ensure everything works flawlessly.</p>
          </li>
        </ol>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Pricing</span>
          <h2 className="section-title">Clear, upfront pricing.</h2>
          <p className="section-subtitle">Choose the option that best fits your needs, or contact us for a custom quote tailored to your project.</p>
        </div>

        <div className="pricing-grid">
          {pricingTiers && pricingTiers.length > 0 ? (
            pricingTiers.map(tier => (
              <article key={tier.id} className={`pricing-card ${tier.isPopular ? 'popular-tier' : ''}`}>
                {tier.isPopular && <span className="badge">Most Popular</span>}
                <h3 className="pricing-name">{tier.name}</h3>
                <p className="pricing-desc">{tier.desc}</p>
                <h4 id={`price-${tier.id}`} className="pricing-price">
                  {isLoaded ? (
                    <>
                      {symbol}{currency === 'usd' ? tier.priceUsd : tier.priceNgn}
                    </>
                  ) : (
                    <span className={`block h-[48px] w-[180px] ${tier.isPopular ? 'bg-white/20' : 'bg-black/10'} animate-pulse rounded-md`}></span>
                  )}
                </h4>
                <ul className="pricing-features">
                  {tier.features.map((feature, idx) => (
                    <li key={idx}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> {feature}</li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {isLoaded ? (
                    <button onClick={() => handleBuyClick(tier.name, currency === 'usd' ? tier.priceUsd : tier.priceNgn)} className={`btn block-btn ${tier.isPopular ? 'btn-primary inverse-btn' : 'btn-dark'}`}>
                      Start Project
                    </button>
                  ) : (
                    <div className={`h-[64px] w-full ${tier.isPopular ? 'bg-white/20' : 'bg-black/10'} animate-pulse rounded-btn`}></div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              Pricing tiers will appear here once added in the admin dashboard.
            </div>
          )}
        </div>

        {/* <div className="centered" style={{ marginTop: '4.5rem', padding: '0 1rem' }}>
          <p className="section-text" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--text-main)', lineHeight: '1.8' }}>
            <span style={{ fontWeight: 700, fontSize: 'clamp(1.15rem, 3vw, 1.35rem)', display: 'block', marginBottom: '0.5rem' }}>Need Something Smaller?</span>
            Not every project requires a large website. If you're looking for a portfolio, landing page, digital resume, event website, or waitlist page, we can create a streamlined solution that fits your goals and budget.
            <span style={{ display: 'block', marginTop: '1.5rem' }}>
              <Link href="#contact" className="text-accent-primary" style={{fontWeight: 700, textDecoration: 'underline' }}>Get a budget-friendly custom quote &rarr;</Link>
            </span>
          </p>
        </div> */}
      </section>

      <section id="faq" className="features-section" style={{ backgroundColor: 'var(--color-bg-light)', paddingBottom: '6rem' }}>
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Have questions? We have answers. If you don&apos;t see your question here, feel free to reach out.</p>
        </div>
        
        <div className="max-w-[800px] mx-auto flex flex-col gap-4 px-[5%]">
          <details className="group bg-white p-6 rounded-lg border border-black/[0.03] shadow-soft cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center font-bold text-lg list-none outline-none [&::-webkit-details-marker]:hidden">
              How long does a project take?
              <span className="transition-transform duration-300 group-open:rotate-180 text-accent-primary shrink-0 ml-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-4 text-text-muted leading-relaxed">
              Most websites are completed within two to six weeks depending on complexity and content requirements.
            </p>
          </details>

          <details className="group bg-white p-6 rounded-lg border border-black/[0.03] shadow-soft cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center font-bold text-lg list-none outline-none [&::-webkit-details-marker]:hidden">
              Will my website work on mobile devices?
              <span className="transition-transform duration-300 group-open:rotate-180 text-accent-primary shrink-0 ml-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-4 text-text-muted leading-relaxed">
              Absolutely. Every website we build is fully responsive and optimized for all screen sizes, ensuring a seamless experience for your visitors on phones, tablets, and desktops.
            </p>
          </details>

          <details className="group bg-white p-6 rounded-lg border border-black/[0.03] shadow-soft cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center font-bold text-lg list-none outline-none [&::-webkit-details-marker]:hidden">
              Can I update the website myself?
              <span className="transition-transform duration-300 group-open:rotate-180 text-accent-primary shrink-0 ml-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-4 text-text-muted leading-relaxed">
              Yes. We can provide a user-friendly content management system and guidance on making updates, so you can easily manage your content without needing technical skills.
            </p>
          </details>

          <details className="group bg-white p-6 rounded-lg border border-black/[0.03] shadow-soft cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center font-bold text-lg list-none outline-none [&::-webkit-details-marker]:hidden">
              Do you provide hosting?
              <span className="transition-transform duration-300 group-open:rotate-180 text-accent-primary shrink-0 ml-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-4 text-text-muted leading-relaxed">
              Yes. Hosting and maintenance options are available for clients who want a hands-off experience. We handle the technical heavy lifting, backups, and security.
            </p>
          </details>

          <details className="group bg-white p-6 rounded-lg border border-black/[0.03] shadow-soft cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center font-bold text-lg list-none outline-none [&::-webkit-details-marker]:hidden">
              What happens after launch?
              <span className="transition-transform duration-300 group-open:rotate-180 text-accent-primary shrink-0 ml-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-4 text-text-muted leading-relaxed">
              We&apos;re available to provide support, maintenance, and future enhancements as your needs evolve. We view our client relationships as long-term partnerships.
            </p>
          </details>

          <details className="group bg-white p-6 rounded-lg border border-black/[0.03] shadow-soft cursor-pointer transition-all duration-300">
            <summary className="flex justify-between items-center font-bold text-lg list-none outline-none [&::-webkit-details-marker]:hidden">
              Do I need to provide the content?
              <span className="transition-transform duration-300 group-open:rotate-180 text-accent-primary shrink-0 ml-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-4 text-text-muted leading-relaxed">
              Generally, yes, because you know your business best. However, if you need assistance, we can guide you on what to write or recommend professional copywriters to help shape your message.
            </p>
          </details>
        </div>
      </section>

      <section id="contact" className="cta-section">
        <h2 className="cta-title">Let&apos;s discuss your next project.</h2>
        <p className="cta-subtitle">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
        <ContactForm />
      </section>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tier={selectedTier} 
        currency={currency} 
      />
    </>
  );
}