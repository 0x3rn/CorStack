import { db } from '../firebase-admin';
import type { PublicContent, Settings } from '../types';
import { cache } from 'react';
import { connection } from 'next/server';
import { pricingSchema, portfolioSchema, collectionSchemas, generalSchema, contactSettingsSchema } from '../validation';

export const getPublicContent = cache(async (): Promise<PublicContent> => {
  // Database content is runtime data, never an empty fallback frozen into a build.
  await connection();
  const [pricingSnap, portfolioSnap, servicesSnap, clientTypesSnap, processSnap, generalSnap, contactSnap] = await Promise.all([
    db.collection('pricing').orderBy('order', 'asc').get(),
    db.collection('portfolio').orderBy('order', 'asc').get(),
    db.collection('services').orderBy('order', 'asc').get(),
    db.collection('client_types').orderBy('order', 'asc').get(),
    db.collection('process').orderBy('order', 'asc').get(),
    db.collection('settings').doc('general').get(), db.collection('settings').doc('contact').get(),
  ]);
  const pricing = pricingSnap.docs.map(doc => ({ ...pricingSchema.strip().parse(doc.data()), id: doc.id }));
  const portfolio = portfolioSnap.docs.map(doc => {
    const data = doc.data() || {};
    const images = data.desktopImageUrls || data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
    return { ...portfolioSchema.strip().parse({ ...data, desktopImageUrls: images }), id: doc.id };
  });
  const cards = (documents: typeof servicesSnap.docs, collection: 'services' | 'client_types') => documents.map(doc => {
    const data = doc.data() || {};
    return { ...collectionSchemas[collection].strip().parse({ ...data, description: data.description ?? data.desc, iconName: data.iconName ?? data.icon ?? 'User' }), id: doc.id };
  });
  const process = processSnap.docs.map(doc => {
    const data = doc.data() || {};
    return { ...collectionSchemas.process.strip().parse({ ...data, description: data.description ?? data.desc }), id: doc.id };
  });
  const settings: Settings = {};
  if (generalSnap.exists) {
    const data = generalSnap.data() || {};
    settings.general = generalSchema.strip().parse({ heroHeadline: data.heroHeadline ?? data.heroTitle ?? 'Websites built to grow your business',
      heroSubtitle: data.heroSubtitle ?? 'Thoughtful design and reliable development for your next project.', isAcceptingProjects: data.isAcceptingProjects ?? true,
      socialTwitter: '', socialInstagram: '', socialLinkedIn: '', ...data });
  }
  if (contactSnap.exists) {
    settings.contact = contactSettingsSchema.strip().parse({ ngnPhone: '', usdPhone: '', ngnEmail: 'hello@corstack.dev', usdEmail: 'hello@corstack.dev', ...contactSnap.data() });
  }
  return { pricing, portfolio, services: cards(servicesSnap.docs, 'services'), clientTypes: cards(clientTypesSnap.docs, 'client_types'), process, settings };
});
