import Link from 'next/link';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface NewsCardProps {
  locale: string;
  news: {
    slug: string;
    title_kk: string;
    title_ru: string;
    content_kk?: string;
    content_ru?: string;
    image_url?: string;
    published_at?: string;
  };
}

export default function NewsCard({ locale, news }: NewsCardProps) {
  const title = locale === 'kk' ? news.title_kk : news.title_ru;
  const content = locale === 'kk' ? news.content_kk : news.content_ru;
  const excerpt = content ? content.slice(0, 150) + '...' : '';

  return (
    <Card hover>
      {news.image_url && (
        <div className="h-48 -mx-5 -mt-5 mb-4 bg-gray-100 rounded-t-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={news.image_url} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div>
        {news.published_at && (
          <p className="text-xs text-gray-400 mb-1">{formatDate(news.published_at, locale)}</p>
        )}
        <h3 className="font-semibold text-gray-900 mb-2">
          <Link href={`/${locale}/news/${news.slug}`} className="hover:text-teal-700 transition-colors">
            {title}
          </Link>
        </h3>
        {excerpt && <p className="text-sm text-gray-500 line-clamp-3">{excerpt}</p>}
      </div>
    </Card>
  );
}
