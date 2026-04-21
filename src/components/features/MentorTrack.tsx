'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';
import MentorAvatar from '@/components/features/MentorAvatar';
import {
  LESSONS,
  MENTOR_META,
  hasLevelAccess,
  lessonsByMentor,
  type MentorKey,
  type LessonMeta,
} from '@/data/lessons-meta';
import { cn } from '@/lib/utils';

interface MentorTrackProps {
  /** Текущий выбранный наставник пользователя. Если не задан — показываем выбор. */
  mentor?: MentorKey | string | null;
  /** CEFR-уровень пользователя (A1/A2/B1/B2/C1/C2). Используется для «🔒». */
  currentLevel?: string | null;
  /** id уже пройденных уроков (из user_lessons). */
  completedLessonIds?: string[];
  /** Локаль для UI (kk/ru). */
  locale?: string;
}

const ACCENT_CLASSES: Record<
  string,
  { card: string; dot: string; btn: string; ring: string; text: string }
> = {
  indigo: {
    card: 'bg-indigo-50/60 border-indigo-100',
    dot: 'bg-indigo-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    ring: 'ring-indigo-200',
    text: 'text-indigo-700',
  },
  emerald: {
    card: 'bg-emerald-50/60 border-emerald-100',
    dot: 'bg-emerald-600',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    ring: 'ring-emerald-200',
    text: 'text-emerald-700',
  },
  amber: {
    card: 'bg-amber-50/60 border-amber-100',
    dot: 'bg-amber-600',
    btn: 'bg-amber-600 hover:bg-amber-700',
    ring: 'ring-amber-200',
    text: 'text-amber-700',
  },
};

function isKnownMentor(key: unknown): key is MentorKey {
  return key === 'abai' || key === 'baitursynuly' || key === 'auezov';
}

export default function MentorTrack({
  mentor,
  currentLevel,
  completedLessonIds = [],
  locale = 'kk',
}: MentorTrackProps) {
  // Локальный override — если mentor не задан, пользователь может выбрать прямо на странице.
  const [selected, setSelected] = useState<MentorKey | null>(
    isKnownMentor(mentor) ? mentor : null
  );

  const active: MentorKey | null = selected;

  if (!active) {
    return (
      <Card className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {locale === 'kk' ? 'Ұстазды таңдаңыз' : 'Выберите наставника'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {locale === 'kk'
            ? 'Әр ұстаз өз бағытымен жетелейді: Абай — мәдениет, Байтұрсынұлы — грамматика, Әуезов — лексика.'
            : 'Каждый наставник ведёт своим путём: Абай — культура, Байтұрсынұлы — грамматика, Әуезов — лексика.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(MENTOR_META) as MentorKey[]).map((k) => {
            const meta = MENTOR_META[k];
            const accent = ACCENT_CLASSES[meta.accent] ?? ACCENT_CLASSES.indigo;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelected(k)}
                className={cn(
                  'text-left rounded-xl border p-4 transition-colors hover:shadow-md',
                  accent.card
                )}
              >
                <div className="flex items-center gap-3">
                  <MentorAvatar mentor={k} size="md" locale={locale} />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {locale === 'kk' ? meta.name_kk : meta.name_ru}
                    </div>
                    <div className="text-xs text-gray-500">
                      {meta.icon}{' '}
                      {locale === 'kk' ? meta.track_kk : meta.track_ru}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <ActiveTrack
      mentor={active}
      currentLevel={currentLevel}
      completedLessonIds={completedLessonIds}
      locale={locale}
    />
  );
}

function ActiveTrack({
  mentor,
  currentLevel,
  completedLessonIds,
  locale,
}: {
  mentor: MentorKey;
  currentLevel?: string | null;
  completedLessonIds: string[];
  locale: string;
}) {
  const meta = MENTOR_META[mentor];
  const accent = ACCENT_CLASSES[meta.accent] ?? ACCENT_CLASSES.indigo;

  const track = useMemo(() => lessonsByMentor(mentor), [mentor]);
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

  // Первый непройденный урок, до которого есть доступ по уровню.
  const currentLessonId = useMemo(() => {
    const found = track.find(
      (l) => !completedSet.has(l.id) && hasLevelAccess(currentLevel, l.required_level)
    );
    return found?.id ?? null;
  }, [track, completedSet, currentLevel]);

  // Если всё пройдено — берём последний.
  const continueLesson: LessonMeta | null =
    track.find((l) => l.id === currentLessonId) ?? null;

  const doneCount = track.filter((l) => completedSet.has(l.id)).length;

  return (
    <Card className={cn('mt-8 border', accent.card)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <MentorAvatar mentor={mentor} size="lg" locale={locale} />
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              {locale === 'kk' ? 'Оқу жолы' : 'Учебный путь'}
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {meta.icon} {locale === 'kk' ? meta.track_kk : meta.track_ru}
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              {locale === 'kk'
                ? `${doneCount} / ${track.length} сабақ өтілген`
                : `${doneCount} / ${track.length} уроков пройдено`}
            </div>
          </div>
        </div>
        {continueLesson && (
          <Link
            href={`/${locale}/learn/lessons/${continueLesson.id}`}
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
              accent.btn
            )}
          >
            {locale === 'kk'
              ? `${meta.name_kk}мен жалғастыру →`
              : `Продолжить с ${meta.name_ru === 'Байтұрсынұлы' ? 'Байтұрсынұлы' : meta.name_ru === 'Әуезов' ? 'Әуезовым' : 'Абаем'} →`}
          </Link>
        )}
      </div>

      {track.length === 0 ? (
        <div className="text-sm text-gray-500 py-6 text-center">
          {locale === 'kk' ? 'Бұл ұстаздың жолында сабақтар жоқ.' : 'У этого наставника нет уроков.'}
        </div>
      ) : (
        <ol className="space-y-2">
          {track.map((lesson, idx) => {
            const completed = completedSet.has(lesson.id);
            const locked = !hasLevelAccess(currentLevel, lesson.required_level);
            const isCurrent = lesson.id === currentLessonId;

            const status: 'done' | 'current' | 'locked' | 'todo' = completed
              ? 'done'
              : locked
                ? 'locked'
                : isCurrent
                  ? 'current'
                  : 'todo';

            const iconEl =
              status === 'done' ? (
                <span className="text-green-600">✓</span>
              ) : status === 'current' ? (
                <span className={cn('h-2 w-2 rounded-full', accent.dot)} />
              ) : status === 'locked' ? (
                <span className="text-gray-400">🔒</span>
              ) : (
                <span className="text-gray-400 text-xs">{idx + 1}</span>
              );

            const inner = (
              <div
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                  status === 'locked'
                    ? 'bg-gray-50 border-gray-100 opacity-70'
                    : 'bg-white border-gray-100 hover:border-gray-200',
                  status === 'current' && cn('ring-2', accent.ring)
                )}
              >
                <div className="w-7 h-7 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                  {iconEl}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'font-medium text-sm',
                        status === 'locked' ? 'text-gray-500' : 'text-gray-900'
                      )}
                    >
                      {locale === 'kk' ? lesson.title_kk : lesson.title_ru}
                    </span>
                    <LevelBadge level={lesson.difficulty} size="sm" />
                    {status === 'done' && (
                      <span className="text-xs text-green-700">
                        {locale === 'kk' ? '✓ өтілді' : '✓ пройдено'}
                      </span>
                    )}
                    {status === 'current' && (
                      <span className={cn('text-xs font-medium', accent.text)}>
                        {locale === 'kk' ? '▶ ағымдағы' : '▶ текущий'}
                      </span>
                    )}
                    {status === 'locked' && lesson.required_level && (
                      <span className="text-xs text-gray-500">
                        {locale === 'kk'
                          ? `қажет: ${lesson.required_level}`
                          : `нужен: ${lesson.required_level}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            if (status === 'locked') {
              return <li key={lesson.id}>{inner}</li>;
            }

            return (
              <li key={lesson.id}>
                <Link
                  href={`/${locale}/learn/lessons/${lesson.id}`}
                  className="block focus:outline-none"
                >
                  {inner}
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-4 text-right">
        <span className="text-xs text-gray-400">
          {LESSONS.length > 0 &&
            (locale === 'kk'
              ? `Барлық сабақтардың ${Math.round((track.length / LESSONS.length) * 100)}%`
              : `${Math.round((track.length / LESSONS.length) * 100)}% всех уроков`)}
        </span>
      </div>
    </Card>
  );
}
