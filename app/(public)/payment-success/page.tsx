import type { Metadata } from 'next';
import Link from 'next/link';
import PaymentStatus from '@/components/PaymentStatus';
export const metadata: Metadata = { title: 'Payment status', robots: { index: false, follow: false } };
export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference } = await searchParams;
  return <section className="hero-section" style={{ minHeight: '85vh' }}><PaymentStatus key={reference} reference={reference} /><Link href="/" className="btn btn-primary">Return home</Link></section>;
}
