import Card from '@/components/ui/Card';
import Link from 'next/link';
import { db } from '@/lib/db';
import { buildMetadata, newsArticleJsonLd } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface NewsRow {
  id?: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  content_kk?: string;
  content_ru?: string;
  excerpt_kk?: string;
  excerpt_ru?: string;
  image_url?: string | null;
  video_url?: string | null;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

async function loadNews(slug: string): Promise<NewsRow | null> {
  try {
    const bySlug = await db.findOne('news', { slug });
    if (bySlug) return bySlug as NewsRow;
  } catch {
    /* ignore */
  }
  try {
    const byId = await db.findOne('news', { id: slug });
    if (byId) return byId as NewsRow;
  } catch {
    /* ignore */
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const news = await loadNews(slug);
  if (!news) {
    return buildMetadata({
      locale,
      title: locale === 'kk' ? 'Жаңалық табылмады' : 'Новость не найдена',
      path: `/${locale}/news/${slug}`,
    });
  }
  const title = locale === 'kk' ? news.title_kk : news.title_ru;
  const description = (
    locale === 'kk' ? news.excerpt_kk || news.content_kk : news.excerpt_ru || news.content_ru
  )?.slice(0, 160);
  return buildMetadata({
    locale,
    title,
    description,
    path: `/${locale}/news/${slug}`,
    image: news.image_url || undefined,
    type: 'article',
    publishedTime: news.published_at,
    modifiedTime: news.updated_at,
  });
}

function detectVideoEmbed(url: string): { kind: 'youtube' | 'vimeo' | 'file'; src: string } {
  // YouTube: https://www.youtube.com/watch?v=ID | https://youtu.be/ID | https://www.youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (ytMatch) {
    return { kind: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  // Vimeo: https://vimeo.com/ID | https://player.vimeo.com/video/ID
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);
  if (vimeoMatch) {
    return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  return { kind: 'file', src: url };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const news = await loadNews(slug);
  if (!news) notFound();

  const title = locale === 'kk' ? news.title_kk : news.title_ru;
  const content = locale === 'kk' ? news.content_kk : news.content_ru;
  const excerpt = locale === 'kk' ? news.excerpt_kk : news.excerpt_ru;
  const publishedAt = news.published_at || news.created_at || new Date().toISOString();

  const jsonLd = newsArticleJsonLd({
    locale,
    title,
    description: (excerpt || content || '').slice(0, 200),
    image: news.image_url || undefined,
    slug: news.slug,
    publishedAt,
    modifiedAt: news.updated_at,
  });

  const video = news.video_url ? detectVideoEmbed(news.video_url) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/${locale}/news`}
        className="text-sm text-teal-700 hover:underline mb-4 inline-block"
      >
        ← {locale === 'kk' ? 'Жаңалықтарға оралу' : 'Вернуться к новостям'}
      </Link>
      <Card>
        {news.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={news.image_url}
            alt={title}
            className="w-full rounded-lg mb-4 object-cover max-h-[420px]"
          />
        )}
        <p className="text-sm text-gray-400 mb-2">{formatDate(publishedAt, locale)}</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        {excerpt && (
          <p className="text-base text-gray-600 mb-4 italic">{excerpt}</p>
        )}
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
          {content}
        </div>
        {video && (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg bg-black">
            {video.kind === 'file' ? (
              <video src={video.src} controls className="w-full h-full" />
            ) : (
              <iframe
                src={video.src}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
