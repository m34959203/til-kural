'use client';

import { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import Badge from '@/components/ui/Badge';
import LevelBadge from '@/components/ui/LevelBadge';
import { cn } from '@/lib/utils';
import questionsData from '@/data/test-questions-bank.json';
import {
  computeKaztestResult,
  SECTION_LABELS,
  SECTION_WEIGHTS,
  LEVEL_THRESHOLDS,
  type Section,
} from '@/lib/kaztest-score';

interface Question {
  id: string;
  test_type: string;
  topic: string;
  difficulty: string;
  question_kk: string;
  question_ru?: string;
  options: string[];
  correct_answer: string;
  explanation_kk?: string;
  explanation_ru?: string;
}

interface Props { locale: string }

const TEST_DURATION_SEC = 30 * 60;

function buildQuestions(): Question[] {
  const pool = (questionsData as Question[]).filter((q) => q.test_type === 'kaztest');
  // Stratified sampling: take roughly proportional mix by section
  const bySection: Record<string, Question[]> = {};
  for (const q of pool) {
    const key = q.topic in SECTION_WEIGHTS ? q.topic : 'grammar';
    (bySection[key] ||= []).push(q);
  }
  const target: Record<string, number> = {
    listening: 4, reading: 4, grammar: 6, vocabulary: 4, writing: 2,
  };
  const out: Question[] = [];
  for (const sec of Object.keys(target)) {
    const list = (bySection[sec] || []).slice().sort(() => Math.random() - 0.5);
    out.push(...list.slice(0, target[sec]));
  }
  // Fallback — fill to 20 if we don't have enough in any section
  const leftover = pool.filter((q) => !out.includes(q));
  while (out.length < 20 && leftover.length) {
    out.push(leftover.shift()!);
  }
  return out.slice(0, 20);
}

export default function KaztestPractice({ locale }: Props) {
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SEC);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [seed, setSeed] = useState(0);

  const questions = useMemo(() => buildQuestions(), [seed]);

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setFinished(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const restart = () => {
    setStarted(false); setFinished(false); setAnswers({}); setCurrentIdx(0);
    setTimeLeft(TEST_DURATION_SEC); setReviewOpen(false); setSeed((s) => s + 1);
  };

  if (!started) {
    return (
      <Card className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {locale === 'kk' ? 'ҚАЗТЕСТ дайындық' : 'Подготовка к КАЗТЕСТ'}
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {locale === 'kk'
            ? '20 сұрақ • 30 минут • 5 секция (тыңдау/оқу/грамматика/лексика/жазу) • 100-балдық жүйе'
            : '20 вопросов • 30 минут • 5 секций (аудирование/чтение/грамматика/лексика/письмо) • 100-балльная шкала'}
        </p>

        <div className="max-w-md mx-auto mb-6 text-left text-xs">
          <div className="font-semibold text-gray-700 mb-2">
            {locale === 'kk' ? 'Бағалау шкаласы:' : 'Шкала оценивания:'}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {LEVEL_THRESHOLDS.slice().reverse().map((t) => (
              <div key={t.level} className="bg-teal-50 border border-teal-100 rounded-md p-2 text-center">
                <div className="font-bold text-teal-700">{t.level}</div>
                <div className="text-gray-500 text-[10px]">≥{t.min}</div>
              </div>
            ))}
          </div>
        </div>

        <Button size="lg" onClick={() => setStarted(true)}>
          {locale === 'kk' ? 'Тестті бастау' : 'Начать тест'}
        </Button>
      </Card>
    );
  }

  if (finished) {
    const result = computeKaztestResult(questions, answers);

    const mistakes = questions
      .map((q, idx) => ({ q, idx, given: answers[idx] }))
      .filter((m) => m.given && m.given !== m.q.correct_answer);

    const unanswered = questions.filter((_, idx) => !answers[idx]).length;

    return (
      <div className="space-y-4">
        <Card className="text-center py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {locale === 'kk' ? 'ҚАЗТЕСТ нәтижесі' : 'Результат КАЗТЕСТ'}
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div>
              <p className="text-5xl font-bold text-teal-700">{result.totalScore}</p>
              <p className="text-xs text-gray-500">/ 100 балл</p>
            </div>
            <div className="text-gray-300 text-4xl">•</div>
            <div>
              {result.level !== 'FAIL' ? <LevelBadge level={result.level} size="lg" /> : (
                <Badge variant="danger">{locale === 'kk' ? 'Өтпеді' : 'Не сдан'}</Badge>
              )}
              <p className="text-sm text-gray-600 mt-1">
                {locale === 'kk' ? result.levelName.kk : result.levelName.ru}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {result.correctCount}/{result.totalQuestions} {locale === 'kk' ? 'дұрыс жауап' : 'правильных ответов'}
            {unanswered > 0 && (
              <span className="ml-2 text-amber-600">
                • {unanswered} {locale === 'kk' ? 'жауапсыз' : 'без ответа'}
              </span>
            )}
          </p>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">
            {locale === 'kk' ? 'Секциялар бойынша' : 'По секциям'}
          </h3>
          <div className="space-y-3">
            {result.sections.map((s) => (
              <div key={s.section}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">
                    {locale === 'kk' ? SECTION_LABELS[s.section as Section].kk : SECTION_LABELS[s.section as Section].ru}
                  </span>
                  <span className="text-gray-500">
                    {s.weightedPoints} / {s.maxWeightedPoints} • {s.correct}/{s.total}
                  </span>
                </div>
                <Progress value={s.weightedPoints} max={s.maxWeightedPoints} color="teal" size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {mistakes.length > 0 && (
          <Card>
            <button
              type="button"
              onClick={() => setReviewOpen((o) => !o)}
              className="w-full flex items-center justify-between font-semibold text-gray-900 mb-3"
            >
              <span>
                {locale === 'kk' ? 'Қателердің талдауы' : 'Разбор ошибок'} ({mistakes.length})
              </span>
              <span className="text-gray-400">{reviewOpen ? '−' : '+'}</span>
            </button>
            {reviewOpen && (
              <div className="space-y-4">
                {mistakes.map((m) => (
                  <div key={m.idx} className="border-l-4 border-red-400 pl-4 py-2">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {m.idx + 1}. {locale === 'kk' ? m.q.question_kk : (m.q.question_ru || m.q.question_kk)}
                    </p>
                    <div className="text-xs space-y-1 mb-2">
                      <p>
                        <span className="text-red-600">✗ {locale === 'kk' ? 'Сіздің жауабыңыз:' : 'Ваш ответ:'}</span>{' '}
                        <span className="font-mono">{m.given}</span>
                      </p>
                      <p>
                        <span className="text-emerald-600">✓ {locale === 'kk' ? 'Дұрыс жауап:' : 'Правильный ответ:'}</span>{' '}
                        <span className="font-mono font-bold">{m.q.correct_answer}</span>
                      </p>
                    </div>
                    {(m.q.explanation_kk || m.q.explanation_ru) && (
                      <p className="text-xs bg-amber-50 border border-amber-100 rounded p-2 text-gray-700">
                        💡 {locale === 'kk' ? m.q.explanation_kk : (m.q.explanation_ru || m.q.explanation_kk)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={restart} className="flex-1">
            {locale === 'kk' ? 'Қайта тапсыру' : 'Пересдать'}
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="flex-1">
            🖨️ {locale === 'kk' ? 'Нәтижені басып шығару' : 'Распечатать'}
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const sectionLabel = (q.topic in SECTION_LABELS)
    ? (locale === 'kk' ? SECTION_LABELS[q.topic as Section].kk : SECTION_LABELS[q.topic as Section].ru)
    : q.topic;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{currentIdx + 1}/{questions.length}</span>
          <span className="text-gray-300">•</span>
          <Badge variant="info">{sectionLabel}</Badge>
          <LevelBadge level={q.difficulty} size="sm" />
        </div>
        <span className={cn('text-sm font-mono font-bold', timeLeft < 300 ? 'text-red-600' : 'text-gray-700')}>
          ⏱ {formatTime(timeLeft)}
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
                answers[currentIdx] === opt ? 'bg-teal-50 border-teal-500' : 'border-gray-200 hover:bg-gray-50',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-1">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIdx(idx)}
            className={cn(
              'w-8 h-8 rounded text-xs font-medium transition-colors',
              currentIdx === idx && 'ring-2 ring-teal-500',
              answers[idx] ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-500',
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
