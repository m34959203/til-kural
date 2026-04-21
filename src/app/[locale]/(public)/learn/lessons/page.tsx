import { getMessages } from '@/lib/i18n';
import { LESSONS, type LessonMeta, type MentorKey, type CefrLevel } from '@/data/lessons-meta';
import { buildMetadata } from '@/lib/seo';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import LessonsList from './LessonsList';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: locale === 'kk' ? 'Сабақтар' : 'Уроки',
    description: locale === 'kk'
      ? 'Қадам-қадаммен қазақ тілі сабақтары A1-ден B2-ге дейін.'
      : 'Пошаговые уроки казахского языка от A1 до B2.',
    path: `/${locale}/learn/lessons`,
  });
}

interface DBLesson {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk?: string | null;
  description_ru?: string | null;
  topic: string;
  difficulty: string;
  content?: unknown;
  sort_order?: number;
  mentor_track?: string | null;
  required_level?: string | null;
  rule_ids?: string[] | null;
}

function isMentorKey(v: unknown): v is MentorKey {
  return v === 'abai' || v === 'baitursynuly' || v === 'auezov';
}

function isCefr(v: unknown): v is CefrLevel {
  return v === 'A1' || v === 'A2' || v === 'B1' || v === 'B2' || v === 'C1' || v === 'C2';
}

function dbToMeta(row: DBLesson): LessonMeta {
  return {
    id: String(row.id),
    title_kk: row.title_kk,
    title_ru: row.title_ru,
    topic: row.topic,
    difficulty: row.difficulty,
    description_kk: row.description_kk || '',
    description_ru: row.description_ru || '',
    rule_ids: Array.isArray(row.rule_ids) ? row.rule_ids : [],
    mentor_track: isMentorKey(row.mentor_track) ? row.mentor_track : undefined,
    required_level: isCefr(row.required_level) ? row.required_level : undefined,
  };
}

async function loadDbLessons(): Promise<DBLesson[]> {
  try {
    const rows = await db.query('lessons', undefined, { orderBy: 'sort_order', order: 'asc' });
    return rows as DBLesson[];
  } catch {
    return [];
  }
}

function mergeLessons(meta: LessonMeta[], dbRows: DBLesson[]): LessonMeta[] {
  if (dbRows.length === 0) return meta;
  const dbById = new Map(dbRows.map((r) => [String(r.id), r]));
  const usedDbIds = new Set<string>();

  const merged: LessonMeta[] = meta.map((m) => {
    const dbRow = dbById.get(String(m.id));
    if (!dbRow) return m;
    usedDbIds.add(String(m.id));
    // БД переопределяет заголовок/описание/сложность, остальные метаполя берём из каталога
    return {
      ...m,
      title_kk: dbRow.title_kk ?? m.title_kk,
      title_ru: dbRow.title_ru ?? m.title_ru,
      description_kk: dbRow.description_kk ?? m.description_kk,
      description_ru: dbRow.description_ru ?? m.description_ru,
      topic: dbRow.topic ?? m.topic,
      difficulty: dbRow.difficulty ?? m.difficulty,
    };
  });

  // Новые уроки из БД (которых нет в meta-каталоге) — добавляем в конец
  for (const row of dbRows) {
    if (!usedDbIds.has(String(row.id))) {
      merged.push(dbToMeta(row));
    }
  }
  return merged;
}

export default async function LessonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  const dbRows = await loadDbLessons();
  const lessons = mergeLessons(LESSONS, dbRows);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{m.learn.lessonsTitle}</h1>
      <p className="text-gray-500 mb-6">
        {locale === 'kk' ? 'Қадам-қадаммен қазақ тілін үйреніңіз' : 'Изучайте казахский язык шаг за шагом'}
      </p>

      <LessonsList locale={locale} lessons={lessons} />
    </div>
  );
}
