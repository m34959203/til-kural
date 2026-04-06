import NewsCard from '@/components/features/NewsCard';

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const newsList = [
    { slug: 'kazakh-language-week-2026', title_kk: 'Қазақ тілі апталығы — 2026', title_ru: 'Неделя казахского языка — 2026', content_kk: 'Қазақ тілі апталығы аясында түрлі іс-шаралар өткізіледі. Диктант, викторина, дебат жарыстары жоспарланған.', content_ru: 'В рамках Недели казахского языка проводятся различные мероприятия. Запланированы диктант, викторина, дебаты.', published_at: '2026-04-01' },
    { slug: 'new-ai-features', title_kk: 'Жаңа AI мүмкіндіктер қосылды', title_ru: 'Добавлены новые AI возможности', content_kk: 'Платформаға жаңа AI мүмкіндіктер қосылды: фото тексеру, диалог жаттықтырғыш, бейімделгіш жаттығулар.', content_ru: 'На платформу добавлены новые AI возможности: проверка фото, тренажёр диалогов, адаптивные упражнения.', published_at: '2026-03-25' },
    { slug: 'kaztest-preparation', title_kk: 'ҚАЗТЕСТ дайындық бағдарламасы', title_ru: 'Программа подготовки к КАЗТЕСТ', content_kk: 'ҚАЗТЕСТ-ке дайындалу үшін жаңа бағдарлама іске қосылды. Нақты форматтағы тест тапсырмалары.', content_ru: 'Запущена новая программа подготовки к КАЗТЕСТ. Тестовые задания в официальном формате.', published_at: '2026-03-20' },
    { slug: 'summer-language-camp', title_kk: 'Жазғы тіл лагері — тіркелу басталды', title_ru: 'Летний языковой лагерь — регистрация открыта', content_kk: 'Жазғы тіл лагеріне тіркелу басталды! Интенсивті курс + мәдени бағдарлама. 14-30 маусым.', content_ru: 'Открыта регистрация в летний языковой лагерь! Интенсивный курс + культурная программа. 14-30 июня.', published_at: '2026-03-15' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'kk' ? 'Жаңалықтар' : 'Новости'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsList.map((news) => (
          <NewsCard key={news.slug} locale={locale} news={news} />
        ))}
      </div>
    </div>
  );
}
