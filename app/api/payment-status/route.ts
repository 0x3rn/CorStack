import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon';
import { enforceRateLimit } from '@/lib/rate-limit';
import { apiError, HttpError } from '@/lib/http';
export async function GET(request: Request) {
  try {
    const reference = new URL(request.url).searchParams.get('reference');
    if (!reference || !/^[a-f0-9-]{36}$/.test(reference)) throw new HttpError(400, 'A valid payment reference is required.');
    await enforceRateLimit(request, reference, 'payment-status');
    const payment = await db.collection('payments').doc(reference).get();
    if (!payment.exists) throw new HttpError(404, 'Payment not found.');
    const saved = payment.data()!;
    if (saved.status !== 'paid') {
      if (!process.env.PAYSTACK_SECRET_KEY) throw new HttpError(503, 'Payment verification is unavailable.');
      const response = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference), {
        headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY }, signal: AbortSignal.timeout(15_000), cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok || payload.status !== true) throw new HttpError(502, 'Payment verification is unavailable.');
      const data = payload.data;
      if (data?.status !== 'success' || data.reference !== reference || data.amount !== saved.amount || data.currency !== saved.currency || data.customer?.email?.toLowerCase() !== String(saved.email).toLowerCase()) {
        return NextResponse.json({ verified: false }, { headers: { 'Cache-Control': 'no-store' } });
      }
      await db.collection('payments').doc(reference).update({ status: 'paid', verifiedAt: new Date().toISOString(), transactionId: String(data.id) });
    }
    return NextResponse.json({ verified: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiError(error); }
}
