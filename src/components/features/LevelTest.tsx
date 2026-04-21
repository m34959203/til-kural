'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import LevelBadge from '@/components/ui/LevelBadge';
import { cn } from '@/lib/utils';

interface LevelTestProps {
  locale: string;
}

interface AdaptiveQuestion {
  id: string;
  topic: string;
  difficulty: string;
  question_kk: string;
  question_ru?: string;
  options: string[];
}

interface AnsweredRecord {
  questionId: string;
  correct: boolean;
  difficulty: string;
  selected: string;
  correctAnswer?: string;
}

type EvaluateDetails = Array<{ questionId: string; correct: boolean; correctAnswer: string }>;

const MAX_QUESTIONS = 15;

export default function LevelTest({ locale }: LevelTestProps) {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<AdaptiveQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState<AnsweredRecord[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>('B1');
  const [progress, setProgress] = useState<{ current: number; max: number }>({
    current: 1,
    max: MAX_QUESTIONS,
  });
  const [finished, setFinished] = useState(false);
  const [finalLevel, setFinalLevel] = useState('');
  const [finalScore, setFinalScore] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = (kk: string, ru: string) => (locale === 'kk' ? kk : ru);

  async function fetchNextQuestion(history: AnsweredRecord[]): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/test/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answered: history.map((a) => ({
            questionId: a.questionId,
            correct: a.correct,
            difficulty: a.difficulty,
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.done) {
        await finalizeTest(history);
        return;
      }

      setQuestion(data.question as AdaptiveQuestion);
      setCurrentLevel(data.currentLevel || data.question?.difficulty || 'B1');
      setProgress(data.progress || { current: history.length + 1, max: MAX_QUESTIONS });
      setSelected(null);
    } catch (e) {
      console.error('[LevelTest] next-question failed', e);
      setError(t('Сұрақ жүктеу сәтсіз', 'Не удалось получить вопрос'));
    } finally {
      setLoading(false);
    }
  }

  async function finalizeTest(history: AnsweredRecord[]): Promise<void> {
    try {
      const res = await fetch('/api/test/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'adaptive',
          answered: history.map((a) => ({
            questionId: a.questionId,
            correct: a.correct,
            difficulty: a.difficulty,
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFinalLevel(data.level || 'A1');
      setFinalScore(typeof data.score === 'number' ? data.score : 0);
      setFinished(true);
    } catch (e) {
      console.error('[LevelTest] evaluate failed', e);
      // fallback: локальная оценка через mode уровней правильных ответов
      const fallback = localEstimate(history);
      setFinalLevel(fallback.level);
      setFinalScore(fallback.score);
      setFinished(true);
    }
  }

  async function startTest(): Promise<void> {
    setAnswered([]);
    setStarted(true);
    setFinished(false);
    setFinalLevel('');
    setFinalScore(0);
    await fetchNextQuestion([]);
  }

  async function submitAnswer(): Promise<void> {
    if (!question || !selected) return;
    // Для клиента корректность ответа определяется на сервере evaluate,
    // но чтобы CAT работал в stateless-режиме — проверим через эндпоинт.
    setLoading(true);
    try {
      const res = await fetch('/api/test/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: [question.id],
          answers: [selected],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { details?: EvaluateDetails };
      const detail = data.details?.[0];
      const isCorrect = !!detail?.correct;

      const record: AnsweredRecord = {
        questionId: question.id,
        correct: isCorrect,
        difficulty: question.difficulty,
        selected,
        correctAnswer: detail?.correctAnswer,
      };
      const nextHistory = [...answered, record];
      setAnswered(nextHistory);
      await fetchNextQuestion(nextHistory);
    } catch (e) {
      console.error('[LevelTest] submit failed', e);
      setError(t('Жауапты сақтау сәтсіз', 'Не удалось сохранить ответ'));
      setLoading(false);
    }
  }

  function resetTest() {
    setStarted(false);
    setFinished(false);
    setAnswered([]);
    setQuestion(null);
    setSelected(null);
    setFinalLevel('');
    setFinalScore(0);
    setCurrentLevel('B1');
    setProgress({ current: 1, max: MAX_QUESTIONS });
    setError(null);
  }

  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      let userName = 'Student';
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const me = await meRes.json();
          userName = me?.user?.name || me?.user?.email?.split('@')[0] || 'Student';
        }
      } catch {}

      const res = await fetch('/api/test/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, level: finalLevel, score: finalScore }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `til-kural-certificate-${finalLevel}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(t('Сертификатты жүктеу сәтсіз аяқталды', 'Не удалось скачать сертификат'));
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  // --- Стартовый экран ---
  if (!started) {
    return (
      <Card className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {t('Адаптивті деңгей тесті', 'Адаптивный тест уровня')}
        </h2>
        <p className="text-gray-500 mb-2 max-w-lg mx-auto">
          {t(
            'Бұл тест CAT алгоритмі арқылы сіздің қазақ тілі деңгейіңізді A1-ден C2-ге дейін анықтайды.',
            'Этот тест использует CAT-алгоритм для определения уровня казахского языка от A1 до C2.',
          )}
        </p>
        <p className="text-xs text-gray-400 mb-6 max-w-lg mx-auto">
          {t(
            'Дұрыс жауап бергенде келесі сұрақ күрделенеді, қате жауапта жеңілдейді. Ұзындығы: 10–15 сұрақ.',
            'При правильных ответах вопросы усложняются, при ошибках — упрощаются. Длина: 10–15 вопросов.',
          )}
        </p>
        <Button size="lg" onClick={startTest}>
          {t('Тестті бастау', 'Начать тест')}
        </Button>
      </Card>
    );
  }

  // --- Финал ---
  if (finished) {
    const correctCount = answered.filter((a) => a.correct).length;
    return (
      <Card className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('Тест нәтижесі', 'Результат теста')}
        </h2>
        <div className="mb-4">
          <LevelBadge level={finalLevel} size="lg" />
        </div>
        <p className="text-4xl font-bold text-teal-700 mb-2">{finalScore}%</p>
        <p className="text-gray-600 mb-1">
          {t(`Сіздің деңгейіңіз: ${finalLevel}`, `Ваш уровень: ${finalLevel}`)}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {t(
            `${correctCount} / ${answered.length} сұраққа дұрыс жауап бердіңіз`,
            `Правильных ответов: ${correctCount} из ${answered.length}`,
          )}
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Button variant="outline" onClick={resetTest}>
            {t('Қайта тапсыру', 'Пересдать')}
          </Button>
          <Button onClick={handleDownloadCertificate} disabled={downloading}>
            {downloading
              ? t('Жүктелуде…', 'Загрузка…')
              : t('Сертификат алу', 'Получить сертификат')}
          </Button>
        </div>
      </Card>
    );
  }

  // --- Загрузка первого вопроса ---
  if (!question) {
    return (
      <Card className="text-center py-10">
        <p className="text-gray-500">
          {loading ? t('Жүктелуде…', 'Загрузка…') : error || t('Дайындалуда…', 'Подготовка…')}
        </p>
      </Card>
    );
  }

  // --- Активный вопрос ---
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-gray-500">
          {t('Сұрақ', 'Вопрос')} {progress.current}/{progress.max}
        </span>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{t('Ағымдағы деңгей:', 'Текущий уровень:')}</span>
          <LevelBadge level={currentLevel} size="sm" />
        </div>
      </div>
      <Progress value={progress.current} max={progress.max} color="teal" />

      <Card>
        <div className="flex items-center gap-2 mb-2">
          <LevelBadge level={question.difficulty} size="sm" />
          <span className="text-xs text-gray-400 uppercase tracking-wide">{question.topic}</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'kk' ? question.question_kk : question.question_ru || question.question_kk}
        </h3>
        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              disabled={loading}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm',
                selected === opt
                  ? 'bg-teal-50 border-teal-500 text-teal-800'
                  : 'border-gray-200 hover:bg-gray-50',
                loading && 'opacity-60 cursor-not-allowed',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </Card>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {t(
            'Жауап бергеннен кейін артқа қайтару мүмкін емес',
            'После ответа вернуться назад нельзя',
          )}
        </span>
        <Button onClick={submitAnswer} disabled={!selected || loading}>
          {loading ? t('Жүктелуде…', 'Загрузка…') : t('Келесі →', 'Далее →')}
        </Button>
      </div>
    </div>
  );
}

// --- Локальная оценка на случай ошибки сети ---
function localEstimate(history: AnsweredRecord[]): { level: string; score: number } {
  const correct = history.filter((a) => a.correct);
  const c2 = correct.filter((a) => a.difficulty === 'C2').length;
  if (c2 >= 3) {
    return {
      level: 'C2',
      score: Math.round((correct.length / Math.max(1, history.length)) * 100),
    };
  }
  const recent = correct.slice(-4);
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  let best = recent[recent.length - 1]?.difficulty || 'A1';
  const counts = new Map<string, number>();
  for (const a of recent) counts.set(a.difficulty, (counts.get(a.difficulty) || 0) + 1);
  let bestCount = -1;
  for (const [lvl, cnt] of counts.entries()) {
    if (cnt > bestCount || (cnt === bestCount && order.indexOf(lvl) > order.indexOf(best))) {
      best = lvl;
      bestCount = cnt;
    }
  }
  return {
    level: best,
    score: Math.round((correct.length / Math.max(1, history.length)) * 100),
  };
}
