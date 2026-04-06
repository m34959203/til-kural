import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  className?: string;
}

const ICON_MAP: Record<string, string> = {
  footprints: '👣',
  'book-open': '📖',
  'check-circle': '✅',
  mic: '🎤',
  'pen-tool': '✍️',
  flame: '🔥',
  zap: '⚡',
  trophy: '🏆',
  award: '🏅',
  camera: '📷',
  map: '🗺️',
  'trending-up': '📈',
  star: '⭐',
};

export default function AchievementBadge({ title, description, icon, earned, className }: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all',
        earned
          ? 'bg-amber-50 border-amber-200'
          : 'bg-gray-50 border-gray-200 opacity-50 grayscale',
        className
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
          earned ? 'bg-amber-100' : 'bg-gray-200'
        )}
      >
        {ICON_MAP[icon] || '⭐'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm truncate">{title}</h4>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      {earned && <span className="text-green-500 text-sm">✓</span>}
    </div>
  );
}
