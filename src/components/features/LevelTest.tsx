'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  /** Снимок самого вопроса — нужен для review-режима после теста. */
  question_kk?: string;
  question_ru?: string;
  topic?: string;
}

type EvaluateDetails = Array<{ questionId: string; correct: boolean; correctAnswer: string }>;

const MAX_QUESTIONS = 25;
const QUESTION_TIMER_SECONDS = 60;
const CEFR_RANK: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

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
  const [levelSaved, setLevelSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [certificateMinScore, setCertificateMinScore] = useState(80);
  const [error, setError] = useState<string | null>(null);
  // Таймер на текущий вопрос (audit P1 — 30-60 сек на вопрос).
  const [secondsLeft, setSecondsLeft] = useState<number>(QUESTION_TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Review-режим после теста — показать все вопросы с правильными ответами.
  const [reviewOpen, setReviewOpen] = useState(false);

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
      setLevelSaved(!!data.level_saved);
      setCertificateEligible(!!data.certificate_eligible);
      if (typeof data.certificate_min_score === 'number') {
        setCertificateMinScore(data.certificate_min_score);
      }
      setFinished(true);
    } catch (e) {
      console.error('[LevelTest] evaluate failed', e);
      // fallback: локальная оценка через mode уровней правильных ответов
      const fallback = localEstimate(history);
      setFinalLevel(fallback.level);
      setFinalScore(fallback.score);
      setLevelSaved(false);
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

  // Сбрасывать таймер при появлении нового вопроса.
  useEffect(() => {
    if (!question || finished || !started) return;
    setSecondsLeft(QUESTION_TIMER_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Время вышло — фиксируем как неправильный ответ.
          void submitAnswer(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, started, finished]);

  async function submitAnswer(timeout = false): Promise<void> {
    if (!question || (!selected && !timeout)) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // На таймауте отправляем заведомо неверный «пустой» ответ — сервер
    // зачтёт его как ошибку, CAT-движок понизит сложность следующего вопроса.
    const submittedAnswer = timeout ? '__TIMEOUT__' : (selected ?? '__TIMEOUT__');
    setLoading(true);
    try {
      const res = await fetch('/api/test/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: [question.id],
          answers: [submittedAnswer],
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
        selected: selected ?? submittedAnswer,
        correctAnswer: detail?.correctAnswer,
        question_kk: question.question_kk,
        question_ru: question.question_ru,
        topic: question.topic,
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
    setLevelSaved(false);
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
        <p className="text-sm text-gray-500 mb-4">
          {t(
            `${correctCount} / ${answered.length} сұраққа дұрыс жауап бердіңіз`,
            `Правильных ответов: ${correctCount} из ${answered.length}`,
          )}
        </p>
        {levelSaved ? (
          <div
            role="status"
            className="mx-auto mb-6 max-w-md rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {t(
              `✓ Деңгейіңіз (${finalLevel}) профильге сақталды`,
              `✓ Ваш уровень ${finalLevel} сохранён в профиле`,
            )}
          </div>
        ) : (
          <div
            role="status"
            className="mx-auto mb-6 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {t(
              'Деңгейді профильге сақтау үшін жүйеге кіріңіз',
              'Войдите, чтобы сохранить уровень в профиле',
            )}
          </div>
        )}
        {!certificateEligible && (
          <div
            role="status"
            className="mx-auto mb-6 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900"
          >
            {t(
              `Сертификат тек ${certificateMinScore}%+ дұрыс жауапта беріледі. Сіздің балыңыз: ${finalScore}%.`,
              `Сертификат выдаётся при ≥${certificateMinScore}% правильных. Ваш балл: ${finalScore}%. Пересдайте тест, чтобы получить сертификат.`,
            )}
          </div>
        )}
        {/* Sparkline уровня по вопросам — визуализация пути (audit P2) */}
        {answered.length > 0 && (
          <div className="mx-auto mb-6 max-w-md">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {t('Деңгейіңіздің траекториясы', 'Траектория уровня')}
            </p>
            <Sparkline answered={answered} />
          </div>
        )}

        <div className="flex justify-center gap-3 flex-wrap mb-4">
          <Button variant="outline" onClick={resetTest}>
            {t('Қайта тапсыру', 'Пересдать')}
          </Button>
          <Button variant="ghost" onClick={() => setReviewOpen((v) => !v)}>
            {reviewOpen
              ? t('Талдауды жасыру', 'Скрыть разбор')
              : t('Сұрақтарды талдау', 'Разбор вопросов')}
          </Button>
          <Button
            onClick={handleDownloadCertificate}
            disabled={downloading || !certificateEligible}
            title={!certificateEligible
              ? t(`Кемінде ${certificateMinScore}% қажет`, `Минимум ${certificateMinScore}% правильных`)
              : undefined}
          >
            {downloading
              ? t('Жүктелуде…', 'Загрузка…')
              : t('Сертификат алу', 'Получить сертификат')}
          </Button>
        </div>

        {/* Review-режим: все ответы с правильным вариантом (audit P1) */}
        {reviewOpen && (
          <div className="mt-4 text-left max-w-2xl mx-auto space-y-2">
            {answered.map((a, idx) => (
              <div
                key={idx}
                className={cn(
                  'rounded-lg border p-3 text-sm',
                  a.correct ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40',
                )}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-gray-400">#{idx + 1}</span>
                  <LevelBadge level={a.difficulty} size="sm" />
                  <span className="text-xs text-gray-500">{a.topic}</span>
                  <span className={cn('ml-auto text-xs font-semibold', a.correct ? 'text-emerald-700' : 'text-red-700')}>
                    {a.correct ? t('✓ Дұрыс', '✓ Правильно') : t('✗ Қате', '✗ Ошибка')}
                  </span>
                </div>
                <p className="text-gray-800 mb-1">
                  {locale === 'kk' ? (a.question_kk || a.question_ru) : (a.question_ru || a.question_kk)}
                </p>
                {!a.correct && a.correctAnswer && (
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">{t('Дұрыс жауап:', 'Правильный ответ:')}</span>{' '}
                    <span className="text-emerald-700">{a.correctAnswer}</span>
                  </p>
                )}
                {a.selected && a.selected !== '__TIMEOUT__' && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">{t('Сіздің жауабыңыз:', 'Ваш ответ:')}</span>{' '}
                    <span className={a.correct ? 'text-emerald-700' : 'text-red-700 line-through'}>
                      {a.selected}
                    </span>
                  </p>
                )}
                {a.selected === '__TIMEOUT__' && (
                  <p className="text-xs text-amber-700">
                    ⏱ {t('Уақыт бітті — жауап есептелмеді', 'Время вышло — ответ не засчитан')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Рекомендации после теста (audit P2) */}
        <Recommendations locale={locale} level={finalLevel} />
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
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <LevelBadge level={question.difficulty} size="sm" />
          <span className="text-xs text-gray-400 uppercase tracking-wide">{question.topic}</span>
          <span
            className={cn(
              'ml-auto text-xs font-mono px-2 py-0.5 rounded-full',
              secondsLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600',
            )}
            title={t('Уақыт', 'Время на ответ')}
          >
            ⏱ {secondsLeft}с
          </span>
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
        <Button onClick={() => submitAnswer()} disabled={!selected || loading}>
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


/* ───────────── Sparkline + Recommendations ───────────── */

function Sparkline({ answered }: { answered: AnsweredRecord[] }) {
  if (answered.length === 0) return null;
  const w = 320;
  const h = 80;
  const padX = 8;
  const padY = 12;
  const stepX = (w - 2 * padX) / Math.max(1, answered.length - 1);
  const points = answered.map((a, i) => {
    const rank = CEFR_RANK[a.difficulty] ?? 1; // 1..6
    const y = h - padY - ((rank - 1) / 5) * (h - 2 * padY);
    const x = padX + i * stepX;
    return { x, y, correct: a.correct, level: a.difficulty };
  });
  const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const labels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="level trajectory">
      {labels.map((lvl, i) => {
        const y = h - padY - (i / 5) * (h - 2 * padY);
        return (
          <g key={lvl}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#eee" strokeDasharray="2 4" />
            <text x={2} y={y + 3} fontSize="9" fill="#94a3b8">{lvl}</text>
          </g>
        );
      })}
      <path d={path} fill="none" stroke="#0d9488" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={p.correct ? "#10b981" : "#ef4444"} />
      ))}
    </svg>
  );
}

interface RecProps { locale: string; level: string }
function Recommendations({ locale, level }: RecProps) {
  const isKk = locale === "kk";
  // Подбираем 1-2 урока и 1-2 правила, релевантные уровню.
  const lessonId = level === "A1" ? 1 : level === "A2" ? 5 : level === "B1" ? 8 : level === "B2" ? 10 : 17;
  const ruleAnchor = level === "A1" ? "rule_22" : level === "A2" ? "rule_04" : level === "B1" ? "rule_06" : level === "B2" ? "rule_17" : "rule_20";
  return (
    <div className="mt-6 max-w-md mx-auto rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-left">
      <h4 className="font-semibold text-teal-900 mb-2">
        {isKk ? `Деңгей ${level} үшін ұсыныстар` : `Что делать дальше для уровня ${level}`}
      </h4>
      <ul className="text-sm text-teal-900 space-y-1 list-disc list-inside">
        <li>
          <Link href={`/${locale}/learn/lessons/${lessonId}`} className="underline hover:text-teal-950">
            📚 {isKk ? "Сабақ" : "Урок"} #{lessonId}
          </Link>
        </li>
        <li>
          <Link href={`/${locale}/learn/basics#${ruleAnchor}`} className="underline hover:text-teal-950">
            📖 {isKk ? "Ереже" : "Правило"} {ruleAnchor}
          </Link>
        </li>
        <li>
          <Link href={`/${locale}/learn/dialog`} className="underline hover:text-teal-950">
            💬 {isKk ? "Тілдік диалог жаттықтырғыш" : "Тренажёр диалогов"}
          </Link>
        </li>
        <li>
          <Link href={`/${locale}/learn/exercises`} className="underline hover:text-teal-950">
            🎯 {isKk ? "Бейімделген жаттығулар" : "Адаптивные упражнения"}
          </Link>
        </li>
        {(level === "B2" || level === "C1" || level === "C2") && (
          <li>
            <Link href={`/${locale}/test/kaztest`} className="underline hover:text-teal-950">
              🏅 {isKk ? "ҚАЗТЕСТ дайындық" : "Подготовка к ҚАЗТЕСТ"}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
