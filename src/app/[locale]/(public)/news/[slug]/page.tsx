import Card from '@/components/ui/Card';
import Link from 'next/link';
import { db } from '@/lib/db';
import { buildMetadata, newsArticleJsonLd } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

async function loadNews(slug: string) {
  try {
    const row = await db.findOne('news', { slug });
    if (row) return row;
  } catch { /* ignore */ }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const news = await loadNews(slug);
  const title = news ? (locale === 'kk' ? news.title_kk : news.title_ru) : slug;
  const description = news
    ? (locale === 'kk' ? news.excerpt_kk || news.content_kk : news.excerpt_ru || news.content_ru)?.slice(0, 160)
    : undefined;
  return buildMetadata({
    locale,
    title,
    description,
    path: `/${locale}/news/${slug}`,
    image: news?.image_url,
    type: 'article',
    publishedTime: news?.published_at,
    modifiedTime: news?.updated_at,
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const news = await loadNews(slug);

  if (!news) {
    // Fallback demo content — preserves original demo behaviour
    const demo = {
      slug,
      title_kk: 'Қазақ тілі апталығы — 2026',
      title_ru: 'Неделя казахского языка — 2026',
      content_kk: 'Қазақ тілі апталығы аясында түрлі іс-шаралар өткізіледі.',
      content_ru: 'В рамках Недели казахского языка проводятся различные мероприятия.',
      published_at: '2026-04-01',
      image_url: null,
    };
    return renderArticle(demo, locale);
  }
  return renderArticle(news, locale);
}

function renderArticle(news: any, locale: string) {
  const title = locale === 'kk' ? news.title_kk : news.title_ru;
  const content = locale === 'kk' ? news.content_kk : news.content_ru;
  const jsonLd = newsArticleJsonLd({
    locale,
    title,
    description: (content || '').slice(0, 200),
    image: news.image_url,
    slug: news.slug,
    publishedAt: news.published_at || news.created_at,
    modifiedAt: news.updated_at,
  });
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href={`/${locale}/news`} className="text-sm text-teal-700 hover:underline mb-4 inline-block">
        ← {locale === 'kk' ? 'Жаңалықтарға оралу' : 'Вернуться к новостям'}
      </Link>
      <Card>
        {news.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={news.image_url} alt={title} className="w-full rounded-lg mb-4" />
        )}
        <p className="text-sm text-gray-400 mb-2">{news.published_at}</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{content}</div>
        {news.video_url && (
          <div className="mt-6 aspect-video">
            <video src={news.video_url} controls className="w-full h-full rounded-lg" />
          </div>
        )}
      </Card>
    </div>
  );
}
