import type { MetadataRoute } from 'next';
import { BUSINESS } from '@/lib/business';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BUSINESS.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
