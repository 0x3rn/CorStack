import { getPublicContent } from '../../lib/db/content';
import PortfolioSection from '../../components/PortfolioSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | Corstack',
  description: 'View our web design and development portfolio. Explore some of our recent projects and see how thoughtful design and development can transform an online presence.',
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const content = await getPublicContent();
  const { portfolio } = content;

  return (
    <main className="w-full pt-24 pb-20">
      <PortfolioSection portfolio={portfolio} />
    </main>
  );
}
