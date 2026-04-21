'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';
import Badge from '@/components/ui/Badge';
import { MENTOR_META, type LessonMeta, type MentorKey } from '@/data/lessons-meta';
import { cn } from '@/lib/utils';

type FilterKey = 'all' | MentorKey;

const FILTERS: { key: FilterKey; label_kk: string; label_ru: string; icon: string }[] = [
  { key: 'all', label_kk: 'Барлығы', label_ru: 'Все', icon: '📚' },
  {
    key: 'abai',
    label_kk: `С ${MENTOR_META.abai.name_kk}`,
    label_ru: `С ${MENTOR_META.abai.name_ru}`,
    icon: MENTOR_META.abai.icon,
  },
  {
    key: 'baitursynuly',
    label_kk: `С ${MENTOR_META.baitursynuly.name_kk}`,
    label_ru: `С ${MENTOR_META.baitursynuly.name_ru}`,
    icon: MENTOR_META.baitursynuly.icon,
  },
  {
    key: 'auezov',
    label_kk: `С ${MENTOR_META.auezov.name_kk}`,
    label_ru: `С ${MENTOR_META.auezov.name_ru}`,
    icon: MENTOR_META.auezov.icon,
  },
];

const FILTER_ACCENT: Record<FilterKey, string> = {
  all: 'bg-gray-900 text-white border-gray-900',
  abai: 'bg-indigo-600 text-white border-indigo-600',
  baitursynuly: 'bg-emerald-600 text-white border-emerald-600',
  auezov: 'bg-amber-600 text-white border-amber-600',
};

function mentorBadgeClass(mentor: MentorKey): string {
  switch (mentor) {
    case 'abai':
      return 'bg-indigo-50 text-indigo-700';
    case 'baitursynuly':
      return 'bg-emerald-50 text-emerald-700';
    case 'auezov':
      return 'bg-amber-50 text-amber-700';
  }
}

function isMentorKey(v: string | null): v is MentorKey {
  return v === 'abai' || v === 'baitursynuly' || v === 'auezov';
}

export default function LessonsList({
  locale,
  lessons,
}: {
  locale: string;
  lessons: LessonMeta[];
}) {
  const searchParams = useSearchParams();
  const urlMentor = searchParams.get('mentor');
  // Инициализируем из URL один раз. Дальше фильтр — локальное состояние (chips без навигации).
  const [filter, setFilter] = useState<FilterKey>(() =>
    isMentorKey(urlMentor) ? urlMentor : 'all'
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return lessons;
    return lessons.filter((l) => l.mentor_track === filter);
  }, [filter, lessons]);

  return (
    <div>
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

      {/* Chip-фильтры наставников */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? FILTER_ACCENT[f.key]
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              )}
              aria-pressed={isActive}
            >
              <span>{f.icon}</span>
              <span>{locale === 'kk' ? f.label_kk : f.label_ru}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          {locale === 'kk' ? 'Бұл сүзгі бойынша сабақтар жоқ.' : 'По этому фильтру уроков нет.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lesson, idx) => {
            const mentor = lesson.mentor_track;
            const mentorMeta = mentor ? MENTOR_META[mentor] : null;
            return (
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
                      {mentor && mentorMeta && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                            mentorBadgeClass(mentor)
                          )}
                          title={locale === 'kk' ? mentorMeta.track_kk : mentorMeta.track_ru}
                        >
                          <span>{mentorMeta.icon}</span>
                          <span>
                            {locale === 'kk' ? mentorMeta.name_kk : mentorMeta.name_ru}
                          </span>
                        </span>
                      )}
                      {lesson.required_level && (
                        <span className="text-xs text-gray-500">
                          {locale === 'kk'
                            ? `деңгей: ${lesson.required_level}+`
                            : `уровень: ${lesson.required_level}+`}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg">→</span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
