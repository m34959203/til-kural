export const locales = ['kk', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'kk';

import kkMessages from '@/messages/kk.json';
import ruMessages from '@/messages/ru.json';

type Messages = typeof kkMessages;

const messages: Record<Locale, Messages> = {
  kk: kkMessages,
  ru: ruMessages,
};

export function getMessages(locale: string): Messages {
  return messages[locale as Locale] || messages[defaultLocale];
}

export function t(locale: string, key: string): string {
  const msgs = getMessages(locale);
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = msgs;
  for (const k of keys) {
    value = value?.[k];
  }
  return typeof value === 'string' ? value : key;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
