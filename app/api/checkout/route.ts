import { NextResponse } from 'next/server';
import axios from 'axios';

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

      const paystackResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: email,
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
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return NextResponse.json(
        { url: paystackResponse.data.data.authorization_url },
        { status: 200 }
      );
    } else {
      let variantId = '';
      
      if (tier === 'basic') {
        variantId = process.env.LEMON_SQUEEZY_BASIC_VARIANT_ID as string;
      } else if (tier === 'growth') {
        variantId = process.env.LEMON_SQUEEZY_GROWTH_VARIANT_ID as string;
      }

      const lsResponse = await axios.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        {
          data: {
            type: 'checkouts',
            attributes: {
              checkout_data: {
                email: email,
              },
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: process.env.LEMON_SQUEEZY_STORE_ID,
                },
              },
              variant: {
                data: {
                  type: 'variants',
                  id: variantId,
                },
              },
            },
          },
        },
        {
          headers: {
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          },
        }
      );

      return NextResponse.json(
        { url: lsResponse.data.data.attributes.url },
        { status: 200 }
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.detail ||
      'The payment gateway is currently offline. Please try again later.';

    console.error('Payment Gateway Error:', errorMessage);

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}