import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';
import { db } from '@/lib/db';

const STATIC_PATHS = [
  '',
  '/about',
  '/news',
  '/events',
  '/rules',
  '/resources',
  '/contacts',
  '/learn',
  '/learn/dialog',
  '/learn/writing',
  '/learn/pronunciation',
  '/learn/lessons',
  '/test',
  '/test/level',
  '/test/kaztest',
  '/test/topics',
  '/kaztest-info',
  '/photo-check',
  '/game',
  '/game/quests',
  '/game/leaderboard',
  '/game/achievements',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const path of STATIC_PATHS) {
    for (const locale of ['kk', 'ru'] as const) {
      entries.push({
        url: `${SITE.url}/${locale}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
        alternates: {
          languages: {
            kk: `${SITE.url}/kk${path}`,
            ru: `${SITE.url}/ru${path}`,
          },
        },
      });
    }
  }

  try {
    const news = await db.query('news', { status: 'published' });
    for (const item of news) {
      for (const locale of ['kk', 'ru'] as const) {
        entries.push({
          url: `${SITE.url}/${locale}/news/${item.slug}`,
          lastModified: item.updated_at || item.published_at || now,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch {
    /* noop — DB may be empty */
  }

  return entries;
}
