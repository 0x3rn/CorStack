import Link from 'next/link';
import ContactForm from '../components/ContactForm';
import ClientPricing from '../components/ClientPricing';
import PortfolioSection from '../components/PortfolioSection';
import { DynamicIcon } from '../components/DynamicIcon';
import { getPublicContent } from '../lib/db/content';
import { XCircle, PenTool, Smartphone, Zap, Rocket, LifeBuoy, CheckCircle, ExternalLink, ChevronDown } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute if using statically generated layout

export default async function HomePage() {
  const content = await getPublicContent();
  const { pricing, portfolio, services, clientTypes, process, settings } = content;

  // Filter portfolio to only show items marked for the homepage snippet
  const homePortfolio = portfolio.filter(item => item.showOnHome !== false);

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "Corstack",
            "url": "https://corstack.dev",
            "logo": "https://corstack.dev/icon.png",
            "image": "https://corstack.dev/icon.png",
            "description": "Corstack is a premium web design and development agency based in Lagos, Nigeria. We specialize in custom website design, frontend development, mobile-first design, e-commerce development, and SEO-optimized web solutions. If you are looking for the best web designers and developers in Nigeria to build fast, beautiful, and conversion-driven websites, Corstack is your top choice.",
            "email": "hello@corstack.dev",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Lagos",
              "addressCountry": "Nigeria"
            },
            "sameAs": [
              "https://x.com/corstackdev",
              "https://instagram.com/corstack.dev"
            ],
            "priceRange": "$$",
            "areaServed": "NG",
            "serviceType": "Web Design & Development"
          })
        }}
      />
      <section id="home" className="hero-section">
        {settings?.general?.isAcceptingProjects && (
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Currently accepting new projects
          </div>
        )}
        <span className="hero-eyebrow">Custom Web Design & Development</span>
        <h1 className="hero-title">{settings?.general?.heroHeadline}</h1>
        <p className="hero-subtitle">
          {settings?.general?.heroSubtitle}
        </p>
        
        <div className="hero-actions">
          <Link href="#pricing" className="btn btn-primary">Start Your Project</Link>
          <Link href="#portfolio" className="btn btn-outline">View Our Work</Link>
        </div>

        <p className="hero-trust">
          <span>Fast Delivery | Mobile Optimized | Transparent Pricing</span>
        </p>
      </section>

      <section id="client-types" className="features-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Who We Work With</span>
          <h2 className="section-title">Built For More Than Just Businesses.</h2>
          <p className="section-subtitle">Whether you&apos;re launching a startup, growing a personal brand, running an organization, selling products online, or upgrading an existing presence, your website should represent you professionally and help you achieve your goals. We build digital experiences tailored to your goals.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          {clientTypes && clientTypes.length > 0 ? (
            clientTypes.map(client => (
              <article key={client.id || client.title} className="feature-card">
                <DynamicIcon name={client.iconName} size={32} />
                <h3 className="card-title">{client.title}</h3>
                <p className="card-text">{client.description}</p>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              Loading...
            </div>
          )}
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
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-[0.2rem]" />
                <span><strong>Slow loading speeds & Outdated design:</strong> Visitors land on your site but leave without contacting you.</span>
              </li>
              <li>
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-[0.2rem]" />
                <span><strong>Poor mobile design & experience:</strong> Hard to read, click, or navigate on smartphones.</span>
              </li>
              <li>
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-[0.2rem]" />
                <span><strong>Low visibility on search engines:</strong> Buried on page 5 of search results where no potential clients are looking.</span>
              </li>
              <li>
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-[0.2rem]" />
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          <article className="feature-card">
            <PenTool />
            <h3 className="card-title">Custom Built</h3>
            <p className="card-text">Every website is tailored to your goals, audience, and brand identity.</p>
          </article>

          <article className="feature-card">
            <Smartphone />
            <h3 className="card-title">Mobile First</h3>
            <p className="card-text">Your website will look and perform beautifully on phones, tablets, and desktops.</p>
          </article>

          <article className="feature-card">
            <Zap />
            <h3 className="card-title">Fast Performance</h3>
            <p className="card-text">Optimized for speed, usability, and a smooth browsing experience.</p>
          </article>

          <article className="feature-card">
            <Rocket />
            <h3 className="card-title">SEO Ready</h3>
            <p className="card-text">Built with clean structure and best practices that help search engines understand your content.</p>
          </article>

          <article className="feature-card">
            <LifeBuoy />
            <h3 className="card-title">Ongoing Support</h3>
            <p className="card-text">We&apos;re available after launch to assist with updates, maintenance, and future improvements.</p>
          </article>

          <article className="feature-card">
            <CheckCircle />
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
          {services && services.length > 0 ? (
            services.map(service => (
              <article key={service.id || service.title} className="feature-card">
                <DynamicIcon name={service.iconName} size={32} />
                <h3 className="card-title">{service.title}</h3>
                <p className="card-text">{service.description}</p>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              Loading...
            </div>
          )}
        </div>
      </section>

      <PortfolioSection portfolio={homePortfolio} isHome={true} />

      <section id="process" className="process-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Process</span>
          <h2 className="section-title">A straightforward process.</h2>
          <p className="section-subtitle">Great projects come from collaboration, transparency, and clear communication. Here's how we bring your website to life</p>
        </div>
        
        <ol className="process-steps">
          {process && process.length > 0 ? (
            process.map(step => (
              <li key={step.id || step.title} className="step-item">
                <h4 className="step-title">{step.title}</h4>
                <p className="step-text">{step.description}</p>
              </li>
            ))
          ) : (
            <div className="w-full text-center text-gray-500 py-12">
              Loading...
            </div>
          )}
        </ol>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="centered">
          <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Pricing</span>
          <h2 className="section-title">Clear, upfront pricing.</h2>
          <p className="section-subtitle">Choose the option that best fits your needs, or contact us for a custom quote tailored to your project.</p>
        </div>

        <ClientPricing pricingTiers={pricing} />
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
                <ChevronDown className="w-6 h-6" />
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
                <ChevronDown className="w-6 h-6" />
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
                <ChevronDown className="w-6 h-6" />
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
                <ChevronDown className="w-6 h-6" />
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
                <ChevronDown className="w-6 h-6" />
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
                <ChevronDown className="w-6 h-6" />
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
    </div>
  );
}