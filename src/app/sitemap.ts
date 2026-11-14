import type { MetadataRoute } from 'next';
import { listProducts } from '@/lib/catalog';
import { posts } from '@/lib/posts';

const BASE = process.env.SITE_URL || 'https://dvernoitrend.ru';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/catalog', '/services', '/reviews', '/about', '/contacts', '/blog'].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const products = listProducts({ perPage: 500 }).items.map((product) => ({
    url: `${BASE}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const blogPosts = posts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...products, ...blogPosts];
}
