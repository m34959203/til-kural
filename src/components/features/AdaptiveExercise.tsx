'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Exercise {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface AdaptiveExerciseProps {
  locale: string;
}

export default function AdaptiveExercise({ locale }: AdaptiveExerciseProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('grammar');

  const topics = [
    { id: 'grammar', label: locale === 'kk' ? 'Грамматика' : 'Грамматика' },
    { id: 'vocabulary', label: locale === 'kk' ? 'Сөздік қор' : 'Словарный запас' },
    { id: 'cases', label: locale === 'kk' ? 'Септіктер' : 'Падежи' },
    { id: 'tenses', label: locale === 'kk' ? 'Етістік шақтары' : 'Времена глагола' },
  ];

  const generateExercises = async () => {
    setLoading(true);
    setExercises([]);
    setCurrentIdx(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);

    try {
      const res = await fetch('/api/learn/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level: 'B1', weakPoints: [] }),
      });
      const data = await res.json();
      if (data.exercises && data.exercises.length > 0) {
        setExercises(data.exercises);
      } else {
        // Fallback exercises
        setExercises([
          { question: 'Мен мектепке ___ (бару)', options: ['барамын', 'барасың', 'барады'], correct: 'барамын', explanation: '1-жақ жекеше: барамын' },
          { question: 'Кітап___ (көптік)', options: ['-тар', '-лар', '-дар'], correct: '-тар', explanation: 'Қатаң дыбыстан кейін: -тар' },
          { question: 'Бала___ (ілік септік)', options: ['-ның', '-нің', '-дың'], correct: '-ның', explanation: 'Дауыстыдан кейін жуан: -ның' },
        ]);
      }
    } catch {
      setExercises([
        { question: 'Мен кітап ___ (оқу)', options: ['оқимын', 'оқисың', 'оқиды'], correct: 'оқимын', explanation: '1-жақ жекеше: оқимын' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = (answer: string) => {
    setSelected(answer);
    setShowResult(true);
    if (answer === exercises[currentIdx].correct) {
      setScore((prev) => prev + 1);
    }
  };

  const nextExercise = () => {
    setSelected(null);
    setShowResult(false);
    setCurrentIdx((prev) => prev + 1);
  };

  if (exercises.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          {locale === 'kk' ? 'Бейімделгіш жаттығулар' : 'Адаптивные упражнения'}
        </h2>
        <p className="text-gray-500 text-sm">
          {locale === 'kk' ? 'Тақырыпты таңдап, AI жаттығулар жасасын' : 'Выберите тему и AI создаст упражнения'}
        </p>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setTopic(t.id)}
              className={cn('px-4 py-2 rounded-lg text-sm transition-colors', topic === t.id ? 'bg-teal-100 text-teal-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={generateExercises} loading={loading}>
          {locale === 'kk' ? 'Жаттығулар жасау' : 'Создать упражнения'}
        </Button>
      </div>
    );
  }

  if (currentIdx >= exercises.length) {
    return (
      <Card className="text-center py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {locale === 'kk' ? 'Жаттығулар аяқталды!' : 'Упражнения завершены!'}
        </h3>
        <p className="text-4xl font-bold text-teal-700 mb-4">
          {score}/{exercises.length}
        </p>
        <Button onClick={generateExercises}>
          {locale === 'kk' ? 'Жаңа жаттығулар' : 'Новые упражнения'}
        </Button>
      </Card>
    );
  }

  const exercise = exercises[currentIdx];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {currentIdx + 1} / {exercises.length}
        </span>
        <span className="text-sm font-medium text-teal-700">
          {locale === 'kk' ? 'Дұрыс' : 'Правильно'}: {score}
        </span>
      </div>

      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{exercise.question}</h3>
        <div className="space-y-2">
          {exercise.options.map((opt) => (
            <button
              key={opt}
              onClick={() => !showResult && checkAnswer(opt)}
              disabled={showResult}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm',
                showResult && opt === exercise.correct && 'bg-green-50 border-green-500 text-green-800',
                showResult && selected === opt && opt !== exercise.correct && 'bg-red-50 border-red-500 text-red-800',
                !showResult && 'hover:bg-teal-50 hover:border-teal-300 border-gray-200'
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        {showResult && (
          <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            <span className="font-medium">{locale === 'kk' ? 'Түсіндірме: ' : 'Объяснение: '}</span>
            {exercise.explanation}
          </div>
        )}
      </Card>

      {showResult && currentIdx < exercises.length - 1 && (
        <Button onClick={nextExercise} className="w-full">
          {locale === 'kk' ? 'Келесі' : 'Далее'} →
        </Button>
      )}
      {showResult && currentIdx === exercises.length - 1 && (
        <Button onClick={nextExercise} className="w-full">
          {locale === 'kk' ? 'Нәтижелер' : 'Результаты'}
        </Button>
      )}
    </div>
  );
}
