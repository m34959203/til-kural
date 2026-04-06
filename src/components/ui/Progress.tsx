import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'teal' | 'amber' | 'green' | 'blue' | 'red';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Progress({
  value,
  max = 100,
  className,
  color = 'teal',
  showLabel = false,
  size = 'md',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    teal: 'bg-teal-600',
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  };

  const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('rounded-full transition-all duration-500', colors[color], sizes[size])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}
