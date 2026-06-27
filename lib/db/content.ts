import { db } from '../firebase-admin';
import { PricingTier, PortfolioItem, ServiceItem, ClientTypeItem, ProcessItem, Settings } from '../types';
import { cache } from 'react';

export const getPublicContent = cache(async () => {
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

    const pricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PricingTier[];
    const portfolio = portfolioSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PortfolioItem[];
    const services = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceItem[];
    const clientTypes = clientTypesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClientTypeItem[];
    const process = processSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProcessItem[];
    
    const settings: Settings = {
      general: generalSettingsSnap.exists ? generalSettingsSnap.data() as Settings['general'] : undefined,
      contact: contactSettingsSnap.exists ? contactSettingsSnap.data() as Settings['contact'] : undefined
    };

    return { pricing, portfolio, services, clientTypes, process, settings };
  } catch (error) {
    console.error('Failed to fetch public content from Firebase:', error);
    return {
      pricing: [],
      portfolio: [],
      services: [],
      clientTypes: [],
      process: [],
      settings: {}
    };
  }
});
