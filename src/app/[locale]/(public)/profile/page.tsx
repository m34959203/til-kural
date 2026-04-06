import { getMessages } from '@/lib/i18n';
import ProgressTracker from '@/components/features/ProgressTracker';
import StreakTracker from '@/components/features/StreakTracker';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import LevelBadge from '@/components/ui/LevelBadge';
import MentorAvatar from '@/components/features/MentorAvatar';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{m.profile.title}</h1>

      {/* User info */}
      <Card className="mb-8">
        <div className="flex items-center gap-4">
          <Avatar name="Test User" size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Test User</h2>
            <p className="text-gray-500 text-sm">test@example.com</p>
            <div className="flex items-center gap-2 mt-2">
              <LevelBadge level="B1" />
              <MentorAvatar mentor="abai" size="sm" showName locale={locale} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressTracker locale={locale} />
        </div>
        <div>
          <StreakTracker locale={locale} currentStreak={12} longestStreak={25} />
        </div>
      </div>
    </div>
  );
}
