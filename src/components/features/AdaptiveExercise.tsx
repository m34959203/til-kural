'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Exercise {
  question: string;
  options: string[];
  correct: string;
  /** rule_id из /basics — если задан, при ошибке покажем CTA «Подробнее о правиле». */
  rule_id?: string | null;
  explanation: string;
}

const CEFR_DOWN: Record<string, string> = {
  C2: 'C1', C1: 'B2', B2: 'B1', B1: 'A2', A2: 'A1', A1: 'A1',
};
const CEFR_UP: Record<string, string> = {
  A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'C2',
};

interface WeakTopic {
  topic: string;
  avg_score: number;
  attempts: number;
  weakness_score: number;
  is_new: boolean;
  target_label_kk?: string;
  target_label_ru?: string;
}

interface AdaptiveExerciseProps {
  locale: string;
  /** Если задан — после завершения раунда вызовем POST /api/lessons/:id/complete со score. */
  lessonId?: string;
  /** Заголовок урока (название темы) — передаётся в AI-промпт, чтобы упражнения были по теме урока. */
  lessonTitle?: string;
  /** Целевой словарь темы (10–20 слов). */
  targetVocab?: string[];
  /** Релевантная грамматика темы (заголовки или описания правил). */
  targetGrammar?: string[];
}

const TOPIC_LABELS: Record<string, { kk: string; ru: string }> = {
  grammar: { kk: 'Грамматика', ru: 'Грамматика' },
  vocabulary: { kk: 'Сөздік қор', ru: 'Словарный запас' },
  cases: { kk: 'Септіктер', ru: 'Падежи' },
  tenses: { kk: 'Етістік шақтары', ru: 'Времена глагола' },
  reading: { kk: 'Оқылым', ru: 'Чтение' },
  listening: { kk: 'Тыңдалым', ru: 'Аудирование' },
  writing: { kk: 'Жазылым', ru: 'Письмо' },
};

function labelForTopic(slug: string, locale: string, fallbackKk?: string, fallbackRu?: string): string {
  const base = TOPIC_LABELS[slug];
  if (base) return locale === 'kk' ? base.kk : base.ru;
  if (locale === 'kk' && fallbackKk) return fallbackKk;
  if (locale !== 'kk' && fallbackRu) return fallbackRu;
  return slug;
}

export default function AdaptiveExercise({ locale, lessonId, lessonTitle, targetVocab, targetGrammar }: AdaptiveExerciseProps) {
  const { user } = useCurrentUser();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('grammar');
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [recommendedTopic, setRecommendedTopic] = useState<WeakTopic | null>(null);
  const [difficultyMode, setDifficultyMode] = useState<'basic' | 'standard' | 'advanced' | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  // Адаптация: уровень текущей сессии (стартовый — из user-профиля или A1).
  const [adaptiveLevel, setAdaptiveLevel] = useState<string>(() => user?.language_level || 'A1');
  // Накапливаем ошибочные rule_id за сессию — для финального экрана и для
  // следующего раунда «Повторить ошибки».
  const [missedRuleIds, setMissedRuleIds] = useState<string[]>([]);
  // Серия подряд правильных/неправильных ответов — для микро-CAT.
  const [streak, setStreak] = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });

  const fallbackTopics = [
    { id: 'grammar', label: locale === 'kk' ? 'Грамматика' : 'Грамматика' },
    { id: 'vocabulary', label: locale === 'kk' ? 'Сөздік қор' : 'Словарный запас' },
    { id: 'cases', label: locale === 'kk' ? 'Септіктер' : 'Падежи' },
    { id: 'tenses', label: locale === 'kk' ? 'Етістік шақтары' : 'Времена глагола' },
  ];

  const loadRecommendations = useCallback(async () => {
    if (!user) {
      setWeakTopics([]);
      setRecommendedTopic(null);
      return;
    }
    try {
      const res = await fetch('/api/recommend/next', { credentials: 'include' });
      if (!res.ok) {
        setWeakTopics([]);
        setRecommendedTopic(null);
        return;
      }
      const data = await res.json();
      const weak: WeakTopic[] = Array.isArray(data?.weakTopics) ? data.weakTopics : [];
      setWeakTopics(weak);
      if (weak.length > 0) {
        // max weakness_score
        const top = [...weak].sort((a, b) => (b.weakness_score ?? 0) - (a.weakness_score ?? 0))[0];
        setRecommendedTopic(top);
        setTopic(top.topic);
      } else {
        setRecommendedTopic(null);
      }
    } catch {
      setWeakTopics([]);
      setRecommendedTopic(null);
    }
  }, [user]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const generateExercises = async (mode: 'fresh' | 'retry-mistakes' = 'fresh') => {
    setLoading(true);
    setExercises([]);
    setCurrentIdx(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    if (mode === 'fresh') {
      setMissedRuleIds([]);
      setStreak({ correct: 0, wrong: 0 });
    }

    // Адаптивный уровень. Дефолт A1 (раньше был B1 — ломал новичков).
    const level = mode === 'retry-mistakes' ? CEFR_DOWN[adaptiveLevel] || 'A1' : adaptiveLevel;
    const weakPoints = mode === 'retry-mistakes' && missedRuleIds.length > 0
      ? missedRuleIds
      : weakTopics.map((w) => w.topic).filter((t) => t !== topic);
    const stat = weakTopics.find((w) => w.topic === topic);
    const avgScore = stat && stat.attempts > 0 ? stat.avg_score : undefined;

    try {
      const res = await fetch('/api/learn/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic,
          level,
          locale: locale === 'kk' ? 'kk' : 'ru',
          ...(lessonTitle ? { lessonTitle } : {}),
          ...(targetVocab && targetVocab.length > 0 ? { targetVocab } : {}),
          ...(targetGrammar && targetGrammar.length > 0 ? { targetGrammar } : {}),
          weakPoints,
          ...(typeof avgScore === 'number' ? { avg_score: avgScore } : {}),
        }),
      });
      const data = await res.json();
      if (data?.difficulty) setDifficultyMode(data.difficulty);
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
    const ex = exercises[currentIdx];
    const isCorrect = answer === ex.correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Микро-CAT: 3 правильных подряд → следующий раунд на ступень выше.
      setStreak((prev) => {
        const next = { correct: prev.correct + 1, wrong: 0 };
        if (next.correct >= 3) {
          setAdaptiveLevel((lv) => CEFR_UP[lv] || lv);
          return { correct: 0, wrong: 0 };
        }
        return next;
      });
    } else {
      // Запоминаем правило, по которому ошиблись (rule_id из ответа AI).
      if (ex.rule_id && !missedRuleIds.includes(ex.rule_id)) {
        setMissedRuleIds((prev) => [...prev, ex.rule_id as string]);
      }
      // Микро-CAT: 2 неправильных подряд → следующий раунд на ступень ниже.
      setStreak((prev) => {
        const next = { correct: 0, wrong: prev.wrong + 1 };
        if (next.wrong >= 2) {
          setAdaptiveLevel((lv) => CEFR_DOWN[lv] || lv);
          return { correct: 0, wrong: 0 };
        }
        return next;
      });
    }
  };

  const nextExercise = () => {
    setSelected(null);
    setShowResult(false);
    const newIdx = currentIdx + 1;
    setCurrentIdx(newIdx);
    // Если только что закончили раунд — обновим рекомендации,
    // чтобы следующая тема подтянулась по актуальным данным.
    if (newIdx >= exercises.length) {
      loadRecommendations();
      // Авто-завершение урока: если рендеримся внутри урока и пользователь авторизован —
      // тихо вызываем complete с фактическим score. UI-кнопка <MarkComplete /> остаётся
      // как fallback (даёт пользователю явное действие и видимый прогресс).
      if (lessonId && user && !lessonCompleted && exercises.length > 0) {
        const finalScore = Math.round((score / exercises.length) * 100);
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        fetch(`/api/lessons/${lessonId}/complete`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ score: finalScore }),
        })
          .then(() => setLessonCompleted(true))
          .catch(() => { /* не блокируем UI */ });
      }
    }
  };

  const recommendedLabel = recommendedTopic
    ? labelForTopic(
        recommendedTopic.topic,
        locale,
        recommendedTopic.target_label_kk,
        recommendedTopic.target_label_ru,
      )
    : '';

  if (exercises.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          {locale === 'kk' ? 'Бейімделгіш жаттығулар' : 'Адаптивные упражнения'}
        </h2>
        <p className="text-gray-500 text-sm">
          {locale === 'kk'
            ? 'Тақырыпты таңдап, AI жаттығулар жасасын'
            : 'Выберите тему и AI создаст упражнения'}
        </p>

        {user && recommendedTopic && (
          <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            <div className="font-medium">
              {locale === 'kk' ? 'Ұсынылады' : 'Рекомендовано'}:
              {' '}
              <span className="font-semibold">{recommendedLabel}</span>
            </div>
            <div className="text-teal-800/80 mt-1">
              {locale === 'kk'
                ? `Бұл тақырыпта әлсіздеу, орташа балл ${Math.round(recommendedTopic.avg_score)}%`
                : `У вас слабо в теме «${recommendedLabel}», средний балл ${Math.round(recommendedTopic.avg_score)}%`}
            </div>
          </div>
        )}

        {user && weakTopics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {weakTopics.map((w) => {
              const lbl = labelForTopic(w.topic, locale, w.target_label_kk, w.target_label_ru);
              const active = topic === w.topic;
              return (
                <button
                  key={w.topic}
                  onClick={() => setTopic(w.topic)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm transition-colors',
                    active
                      ? 'bg-teal-100 text-teal-800 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {lbl}
                  <span className="ml-2 text-xs opacity-70">
                    {Math.round(w.avg_score)}%
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fallbackTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm transition-colors',
                  topic === t.id
                    ? 'bg-teal-100 text-teal-800 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <Button onClick={() => generateExercises('fresh')} loading={loading}>
          {loading
            ? (locale === 'kk' ? 'AI жаттығулар дайындап жатыр…' : 'AI готовит задания…')
            : (locale === 'kk' ? 'Жаттығулар жасау' : 'Создать упражнения')}
        </Button>
        {loading && (
          <p className="text-xs text-gray-500 mt-2">
            {locale === 'kk'
              ? 'Бұл 10–20 секунд алуы мүмкін.'
              : 'Это может занять 10–20 секунд.'}
          </p>
        )}
        {/* Подсказка про адаптивный уровень */}
        <p className="text-xs text-gray-500 mt-2">
          {locale === 'kk'
            ? `Ағымдағы деңгей: ${adaptiveLevel}. Дұрыс жауап → жоғарылатылады, қате → төмендетіледі.`
            : `Текущий уровень: ${adaptiveLevel}. После 3 правильных подряд — повышается, после 2 ошибок подряд — понижается.`}
        </p>
      </div>
    );
  }

  if (currentIdx >= exercises.length) {
    const summaryRules = Array.from(new Set(missedRuleIds));
    return (
      <Card className="text-center py-8 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'kk' ? 'Жаттығулар аяқталды!' : 'Упражнения завершены!'}
          </h3>
          <p className="text-4xl font-bold text-teal-700 mb-2">
            {score}/{exercises.length}
          </p>
          <p className="text-sm text-gray-500">
            {locale === 'kk'
              ? `Деңгей: ${adaptiveLevel}`
              : `Уровень: ${adaptiveLevel}`}
          </p>
        </div>

        {summaryRules.length > 0 && (
          <div className="text-left max-w-md mx-auto rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-semibold text-amber-900 mb-2">
              {locale === 'kk' ? 'Қайталау керек ережелер' : 'Правила для повторения'}
            </h4>
            <ul className="text-sm text-amber-900 space-y-1">
              {summaryRules.map((rid) => (
                <li key={rid}>
                  <Link
                    href={`/${locale}/learn/basics#${rid}`}
                    className="underline hover:text-amber-950"
                  >
                    📖 {locale === 'kk' ? `${rid} ережесі` : `Правило ${rid}`}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {summaryRules.length > 0 && (
            <Button variant="outline" onClick={() => generateExercises('retry-mistakes')}>
              🔄 {locale === 'kk' ? 'Қателерді қайталау' : 'Повторить ошибки'}
            </Button>
          )}
          <Button onClick={() => generateExercises('fresh')}>
            {locale === 'kk' ? 'Жаңа жаттығулар' : 'Новые упражнения'}
          </Button>
        </div>
      </Card>
    );
  }

  const exercise = exercises[currentIdx];
  const difficultyBadgeText =
    difficultyMode === 'basic'
      ? locale === 'kk' ? 'Базалық' : 'Базовые'
      : difficultyMode === 'advanced'
        ? locale === 'kk' ? 'Озық' : 'Продвинутые'
        : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {currentIdx + 1} / {exercises.length}
        </span>
        <div className="flex items-center gap-2">
          {difficultyBadgeText && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                difficultyMode === 'basic'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-indigo-100 text-indigo-800',
              )}
            >
              {difficultyBadgeText}
            </span>
          )}
          <span className="text-sm font-medium text-teal-700">
            {locale === 'kk' ? 'Дұрыс' : 'Правильно'}: {score}
          </span>
        </div>
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
            <span className="whitespace-pre-line">{exercise.explanation}</span>
            {exercise.rule_id && /^rule_\d+$/.test(exercise.rule_id) && (
              <div className="mt-2">
                <Link
                  href={`/${locale}/learn/basics#${exercise.rule_id}`}
                  className="text-xs text-teal-700 hover:text-teal-900 underline"
                >
                  📖 {locale === 'kk' ? 'Толық ереже' : 'Подробнее о правиле'} →
                </Link>
              </div>
            )}
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
