export async function GET() {
  const events = [
    { id: '1', title_kk: 'Қазақ тілі апталығы', title_ru: 'Неделя казахского языка', start_date: '2026-04-14', event_type: 'conference', status: 'upcoming' },
    { id: '2', title_kk: 'ҚАЗТЕСТ дайындық семинары', title_ru: 'Семинар подготовки к КАЗТЕСТ', start_date: '2026-04-20', event_type: 'seminar', status: 'upcoming' },
    { id: '3', title_kk: 'Диктант — Тіл байлығы', title_ru: 'Диктант — Богатство языка', start_date: '2026-05-01', event_type: 'event', status: 'upcoming' },
  ];

  return Response.json({ events });
}
