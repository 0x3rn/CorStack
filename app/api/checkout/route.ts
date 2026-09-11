import { NextResponse } from 'next/server';

type GatewayErrorPayload = {
  message?: string;
  errors?: Array<{ detail?: string }>;
};

async function readGatewayResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as GatewayErrorPayload & T;
  if (!response.ok) {
    throw new Error(
      payload.message || payload.errors?.[0]?.detail || 'The payment gateway is currently offline. Please try again later.',
    );
  }
  return payload;
}

export async function POST(req: Request) {
  try {
    const { tier, currency, email } = await req.json();
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    if (currency === 'ngn') {
      let priceAmount = 0;
      let packageName = '';

      if (tier === 'basic') {
        priceAmount = 35000000;
        packageName = 'Basic Package';
      } else if (tier === 'growth') {
        priceAmount = 60000000;
        packageName = 'Business Package';
      }

      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: priceAmount,
          currency: 'NGN',
          callback_url: `${origin}/payment-success`,
          metadata: {
            custom_fields: [
              {
                display_name: 'Package Purchased',
                variable_name: 'package',
                value: packageName,
              },
            ],
          },
        }),
      });
      const paystackPayload = await readGatewayResponse<{ data: { authorization_url: string } }>(paystackResponse);

      return NextResponse.json({ url: paystackPayload.data.authorization_url }, { status: 200 });
    }

    let variantId = '';
    if (tier === 'basic') {
      variantId = process.env.LEMON_SQUEEZY_BASIC_VARIANT_ID as string;
    } else if (tier === 'growth') {
      variantId = process.env.LEMON_SQUEEZY_GROWTH_VARIANT_ID as string;
    }

    const lemonSqueezyResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: { checkout_data: { email } },
          relationships: {
            store: { data: { type: 'stores', id: process.env.LEMON_SQUEEZY_STORE_ID } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    });
    const lemonSqueezyPayload = await readGatewayResponse<{ data: { attributes: { url: string } } }>(
      lemonSqueezyResponse,
    );

    return NextResponse.json({ url: lemonSqueezyPayload.data.attributes.url }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'The payment gateway is currently offline. Please try again later.';

    console.error('Payment Gateway Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
