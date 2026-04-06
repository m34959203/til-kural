'use client';

import { getXPForNextLevel, getLevelName } from '@/lib/utils';
import Progress from './Progress';

interface XPBarProps {
  xp: number;
  level: number;
  locale?: string;
  showDetails?: boolean;
}

export default function XPBar({ xp, level, locale = 'kk', showDetails = true }: XPBarProps) {
  const { current, next, progress } = getXPForNextLevel(xp);
  const levelName = getLevelName(level, locale);

  return (
    <div className="space-y-1">
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-teal-700">
            {locale === 'kk' ? 'Деңгей' : 'Уровень'} {level}: {levelName}
          </span>
          <span className="text-gray-500">
            {current}/{next} XP
          </span>
        </div>
      )}
      <Progress value={progress} color="amber" size="md" />
    </div>
  );
}
