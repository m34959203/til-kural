import { cn } from '@/lib/utils';

interface MentorAvatarProps {
  mentor: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
  locale?: string;
}

const mentorData: Record<string, { initials: string; color: string; name_kk: string; name_ru: string; title_kk: string; title_ru: string }> = {
  abai: {
    initials: 'АҚ',
    color: 'bg-indigo-700',
    name_kk: 'Абай Құнанбайұлы',
    name_ru: 'Абай Кунанбайулы',
    title_kk: 'Ақын, ойшыл, ағартушы',
    title_ru: 'Поэт, мыслитель, просветитель',
  },
  baitursynuly: {
    initials: 'АБ',
    color: 'bg-emerald-700',
    name_kk: 'Ахмет Байтұрсынұлы',
    name_ru: 'Ахмет Байтурсынулы',
    title_kk: 'Тілші, ғалым, педагог',
    title_ru: 'Лингвист, учёный, педагог',
  },
  auezov: {
    initials: 'МӘ',
    color: 'bg-amber-700',
    name_kk: 'Мұхтар Әуезов',
    name_ru: 'Мухтар Ауэзов',
    title_kk: 'Жазушы, драматург',
    title_ru: 'Писатель, драматург',
  },
};

export default function MentorAvatar({ mentor, size = 'md', className, showName = false, locale = 'kk' }: MentorAvatarProps) {
  const data = mentorData[mentor] || mentorData.abai;
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-xl',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-bold shrink-0',
          data.color,
          sizes[size]
        )}
      >
        {data.initials}
      </div>
      {showName && (
        <div>
          <div className="font-semibold text-gray-900 text-sm">{locale === 'kk' ? data.name_kk : data.name_ru}</div>
          <div className="text-xs text-gray-500">{locale === 'kk' ? data.title_kk : data.title_ru}</div>
        </div>
      )}
    </div>
  );
}
