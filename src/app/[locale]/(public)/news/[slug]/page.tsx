import Card from '@/components/ui/Card';
import Link from 'next/link';

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;

  // Demo content
  const news = {
    slug,
    title_kk: 'Қазақ тілі апталығы — 2026',
    title_ru: 'Неделя казахского языка — 2026',
    content_kk: `Қазақ тілі апталығы аясында түрлі іс-шаралар өткізіледі.

Бағдарлама:
- Диктант жарысы
- Викторина
- Дебат жарыстары
- AI мұғалімімен ашық сабақтар
- Сертификат тапсыру

Іс-шараға қатысу тегін. Алдын ала тіркелу қажет.`,
    content_ru: `В рамках Недели казахского языка проводятся различные мероприятия.

Программа:
- Конкурс диктантов
- Викторина
- Дебаты
- Открытые уроки с AI учителем
- Выдача сертификатов

Участие бесплатное. Необходима предварительная регистрация.`,
    published_at: '2026-04-01',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/${locale}/news`} className="text-sm text-teal-700 hover:underline mb-4 inline-block">
        ← {locale === 'kk' ? 'Жаңалықтарға оралу' : 'Вернуться к новостям'}
      </Link>
      <Card>
        <p className="text-sm text-gray-400 mb-2">{news.published_at}</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {locale === 'kk' ? news.title_kk : news.title_ru}
        </h1>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
          {locale === 'kk' ? news.content_kk : news.content_ru}
        </div>
      </Card>
    </div>
  );
}
