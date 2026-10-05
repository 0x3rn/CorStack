import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/services', '/portfolio', '/privacy', '/terms'].map(path => ({ url: 'https://corstack.dev' + path,
    changeFrequency: path === '' ? 'weekly' : 'monthly', priority: path === '' ? 1 : 0.5 }));
}
