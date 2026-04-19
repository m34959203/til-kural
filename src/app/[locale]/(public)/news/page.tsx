import NewsCard from '@/components/features/NewsCard';
import { db } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

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

const FALLBACK = [
  { slug: 'kazakh-language-week-2026', title_kk: 'Қазақ тілі апталығы — 2026', title_ru: 'Неделя казахского языка — 2026', content_kk: 'Қазақ тілі апталығы аясында түрлі іс-шаралар өткізіледі.', content_ru: 'В рамках Недели казахского языка проводятся различные мероприятия.', published_at: '2026-04-01' },
  { slug: 'new-ai-features', title_kk: 'Жаңа AI мүмкіндіктер қосылды', title_ru: 'Добавлены новые AI возможности', content_kk: 'Платформаға жаңа AI мүмкіндіктер қосылды.', content_ru: 'На платформу добавлены новые AI возможности.', published_at: '2026-03-25' },
  { slug: 'kaztest-preparation', title_kk: 'ҚАЗТЕСТ дайындық бағдарламасы', title_ru: 'Программа подготовки к КАЗТЕСТ', content_kk: 'ҚАЗТЕСТ-ке дайындалу үшін жаңа бағдарлама.', content_ru: 'Запущена новая программа подготовки к КАЗТЕСТ.', published_at: '2026-03-20' },
];

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let items: typeof FALLBACK = FALLBACK;
  try {
    const rows = await db.query('news', { status: 'published' }, { orderBy: 'published_at', order: 'desc', limit: 24 });
    if (rows.length) items = rows as unknown as typeof FALLBACK;
  } catch {
    /* use fallback */
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'kk' ? 'Жаңалықтар' : 'Новости'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((news) => (
          <NewsCard key={news.slug} locale={locale} news={news} />
        ))}
      </div>
    </div>
  );
}
