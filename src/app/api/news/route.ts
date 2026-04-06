export async function GET() {
  const news = [
    { slug: 'kazakh-language-week-2026', title_kk: 'Қазақ тілі апталығы — 2026', title_ru: 'Неделя казахского языка — 2026', status: 'published', published_at: '2026-04-01' },
    { slug: 'new-ai-features', title_kk: 'Жаңа AI мүмкіндіктер қосылды', title_ru: 'Добавлены новые AI возможности', status: 'published', published_at: '2026-03-25' },
    { slug: 'kaztest-preparation', title_kk: 'ҚАЗТЕСТ дайындық бағдарламасы', title_ru: 'Программа подготовки к КАЗТЕСТ', status: 'published', published_at: '2026-03-20' },
  ];

  return Response.json({ news });
}
