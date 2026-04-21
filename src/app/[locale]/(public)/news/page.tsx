import NewsCard from '@/components/features/NewsCard';
import { db } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: locale === 'kk' ? 'Жаңалықтар' : 'Новости',
    description: locale === 'kk'
      ? 'Тіл-құрал орталығының жаңалықтары, іс-шаралары мен хабарландырулары.'
      : 'Новости, события и объявления центра «Тіл-құрал».',
    path: `/${locale}/news`,
  });
}

interface NewsRow {
  id?: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  content_kk?: string;
  content_ru?: string;
  excerpt_kk?: string;
  excerpt_ru?: string;
  image_url?: string;
  video_url?: string;
  published_at?: string;
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let items: NewsRow[] = [];
  try {
    const rows = await db.query(
      'news',
      { status: 'published' },
      { orderBy: 'published_at', order: 'desc', limit: 50 },
    );
    items = rows as NewsRow[];
  } catch {
    /* empty list */
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'kk' ? 'Жаңалықтар' : 'Новости'}
      </h1>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-gray-500">
            {locale === 'kk' ? 'Жаңалықтар жақында шығады.' : 'Скоро появятся новости.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((news) => (
            <NewsCard key={news.slug || news.id} locale={locale} news={news} />
          ))}
        </div>
      )}
    </div>
  );
}
