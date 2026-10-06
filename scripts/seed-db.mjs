import { db } from '../lib/db/neon.ts';
import { replaceCollections } from './data-safety.mjs';
import fs from 'fs';
import path from 'path';



// Default hardcoded seed data
let pricingTiers = [
  {
    name: 'Launch',
    desc: 'Perfect for personal brands, events, product launches, waitlists, and simple online presences.',
    priceUsd: '150 - $250',
    priceNgn: '150,000 - ₦250,000',
    features: [
      'Single Page Design (Landing Page)',
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
      'Up to 5 Pages (Home, About, Services, Contact, etc.)',
      'CMS Setup (Content Management)',
      'Blog Integration',
      'Lead Generation Forms',
      'Newsletter Integration',
      'Basic Performance Optimization',
      '30 Days Free Post-Launch Support',
      'Delivery in 1-2 Weeks'
    ],
    isPopular: true,
    order: 1
  },
  {
    name: 'Scale',
    desc: 'For established businesses looking to scale their operations with advanced functionality.',
    priceUsd: '500 - $800+',
    priceNgn: '650,000 - ₦1,000,000+',
    features: [
      'Everything in Growth',
      'Up to 10 Pages',
      'E-commerce Integration (Up to 50 products)',
      'Payment Gateway Setup',
      'Custom Animations & Interactions',
      'Advanced SEO Strategy',
      'Custom API Integrations',
      'Priority Support',
      '60 Days Free Post-Launch Support',
      'Delivery in 2-4 Weeks'
    ],
    isPopular: false,
    order: 2
  },
  {
    name: 'Enterprise',
    desc: 'Custom solutions for large organizations with complex requirements and high traffic.',
    priceUsd: '1,500+',
    priceNgn: '2,000,000+',
    features: [
      'Custom Web App Development',
      'Unlimited Pages',
      'Advanced E-commerce (1000+ products)',
      'Complex Database Architecture',
      'Custom Admin Dashboards',
      'Third-party Software Integrations',
      'High-Performance Architecture',
      'Dedicated Account Manager',
      '90 Days Free Post-Launch Support'
    ],
    isPopular: false,
    order: 3
  }
];

let portfolioItems = [
  {
    title: 'Vera',
    category: 'SaaS | Tech Consulting Firm',
    description: 'We built a high-performance, conversion-optimized landing page for Vera, showcasing their tech consulting services with sleek modern aesthetics and lightning-fast load times.',
    desktopImageUrls: ['/hirehook.png'],
    order: 0
  },
  {
    title: 'Omnimart',
    category: 'E-Commerce Setup',
    description: 'A complete e-commerce storefront designed to maximize sales. Features include advanced product filtering, seamless checkout flows, and a mobile-first shopping experience.',
    desktopImageUrls: ['/omnimart.png'],
    order: 1
  },
  {
    title: 'Omnimart v2',
    category: 'E-Commerce Setup',
    description: 'An iteration on the Omnimart design system, focusing on bold typography and immersive product showcases.',
    desktopImageUrls: ['/omnimart.png'],
    order: 2
  }
];

let servicesItems = [
  {
    title: 'Custom Website Design',
    description: 'Bespoke designs tailored to your brand identity. We craft unique, modern, and engaging interfaces that captivate your audience.',
    iconName: 'layout',
    order: 0
  },
  {
    title: 'E-Commerce Development',
    description: 'Robust online stores built for conversion. From product catalogs to secure checkout, we handle the entire shopping experience.',
    iconName: 'shopping-cart',
    order: 1
  },
  {
    title: 'Web App Development',
    description: 'Complex, interactive web applications built with modern frameworks. We turn your innovative ideas into powerful software.',
    iconName: 'code',
    order: 2
  },
  {
    title: 'SEO Optimization',
    description: 'Data-driven strategies to improve your search rankings. We optimize site structure, speed, and content for maximum visibility.',
    iconName: 'search',
    order: 3
  }
];

let clientTypesItems = [
  {
    title: 'Startups',
    description: 'Agile and innovative solutions to help new ventures establish a strong digital footprint quickly.',
    order: 0
  },
  {
    title: 'E-Commerce',
    description: 'Scalable platforms designed to drive sales, manage inventory, and provide a seamless shopping experience.',
    order: 1
  },
  {
    title: 'Agencies',
    description: 'White-label development and robust technical partnerships to help agencies scale their service offerings.',
    order: 2
  },
  {
    title: 'Enterprises',
    description: 'Secure, high-performance web applications tailored for complex organizational workflows.',
    order: 3
  }
];

let processItems = [
  {
    step: '1',
    title: 'Discovery & Strategy',
    description: 'We start by understanding your goals, target audience, and unique requirements to formulate a comprehensive project roadmap.',
    order: 0
  },
  {
    step: '2',
    title: 'UI/UX Design',
    description: 'Our design team creates wireframes and high-fidelity mockups, ensuring an intuitive and visually stunning user experience.',
    order: 1
  },
  {
    step: '3',
    title: 'Development',
    description: 'We bring the designs to life using clean, scalable code and the latest web technologies for optimal performance.',
    order: 2
  },
  {
    step: '4',
    title: 'Testing & Launch',
    description: 'Rigorous quality assurance across devices and browsers guarantees a flawless product ready for a successful launch.',
    order: 3
  }
];

let generalSettings = {
  heroHeadline: 'Crafting Digital Experiences',
  heroSubtitle: 'We build fast, secure, and beautiful web applications that drive results for your business.',
  isAcceptingProjects: true,
  socialTwitter: 'https://twitter.com/corstack',
  socialLinkedIn: 'https://linkedin.com/company/corstack',
  socialInstagram: ''
};

let contactSettings = {
  ngnPhone: '', ngnEmail: 'hello@corstack.dev', usdPhone: '', usdEmail: 'hello@corstack.dev'
};

async function loadBackupIfExists() {
  const backupPath = path.join(process.cwd(), 'scripts', 'db-backup.json');
  if (fs.existsSync(backupPath)) {
    console.log(`\n📦 Found db-backup.json! Loading seeded data from your backup...`);
    try {
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      if (!backupData || ['pricing','portfolio','services','clientTypes','process'].some(key => !Array.isArray(backupData[key])) || !backupData.settings?.general || !backupData.settings?.contact) throw new Error('Incomplete public-content backup.');
      if (backupData.pricing) pricingTiers = backupData.pricing;
      if (backupData.portfolio) {
        portfolioItems = backupData.portfolio.map(item => {
          let desktopImageUrls = item.desktopImageUrls || [];
          if (!desktopImageUrls.length) {
             desktopImageUrls = item.imageUrls && item.imageUrls.length > 0 
                ? item.imageUrls 
                : (item.imageUrl ? [item.imageUrl] : []);
          }
          const newItem = { ...item, desktopImageUrls };
          delete newItem.imageUrls;
          delete newItem.imageUrl;
          return newItem;
        });
      }
      if (backupData.services) servicesItems = backupData.services;
      if (backupData.clientTypes) clientTypesItems = backupData.clientTypes;
      if (backupData.process) processItems = backupData.process;
      if (backupData.settings) {
        if (backupData.settings.general) generalSettings = backupData.settings.general;
        if (backupData.settings.contact) contactSettings = backupData.settings.contact;
      }
      console.log('✅ Backup data loaded successfully.');
    } catch (e) {
      throw new Error('Invalid db-backup.json. No data was changed.', { cause: e });
    }
  } else {
    console.log(`\nℹ️ No db-backup.json found. Seeding with hardcoded defaults.`);
  }
  console.log('');
}

async function run() {
  if (!process.argv.includes('--replace-existing')) throw new Error('This replaces content. Pass --replace-existing to continue.');
  await loadBackupIfExists();

  await replaceCollections(db, [
    ['pricing', pricingTiers], ['portfolio', portfolioItems], ['services', servicesItems],
    ['client_types', clientTypesItems.map(item => ({iconName:'User',...item}))], ['process', processItems],
  ], {general:generalSettings,contact:contactSettings});

  console.log('Done!');
  process.exit(0);
}

run().catch(error => { console.error(error); process.exitCode = 1; });
