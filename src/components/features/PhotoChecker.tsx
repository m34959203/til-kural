'use client';

import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

interface PhotoCheckerProps {
  locale: string;
}

interface PhotoError {
  word: string;
  correction: string;
  rule: string;
  position: number;
  type: string;
}

interface CheckResult {
  recognized_text: string;
  errors: PhotoError[];
  overall_score: number;
  feedback: string;
  literacy_score: number;
  coherence_score: number;
  lexical_diversity: number;
}

export default function PhotoChecker({ locale }: PhotoCheckerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleCheck = async () => {
    if (!preview || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/photo-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: preview }),
      });
      const data = await res.json();
      setResult(data.result);
    } catch {
      setResult({
        recognized_text: '',
        errors: [],
        overall_score: 0,
        feedback: locale === 'kk' ? 'Тексеру кезінде қате болды' : 'Ошибка при проверке',
        literacy_score: 0,
        coherence_score: 0,
        lexical_diversity: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const errorTypeColors: Record<string, string> = {
    spelling: 'bg-red-100 text-red-700 border-red-200',
    grammar: 'bg-orange-100 text-orange-700 border-orange-200',
    punctuation: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    style: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const errorTypeLabels: Record<string, Record<string, string>> = {
    spelling: { kk: 'Орфография', ru: 'Орфография' },
    grammar: { kk: 'Грамматика', ru: 'Грамматика' },
    punctuation: { kk: 'Тыныс белгі', ru: 'Пунктуация' },
    style: { kk: 'Стиль', ru: 'Стиль' },
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <Card className="text-center py-8">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!preview ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-10 hover:border-teal-400 transition-colors"
          >
            <div className="text-4xl mb-3">📷</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {locale === 'kk' ? 'Фотоны жүктеңіз' : 'Загрузите фото'}
            </h3>
            <p className="text-sm text-gray-500">
              {locale === 'kk' ? 'JPG, PNG форматтағы фото (10MB дейін)' : 'Фото в формате JPG, PNG (до 10МБ)'}
            </p>
          </div>
        ) : (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded"
              className="max-h-64 mx-auto rounded-lg border mb-4"
            />
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => { setPreview(null); setResult(null); }}>
                {locale === 'kk' ? 'Басқа фото' : 'Другое фото'}
              </Button>
              <Button onClick={handleCheck} loading={loading}>
                {loading
                  ? locale === 'kk' ? 'Тексерілуде...' : 'Проверяется...'
                  : locale === 'kk' ? 'Тексеру' : 'Проверить'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Overall score */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              {locale === 'kk' ? 'Жалпы баға' : 'Общая оценка'}
            </h3>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-teal-700">{result.overall_score}</span>
              <span className="text-lg text-gray-400">/100</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">{locale === 'kk' ? 'Сауаттылық' : 'Грамотность'}</p>
                <Progress value={result.literacy_score} color="green" showLabel />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{locale === 'kk' ? 'Байланыстылық' : 'Связность'}</p>
                <Progress value={result.coherence_score} color="blue" showLabel />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{locale === 'kk' ? 'Лексика' : 'Лексика'}</p>
                <Progress value={result.lexical_diversity} color="amber" showLabel />
              </div>
            </div>
          </Card>

          {/* Recognized text */}
          {result.recognized_text && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                {locale === 'kk' ? 'Танылған мәтін' : 'Распознанный текст'}
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                {result.recognized_text}
              </p>
            </Card>
          )}

          {/* Errors */}
          {result.errors.length > 0 ? (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">
                {locale === 'kk' ? 'Қателер' : 'Ошибки'} ({result.errors.length})
              </h3>
              <div className="space-y-2">
                {result.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className={cn('rounded-lg border p-3', errorTypeColors[err.type] || 'bg-gray-50 border-gray-200')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50">
                        {errorTypeLabels[err.type]?.[locale] || err.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="line-through">{err.word}</span>
                      <span>→</span>
                      <span className="font-medium">{err.correction}</span>
                    </div>
                    <p className="text-xs mt-1 opacity-80">{err.rule}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-6">
              <p className="text-lg">🎉</p>
              <p className="font-medium text-green-700">
                {locale === 'kk' ? 'Қате табылмады! Тамаша!' : 'Ошибок не найдено! Отлично!'}
              </p>
            </Card>
          )}

          {/* Feedback */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">
              {locale === 'kk' ? 'Пікір мен кеңестер' : 'Отзыв и рекомендации'}
            </h3>
            <p className="text-sm text-gray-700">{result.feedback}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
