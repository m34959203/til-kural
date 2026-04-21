import { cn } from '@/lib/utils';

interface LessonLockBadgeProps {
  required: string;
  locale: string;
  className?: string;
}

/**
 * Компактный бейдж «замок + требуемый уровень» для карточек закрытых уроков.
 * На hover показывает подсказку «Открыто с {уровня}».
 */
export default function LessonLockBadge({ required, locale, className }: LessonLockBadgeProps) {
  const title =
    locale === 'kk'
      ? `${required}-деңгейінен ашылады`
      : `Открыто с уровня ${required}`;

  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gray-900 text-white',
        'px-2 py-0.5 text-xs font-semibold shadow-sm',
        className
      )}
    >
      <span aria-hidden>🔒</span>
      <span>{required}</span>
    </span>
  );
}
