import achievementsData from '@/data/achievements.json';
import AchievementBadge from '@/components/features/AchievementBadge';

export default async function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const earned = ['first_lesson', 'streak_7', 'polyglot'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Жетістіктер' : 'Достижения'}
      </h1>
      <p className="text-gray-500 mb-8">
        {earned.length}/{achievementsData.length} {locale === 'kk' ? 'алынған' : 'получено'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievementsData.map((achievement) => (
          <AchievementBadge
            key={achievement.code}
            title={locale === 'kk' ? achievement.title_kk : achievement.title_ru}
            description={locale === 'kk' ? achievement.description_kk : achievement.description_ru}
            icon={achievement.icon}
            earned={earned.includes(achievement.code)}
          />
        ))}
      </div>
    </div>
  );
}
