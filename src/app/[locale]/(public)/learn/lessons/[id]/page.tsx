import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import AdaptiveExercise from '@/components/features/AdaptiveExercise';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';
import { findLesson } from '@/data/lessons-meta';
import rulesData from '@/data/kazakh-grammar-rules.json';
import { notFound } from 'next/navigation';

interface Rule {
  id: string;
  topic: string;
  title_kk: string;
  title_ru: string;
  description_kk: string;
  description_ru: string;
  examples: string[];
  level: string;
}

export default async function LessonPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const lesson = findLesson(id);
  const m = getMessages(locale);
  if (!lesson) notFound();

  const rules = (rulesData as Rule[]).filter((r) => lesson.rule_ids.includes(r.id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link href={`/${locale}/learn/lessons`} className="text-sm text-teal-700 hover:underline inline-flex items-center gap-1 mb-3">
          ← {locale === 'kk' ? 'Барлық сабақтар' : 'Все уроки'}
        </Link>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === 'kk' ? lesson.title_kk : lesson.title_ru}
          </h1>
          <LevelBadge level={lesson.difficulty} />
        </div>
        <p className="text-gray-500">
          {locale === 'kk' ? lesson.description_kk : lesson.description_ru}
        </p>
      </div>

      {rules.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📖 {locale === 'kk' ? 'Осы сабаққа тиісті ережелер' : 'Правила для этого урока'}
          </h2>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="border-l-4 border-teal-500 pl-4 py-2">
                <Link href={`/${locale}/learn/basics#${rule.id}`} className="block hover:bg-gray-50 -mx-4 px-4 py-1 rounded">
                  <p className="font-medium text-gray-900 text-sm">
                    {locale === 'kk' ? rule.title_kk : rule.title_ru}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {locale === 'kk' ? rule.description_kk : rule.description_ru}
                  </p>
                  {rule.examples?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rule.examples.slice(0, 3).map((ex, i) => (
                        <code key={i} className="text-[11px] bg-teal-50 text-teal-800 rounded px-1.5 py-0.5 font-mono">{ex}</code>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
          <Link
            href={`/${locale}/learn/basics`}
            className="inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-800 mt-4"
          >
            {locale === 'kk' ? 'Толық анықтамалық' : 'Полный справочник'} →
          </Link>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {locale === 'kk' ? 'Жаттығулар' : 'Упражнения'}
        </h2>
        <AdaptiveExercise locale={locale} />
      </div>

      <span className="hidden">{m.learn.lessons}</span>
    </div>
  );
}
