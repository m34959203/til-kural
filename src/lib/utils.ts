export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date, locale: string = 'kk'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date, locale: string = 'kk'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, '0');
  return `TK-${year}-${random}`;
}

export function calculateLevel(xp: number): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

export function getLevelName(level: number, locale: string = 'kk'): string {
  const names: Record<string, string[]> = {
    kk: ['Бастаушы', 'Жаңа бастаушы', 'Оқушы', 'Тыңдаушы', 'Білімді', 'Тәжірибелі', 'Маман', 'Сарапшы', 'Ұстаз', 'Шебер', 'Дана'],
    ru: ['Начинающий', 'Новичок', 'Ученик', 'Слушатель', 'Знающий', 'Опытный', 'Специалист', 'Эксперт', 'Наставник', 'Мастер', 'Мудрец'],
  };
  return (names[locale] || names.kk)[Math.min(level - 1, 10)];
}

export function getXPForNextLevel(currentXP: number): { current: number; next: number; progress: number } {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
  const level = calculateLevel(currentXP);
  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1] + 1000;
  const progress = ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return { current: currentXP - currentThreshold, next: nextThreshold - currentThreshold, progress: Math.min(progress, 100) };
}

export function getLanguageLevelColor(level: string): string {
  const colors: Record<string, string> = {
    A1: 'bg-green-100 text-green-800',
    A2: 'bg-blue-100 text-blue-800',
    B1: 'bg-yellow-100 text-yellow-800',
    B2: 'bg-orange-100 text-orange-800',
    C1: 'bg-purple-100 text-purple-800',
    C2: 'bg-red-100 text-red-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
