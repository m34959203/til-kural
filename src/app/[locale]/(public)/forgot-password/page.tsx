'use client';

import { use, useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = (kk: string, ru: string) => (locale === 'kk' ? kk : ru);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitted(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t('Құпиясөзді ұмыттыңыз ба?', 'Забыли пароль?')}
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        {t(
          'Email енгізіңіз — біз сізге қалпына келтіру сілтемесін жібереміз.',
          'Введите email — мы пришлём ссылку для сброса пароля.',
        )}
      </p>

      {submitted ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {t(
            'Хат жіберілді. Поштаңызды тексеріңіз (1 сағат жарамды). Егер хат келмесе — спам бумасын қараңыз.',
            'Письмо отправлено. Проверьте почту (ссылка действительна 1 час). Если письмо не пришло — проверьте папку спам.',
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
          >
            {submitting
              ? t('Жіберілуде...', 'Отправка...')
              : t('Сілтеме жіберу', 'Отправить ссылку')}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href={`/${locale}/login`} className="font-medium text-teal-700 hover:text-teal-800">
          ← {t('Кіруге оралу', 'Назад к входу')}
        </Link>
      </p>
    </div>
  );
}
