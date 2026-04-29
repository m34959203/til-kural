'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface WritingCheckerProps {
  locale: string;
}

interface Correction {
  original: string;
  corrected: string;
  rule: string;
  explanation: string;
}

interface CheckResult {
  score: number;
  corrections: Correction[];
  feedback: string;
  strengths: string[];
  improvements: string[];
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const GENRES: Array<{ id: string; label_kk: string; label_ru: string }> = [
  { id: 'free', label_kk: 'Еркін', label_ru: 'Свободный' },
  { id: 'letter', label_kk: 'Жеке хат', label_ru: 'Личное письмо' },
  { id: 'essay', label_kk: 'Эссе', label_ru: 'Эссе / сочинение' },
  { id: 'application', label_kk: 'Ресми хат', label_ru: 'Заявление / офиц. письмо' },
  { id: 'sms', label_kk: 'SMS / мессенджер', label_ru: 'SMS / мессенджер' },
  { id: 'congrats', label_kk: 'Құттықтау', label_ru: 'Поздравление' },
];

const MIN_WORDS = 10;

export default function WritingChecker({ locale }: WritingCheckerProps) {
  const isKk = locale === 'kk';
  const apiLocale: 'kk' | 'ru' = isKk ? 'kk' : 'ru';
  const { user } = useCurrentUser();

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const [level, setLevel] = useState<string>(() => user?.language_level || 'A2');
  const [genre, setGenre] = useState<string>('free');

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleCheck = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const res = await fetch('/api/learn/check-writing', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: text.trim(),
          level,
          locale: apiLocale,
          genre,
        }),
      });
      const data = await res.json();
      setResult(data.result || {
        score: 75,
        corrections: [],
        feedback: data.reply || (isKk ? 'Тексеру аяқталды' : 'Проверка завершена'),
        strengths: [],
        improvements: [],
      });
    } catch {
      setResult({
        score: 0,
        corrections: [],
        feedback: isKk ? 'Тексеру кезінде қате пайда болды' : 'Ошибка при проверке',
        strengths: [],
        improvements: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isKk ? 'Жазба тексеру' : 'Проверка письма'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isKk
            ? 'Мәтініңізді қазақ тілінде жазыңыз, AI грамматика мен стильді тексереді'
            : 'Напишите текст на казахском языке, AI проверит грамматику и стиль'}
        </p>
      </div>

      {/* Селекторы — уровень цели + жанр */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-gray-700">{isKk ? 'Деңгей:' : 'Уровень:'}</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          >
            {CEFR_LEVELS.map((lv) => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-gray-700">{isKk ? 'Жанр:' : 'Жанр:'}</span>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          >
            {GENRES.map((g) => (
              <option key={g.id} value={g.id}>{isKk ? g.label_kk : g.label_ru}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isKk ? 'Мәтініңізді мұнда жазыңыз...' : 'Напишите текст здесь...'}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-h-[200px] resize-y"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div className="text-xs">
            <span className={wordCount < MIN_WORDS ? 'text-amber-600' : 'text-gray-400'}>
              {wordCount} {isKk ? 'сөз' : 'слов'}
              {wordCount < MIN_WORDS && (
                <>
                  {' · '}
                  {isKk
                    ? `толық талдау үшін кемінде ${MIN_WORDS}`
                    : `минимум ${MIN_WORDS} для развёрнутого анализа`}
                </>
              )}
            </span>
          </div>
          <Button onClick={handleCheck} loading={loading} disabled={loading || wordCount === 0}>
            {loading
              ? (isKk ? 'AI тексеріп жатыр…' : 'AI проверяет текст…')
              : (isKk ? 'Тексеру' : 'Проверить')}
          </Button>
        </div>
        {loading && (
          <p className="text-xs text-gray-500 mt-2">
            {isKk
              ? 'Бұл 10–20 секунд алуы мүмкін. Мәтін ұзағырақ болса — сәл ұзағырақ.'
              : 'Это может занять 10–20 секунд. На длинном тексте — чуть дольше.'}
          </p>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {isKk ? 'Жалпы баға' : 'Общая оценка'}
              </h3>
              <span className="text-2xl font-bold text-teal-700">{result.score}/100</span>
            </div>
            <Progress value={result.score} color={result.score >= 80 ? 'green' : result.score >= 50 ? 'amber' : 'red'} />
          </Card>

          {/* Corrections */}
          {result.corrections.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">
                {isKk ? 'Түзетулер' : 'Исправления'} ({result.corrections.length})
              </h3>
              <div className="space-y-3">
                {result.corrections.map((c, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <span className="line-through text-red-600 text-sm break-words">{c.original}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-medium text-sm break-words">{c.corrected}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">{c.rule}:</span> {c.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Feedback */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">
              {isKk ? 'Пікір' : 'Отзыв'}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{result.feedback}</p>

            {result.strengths.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-green-700 mb-1">
                  {isKk ? 'Күшті жақтар:' : 'Сильные стороны:'}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {result.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.improvements.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-amber-700 mb-1">
                  {isKk ? 'Жақсарту керек:' : 'Нужно улучшить:'}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {result.improvements.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">!</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
