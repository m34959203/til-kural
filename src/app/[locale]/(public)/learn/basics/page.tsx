import Link from 'next/link';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';
import Badge from '@/components/ui/Badge';
import rules from '@/data/kazakh-grammar-rules.json';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: locale === 'kk' ? 'Қазақ тілінің негіздері' : 'Основы казахского языка',
    description: locale === 'kk'
      ? 'Қазақ тілінің грамматика негіздері: сингармонизм, септіктер, етістік шақтары, көптік және тәуелдік жалғаулары.'
      : 'Основы грамматики казахского языка: сингармонизм, падежи, времена глагола, окончания.',
    path: `/${locale}/learn/basics`,
  });
}

interface Rule {
  id: string;
  topic: string;
  title_kk: string;
  title_ru: string;
  level: string;
  description_kk: string;
  description_ru: string;
  examples: string[];
  exceptions?: string[];
}

const TOPIC_ICONS: Record<string, string> = {
  'Дыбыс үндестігі': '🔊',
  'Зат есім': '📦',
  'Сын есім': '🎨',
  'Етістік': '🏃',
  'Есімдік': '👤',
  'Сан есім': '🔢',
  'Үстеу': '↗️',
  'Шылау': '🔗',
  'Сөйлем': '📝',
};

export default async function BasicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const byTopic = (rules as Rule[]).reduce<Record<string, Rule[]>>((acc, r) => {
    (acc[r.topic] ||= []).push(r);
    return acc;
  }, {});

  const topics = Object.keys(byTopic);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {locale === 'kk' ? 'Қазақ тілінің негіздері' : 'Основы казахского языка'}
        </h1>
        <p className="text-gray-500">
          {locale === 'kk'
            ? 'Грамматиканың негізгі ережелері, мысалдармен'
            : 'Основные правила грамматики с примерами'}
        </p>
      </div>

      {/* Quick-nav */}
      <div className="flex flex-wrap gap-2 mb-8 sticky top-16 bg-gray-50 py-3 z-10">
        {topics.map((topic) => (
          <a
            key={topic}
            href={`#${encodeURIComponent(topic)}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm hover:border-teal-500 hover:text-teal-700 transition-colors"
          >
            <span>{TOPIC_ICONS[topic] || '📚'}</span>
            <span>{topic}</span>
            <span className="text-xs text-gray-400">{byTopic[topic].length}</span>
          </a>
        ))}
      </div>

      <div className="space-y-10">
        {topics.map((topic) => (
          <section key={topic} id={encodeURIComponent(topic)} className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>{TOPIC_ICONS[topic] || '📚'}</span>
              <span>{topic}</span>
            </h2>
            <div className="space-y-4">
              {byTopic[topic].map((rule) => (
                <div key={rule.id} id={rule.id} className="scroll-mt-32">
                <Card className="scroll-mt-32">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {locale === 'kk' ? rule.title_kk : rule.title_ru}
                    </h3>
                    <LevelBadge level={rule.level} size="sm" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {locale === 'kk' ? rule.description_kk : rule.description_ru}
                  </p>

                  {rule.examples?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                        {locale === 'kk' ? 'Мысалдар' : 'Примеры'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rule.examples.map((ex, i) => (
                          <code key={i} className="text-xs bg-teal-50 border border-teal-100 text-teal-800 rounded px-2 py-1 font-mono">
                            {ex}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.exceptions && rule.exceptions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-2 uppercase">
                        ⚠️ {locale === 'kk' ? 'Ерекшеліктер' : 'Исключения'}
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        {rule.exceptions.map((exc, i) => <li key={i}>{exc}</li>)}
                      </ul>
                    </div>
                  )}
                </Card>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 bg-teal-50 border border-teal-100 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-teal-900 mb-2">
          {locale === 'kk' ? 'Білімді іс жүзінде қолданыңыз' : 'Примените знания на практике'}
        </h3>
        <p className="text-sm text-teal-700 mb-4">
          {locale === 'kk'
            ? 'Алған білімді бекіту үшін интерактивті жаттығулар орындаңыз'
            : 'Закрепите знания с помощью интерактивных упражнений'}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`/${locale}/learn/lessons`} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800">
            📚 {locale === 'kk' ? 'Сабақтар' : 'Уроки'}
          </Link>
          <Link href={`/${locale}/test/topics`} className="bg-white border border-teal-200 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-50">
            ✅ {locale === 'kk' ? 'Тақырыптық тесттер' : 'Тематические тесты'}
          </Link>
          <Link href={`/${locale}/test/kaztest`} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">
            🎯 {locale === 'kk' ? 'ҚАЗТЕСТ' : 'КАЗТЕСТ'}
          </Link>
        </div>
      </div>
    </div>
  );
}
