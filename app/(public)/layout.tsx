import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import { getPublicContent } from '@/lib/db/content';
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getPublicContent();
  return <SmoothScroll><div className="flex flex-col min-h-screen overflow-x-hidden w-full"><Header />{children}<Footer settings={settings} /></div></SmoothScroll>;
}
