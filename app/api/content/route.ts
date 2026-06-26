import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';

export const revalidate = 60;

export async function GET() {
  try {
    const [
      pricingSnap, 
      portfolioSnap, 
      servicesSnap, 
      clientTypesSnap, 
      processSnap,
      generalSettingsSnap,
      contactSettingsSnap
    ] = await Promise.all([
      db.collection('pricing').orderBy('order', 'asc').get(),
      db.collection('portfolio').orderBy('order', 'asc').get(),
      db.collection('services').orderBy('order', 'asc').get(),
      db.collection('client_types').orderBy('order', 'asc').get(),
      db.collection('process').orderBy('order', 'asc').get(),
      db.collection('settings').doc('general').get(),
      db.collection('settings').doc('contact').get()
    ]);

    const pricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const portfolio = portfolioSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const services = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const clientTypes = clientTypesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const process = processSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const settings = {
      general: generalSettingsSnap.exists ? generalSettingsSnap.data() : null,
      contact: contactSettingsSnap.exists ? contactSettingsSnap.data() : null
    };

    return NextResponse.json({ pricing, portfolio, services, clientTypes, process, settings });
  } catch (error: any) {
    console.error('Failed to fetch public content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
