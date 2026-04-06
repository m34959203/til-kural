import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import XPBar from '@/components/ui/XPBar';
import StreakCounter from '@/components/ui/StreakCounter';
import QuestTracker from '@/components/features/QuestTracker';

export default async function GamePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{m.game.title}</h1>

      {/* User stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-500 mb-2">XP & {m.game.level}</p>
          <XPBar xp={1250} level={4} locale={locale} />
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{m.game.streak}</p>
            <StreakCounter streak={12} locale={locale} size="lg" />
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{m.game.rank}</p>
            <p className="text-3xl font-bold text-amber-500">#7</p>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href={`/${locale}/game/quests`}>
          <Card hover className="text-center h-full">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-semibold text-gray-900">{m.game.quests}</h3>
          </Card>
        </Link>
        <Link href={`/${locale}/game/leaderboard`}>
          <Card hover className="text-center h-full">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold text-gray-900">{m.game.leaderboard}</h3>
          </Card>
        </Link>
        <Link href={`/${locale}/game/achievements`}>
          <Card hover className="text-center h-full">
            <div className="text-3xl mb-2">🏅</div>
            <h3 className="font-semibold text-gray-900">{m.game.achievements}</h3>
          </Card>
        </Link>
      </div>

      {/* Active quests */}
      <QuestTracker locale={locale} />
    </div>
  );
}
