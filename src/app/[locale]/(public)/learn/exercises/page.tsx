import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import AdaptiveExercise from '@/components/features/AdaptiveExercise';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: locale === 'kk' ? 'Бейімделген жаттығулар' : 'Адаптивные упражнения',
    description: locale === 'kk'
      ? 'Деңгейіңізге және әлсіз жерлеріңізге бейімделетін жаттығулар.'
      : 'Упражнения, которые подстраиваются под ваш уровень и слабые места.',
    path: `/${locale}/learn/exercises`,
  });
}

export default async function ExercisesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const title = locale === 'kk' ? 'Бейімделген жаттығулар' : 'Адаптивные упражнения';
  const subtitle = locale === 'kk'
    ? 'Жүйе сіздің деңгейіңізді бағалап, ең әлсіз тақырыптардан бастайды. Әр дұрыс жауап сізді келесі деңгейге жақындатады.'
    : 'Система оценивает ваш уровень и начинает с самых слабых тем. Каждый правильный ответ приближает вас к следующему уровню.';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">{subtitle}</p>

      <AdaptiveExercise locale={locale} />
    </div>
  );
}
