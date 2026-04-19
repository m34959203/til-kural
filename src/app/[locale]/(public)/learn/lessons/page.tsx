import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';
import Badge from '@/components/ui/Badge';
import { LESSONS } from '@/data/lessons-meta';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

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

      <Link
        href={`/${locale}/learn/basics`}
        className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-5 py-4 mb-6 hover:bg-teal-100 transition-colors"
      >
        <div>
          <p className="font-medium text-teal-900 flex items-center gap-2">
            📖 {locale === 'kk' ? 'Тілдің негіздері — 21 ереже' : 'Основы языка — 21 правило'}
          </p>
          <p className="text-sm text-teal-700 mt-1">
            {locale === 'kk' ? 'Грамматика анықтамалығы мысалдармен' : 'Справочник грамматики с примерами'}
          </p>
        </div>
        <span className="text-teal-700 text-xl">→</span>
      </Link>

      <div className="space-y-3">
        {LESSONS.map((lesson, idx) => (
          <Link key={lesson.id} href={`/${locale}/learn/lessons/${lesson.id}`}>
            <Card hover className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">
                  {locale === 'kk' ? lesson.title_kk : lesson.title_ru}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {locale === 'kk' ? lesson.description_kk : lesson.description_ru}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <LevelBadge level={lesson.difficulty} size="sm" />
                  <Badge variant="default">{lesson.topic}</Badge>
                  {lesson.rule_ids.length > 0 && (
                    <Badge variant="info">
                      📖 {lesson.rule_ids.length} {locale === 'kk' ? 'ереже' : 'правил'}
                    </Badge>
                  )}
                </div>
              </div>
              <span className="text-gray-400 text-lg">→</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
