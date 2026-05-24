import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { tier, currency, email } = await req.json();

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    let priceAmount: number = 0;
    let packageName = '';

    if (currency === 'ngn') {
      if (tier === 'basic') {
        priceAmount = 35000000;
        packageName = 'Basic Package';
      }
      if (tier === 'growth') {
        priceAmount = 60000000;
        packageName = 'Business Package';
      }
    } else {
      if (tier === 'basic') {
        priceAmount = 29900;
        packageName = 'Basic Package';
      }
      if (tier === 'growth') {
        priceAmount = 59900;
        packageName = 'Business Package';
      }
    }

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email,
        amount: priceAmount,
        currency: currency.toUpperCase(),
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
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'The payment gateway is currently offline. Please try again later.';

    console.error('Paystack Error:', errorMessage);

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}