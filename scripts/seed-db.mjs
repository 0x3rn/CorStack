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

const servicesItems = [
  {
    title: 'Custom Website Design',
    description: 'Unique, professionally crafted designs that help you stand out online.',
    iconName: 'Layout',
    order: 0
  },
  {
    title: 'Website Development',
    description: 'Modern, responsive, secure, fast, and scalable web applications built with the latest technologies.',
    iconName: 'Code',
    order: 1
  },
  {
    title: 'Website Redesigns',
    description: 'Transform outdated websites into modern experiences that better represent your brand.',
    iconName: 'RefreshCw',
    order: 2
  },
  {
    title: 'Hosting & Maintenance',
    description: 'Reliable hosting, security updates, backups, and ongoing technical support.',
    iconName: 'Server',
    order: 3
  }
];

const clientTypesItems = [
  {
    title: 'Startups',
    description: 'Launch with professional online presence that builds credibility from day one and helps you attract customers, investors, and partners.',
    iconName: 'Rocket',
    order: 0
  },
  {
    title: 'Creators & Personal Brands',
    description: 'Showcase your work, tell your story, and create a platform that reflects your unique identity.',
    iconName: 'UserCircle',
    order: 1
  },
  {
    title: 'Small Businesses',
    description: 'Build trust, generate inquiries, and create a seamless experience for potential customers.',
    iconName: 'Building2',
    order: 2
  },
  {
    title: 'Online Stores',
    description: 'Turn visitors into customers with a shopping experience designed for potential customers.',
    iconName: 'ShoppingCart',
    order: 3
  },
  {
    title: 'Professionals & Consultants',
    description: 'Position yourself as an authority in your field with a website that highlights your expertise and services.',
    iconName: 'Briefcase',
    order: 4
  },
  {
    title: 'Organizations & Nonprofits',
    description: 'Communicate your mission clearly and connect with supporters, donors, volunteers and communities.',
    iconName: 'HeartHandshake',
    order: 5
  }
];

const processItems = [
  {
    title: 'Discovery',
    description: 'We learn about your goals, audience, requirements, and vision for the project.',
    order: 0
  },
  {
    title: 'Design & Wireframing',
    description: 'We create a visual direction and gather feedback to ensure everything aligns with your expectations.',
    order: 1
  },
  {
    title: 'Development',
    description: 'The approved design is transformed into a fully functional, responsive website.',
    order: 2
  },
  {
    title: 'Testing & Launch',
    description: 'We thoroughly test every aspect of the website to ensure it is bug-free and fully functional before launching it to ensure everything works flawlessly.',
    order: 3
  }
];

const generalSettings = {
  heroHeadline: 'Designed With Purpose. Built for Results.',
  heroSubtitle: "Whether you're launching a startup, growing a personal brand, running an organization, selling products online, or upgrading an existing presence, your website should represent you professionally and help you achieve your goals. We build digital experiences tailored to your goals.",
  isAcceptingProjects: true,
  socialTwitter: '',
  socialInstagram: '',
  socialLinkedIn: ''
};

const contactSettings = {
  ngnPhone: '+234 800 000 0000',
  ngnEmail: 'hello@corstack.dev',
  usdPhone: '+1 (234) 567-890',
  usdEmail: 'hello@corstack.dev'
};

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

  console.log('Clearing existing Services...');
  const servicesSnapshot = await db.collection('services').get();
  for (const doc of servicesSnapshot.docs) {
    await doc.ref.delete();
  }

  console.log('Seeding Services...');
  for (const item of servicesItems) {
    await db.collection('services').add(item);
  }

  console.log('Clearing existing Client Types...');
  const clientTypesSnapshot = await db.collection('client_types').get();
  for (const doc of clientTypesSnapshot.docs) {
    await doc.ref.delete();
  }

  console.log('Seeding Client Types...');
  for (const item of clientTypesItems) {
    await db.collection('client_types').add(item);
  }

  console.log('Clearing existing Process...');
  const processSnapshot = await db.collection('process').get();
  for (const doc of processSnapshot.docs) {
    await doc.ref.delete();
  }

  console.log('Seeding Process...');
  for (const item of processItems) {
    await db.collection('process').add(item);
  }

  console.log('Seeding Settings...');
  await db.collection('settings').doc('general').set(generalSettings);
  await db.collection('settings').doc('contact').set(contactSettings);

  console.log('Done!');
  process.exit(0);
}

seed();
