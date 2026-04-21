import { getMessages } from '@/lib/i18n';
import { LESSONS } from '@/data/lessons-meta';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import LessonsList from './LessonsList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: locale === 'kk' ? 'Сабақтар' : 'Уроки',
    description: locale === 'kk' ? 'Қадам-қадаммен қазақ тілі сабақтары A1-ден B2-ге дейін.' : 'Пошаговые уроки казахского языка от A1 до B2.',
    path: `/${locale}/learn/lessons`,
  });
}

export default async function LessonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{m.learn.lessonsTitle}</h1>
      <p className="text-gray-500 mb-6">
        {locale === 'kk' ? 'Қадам-қадаммен қазақ тілін үйреніңіз' : 'Изучайте казахский язык шаг за шагом'}
      </p>

      <LessonsList locale={locale} lessons={LESSONS} />
    </div>
  );
}
