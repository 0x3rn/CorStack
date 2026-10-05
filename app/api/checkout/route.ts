import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError, assertSameOrigin, HttpError } from '@/lib/http';
import { parseBody } from '@/lib/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/firebase-admin';
const checkoutSchema = z.object({ tier: z.enum(['basic', 'growth']), currency: z.enum(['ngn', 'usd']), email: z.email().max(254) }).strict();
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { tier, currency, email } = await parseBody(request, checkoutSchema);
    await enforceRateLimit(request, email, 'checkout');
    const origin = new URL(process.env.SITE_URL || 'https://corstack.dev').origin;
    if (currency === 'ngn') {
      if (!process.env.PAYSTACK_SECRET_KEY) throw new HttpError(503, 'Checkout is temporarily unavailable.');
      const configuredAmount = process.env[tier === 'basic' ? 'PAYSTACK_BASIC_AMOUNT' : 'PAYSTACK_GROWTH_AMOUNT'];
      const naira = Number(configuredAmount);
      if (!configuredAmount || !Number.isSafeInteger(naira) || naira <= 0 || naira > 1e9) throw new HttpError(503, 'Checkout pricing is not configured.');
      const reference = crypto.randomUUID();
      const amount = naira * 100;
      await db.collection('payments').doc(reference).set({ email, tier, currency: 'NGN', amount, status: 'pending', createdAt: new Date().toISOString() });
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST', signal: AbortSignal.timeout(15_000),
        headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount, currency: 'NGN', reference, callback_url: origin + '/payment-success', metadata: { tier } }),
      });
      const payload = await response.json();
      const url = payload.data?.authorization_url;
      if (!response.ok || payload.status !== true || typeof url !== 'string' || new URL(url).origin !== 'https://checkout.paystack.com') throw new HttpError(502, 'Payment provider is unavailable.');
      return NextResponse.json({ url });
    }
    const variant = process.env[tier === 'basic' ? 'LEMON_SQUEEZY_BASIC_VARIANT_ID' : 'LEMON_SQUEEZY_GROWTH_VARIANT_ID'];
    const store = process.env.LEMON_SQUEEZY_STORE_ID;
    const key = process.env.LEMON_SQUEEZY_API_KEY;
    if (!variant || !store || !key) throw new HttpError(503, 'Checkout is temporarily unavailable.');
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST', signal: AbortSignal.timeout(15_000),
      headers: { Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ data: { type: 'checkouts', attributes: { checkout_data: { email }, product_options: { redirect_url: origin + '/payment-success' } },
        relationships: { store: { data: { type: 'stores', id: store } }, variant: { data: { type: 'variants', id: variant } } } } }),
    });
    const payload = await response.json();
    const url = payload.data?.attributes?.url;
    if (!response.ok || typeof url !== 'string' || new URL(url).protocol !== 'https:' || !new URL(url).hostname.endsWith('.lemonsqueezy.com')) throw new HttpError(502, 'Payment provider is unavailable.');
    return NextResponse.json({ url });
  } catch (error) { return apiError(error); }
}
