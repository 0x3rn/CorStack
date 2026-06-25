import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';

// Cache for 60 seconds (or revalidate if you want ISR, but let's keep it simple)
export const revalidate = 60;

export async function GET() {
  try {
    const [pricingSnap, portfolioSnap] = await Promise.all([
      db.collection('pricing').orderBy('order', 'asc').get(),
      db.collection('portfolio').orderBy('order', 'asc').get(),
    ]);

    const pricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const portfolio = portfolioSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ pricing, portfolio });
  } catch (error: any) {
    console.error('Failed to fetch public content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
