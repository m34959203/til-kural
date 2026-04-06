export async function GET() {
  // Demo leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Айгерім Т.', xp: 5200, level: 9, streak: 45 },
    { rank: 2, name: 'Нұрлан К.', xp: 4800, level: 8, streak: 32 },
    { rank: 3, name: 'Дарья М.', xp: 4500, level: 8, streak: 28 },
    { rank: 4, name: 'Асан Б.', xp: 4100, level: 7, streak: 21 },
    { rank: 5, name: 'Мадина С.', xp: 3800, level: 7, streak: 19 },
    { rank: 6, name: 'Тимур Ж.', xp: 3500, level: 6, streak: 15 },
    { rank: 7, name: 'Камила А.', xp: 3200, level: 6, streak: 12 },
    { rank: 8, name: 'Ерлан Н.', xp: 2900, level: 5, streak: 10 },
    { rank: 9, name: 'Жанар О.', xp: 2600, level: 5, streak: 8 },
    { rank: 10, name: 'Руслан Т.', xp: 2300, level: 4, streak: 5 },
  ];

  return Response.json({ leaderboard });
}
