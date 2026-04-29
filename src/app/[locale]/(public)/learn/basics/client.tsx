'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';

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

interface BasicsClientProps {
  locale: string;
  rules: Rule[];
}

// Категории + английские slug-якоря (для нормальных URL — раньше был
// процент-кодированный казахский). + русские переводы заголовков (P0 audit).
const TOPIC_META: Record<string, { slug: string; icon: string; ru: string }> = {
  'Дыбыс үндестігі': { slug: 'phonetic-harmony', icon: '🔊', ru: 'Звуковая гармония' },
  'Зат есім': { slug: 'noun', icon: '📦', ru: 'Существительное' },
  'Сын есім': { slug: 'adjective', icon: '🎨', ru: 'Прилагательное' },
  'Етістік': { slug: 'verb', icon: '🏃', ru: 'Глагол' },
  'Сөйлем құрылымы': { slug: 'sentence', icon: '📝', ru: 'Структура предложения' },
  'Шылаулар': { slug: 'postpositions', icon: '🔗', ru: 'Послелоги' },
  'Сан есім': { slug: 'numeral', icon: '🔢', ru: 'Числительное' },
  'Есімдік': { slug: 'pronoun', icon: '👤', ru: 'Местоимение' },
  'Жұрнақтар': { slug: 'suffixes', icon: '🧩', ru: 'Суффиксы' },
  'Фонетика': { slug: 'phonetics', icon: '🗣️', ru: 'Фонетика' },
  'Емле': { slug: 'orthography', icon: '✏️', ru: 'Орфография' },
  'Мақал-мәтелдер': { slug: 'proverbs', icon: '💬', ru: 'Пословицы' },
};

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export default function BasicsClient({ locale, rules }: BasicsClientProps) {
  const isKk = locale === 'kk';
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filtered = useMemo(
    () => (levelFilter === 'all' ? rules : rules.filter((r) => r.level === levelFilter)),
    [rules, levelFilter],
  );

  const byTopic = useMemo(() => {
    return filtered.reduce<Record<string, Rule[]>>((acc, r) => {
      (acc[r.topic] ||= []).push(r);
      return acc;
    }, {});
  }, [filtered]);

  // Считаем, сколько правил каждого уровня в полном банке (для chips-counter).
  const totalsByLevel = useMemo(() => {
    const t: Record<string, number> = {};
    for (const r of rules) t[r.level] = (t[r.level] ?? 0) + 1;
    return t;
  }, [rules]);

  const topics = Object.keys(byTopic);
  const topicLabel = (topic: string) => {
    const meta = TOPIC_META[topic];
    if (!meta) return topic;
    return isKk ? topic : meta.ru;
  };
  const topicSlug = (topic: string) => TOPIC_META[topic]?.slug ?? encodeURIComponent(topic);
  const topicIcon = (topic: string) => TOPIC_META[topic]?.icon ?? '📚';

  // Простой markdown-substitution: \n → <br/>, **текст** → <strong>.
  const renderRich = (text: string) => {
    const lines = text.split('\n');
    return (
      <>
        {lines.map((line, i) => (
          <span key={i}>
            {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
              const m = part.match(/^\*\*([^*]+)\*\*$/);
              if (m) return <strong key={j}>{m[1]}</strong>;
              return <span key={j}>{part}</span>;
            })}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isKk ? 'Қазақ тілінің негіздері' : 'Основы казахского языка'}
        </h1>
        <p className="text-gray-500">
          {isKk
            ? 'Грамматиканың негізгі ережелері, мысалдармен'
            : 'Основные правила грамматики с примерами и переводами'}
        </p>
      </div>

      {/* Level filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-1">
          {isKk ? 'Деңгей:' : 'Уровень:'}
        </span>
        <button
          onClick={() => setLevelFilter('all')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            levelFilter === 'all' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-300 hover:border-teal-400'
          }`}
        >
          {isKk ? 'Барлығы' : 'Все'} ({rules.length})
        </button>
        {CEFR_ORDER.map((lv) => {
          const count = totalsByLevel[lv] ?? 0;
          if (count === 0) return null;
          const active = levelFilter === lv;
          return (
            <button
              key={lv}
              onClick={() => setLevelFilter(lv)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-300 hover:border-teal-400'
              }`}
            >
              {lv} ({count})
            </button>
          );
        })}
      </div>

      {/* Quick-nav топики (английские slug-якоря для нормальных URL) */}
      <div className="flex flex-wrap gap-2 mb-8 sticky top-16 bg-gray-50/95 backdrop-blur py-3 z-10">
        {topics.map((topic) => (
          <a
            key={topic}
            href={`#${topicSlug(topic)}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm hover:border-teal-500 hover:text-teal-700 transition-colors"
          >
            <span>{topicIcon(topic)}</span>
            <span>{topicLabel(topic)}</span>
            <span className="text-xs text-gray-400">{byTopic[topic].length}</span>
          </a>
        ))}
      </div>

      {topics.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          {isKk
            ? 'Бұл деңгейге арналған ережелер табылмады.'
            : 'Для этого уровня правил пока нет.'}
        </p>
      )}

      <div className="space-y-10">
        {topics.map((topic) => (
          <section key={topic} id={topicSlug(topic)} className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>{topicIcon(topic)}</span>
              <span>{topicLabel(topic)}</span>
              {!isKk && (
                <span className="text-sm font-normal text-gray-400">({topic})</span>
              )}
            </h2>
            <div className="space-y-4">
              {byTopic[topic].map((rule) => (
                <div key={rule.id} id={rule.id} className="scroll-mt-32">
                  <Card className="scroll-mt-32">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isKk ? rule.title_kk : rule.title_ru}
                      </h3>
                      <LevelBadge level={rule.level} size="sm" />
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                      {renderRich(isKk ? rule.description_kk : rule.description_ru)}
                    </div>

                    {rule.examples?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                          {isKk ? 'Мысалдар' : 'Примеры'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rule.examples.map((ex, i) => (
                            <code key={i} className="text-xs bg-teal-50 border border-teal-100 text-teal-800 rounded px-2 py-1 font-mono break-words [overflow-wrap:anywhere] max-w-full">
                              {ex}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.exceptions && rule.exceptions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-2 uppercase">
                          ⚠️ {isKk ? 'Ерекшеліктер' : 'Исключения'}
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
          {isKk ? 'Білімді іс жүзінде қолданыңыз' : 'Примените знания на практике'}
        </h3>
        <p className="text-sm text-teal-700 mb-4">
          {isKk
            ? 'Алған білімді бекіту үшін интерактивті жаттығулар орындаңыз'
            : 'Закрепите знания с помощью интерактивных упражнений'}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`/${locale}/learn/lessons`} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800">
            📚 {isKk ? 'Сабақтар' : 'Уроки'}
          </Link>
          <Link href={`/${locale}/test/topics`} className="bg-white border border-teal-200 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-50">
            ✅ {isKk ? 'Тақырыптық тесттер' : 'Тематические тесты'}
          </Link>
          <Link href={`/${locale}/test/kaztest`} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">
            🎯 {isKk ? 'ҚАЗТЕСТ' : 'КАЗТЕСТ'}
          </Link>
        </div>
      </div>
    </div>
  );
}
