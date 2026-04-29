import EventCalendar, { type EventRow } from '@/components/features/EventCalendar';
import { db } from '@/lib/db';
import { buildMetadata, eventJsonLd } from '@/lib/seo';
import { withEffectiveStatus } from '@/lib/event-status';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: locale === 'kk' ? 'Іс-шаралар' : 'Мероприятия',
    description: locale === 'kk'
      ? 'Тіл-құрал орталығының алдағы іс-шаралары мен оқиғалары.'
      : 'Предстоящие мероприятия и события центра «Тіл-құрал».',
    path: `/${locale}/events`,
  });
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let events: EventRow[] = [];
  try {
    const rows = await db.query('events', undefined, { orderBy: 'start_date', order: 'asc', limit: 100 });
    // Не показываем drafts/scheduled публично; обогащаем effective_status.
    const filtered = (rows as Record<string, unknown>[]).filter((r) => {
      if (r.status === 'draft') return false;
      const sched = r.scheduled_at;
      if (!sched) return true;
      try {
        return new Date(sched as string).getTime() <= Date.now();
      } catch { return true; }
    });
    events = withEffectiveStatus(filtered) as unknown as EventRow[];
  } catch {
    /* keep empty */
  }

  // JSON-LD только для предстоящих (и «сегодня»)
  const nowTs = new Date().getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const upcoming = events.filter((e) => {
    if (!e.start_date) return false;
    const ts = new Date(e.start_date).getTime();
    return !Number.isNaN(ts) && ts >= nowTs - dayMs;
  });
  const ld = upcoming.map((e) =>
    eventJsonLd({
      locale,
      id: e.id,
      title: locale === 'kk' ? e.title_kk : e.title_ru,
      description:
        (locale === 'kk' ? e.description_kk : e.description_ru) ||
        (locale === 'kk' ? e.title_kk : e.title_ru),
      startDate: e.start_date,
      endDate: e.end_date || undefined,
      location: e.location || undefined,
      image: e.image_url || undefined,
    }),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {ld.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Іс-шаралар' : 'Мероприятия'}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Алдағы іс-шаралар мен оқиғалар' : 'Предстоящие мероприятия и события'}
      </p>
      <EventCalendar locale={locale} events={events} />
    </div>
  );
}
