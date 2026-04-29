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

export default function WritingChecker({ locale }: WritingCheckerProps) {
  const { user } = useCurrentUser();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const userLevel = user?.language_level || 'A2';
      const res = await fetch('/api/learn/check-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), level: userLevel }),
      });
      const data = await res.json();
      setResult(data.result || {
        score: 75,
        corrections: [],
        feedback: data.reply || 'Тексеру аяқталды',
        strengths: [],
        improvements: [],
      });
    } catch {
      setResult({
        score: 0,
        corrections: [],
        feedback: locale === 'kk' ? 'Тексеру кезінде қате пайда болды' : 'Ошибка при проверке',
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
          {locale === 'kk' ? 'Жазба тексеру' : 'Проверка письма'}
        </h2>
        <p className="text-gray-500 text-sm">
          {locale === 'kk'
            ? 'Мәтініңізді қазақ тілінде жазыңыз, AI грамматика мен стильді тексереді'
            : 'Напишите текст на казахском языке, AI проверит грамматику и стиль'}
        </p>
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={locale === 'kk' ? 'Мәтініңізді мұнда жазыңыз...' : 'Напишите текст здесь...'}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-h-[200px] resize-y"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {text.split(/\s+/).filter(Boolean).length} {locale === 'kk' ? 'сөз' : 'слов'}
          </span>
          <Button onClick={handleCheck} loading={loading}>
            {locale === 'kk' ? 'Тексеру' : 'Проверить'}
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {locale === 'kk' ? 'Жалпы баға' : 'Общая оценка'}
              </h3>
              <span className="text-2xl font-bold text-teal-700">{result.score}/100</span>
            </div>
            <Progress value={result.score} color={result.score >= 80 ? 'green' : result.score >= 50 ? 'amber' : 'red'} />
          </Card>

          {/* Corrections */}
          {result.corrections.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">
                {locale === 'kk' ? 'Түзетулер' : 'Исправления'} ({result.corrections.length})
              </h3>
              <div className="space-y-3">
                {result.corrections.map((c, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="line-through text-red-600 text-sm">{c.original}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-medium text-sm">{c.corrected}</span>
                    </div>
                    <p className="text-xs text-gray-500">
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
              {locale === 'kk' ? 'Пікір' : 'Отзыв'}
            </h3>
            <p className="text-sm text-gray-700">{result.feedback}</p>

            {result.strengths.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-green-700 mb-1">
                  {locale === 'kk' ? 'Күшті жақтар:' : 'Сильные стороны:'}
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
                  {locale === 'kk' ? 'Жақсарту керек:' : 'Нужно улучшить:'}
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
