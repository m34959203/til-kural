'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdaptiveExercise from '@/components/features/AdaptiveExercise';
import MarkComplete from '@/components/features/MarkComplete';
import LessonLockBadge from '@/components/features/LessonLockBadge';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';
import { findLesson, LESSONS, type LessonMeta } from '@/data/lessons-meta';
import { LESSON_CONTENT } from '@/data/lesson-content';
import { isUnlocked } from '@/lib/level-gate';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import rulesData from '@/data/kazakh-grammar-rules.json';

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

export default function LessonPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const lesson = findLesson(id);
  const { user, loading } = useCurrentUser();

  if (!lesson) notFound();

  // Поле required_level добавляется другим агентом и может отсутствовать в типе.
  const requiredLevel: string | undefined = (lesson as any).required_level ?? undefined;
  const userLevel = user?.language_level ?? null;
  const unlocked = isUnlocked(userLevel, requiredLevel);

  const rules = (rulesData as Rule[]).filter((r) => lesson.rule_ids.includes(r.id));
  const content = LESSON_CONTENT[lesson.id];
  const goals = locale === 'kk' ? content?.goals_kk : content?.goals_ru;
  const culturalNote = locale === 'kk' ? content?.culturalNote_kk : content?.culturalNote_ru;
  const lessonTitle = locale === 'kk' ? lesson.title_kk : lesson.title_ru;
  const targetVocab = content?.vocabulary?.map((v) => `${v.kk} (${v.ru})`) ?? [];
  const targetGrammar = rules.map((r) => locale === 'kk' ? r.title_kk : r.title_ru);

  // Пока ждём ответ /api/auth/me — показываем скелетон, чтобы гейт не мигал
  // (иначе успеем отрендерить контент до загрузки user и он мелькнёт для анонимов).
  if (loading && requiredLevel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-40 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!unlocked && requiredLevel) {
    return (
      <LessonGate
        locale={locale}
        lesson={lesson}
        requiredLevel={requiredLevel}
        userLevel={userLevel}
        isAnonymous={!user}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href={`/${locale}/learn/lessons`}
          className="text-sm text-teal-700 hover:underline inline-flex items-center gap-1 mb-3"
        >
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

      {goals && goals.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            🎯 {locale === 'kk' ? 'Сіз нені үйренесіз' : 'Чему вы научитесь'}
          </h2>
          <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
            {goals.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </Card>
      )}

      {content?.vocabulary && content.vocabulary.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📚 {locale === 'kk' ? 'Тақырып сөздігі' : 'Словарь темы'}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {content.vocabulary.map((v, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold text-gray-900">{v.kk}</span>
                {v.tr && <span className="text-xs text-gray-400">{v.tr}</span>}
                <span className="text-gray-600">— {v.ru}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {content?.dialogue && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            💬 {locale === 'kk' ? content.dialogue.title_kk : content.dialogue.title_ru}
          </h2>
          <div className="space-y-2.5">
            {content.dialogue.lines.map((line, i) => (
              <div key={i} className="border-l-2 border-teal-300 pl-3">
                <div className="text-xs font-semibold text-teal-700 uppercase tracking-wide">{line.speaker}</div>
                <div className="text-sm text-gray-900">{line.kk}</div>
                <div className="text-xs text-gray-500 italic">{line.ru}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {culturalNote && (
        <Card className="border-amber-100 bg-amber-50/40">
          <h2 className="text-base font-semibold text-amber-900 mb-1.5 flex items-center gap-2">
            🇰🇿 {locale === 'kk' ? 'Мәдени ескертпе' : 'Культурная заметка'}
          </h2>
          <p className="text-sm text-amber-900/90">{culturalNote}</p>
        </Card>
      )}

      {rules.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📖 {locale === 'kk' ? 'Осы сабаққа тиісті ережелер' : 'Правила для этого урока'}
          </h2>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="border-l-4 border-teal-500 pl-4 py-2">
                <Link
                  href={`/${locale}/learn/basics#${rule.id}`}
                  className="block hover:bg-gray-50 -mx-4 px-4 py-1 rounded"
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {locale === 'kk' ? rule.title_kk : rule.title_ru}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {locale === 'kk' ? rule.description_kk : rule.description_ru}
                  </p>
                  {rule.examples?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rule.examples.slice(0, 3).map((ex, i) => (
                        <code
                          key={i}
                          className="text-[11px] bg-teal-50 text-teal-800 rounded px-1.5 py-0.5 font-mono"
                        >
                          {ex}
                        </code>
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
        <AdaptiveExercise
          locale={locale}
          lessonId={lesson.id}
          lessonTitle={lessonTitle}
          targetVocab={targetVocab.length > 0 ? targetVocab : undefined}
          targetGrammar={targetGrammar.length > 0 ? targetGrammar : undefined}
        />
      </div>

      <div className="pt-2">
        <MarkComplete lessonId={lesson.id} locale={locale} />
      </div>
    </div>
  );
}

interface LessonGateProps {
  locale: string;
  lesson: LessonMeta;
  requiredLevel: string;
  userLevel: string | null;
  isAnonymous: boolean;
}

function LessonGate({ locale, lesson, requiredLevel, userLevel, isAnonymous }: LessonGateProps) {
  // Список уроков, доступных пользователю сейчас (если анон — A1-уроки).
  const available = LESSONS.filter((l) => {
    const req = (l as any).required_level ?? undefined;
    return isUnlocked(userLevel, req);
  }).slice(0, 8);

  const title =
    locale === 'kk'
      ? `Бұл сабақ ${requiredLevel} деңгейінен ашылады`
      : `Этот урок открывается с уровня ${requiredLevel}`;

  const currentLine = isAnonymous
    ? locale === 'kk'
      ? 'Деңгейіңізге қарай қол жеткізуді тексеру үшін кіріңіз.'
      : 'Войдите, чтобы оценить доступ по уровню.'
    : userLevel
      ? locale === 'kk'
        ? `Сіздің ағымдағы деңгейіңіз: ${userLevel}. Осы сабақты ашу үшін деңгей тестінен өтіңіз.`
        : `Ваш текущий уровень: ${userLevel}. Пройдите тест уровня, чтобы открыть этот урок.`
      : locale === 'kk'
        ? 'Сіздің деңгейіңіз әлі анықталмаған. Деңгей тестінен өтіңіз.'
        : 'Ваш уровень ещё не определён. Пройдите тест уровня.';

  const ctaLabel = locale === 'kk' ? 'Деңгей тестінен өту' : 'Пройти тест уровня';
  const backLabel = locale === 'kk' ? 'Барлық сабақтар' : 'Все уроки';
  const availableHeading =
    locale === 'kk' ? 'Сізге қазір қолжетімді сабақтар' : 'Доступные вам сейчас уроки';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href={`/${locale}/learn/lessons`}
          className="text-sm text-teal-700 hover:underline inline-flex items-center gap-1 mb-3"
        >
          ← {backLabel}
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

      <Card className="border-2 border-dashed border-amber-200 bg-amber-50/40">
        <div className="flex flex-col items-center text-center py-6 space-y-4">
          <div className="text-5xl" aria-hidden>
            🔒
          </div>
          <h2 className="text-xl font-semibold text-gray-900 max-w-xl">{title}</h2>
          <p className="text-sm text-gray-700 max-w-xl">{currentLine}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`/${locale}/test/level`}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 shadow-sm transition-colors"
            >
              {ctaLabel} →
            </Link>
            <LessonLockBadge required={requiredLevel} locale={locale} />
          </div>
        </div>
      </Card>

      {available.length > 0 && (
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-3">{availableHeading}</h3>
          <ul className="divide-y divide-gray-100">
            {available.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/${locale}/learn/lessons/${l.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded"
                >
                  <span className="text-sm text-gray-900">
                    {locale === 'kk' ? l.title_kk : l.title_ru}
                  </span>
                  <LevelBadge level={l.difficulty} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
