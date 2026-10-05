import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/confirmation', '/payment-success'],
    },
    sitemap: 'https://corstack.dev/sitemap.xml',
  }
}
