'use client';

import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakCounter({ streak, locale = 'kk', size = 'md' }: StreakCounterProps) {
  const isActive = streak > 0;
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn('flex items-center gap-1.5', sizes[size])}>
      <span className={cn('text-xl', isActive ? 'animate-pulse' : 'opacity-40')}>
        {isActive ? '🔥' : '❄️'}
      </span>
      <span className={cn('font-bold', isActive ? 'text-orange-500' : 'text-gray-400')}>
        {streak}
      </span>
      <span className="text-gray-500 text-sm">
        {locale === 'kk' ? 'күн' : 'дн.'}
      </span>
    </div>
  );
}
