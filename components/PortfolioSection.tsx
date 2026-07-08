import Link from 'next/link';
import PortfolioCard from './PortfolioCard';
import { PortfolioItem } from '../lib/types';

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
  isHome?: boolean;
}

export default function PortfolioSection({ portfolio, isHome = false }: PortfolioSectionProps) {
  return (
    <section id="portfolio" className="portfolio-section">
      <div className="centered">
        <span className="hero-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Portfolio</span>
        <h2 className="section-title">Selected Work</h2>
        <p className="section-subtitle">Explore some of our recent projects and see how thoughtful design and development can tranform an online presence.</p>
      </div>
      
      <div className="portfolio-grid mt-12">
        {portfolio && portfolio.length > 0 ? (
          portfolio.map(item => (
            <PortfolioCard key={item.id} item={item} isHome={isHome} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            Portfolio items will appear here once added.
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
