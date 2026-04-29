'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  KK_SOUNDS,
  KK_WORDS,
  KK_PHRASES,
  KK_MINIMAL_PAIRS,
  KK_TONGUE_TWISTERS,
  type PracticeItem,
  type PracticeLevel,
} from '@/data/pronunciation-catalog';

interface PronunciationPracticeProps {
  locale: string;
}

type Mode = 'phrases' | 'words' | 'sounds' | 'minimal-pairs' | 'tongue-twisters';

const MODES: Array<{ id: Mode; label_kk: string; label_ru: string; icon: string }> = [
  { id: 'phrases', label_kk: 'Сөз тіркестері', label_ru: 'Фразы', icon: '💬' },
  { id: 'words', label_kk: 'Сөздер', label_ru: 'Слова', icon: '📝' },
  { id: 'sounds', label_kk: 'Дыбыстар', label_ru: 'Звуки', icon: '🔡' },
  { id: 'minimal-pairs', label_kk: 'Минималдық жұптар', label_ru: 'Минимальные пары', icon: '⚖️' },
  { id: 'tongue-twisters', label_kk: 'Жаңылтпаштар', label_ru: 'Скороговорки', icon: '🌀' },
];

const LEVELS: PracticeLevel[] = ['A1', 'A2', 'B1', 'B2'];

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
}

type WindowWithSpeech = Window & {
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  SpeechRecognition?: new () => SpeechRecognitionLike;
};

// Нормализация для сравнения: приводим к нижнему регистру, убираем
// пунктуацию и лишние пробелы.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[!.?,;:—\-"'«»()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Левенштейн-расстояние (классический DP).
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** Возвращает совпадение в процентах (0..100). */
function similarity(reference: string, spoken: string): number {
  const a = normalize(reference);
  const b = normalize(spoken);
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

export default function PronunciationPractice({ locale }: PronunciationPracticeProps) {
  const isKk = locale === 'kk';
  const apiLocale: 'kk' | 'ru' = isKk ? 'kk' : 'ru';

  const [mode, setMode] = useState<Mode>('phrases');
  const [levelFilter, setLevelFilter] = useState<'all' | PracticeLevel>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guide, setGuide] = useState('');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState<'normal' | 'slow' | 'pair-a' | 'pair-b' | null>(null);

  // Запись и распознавание.
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recognized, setRecognized] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as WindowWithSpeech;
    setSpeechSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  // Текущий список единиц практики в зависимости от режима + фильтра уровня.
  const items: PracticeItem[] = useMemo(() => {
    let base: PracticeItem[] = [];
    if (mode === 'phrases') base = KK_PHRASES;
    else if (mode === 'words') base = KK_WORDS;
    else if (mode === 'tongue-twisters') base = KK_TONGUE_TWISTERS;
    else return [];
    if (levelFilter === 'all') return base;
    return base.filter((i) => i.level === levelFilter);
  }, [mode, levelFilter]);

  const currentItem = items[currentIndex] ?? null;
  const currentSound = mode === 'sounds' ? KK_SOUNDS[currentIndex] ?? null : null;
  const currentPair = mode === 'minimal-pairs' ? KK_MINIMAL_PAIRS[currentIndex] ?? null : null;

  const totalCount =
    mode === 'sounds'
      ? KK_SOUNDS.length
      : mode === 'minimal-pairs'
        ? KK_MINIMAL_PAIRS.length
        : items.length;

  // При смене режима/фильтра сбрасываем индекс и состояние.
  useEffect(() => {
    setCurrentIndex(0);
    setGuide('');
    setRecognized('');
    setScore(null);
  }, [mode, levelFilter]);

  const speak = async (text: string, slow = false, slot: 'normal' | 'slow' | 'pair-a' | 'pair-b' = 'normal') => {
    if (!text) return;
    setLoadingAudio(slot);
    try {
      const res = await fetch('/api/learn/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: slow ? text.split('').join(' ') : text, mode: 'audio' }),
      });
      const data = await res.json();
      if (data.audio?.audioBase64) {
        const audio = new Audio(`data:${data.audio.mimeType};base64,${data.audio.audioBase64}`);
        audio.playbackRate = slow ? 0.75 : 1;
        await audio.play();
      }
    } catch {
      /* без fallback */
    } finally {
      setLoadingAudio(null);
    }
  };

  const getGuide = async (text: string) => {
    setLoadingGuide(true);
    try {
      const res = await fetch('/api/learn/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: 'guide', locale: apiLocale }),
      });
      const data = await res.json();
      setGuide(data.guide || '');
    } catch {
      setGuide(isKk ? 'Қол жетімді емес' : 'Недоступно');
    } finally {
      setLoadingGuide(false);
    }
  };

  const startRecording = (reference: string) => {
    const w = window as WindowWithSpeech;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    setRecognized('');
    setScore(null);
    const r = new Ctor();
    r.lang = 'kk-KZ';
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript?.trim() ?? '';
      setRecognized(t);
      setScore(similarity(reference, t));
    };
    r.onerror = () => setRecording(false);
    r.onend = () => setRecording(false);
    recogRef.current = r;
    setRecording(true);
    try { r.start(); } catch { setRecording(false); }
  };

  const stopRecording = () => {
    try { recogRef.current?.stop(); } catch { /* ignore */ }
    setRecording(false);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, totalCount));
    setGuide('');
    setRecognized('');
    setScore(null);
  };
  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, totalCount)) % Math.max(1, totalCount));
    setGuide('');
    setRecognized('');
    setScore(null);
  };

  // Текущий «эталон» для записи + сравнения.
  const referenceText: string =
    mode === 'minimal-pairs' && currentPair
      ? `${currentPair.a} ${currentPair.b}`
      : mode === 'sounds' && currentSound
        ? currentSound.examples[0]?.split(' ')[0] || currentSound.letter
        : currentItem?.word ?? '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isKk ? 'Айтылым практикасы' : 'Практика произношения'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isKk
            ? 'Сөздер мен сөз тіркестерін тыңдап, қайталаңыз. Дауысыңызды жазып, эталонмен салыстырыңыз.'
            : 'Слушайте, повторяйте, записывайте свой голос — AI сравнит с эталоном.'}
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
              }`}
            >
              <span aria-hidden>{m.icon}</span>
              <span>{isKk ? m.label_kk : m.label_ru}</span>
            </button>
          );
        })}
      </div>

      {/* Level filter (только для phrases / words / tongue-twisters) */}
      {(mode === 'phrases' || mode === 'words' || mode === 'tongue-twisters') && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-700">{isKk ? 'Деңгей:' : 'Уровень:'}</span>
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-2.5 py-1 rounded-full border text-xs ${levelFilter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            {isKk ? 'Барлығы' : 'Все'}
          </button>
          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevelFilter(lv)}
              className={`px-2.5 py-1 rounded-full border text-xs ${levelFilter === lv ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {lv}
            </button>
          ))}
        </div>
      )}

      {/* Карточка контента */}
      {mode === 'sounds' && currentSound && (
        <Card className="text-center py-8">
          <p className="text-xs text-gray-400 mb-2">
            {currentIndex + 1} / {KK_SOUNDS.length}
          </p>
          <h3 className="text-5xl font-bold text-teal-800 mb-1">{currentSound.letter}</h3>
          <p className="text-lg text-amber-700 font-mono mb-3">{currentSound.ipa}</p>
          <p className="text-sm text-gray-700 max-w-md mx-auto mb-4">{currentSound.description_ru}</p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {currentSound.examples.map((ex, i) => (
              <code key={i} className="text-xs bg-teal-50 border border-teal-100 text-teal-800 rounded px-2 py-1">{ex}</code>
            ))}
          </div>
          <Button variant="outline" size="lg" onClick={() => speak(currentSound.examples[0]?.split(' ')[0] || currentSound.letter)} loading={loadingAudio === 'normal'}>
            🔊 {isKk ? 'Тыңдау' : 'Слушать пример'}
          </Button>
        </Card>
      )}

      {mode === 'minimal-pairs' && currentPair && (
        <Card className="text-center py-8">
          <p className="text-xs text-gray-400 mb-2">
            {currentIndex + 1} / {KK_MINIMAL_PAIRS.length} · {currentPair.contrast}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-xl mx-auto">
            <div className="flex-1 rounded-xl border border-teal-200 bg-teal-50 p-4">
              <div className="text-2xl font-bold text-teal-800">{currentPair.a}</div>
              <div className="text-sm text-gray-600 mt-1">{currentPair.a_ru}</div>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => speak(currentPair.a, false, 'pair-a')} loading={loadingAudio === 'pair-a'}>
                🔊 {isKk ? 'Тыңдау' : 'Слушать'}
              </Button>
            </div>
            <div className="self-center text-gray-400 text-xl">⇄</div>
            <div className="flex-1 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-2xl font-bold text-amber-800">{currentPair.b}</div>
              <div className="text-sm text-gray-600 mt-1">{currentPair.b_ru}</div>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => speak(currentPair.b, false, 'pair-b')} loading={loadingAudio === 'pair-b'}>
                🔊 {isKk ? 'Тыңдау' : 'Слушать'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {(mode === 'phrases' || mode === 'words' || mode === 'tongue-twisters') && currentItem && (
        <Card className="text-center py-8">
          <p className="text-xs text-gray-400 mb-2">
            {currentIndex + 1} / {totalCount} · {currentItem.level}
            {currentItem.focusSound ? ` · «${currentItem.focusSound}»` : ''}
          </p>
          <h3 className="text-3xl font-bold text-teal-800 mb-2 break-words [overflow-wrap:anywhere] px-2">{currentItem.word}</h3>
          <p className="text-gray-500 mb-6">{currentItem.translation}</p>

          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <Button variant="outline" size="lg" onClick={() => speak(currentItem.word)} loading={loadingAudio === 'normal'}>
              🔊 {isKk ? 'Тыңдау' : 'Слушать'}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => speak(currentItem.word, true, 'slow')} loading={loadingAudio === 'slow'}>
              🔄 {isKk ? 'Баяу' : 'Медленно'}
            </Button>
          </div>

          {/* Запись голоса + сравнение */}
          {speechSupported && (
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {!recording ? (
                  <Button variant="outline" size="md" onClick={() => startRecording(currentItem.word)}>
                    🎙 {isKk ? 'Жазу' : 'Записать'}
                  </Button>
                ) : (
                  <Button variant="danger" size="md" onClick={stopRecording}>
                    ⏹ {isKk ? 'Тоқтату' : 'Стоп'}
                  </Button>
                )}
              </div>
              {recognized && (
                <div className="mt-3 text-sm">
                  <div className="text-gray-700">
                    <span className="text-gray-500">{isKk ? 'AI естіді:' : 'AI услышал:'}</span>{' '}
                    <span className="font-medium">«{recognized}»</span>
                  </div>
                  {score !== null && (
                    <div className={`mt-1 font-bold ${score >= 80 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                      {isKk ? 'Сәйкестік:' : 'Совпадение:'} {score}/100
                      {score >= 80 ? ' ✓' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {!speechSupported && (
            <p className="text-xs text-amber-600 mt-2">
              {isKk
                ? 'Дауыс жазу тек Chrome / Edge браузерлерінде істейді.'
                : 'Запись голоса работает только в Chrome / Edge.'}
            </p>
          )}

          <Button variant="ghost" size="sm" onClick={() => getGuide(currentItem.word)} loading={loadingGuide} className="mt-4">
            {isKk ? '📖 Айтылу нұсқаулығы' : '📖 Руководство по произношению'}
          </Button>

          {guide && (
            <div className="mt-4 bg-teal-50 border border-teal-100 rounded-lg p-4 text-left text-sm text-teal-900 whitespace-pre-line">
              {guide}
            </div>
          )}
        </Card>
      )}

      {/* Навигация */}
      {totalCount > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={prev}>
            ← {isKk ? 'Алдыңғы' : 'Предыдущий'}
          </Button>
          <Button onClick={next}>
            {isKk ? 'Келесі' : 'Следующий'} →
          </Button>
        </div>
      )}

      {/* Связка с разделами /basics и /lessons */}
      <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-sm">
        <p className="text-teal-900 font-medium mb-2">
          {isKk ? 'Қосымша оқу' : 'Дополнительно'}
        </p>
        <div className="flex flex-wrap gap-3 text-teal-800">
          <a href={`/${locale}/learn/basics#rule_18`} className="underline hover:text-teal-900">
            📖 {isKk ? 'Ереже: ерекше дыбыстар' : 'Правило: специфические звуки'}
          </a>
          <a href={`/${locale}/learn/lessons/18`} className="underline hover:text-teal-900">
            📚 {isKk ? '18-сабақ: фонетика' : 'Урок 18: фонетика'}
          </a>
        </div>
      </div>
    </div>
  );
}
