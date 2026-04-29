'use client';

import { use, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = (kk: string, ru: string) => (locale === 'kk' ? kk : ru);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t('Кемінде 8 таңба қажет', 'Минимум 8 символов'));
      return;
    }
    if (password !== confirm) {
      setError(t('Құпиясөздер сәйкес келмейді', 'Пароли не совпадают'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || `HTTP ${res.status}`);
        return;
      }
      setDone(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-red-600">
          {t('Қалпына келтіру токені жоқ', 'Не указан токен сброса')}
        </p>
        <p className="mt-4 text-sm">
          <Link href={`/${locale}/forgot-password`} className="text-teal-700">
            {t('Сілтемені қайта сұрау', 'Запросить новую ссылку')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t('Жаңа құпиясөз', 'Новый пароль')}
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        {t('Кемінде 8 таңба.', 'Минимум 8 символов.')}
      </p>

      {done ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 space-y-3">
          <p>{t('Құпиясөз сәтті жаңартылды.', 'Пароль успешно обновлён.')}</p>
          <Link
            href={`/${locale}/login`}
            className="inline-block rounded-lg bg-teal-600 px-4 py-2 font-medium text-white"
          >
            {t('Кіруге өту →', 'Войти →')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="pwd" className="block text-sm font-medium text-gray-700 mb-1">
              {t('Жаңа құпиясөз', 'Новый пароль')}
            </label>
            <input
              id="pwd"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="cfm" className="block text-sm font-medium text-gray-700 mb-1">
              {t('Қайталау', 'Повторите')}
            </label>
            <input
              id="cfm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
          >
            {submitting ? t('Сақталуда...', 'Сохранение...') : t('Сақтау', 'Сохранить')}
          </button>
        </form>
      )}
    </div>
  );
}
