import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

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
}

interface EventCalendarProps {
  locale: string;
  events?: EventRow[];
}

const TYPE_VARIANTS: Record<string, 'info' | 'success' | 'warning' | 'gold' | 'default'> = {
  conference: 'info',
  seminar: 'success',
  event: 'warning',
  program: 'gold',
};

export default function EventCalendar({ locale, events = [] }: EventCalendarProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
        <p className="text-gray-500">
          {locale === 'kk'
            ? 'Жақын арада жаңа іс-шаралар жарияланатын болады.'
            : 'Скоро появятся новые мероприятия.'}
        </p>
      </div>
    );
  }

  // Group by month (YYYY-MM)
  const byMonth = events.reduce<Record<string, EventRow[]>>((acc, ev) => {
    const d = new Date(ev.start_date);
    if (Number.isNaN(d.getTime())) return acc;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    (acc[key] ||= []).push(ev);
    return acc;
  }, {});

  const monthKeys = Object.keys(byMonth).sort();

  return (
    <div className="space-y-6">
      {monthKeys.map((month) => {
        const list = byMonth[month];
        const date = new Date(month + '-01');
        return (
          <div key={month}>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {date.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
                year: 'numeric',
                month: 'long',
              })}
            </h2>
            <div className="space-y-3">
              {list.map((event) => {
                const title = locale === 'kk' ? event.title_kk : event.title_ru;
                const description =
                  locale === 'kk' ? event.description_kk : event.description_ru;
                const start = new Date(event.start_date);
                return (
                  <Card key={event.id} hover>
                    <div className="flex items-start gap-4">
                      <div className="text-center bg-teal-50 rounded-lg px-3 py-2 min-w-[60px]">
                        <p className="text-2xl font-bold text-teal-700">
                          {start.getDate()}
                        </p>
                        <p className="text-xs text-teal-600">
                          {start.toLocaleDateString(
                            locale === 'kk' ? 'kk-KZ' : 'ru-RU',
                            { month: 'short' },
                          )}
                        </p>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{title}</h3>
                        {description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {description}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {event.location}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                          {event.event_type && (
                            <Badge
                              variant={
                                TYPE_VARIANTS[event.event_type] || 'default'
                              }
                            >
                              {event.event_type}
                            </Badge>
                          )}
                          {event.registration_url && (
                            <a
                              href={event.registration_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-teal-700 hover:underline"
                            >
                              {locale === 'kk' ? 'Тіркелу →' : 'Регистрация →'}
                            </a>
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
