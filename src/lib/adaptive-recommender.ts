import { db } from './db';
import { LESSONS, type LessonMeta } from '@/data/lessons-meta';
import rulesData from '@/data/kazakh-grammar-rules.json';

export interface TopicStat {
  id?: string;
  user_id: string;
  topic_slug: string;
  attempts: number;
  correct: number;
  avg_score: number;
  weakness_score: number;
  last_attempt_at: string | null;
  updated_at?: string;
}

export interface QuestionOutcome {
  topic: string;
  is_correct: boolean;
}

export type RecommendationKind = 'lesson' | 'test' | 'basics';

export interface Recommendation {
  topic: string;
  avg_score: number;
  attempts: number;
  last_seen: string | null;
  weakness_score: number;
  is_new: boolean;
  recommendation: RecommendationKind;
  target_id: string;
  target_label_kk: string;
  target_label_ru: string;
}

export interface NextAction {
  kind: RecommendationKind | 'welcome';
  target_id: string;
  label_kk: string;
  label_ru: string;
}

export interface RecommendResponse {
  weakTopics: Recommendation[];
  nextAction: NextAction;
  isOnboarding: boolean;
}

const DECAY_PER_DAY = 1.5;
const MAX_DECAY = 40;
const NEW_TOPIC_SCORE = 55;
const TOP_WEAK_LIMIT = 3;

interface GrammarRule {
  id: string;
  topic: string;
  title_kk: string;
  title_ru: string;
}

const RULES = rulesData as GrammarRule[];

function daysBetween(fromIso: string | null, now: Date): number {
  if (!fromIso) return 0;
  const from = new Date(fromIso).getTime();
  if (Number.isNaN(from)) return 0;
  const diff = now.getTime() - from;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function computeWeaknessScore(
  attempts: number,
  avgScore: number,
  lastAttemptAt: string | null,
  now: Date = new Date(),
): number {
  if (attempts < 2) return NEW_TOPIC_SCORE;
  const decay = Math.min(MAX_DECAY, daysBetween(lastAttemptAt, now) * DECAY_PER_DAY);
  const base = 100 - avgScore;
  const score = base + decay;
  return Math.max(0, Math.min(200, Number(score.toFixed(2))));
}

interface RawStatRow {
  id?: string;
  user_id: string;
  topic_slug: string;
  attempts: number | string;
  correct: number | string;
  avg_score: number | string;
  weakness_score: number | string;
  last_attempt_at: string | null;
  updated_at?: string;
}

function normalizeStat(row: RawStatRow): TopicStat {
  return {
    id: row.id,
    user_id: row.user_id,
    topic_slug: row.topic_slug,
    attempts: Number(row.attempts) || 0,
    correct: Number(row.correct) || 0,
    avg_score: Number(row.avg_score) || 0,
    weakness_score: Number(row.weakness_score) || 0,
    last_attempt_at: row.last_attempt_at,
    updated_at: row.updated_at,
  };
}

async function findStat(userId: string, topicSlug: string): Promise<TopicStat | null> {
  const row = await db.findOne('user_topic_stats', { user_id: userId, topic_slug: topicSlug });
  return row ? normalizeStat(row as RawStatRow) : null;
}

async function listUserStats(userId: string): Promise<TopicStat[]> {
  const rows = await db.query('user_topic_stats', { user_id: userId });
  return (rows as RawStatRow[]).map(normalizeStat);
}

export async function recordTestOutcomes(userId: string, outcomes: QuestionOutcome[]): Promise<void> {
  if (!userId || outcomes.length === 0) return;

  const aggregated = new Map<string, { attempts: number; correct: number }>();
  for (const o of outcomes) {
    if (!o.topic) continue;
    const slot = aggregated.get(o.topic) ?? { attempts: 0, correct: 0 };
    slot.attempts += 1;
    if (o.is_correct) slot.correct += 1;
    aggregated.set(o.topic, slot);
  }

  const now = new Date();
  const nowIso = now.toISOString();

  for (const [topicSlug, delta] of aggregated) {
    const existing = await findStat(userId, topicSlug);
    const attempts = (existing?.attempts ?? 0) + delta.attempts;
    const correct = (existing?.correct ?? 0) + delta.correct;
    const avgScore = attempts === 0 ? 0 : Number(((correct / attempts) * 100).toFixed(2));
    const weaknessScore = computeWeaknessScore(attempts, avgScore, nowIso, now);

    if (existing?.id) {
      await db.update('user_topic_stats', existing.id, {
        attempts,
        correct,
        avg_score: avgScore,
        weakness_score: weaknessScore,
        last_attempt_at: nowIso,
        updated_at: nowIso,
      });
    } else {
      await db.insert('user_topic_stats', {
        user_id: userId,
        topic_slug: topicSlug,
        attempts,
        correct,
        avg_score: avgScore,
        weakness_score: weaknessScore,
        last_attempt_at: nowIso,
        updated_at: nowIso,
      });
    }
  }
}

const TOPIC_LABELS: Record<string, { kk: string; ru: string }> = {
  grammar: { kk: 'Грамматика', ru: 'Грамматика' },
  vocabulary: { kk: 'Сөздік қор', ru: 'Словарный запас' },
  reading: { kk: 'Оқылым', ru: 'Чтение' },
  listening: { kk: 'Тыңдалым', ru: 'Аудирование' },
  writing: { kk: 'Жазылым', ru: 'Письмо' },
  family: { kk: 'Отбасы', ru: 'Семья' },
  food: { kk: 'Тамақ', ru: 'Еда' },
  colors: { kk: 'Түстер', ru: 'Цвета' },
  numbers: { kk: 'Сандар', ru: 'Числа' },
  days: { kk: 'Апта күндері', ru: 'Дни недели' },
  greetings: { kk: 'Амандасу', ru: 'Приветствия' },
  professions: { kk: 'Мамандықтар', ru: 'Профессии' },
  city: { kk: 'Қала', ru: 'Город' },
  nature: { kk: 'Табиғат', ru: 'Природа' },
  weather: { kk: 'Ауа райы', ru: 'Погода' },
  conversation: { kk: 'Сөйлесу', ru: 'Разговор' },
  cases: { kk: 'Септіктер', ru: 'Падежи' },
  tenses: { kk: 'Етістік шақтары', ru: 'Времена глагола' },
};

function topicLabel(topic: string): { kk: string; ru: string } {
  return TOPIC_LABELS[topic] ?? { kk: topic, ru: topic };
}

function findLessonForTopic(topicSlug: string): LessonMeta | null {
  const direct = LESSONS.find((l) => l.topic === topicSlug);
  if (direct) return direct;

  const rule = RULES.find((r) => r.topic.toLowerCase().includes(topicSlug.toLowerCase()));
  if (rule) {
    const byRule = LESSONS.find((l) => l.rule_ids.includes(rule.id));
    if (byRule) return byRule;
  }
  return null;
}

function findRuleForTopic(topicSlug: string): GrammarRule | null {
  const byTopic = RULES.find((r) => r.topic.toLowerCase().includes(topicSlug.toLowerCase()));
  if (byTopic) return byTopic;
  return null;
}

const THEMATIC_TEST_TOPICS = new Set([
  'family', 'food', 'colors', 'numbers', 'days', 'greetings',
  'professions', 'city', 'nature', 'weather', 'grammar', 'vocabulary',
]);

function buildRecommendation(stat: TopicStat): Recommendation {
  const label = topicLabel(stat.topic_slug);
  const isNew = stat.attempts < 2;

  const lesson = findLessonForTopic(stat.topic_slug);
  if (lesson) {
    return {
      topic: stat.topic_slug,
      avg_score: stat.avg_score,
      attempts: stat.attempts,
      last_seen: stat.last_attempt_at,
      weakness_score: stat.weakness_score,
      is_new: isNew,
      recommendation: 'lesson',
      target_id: `/learn/lessons/${lesson.id}`,
      target_label_kk: lesson.title_kk,
      target_label_ru: lesson.title_ru,
    };
  }

  const rule = findRuleForTopic(stat.topic_slug);
  if (rule) {
    return {
      topic: stat.topic_slug,
      avg_score: stat.avg_score,
      attempts: stat.attempts,
      last_seen: stat.last_attempt_at,
      weakness_score: stat.weakness_score,
      is_new: isNew,
      recommendation: 'basics',
      target_id: `/learn/basics#${rule.id}`,
      target_label_kk: rule.title_kk,
      target_label_ru: rule.title_ru,
    };
  }

  if (THEMATIC_TEST_TOPICS.has(stat.topic_slug)) {
    return {
      topic: stat.topic_slug,
      avg_score: stat.avg_score,
      attempts: stat.attempts,
      last_seen: stat.last_attempt_at,
      weakness_score: stat.weakness_score,
      is_new: isNew,
      recommendation: 'test',
      target_id: `/test/topics/${stat.topic_slug}`,
      target_label_kk: label.kk,
      target_label_ru: label.ru,
    };
  }

  return {
    topic: stat.topic_slug,
    avg_score: stat.avg_score,
    attempts: stat.attempts,
    last_seen: stat.last_attempt_at,
    weakness_score: stat.weakness_score,
    is_new: isNew,
    recommendation: 'basics',
    target_id: '/learn/basics',
    target_label_kk: label.kk,
    target_label_ru: label.ru,
  };
}

export async function getRecommendations(userId: string, now: Date = new Date()): Promise<RecommendResponse> {
  const rawStats = await listUserStats(userId);

  if (rawStats.length === 0) {
    return {
      weakTopics: [],
      isOnboarding: true,
      nextAction: {
        kind: 'welcome',
        target_id: '/test/level',
        label_kk: 'Деңгей анықтау тестін тапсырыңыз',
        label_ru: 'Пройдите тест на определение уровня',
      },
    };
  }

  const refreshed = rawStats.map((s) => ({
    ...s,
    weakness_score: computeWeaknessScore(s.attempts, s.avg_score, s.last_attempt_at, now),
  }));

  const sorted = refreshed.sort((a, b) => b.weakness_score - a.weakness_score);
  const top = sorted.slice(0, TOP_WEAK_LIMIT).map(buildRecommendation);

  const primary = top[0];
  const nextAction: NextAction = primary
    ? {
        kind: primary.recommendation,
        target_id: primary.target_id,
        label_kk: primary.target_label_kk,
        label_ru: primary.target_label_ru,
      }
    : {
        kind: 'welcome',
        target_id: '/test/level',
        label_kk: 'Деңгей анықтау тестін тапсырыңыз',
        label_ru: 'Пройдите тест на определение уровня',
      };

  return {
    weakTopics: top,
    isOnboarding: false,
    nextAction,
  };
}
