'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Recommendation {
  topic: string;
  avg_score: number;
  attempts: number;
  last_seen: string | null;
  weakness_score: number;
  is_new: boolean;
  recommendation: 'lesson' | 'test' | 'basics';
  target_id: string;
  target_label_kk: string;
  target_label_ru: string;
}

interface NextAction {
  kind: 'lesson' | 'test' | 'basics' | 'welcome';
  target_id: string;
  label_kk: string;
  label_ru: string;
}

interface RecommendResponse {
  weakTopics: Recommendation[];
  nextAction: NextAction;
  isOnboarding: boolean;
}

interface Messages {
  recommendTitle: string;
  recommendSubtitle: string;
  recommendWelcome: string;
  recommendStartTest: string;
  recommendLoginHint: string;
  recommendNewTopic: string;
  recommendWeak: string;
  recommendAvg: string;
  recommendLastSeen: string;
  recommendCtaLesson: string;
  recommendCtaTest: string;
  recommendCtaBasics: string;
  recommendEmpty: string;
  loading: string;
}

interface Props {
  locale: string;
  messages: Messages;
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

function topicLabel(topic: string, locale: string): string {
  const entry = TOPIC_LABELS[topic];
  if (!entry) return topic;
  return locale === 'kk' ? entry.kk : entry.ru;
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '—';
  }
}

function ctaLabel(kind: Recommendation['recommendation'], m: Messages): string {
  if (kind === 'lesson') return m.recommendCtaLesson;
  if (kind === 'test') return m.recommendCtaTest;
  return m.recommendCtaBasics;
}

function icon(kind: Recommendation['recommendation']): string {
  if (kind === 'lesson') return '📚';
  if (kind === 'test') return '📝';
  return '📖';
}

async function loadRecommendations(token: string, signal: AbortSignal): Promise<{
  data: RecommendResponse | null;
  unauth: boolean;
}> {
  const res = await fetch('/api/recommend/next', {
    headers: { authorization: `Bearer ${token}` },
    signal,
  });
  if (res.status === 401) return { data: null, unauth: true };
  const payload = (await res.json()) as RecommendResponse;
  return { data: payload, unauth: false };
}

export default function RecommendedTopics({ locale, messages }: Props) {
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'unauth' | 'ready'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

    const run = async () => {
      if (!token) {
        setStatus('unauth');
        return;
      }
      try {
        const result = await loadRecommendations(token, controller.signal);
        if (controller.signal.aborted) return;
        if (result.unauth) {
          setStatus('unauth');
          return;
        }
        setData(result.data);
        setStatus('ready');
      } catch {
        if (!controller.signal.aborted) setStatus('ready');
      }
    };

    void run();
    return () => controller.abort();
  }, []);

  const loading = status === 'loading';
  const unauthenticated = status === 'unauth';

  if (loading) {
    return (
      <section className="mb-8">
        <Card padding="sm" className="text-center text-gray-400 text-sm">
          {messages.loading}
        </Card>
      </section>
    );
  }

  if (unauthenticated) {
    return (
      <section className="mb-8">
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-gray-900">{messages.recommendTitle}</h2>
          <p className="text-sm text-gray-500">{messages.recommendLoginHint}</p>
        </div>
        <Card padding="md" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-sm text-gray-600">{messages.recommendWelcome}</p>
          <Link href={`/${locale}/test/level`}>
            <Button size="sm">{messages.recommendStartTest}</Button>
          </Link>
        </Card>
      </section>
    );
  }

  if (!data) return null;

  if (data.isOnboarding || data.weakTopics.length === 0) {
    const isWelcome = data.isOnboarding;
    return (
      <section className="mb-8">
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-gray-900">{messages.recommendTitle}</h2>
          <p className="text-sm text-gray-500">{messages.recommendSubtitle}</p>
        </div>
        <Card padding="md" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            {isWelcome ? messages.recommendWelcome : messages.recommendEmpty}
          </p>
          <Link href={`/${locale}${data.nextAction.target_id}`}>
            <Button size="sm">
              {locale === 'kk' ? data.nextAction.label_kk : data.nextAction.label_ru}
            </Button>
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-gray-900">{messages.recommendTitle}</h2>
        <p className="text-sm text-gray-500">{messages.recommendSubtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.weakTopics.map((rec) => (
          <Card key={rec.topic} padding="md" className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{icon(rec.recommendation)}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rec.is_new ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                {rec.is_new ? messages.recommendNewTopic : messages.recommendWeak}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              {topicLabel(rec.topic, locale)}
            </h3>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
              {locale === 'kk' ? rec.target_label_kk : rec.target_label_ru}
            </p>
            <dl className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
              <div>
                <dt className="text-gray-400">{messages.recommendAvg}</dt>
                <dd className="font-medium text-gray-800">
                  {rec.is_new ? '—' : `${Math.round(rec.avg_score)}%`}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">{messages.recommendLastSeen}</dt>
                <dd className="font-medium text-gray-800">{formatDate(rec.last_seen, locale)}</dd>
              </div>
            </dl>
            <Link href={`/${locale}${rec.target_id}`} className="mt-auto">
              <Button size="sm" className="w-full">
                {ctaLabel(rec.recommendation, messages)}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
