import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';


const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = getApps().length === 0 ? initializeApp({
  credential: cert(serviceAccount),
}) : getApps()[0];

const db = getFirestore(app);

const pricingTiers = [
  {
    name: 'Launch',
    desc: 'Perfect for personal brands, events, product launches, waitlists, and simple online presences.',
    priceUsd: '100 - $250',
    priceNgn: '150,000 - ₦250,000',
    features: [
      'Up to 2 Pages',
      'Mobile Responsive Design',
      'Basic SEO Setup',
      'Contact Form Integration',
      'Analytics Integration',
      'SSL Security',
      'Social Media Links',
      'Launch Assistance',
      'Delivery in 2-3 Days'
    ],
    isPopular: false,
    order: 0
  },
  {
    name: 'Growth',
    desc: 'Ideal for startups and local shops needing a professional online presence.',
    priceUsd: '300 - $450',
    priceNgn: '350,000 - ₦500,000',
    features: [
      'Everything in Launch',
      'Up to 5 Custom Pages',
      'Custom Brand Integration',
      'Newsletter Sign-up Form',
      'WhatsApp / Live Chat Widget',
      'Google Maps Integration',
      'Website Training & Handover',
      '1 Round of Revisions',
      'Delivery in 7 Days'
    ],
    isPopular: false,
    order: 1
  },
  {
    name: 'Professional',
    desc: 'Built for brands and organizations that want to generate more leads and establish authority online.',
    priceUsd: '600 - $1,000',
    priceNgn: '600,000 - ₦1,000,000',
    features: [
      'Everything in Growth',
      'Up to 10 Custom Pages',
      'Advanced SEO Strategy',
      'Lead Capture Funnels',
      'Blog / CMS Setup',
      'Performance Optimization',
      'Priority Email Support',
      '3 Rounds of Revisions',
      'Delivery in 14 Days'
    ],
    isPopular: true,
    order: 2
  },
  {
    name: 'Custom',
    desc: 'Advanced websites built for organizations that require custom functionality, scalability, and e-commerce capabilities.',
    priceUsd: '1,500 - $2,500',
    priceNgn: '1,500,000 - ₦2,500,000',
    features: [
      'Everything in Professional',
      'Unlimited Scalable Pages',
      'Online Store Setup',
      'Custom API Integrations',
      'Membership & Booking Systems',
      'Secure Payment Gateways',
      'Client Dashboards & Portals',
      'Advanced Security Configuration',
      'Dedicated Project Support',
      '90 Days Free Post-Launch Support'
    ],
    isPopular: false,
    order: 3
  }
];

const portfolioItems = [
  {
    title: 'Vera',
    category: 'SaaS | Tech Consulting Firm',
    imageUrl: '/hirehook.png',
    order: 0
  },
  {
    title: 'Omnimart',
    category: 'E-Commerce Setup',
    imageUrl: '/omnimart.png',
    order: 1
  },
  {
    title: 'Omnimart',
    category: 'E-Commerce Setup',
    imageUrl: '/omnimart.png',
    order: 2
  }
];

async function seed() {
  console.log('Clearing existing Pricing...');
  const pricingSnapshot = await db.collection('pricing').get();
  for (const doc of pricingSnapshot.docs) {
    await doc.ref.delete();
  }

  console.log('Seeding Pricing...');
  for (const item of pricingTiers) {
    await db.collection('pricing').add(item);
  }

  console.log('Clearing existing Portfolio...');
  const portfolioSnapshot = await db.collection('portfolio').get();
  for (const doc of portfolioSnapshot.docs) {
    await doc.ref.delete();
  }

  console.log('Seeding Portfolio...');
  for (const item of portfolioItems) {
    await db.collection('portfolio').add(item);
  }

  console.log('Done!');
  process.exit(0);
}

seed();
