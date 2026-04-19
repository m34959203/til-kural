import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { db } from '@/lib/db';
import { eventJsonLd } from '@/lib/seo';

interface EventCalendarProps {
  locale: string;
}

const FALLBACK = [
  { id: '1', title_kk: 'Қазақ тілі апталығы', title_ru: 'Неделя казахского языка', start_date: '2026-04-14', event_type: 'conference', status: 'upcoming', description_kk: '', description_ru: '' },
  { id: '2', title_kk: 'ҚАЗТЕСТ дайындық семинары', title_ru: 'Семинар подготовки к КАЗТЕСТ', start_date: '2026-04-20', event_type: 'seminar', status: 'upcoming', description_kk: '', description_ru: '' },
  { id: '3', title_kk: 'Диктант — Тіл байлығы', title_ru: 'Диктант — Богатство языка', start_date: '2026-05-01', event_type: 'event', status: 'upcoming', description_kk: '', description_ru: '' },
  { id: '4', title_kk: 'Жазғы тіл лагері', title_ru: 'Летний языковой лагерь', start_date: '2026-06-01', event_type: 'program', status: 'upcoming', description_kk: '', description_ru: '' },
];

export default async function EventCalendar({ locale }: EventCalendarProps) {
  let events: typeof FALLBACK = FALLBACK;
  try {
    const rows = await db.query('events', undefined, { orderBy: 'start_date', order: 'asc', limit: 50 });
    if (rows.length) events = rows as unknown as typeof FALLBACK;
  } catch { /* fallback */ }

  const typeVariants: Record<string, 'info' | 'success' | 'warning' | 'gold'> = {
    conference: 'info',
    seminar: 'success',
    event: 'warning',
    program: 'gold',
  };

  const ld = events.map((e) =>
    eventJsonLd({
      locale,
      id: e.id,
      title: locale === 'kk' ? e.title_kk : e.title_ru,
      description: locale === 'kk' ? e.description_kk || e.title_kk : e.description_ru || e.title_ru,
      startDate: e.start_date,
    }),
  );

  // Group by month
  const byMonth = events.reduce<Record<string, typeof FALLBACK>>((acc, ev) => {
    const d = new Date(ev.start_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    (acc[key] ||= []).push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {Object.entries(byMonth).map(([month, list]) => {
        const date = new Date(month + '-01');
        return (
          <div key={month}>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {date.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', { year: 'numeric', month: 'long' })}
            </h2>
            <div className="space-y-3">
              {list.map((event) => (
                <Card key={event.id} hover>
                  <div className="flex items-start gap-4">
                    <div className="text-center bg-teal-50 rounded-lg px-3 py-2 min-w-[60px]">
                      <p className="text-2xl font-bold text-teal-700">{new Date(event.start_date).getDate()}</p>
                      <p className="text-xs text-teal-600">
                        {new Date(event.start_date).toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', { month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{locale === 'kk' ? event.title_kk : event.title_ru}</h3>
                      {(event.description_kk || event.description_ru) && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {locale === 'kk' ? event.description_kk : event.description_ru}
                        </p>
                      )}
                      <div className="mt-2">
                        <Badge variant={typeVariants[event.event_type] || 'default'}>
                          {event.event_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
