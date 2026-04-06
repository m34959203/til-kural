import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface EventCalendarProps {
  locale: string;
}

export default function EventCalendar({ locale }: EventCalendarProps) {
  const events = [
    { id: '1', title_kk: 'Қазақ тілі апталығы', title_ru: 'Неделя казахского языка', date: '2026-04-14', type: 'conference', status: 'upcoming' },
    { id: '2', title_kk: 'ҚАЗТЕСТ дайындық семинары', title_ru: 'Семинар подготовки к КАЗТЕСТ', date: '2026-04-20', type: 'seminar', status: 'upcoming' },
    { id: '3', title_kk: 'Диктант — Тіл байлығы', title_ru: 'Диктант — Богатство языка', date: '2026-05-01', type: 'event', status: 'upcoming' },
    { id: '4', title_kk: 'Жазғы тіл лагері', title_ru: 'Летний языковой лагерь', date: '2026-06-01', type: 'program', status: 'upcoming' },
  ];

  const typeVariants: Record<string, 'info' | 'success' | 'warning' | 'gold'> = {
    conference: 'info',
    seminar: 'success',
    event: 'warning',
    program: 'gold',
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} hover>
          <div className="flex items-start gap-4">
            <div className="text-center bg-teal-50 rounded-lg px-3 py-2 min-w-[60px]">
              <p className="text-2xl font-bold text-teal-700">
                {new Date(event.date).getDate()}
              </p>
              <p className="text-xs text-teal-600">
                {new Date(event.date).toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', { month: 'short' })}
              </p>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {locale === 'kk' ? event.title_kk : event.title_ru}
              </h3>
              <div className="mt-2">
                <Badge variant={typeVariants[event.type] || 'default'}>
                  {event.type}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
