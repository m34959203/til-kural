import { cn } from '@/lib/utils';
import ShareButton from '@/components/features/ShareButton';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  className?: string;
  shareable?: boolean;
  locale?: string;
  /** Absolute URL for sharing (defaults to current page when empty) */
  shareUrl?: string;
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

export default function AchievementBadge({
  title,
  description,
  icon,
  earned,
  className,
  shareable = false,
  locale = 'ru',
  shareUrl,
}: AchievementBadgeProps) {
  const iconChar = ICON_MAP[icon] || '⭐';
  const ogImage = `/api/og/badge?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&icon=${encodeURIComponent(iconChar)}&locale=${locale}`;

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
        {iconChar}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm truncate">{title}</h4>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      {earned && !shareable && <span className="text-green-500 text-sm">✓</span>}
      {earned && shareable && (
        <ShareButton
          size="sm"
          variant="ghost"
          locale={locale}
          url={shareUrl || (typeof window !== 'undefined' ? window.location.href : 'https://til-kural.kz')}
          title={
            locale === 'kk'
              ? `${title} — Тіл-құрал жетістігі`
              : `${title} — достижение Тіл-құрал`
          }
          text={description}
          image={ogImage}
          className="shrink-0"
        />
      )}
    </div>
  );
}
