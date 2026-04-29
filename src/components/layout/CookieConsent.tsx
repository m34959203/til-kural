'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tk-cookie-consent';

interface ConsentState {
  status: 'accepted' | 'declined';
  ts: string;
}

interface CookieConsentProps {
  locale: string;
}

/**
 * Минималистичный cookie-consent banner.
 * GA4 / Yandex.Metrica читают `localStorage[STORAGE_KEY]` через
 * <Analytics /> и не загружаются, если consent.status !== 'accepted'.
 * Согласно ЗРК «О персональных данных» — без явного согласия трекеры
 * грузить нельзя.
 */
export default function CookieConsent({ locale }: CookieConsentProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const set = (status: 'accepted' | 'declined') => {
    const payload: ConsentState = { status, ts: new Date().toISOString() };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch { /* ignore */ }
    setShow(false);
    // Если приняли — Analytics-скрипты подхватятся при следующей навигации.
    // Можно сделать reload, но это раздражает; пользователь увидит трекинг
    // на следующем переходе.
    if (status === 'accepted') {
      window.dispatchEvent(new Event('cookie-consent-accepted'));
    }
  };

  if (!show) return null;

  const t = (kk: string, ru: string) => (locale === 'kk' ? kk : ru);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:left-auto sm:bottom-4 sm:right-4 sm:max-w-md"
      role="dialog"
      aria-live="polite"
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl p-4 sm:p-5">
        <p className="text-sm text-gray-700">
          🍪 {t(
            'Біз cookie мен аналитика (GA4, Яндекс.Метрика) қолданамыз. Сіз қабылдаған соң ғана іске қосылады.',
            'Мы используем cookies и аналитику (GA4, Яндекс.Метрика). Они активируются только после вашего согласия.',
          )}
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button
            onClick={() => set('accepted')}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
          >
            {t('Қабылдау', 'Принять')}
          </button>
          <button
            onClick={() => set('declined')}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            {t('Бас тарту', 'Отклонить')}
          </button>
          <a
            href={`/${locale}/privacy`}
            className="px-4 py-2 text-sm text-teal-700 hover:underline self-center"
          >
            {t('Құпиялылық саясаты', 'Политика конфиденциальности')}
          </a>
        </div>
      </div>
    </div>
  );
}
