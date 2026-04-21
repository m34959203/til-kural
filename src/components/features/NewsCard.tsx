import Link from 'next/link';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface NewsCardProps {
  locale: string;
  news: {
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
  };
}

export default function NewsCard({ locale, news }: NewsCardProps) {
  const title = locale === 'kk' ? news.title_kk : news.title_ru;
  const excerptSrc = locale === 'kk' ? news.excerpt_kk : news.excerpt_ru;
  const contentSrc = locale === 'kk' ? news.content_kk : news.content_ru;
  const excerpt = excerptSrc || (contentSrc ? contentSrc.slice(0, 150) + '…' : '');
  const hasVideo = Boolean(news.video_url);

  return (
    <Card hover>
      {news.image_url && (
        <div className="relative h-48 -mx-5 -mt-5 mb-4 bg-gray-100 rounded-t-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={news.image_url} alt={title} className="w-full h-full object-cover" />
          {hasVideo && (
            <span
              className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-xs px-2 py-1"
              aria-label={locale === 'kk' ? 'Бейне бар' : 'Есть видео'}
              title={locale === 'kk' ? 'Бейне бар' : 'Есть видео'}
            >
              🎬
            </span>
          )}
        </div>
      )}
      {!news.image_url && hasVideo && (
        <div className="flex justify-end mb-2">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-0.5"
            aria-label={locale === 'kk' ? 'Бейне бар' : 'Есть видео'}
            title={locale === 'kk' ? 'Бейне бар' : 'Есть видео'}
          >
            🎬 {locale === 'kk' ? 'Бейне' : 'Видео'}
          </span>
        </div>
      )}
      <div>
        {news.published_at && (
          <p className="text-xs text-gray-400 mb-1">{formatDate(news.published_at, locale)}</p>
        )}
        <h3 className="font-semibold text-gray-900 mb-2">
          <Link
            href={`/${locale}/news/${news.slug}`}
            className="hover:text-teal-700 transition-colors"
          >
            {title}
          </Link>
        </h3>
        {excerpt && <p className="text-sm text-gray-500 line-clamp-3">{excerpt}</p>}
      </div>
    </Card>
  );
}
