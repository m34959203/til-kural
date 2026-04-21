import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MentorAvatarProps {
  mentor: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
  locale?: string;
}

const mentorData: Record<string, { image: string; ring: string; name_kk: string; name_ru: string; title_kk: string; title_ru: string }> = {
  abai: {
    image: '/mentors/abai.png',
    ring: 'ring-indigo-600/40',
    name_kk: 'Абай Құнанбайұлы',
    name_ru: 'Абай Кунанбайулы',
    title_kk: 'Ақын, ойшыл, ағартушы',
    title_ru: 'Поэт, мыслитель, просветитель',
  },
  baitursynuly: {
    image: '/mentors/baitursynuly.png',
    ring: 'ring-emerald-600/40',
    name_kk: 'Ахмет Байтұрсынұлы',
    name_ru: 'Ахмет Байтурсынулы',
    title_kk: 'Тілші, ғалым, педагог',
    title_ru: 'Лингвист, учёный, педагог',
  },
  auezov: {
    image: '/mentors/auezov.png',
    ring: 'ring-amber-600/40',
    name_kk: 'Мұхтар Әуезов',
    name_ru: 'Мухтар Ауэзов',
    title_kk: 'Жазушы, драматург',
    title_ru: 'Писатель, драматург',
  },
};

const SIZE_PX = { sm: 32, md: 48, lg: 80 } as const;

export default function MentorAvatar({ mentor, size = 'md', className, showName = false, locale = 'kk' }: MentorAvatarProps) {
  const data = mentorData[mentor] || mentorData.abai;
  const px = SIZE_PX[size];
  const name = locale === 'kk' ? data.name_kk : data.name_ru;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src={data.image}
        alt={name}
        width={px}
        height={px}
        className={cn('rounded-full object-cover shrink-0 ring-2 ring-offset-2 ring-offset-white', data.ring)}
        priority={size === 'lg'}
      />
      {showName && (
        <div>
          <div className="font-semibold text-gray-900 text-sm">{name}</div>
          <div className="text-xs text-gray-500">{locale === 'kk' ? data.title_kk : data.title_ru}</div>
        </div>
      )}
    </div>
  );
}
