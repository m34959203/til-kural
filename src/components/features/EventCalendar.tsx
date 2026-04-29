'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { computeEffectiveStatus, type EventStatus } from '@/lib/event-status';

export interface EventRow {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk?: string | null;
  description_ru?: string | null;
  image_url?: string | null;
  event_type?: string;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  registration_url?: string | null;
  status?: string;
  effective_status?: EventStatus;
  slug?: string | null;
}

interface EventCalendarProps {
  locale: string;
  events?: EventRow[];
}

const TYPE_VARIANTS: Record<string, 'info' | 'success' | 'warning' | 'gold' | 'default'> = {
  conference: 'info',
  seminar: 'success',
  event: 'warning',
  webinar: 'info',
  workshop: 'gold',
  festival: 'gold',
  contest: 'warning',
  camp: 'success',
};

const TYPE_LABELS: Record<string, { kk: string; ru: string }> = {
  event: { kk: 'Іс-шара', ru: 'Мероприятие' },
  seminar: { kk: 'Семинар', ru: 'Семинар' },
  webinar: { kk: 'Вебинар', ru: 'Вебинар' },
  workshop: { kk: 'Шеберхана', ru: 'Мастер-класс' },
  conference: { kk: 'Конференция', ru: 'Конференция' },
  festival: { kk: 'Фестиваль', ru: 'Фестиваль' },
  contest: { kk: 'Байқау', ru: 'Конкурс' },
  camp: { kk: 'Лагерь', ru: 'Лагерь' },
};

function gcalLink(event: EventRow, locale: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const start = fmt(event.start_date);
  const end = event.end_date ? fmt(event.end_date) : start;
  const title = locale === 'kk' ? event.title_kk : event.title_ru;
  const desc = (locale === 'kk' ? event.description_kk : event.description_ru) || '';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: desc,
    location: event.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function EventCalendar({ locale, events = [] }: EventCalendarProps) {
  const isKk = locale === 'kk';
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  // Группируем по effective_status (если бэкенд не пришлёт — считаем сами).
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const up: EventRow[] = [];
    const pa: EventRow[] = [];
    for (const e of events) {
      const eff = e.effective_status || computeEffectiveStatus(e, now);
      if (eff === 'past' || eff === 'cancelled') pa.push(e);
      else up.push(e);
    }
    pa.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    return { upcoming: up, past: pa };
  }, [events]);

  const currentList = tab === 'upcoming' ? upcoming : past;

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
        <p className="text-gray-500">
          {isKk
            ? 'Жақын арада жаңа іс-шаралар жарияланатын болады.'
            : 'Скоро появятся новые мероприятия.'}
        </p>
      </div>
    );
  }

  // Group by month (YYYY-MM)
  const byMonth = currentList.reduce<Record<string, EventRow[]>>((acc, ev) => {
    const d = new Date(ev.start_date);
    if (Number.isNaN(d.getTime())) return acc;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    (acc[key] ||= []).push(ev);
    return acc;
  }, {});
  const monthKeys = Object.keys(byMonth).sort(tab === 'upcoming' ? undefined : (a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Tabs upcoming / past — закрывает audit P1: архив прошедших */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'upcoming' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {isKk ? 'Алдағы' : 'Предстоящие'} ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'past' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {isKk ? 'Өткен' : 'Прошедшие'} ({past.length})
        </button>
      </div>

      {currentList.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-gray-500">
            {tab === 'upcoming'
              ? (isKk ? 'Алдағы іс-шаралар әзірге жоқ.' : 'Предстоящих мероприятий пока нет.')
              : (isKk ? 'Әлі өткен іс-шаралар жоқ.' : 'Прошедших мероприятий пока нет.')}
          </p>
        </div>
      )}

      {monthKeys.map((month) => {
        const list = byMonth[month];
        const date = new Date(month + '-01');
        return (
          <div key={month}>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {date.toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU', {
                year: 'numeric',
                month: 'long',
              })}
            </h2>
            <div className="space-y-3">
              {list.map((event) => {
                const title = isKk ? event.title_kk : event.title_ru;
                const description = isKk ? event.description_kk : event.description_ru;
                const start = new Date(event.start_date);
                const typeLabel = event.event_type
                  ? (TYPE_LABELS[event.event_type]?.[isKk ? 'kk' : 'ru'] || event.event_type)
                  : null;
                const eff = event.effective_status || computeEffectiveStatus(event);
                return (
                  <Card key={event.id} hover>
                    <div className="flex items-start gap-4">
                      <div className="text-center bg-teal-50 rounded-lg px-3 py-2 min-w-[60px] shrink-0">
                        <p className="text-2xl font-bold text-teal-700">{start.getDate()}</p>
                        <p className="text-xs text-teal-600">
                          {start.toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU', { month: 'short' })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900">{title}</h3>
                          {eff === 'ongoing' && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              ● {isKk ? 'Жүріп жатыр' : 'Идёт сейчас'}
                            </span>
                          )}
                          {eff === 'cancelled' && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-800">
                              {isKk ? 'Болдырылмады' : 'Отменено'}
                            </span>
                          )}
                          {eff === 'past' && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {isKk ? 'Өтті' : 'Прошло'}
                            </span>
                          )}
                        </div>
                        {description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
                        )}
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                          {typeLabel && (
                            <Badge variant={TYPE_VARIANTS[event.event_type || ''] || 'default'}>
                              {typeLabel}
                            </Badge>
                          )}
                          {event.registration_url ? (
                            <a
                              href={event.registration_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-teal-700 hover:underline"
                            >
                              {isKk ? 'Тіркелу →' : 'Регистрация →'}
                            </a>
                          ) : eff !== 'past' && eff !== 'cancelled' ? (
                            // Fallback CTA когда нет registration_url (audit P1).
                            <Link
                              href={`/${locale}/contacts`}
                              className="text-xs text-teal-700 hover:underline"
                            >
                              {isKk ? 'Ұйымдастырушылармен байланыс →' : 'Связаться с организатором →'}
                            </Link>
                          ) : null}
                          {eff !== 'past' && eff !== 'cancelled' && (
                            <a
                              href={gcalLink(event, locale)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-600 hover:text-teal-700"
                            >
                              📅 {isKk ? 'Күнтізбеге қосу' : 'В календарь'}
                            </a>
                          )}
                          {event.slug && (
                            <Link
                              href={`/${locale}/events/${event.slug}`}
                              className="text-xs text-gray-600 hover:text-teal-700"
                            >
                              {isKk ? 'Толығырақ →' : 'Подробнее →'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
