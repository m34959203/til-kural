import { cn, getLanguageLevelColor } from '@/lib/utils';

interface LevelBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold',
        getLanguageLevelColor(level),
        sizes[size],
        className
      )}
    >
      {level}
    </span>
  );
}
