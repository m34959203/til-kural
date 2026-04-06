'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import questionsData from '@/data/test-questions-bank.json';

interface KaztestPracticeProps {
  locale: string;
}

export default function KaztestPractice({ locale }: KaztestPracticeProps) {
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes

  const questions = questionsData.filter((q) => q.test_type === 'kaztest' || q.test_type === 'level').slice(0, 20);

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!started) {
    return (
      <Card className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {locale === 'kk' ? 'ҚАЗТЕСТ дайындық' : 'Подготовка к КАЗТЕСТ'}
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {locale === 'kk'
            ? 'Ресми ҚАЗТЕСТ форматындағы тест. 20 сұрақ, 30 минут.'
            : 'Тест в формате официального КАЗТЕСТ. 20 вопросов, 30 минут.'}
        </p>
        <Button size="lg" onClick={() => setStarted(true)}>
          {locale === 'kk' ? 'Тестті бастау' : 'Начать тест'}
        </Button>
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
      <Card className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {locale === 'kk' ? 'ҚАЗТЕСТ нәтижесі' : 'Результат КАЗТЕСТ'}
        </h2>
        <p className="text-5xl font-bold text-teal-700 mb-2">{pct}%</p>
        <p className="text-gray-500 mb-6">
          {correct}/{questions.length} {locale === 'kk' ? 'дұрыс жауап' : 'правильных ответов'}
        </p>
        <Button onClick={() => { setStarted(false); setFinished(false); setAnswers({}); setCurrentIdx(0); setTimeLeft(30 * 60); }}>
          {locale === 'kk' ? 'Қайта тапсыру' : 'Пересдать'}
        </Button>
      </Card>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {currentIdx + 1}/{questions.length}
        </span>
        <span className={cn('text-sm font-mono font-bold', timeLeft < 300 ? 'text-red-600' : 'text-gray-700')}>
          {formatTime(timeLeft)}
        </span>
      </div>
      <Progress value={currentIdx + 1} max={questions.length} color="teal" size="sm" />

      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'kk' ? q.question_kk : (q.question_ru || q.question_kk)}
        </h3>
        <div className="space-y-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswers({ ...answers, [currentIdx]: opt })}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors',
                answers[currentIdx] === opt ? 'bg-teal-50 border-teal-500' : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </Card>

      {/* Question navigation */}
      <div className="flex flex-wrap gap-1">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIdx(idx)}
            className={cn(
              'w-8 h-8 rounded text-xs font-medium transition-colors',
              currentIdx === idx && 'ring-2 ring-teal-500',
              answers[idx] ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-500'
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))} disabled={currentIdx === 0}>
          ←
        </Button>
        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx((p) => p + 1)}>→</Button>
        ) : (
          <Button variant="secondary" onClick={() => setFinished(true)}>
            {locale === 'kk' ? 'Аяқтау' : 'Завершить'}
          </Button>
        )}
      </div>
    </div>
  );
}
