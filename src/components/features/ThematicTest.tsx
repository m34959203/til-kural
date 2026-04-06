'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import questionsData from '@/data/test-questions-bank.json';

interface ThematicTestProps {
  locale: string;
  topic?: string;
}

export default function ThematicTest({ locale, topic }: ThematicTestProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const questions = questionsData.filter((q) =>
    topic ? q.topic === topic : q.test_type === 'thematic'
  ).slice(0, 10);

  if (questions.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-500">{locale === 'kk' ? 'Сұрақтар табылмады' : 'Вопросы не найдены'}</p>
      </Card>
    );
  }

  if (finished) {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);

    return (
      <Card className="text-center py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {locale === 'kk' ? 'Нәтиже' : 'Результат'}
        </h3>
        <p className="text-4xl font-bold text-teal-700 mb-1">{pct}%</p>
        <p className="text-gray-500 mb-4">
          {correct}/{questions.length} {locale === 'kk' ? 'дұрыс' : 'правильно'}
        </p>
        <Button onClick={() => { setFinished(false); setCurrentIdx(0); setAnswers({}); setShowResult(false); }}>
          {locale === 'kk' ? 'Қайта тапсыру' : 'Пересдать'}
        </Button>
      </Card>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {currentIdx + 1}/{questions.length}
      </p>
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'kk' ? q.question_kk : (q.question_ru || q.question_kk)}
        </h3>
        <div className="space-y-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                if (!showResult) {
                  setAnswers({ ...answers, [currentIdx]: opt });
                  setShowResult(true);
                }
              }}
              disabled={showResult}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors',
                showResult && opt === q.correct_answer && 'bg-green-50 border-green-500',
                showResult && answers[currentIdx] === opt && opt !== q.correct_answer && 'bg-red-50 border-red-500',
                !showResult && 'hover:bg-teal-50 hover:border-teal-300 border-gray-200'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        {showResult && (
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            {locale === 'kk' ? q.explanation_kk : (q.explanation_ru || q.explanation_kk)}
          </div>
        )}
      </Card>
      {showResult && (
        <Button
          className="w-full"
          onClick={() => {
            if (currentIdx < questions.length - 1) {
              setCurrentIdx((prev) => prev + 1);
              setShowResult(false);
            } else {
              setFinished(true);
            }
          }}
        >
          {currentIdx < questions.length - 1
            ? (locale === 'kk' ? 'Келесі' : 'Далее')
            : (locale === 'kk' ? 'Нәтиже' : 'Результат')}
        </Button>
      )}
    </div>
  );
}
