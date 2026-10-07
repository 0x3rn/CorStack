import Link from 'next/link';
import PortfolioCard from './PortfolioCard';
import { PortfolioItem } from '../lib/types';

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
  isHome?: boolean;
}

export default function PortfolioSection({ portfolio, isHome = false }: PortfolioSectionProps) {
  const Heading = isHome ? 'h2' : 'h1';
  return (
    <section id="portfolio" className="portfolio-section">
      <div className="centered">
        <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Portfolio</span>
        <Heading className="section-title">Selected Work</Heading>
        <p className="section-subtitle">Explore some of our recent projects and see how thoughtful design and development can transform an online presence.</p>
      </div>
      
      <div className="portfolio-grid mt-12">
        {portfolio && portfolio.length > 0 ? (
          portfolio.map(item => (
            <PortfolioCard key={item.id} item={item} isHome={isHome} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            New projects are coming soon.
          </div>
        )}
      </div>

      {isHome && (
        <div className="mt-12 flex justify-center">
          <Link href="/portfolio" className="btn btn-outline-dark">
            View full portfolio gallery
          </Link>
        </div>
      )}
    </section>
  );
}
