import { getMessages } from '@/lib/i18n';
import AdaptiveExercise from '@/components/features/AdaptiveExercise';

export default async function LessonPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const m = getMessages(locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {m.learn.lessons} #{id}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Жаттығуларды орындаңыз' : 'Выполните упражнения'}
      </p>
      <AdaptiveExercise locale={locale} />
    </div>
  );
}
