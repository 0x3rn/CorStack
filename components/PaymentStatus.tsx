'use client';
import { useEffect, useState } from 'react';
export default function PaymentStatus({ reference }: { reference?: string }) {
  const [status, setStatus] = useState<'checking' | 'verified' | 'unconfirmed'>('checking');
  useEffect(() => {
    if (!reference) return;
    const controller = new AbortController();
    fetch('/api/payment-status?reference=' + encodeURIComponent(reference), { signal: controller.signal, cache: 'no-store' })
      .then(response => response.json()).then(data => { if (!controller.signal.aborted) setStatus(data.verified === true ? 'verified' : 'unconfirmed'); })
      .catch(() => { if (!controller.signal.aborted) setStatus('unconfirmed'); });
    return () => controller.abort();
  }, [reference]);
  const verified = reference && status === 'verified';
  return <><h1 className="hero-title">{verified ? 'Payment confirmed' : reference && status === 'checking' ? 'Checking your payment' : 'Payment awaiting confirmation'}</h1>
    <p className="hero-subtitle">{verified ? 'Your payment has been verified. Our team will contact you about your project.' : 'Please keep your receipt. If you paid an invoice, contact our team to confirm your transaction.'}</p>
    {!verified && <a href="mailto:projects@corstack.dev">Contact our team</a>}</>;
}
