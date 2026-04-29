'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MENTORS, type MentorKey, DEFAULT_MENTOR } from '@/lib/mentors';
import LiveVoiceDialog from '@/components/features/LiveVoiceDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type DialogMode = 'text' | 'voice-loop' | 'live';

interface DialogTrainerProps {
  locale: string;
}

interface DialogTopic {
  id: string;
  label_kk: string;
  label_ru: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
}

// Расширенный каталог тем (audit просил 20+, было 8). Сгруппированы по
// CEFR-уровню — на UI рендерим с фильтром по доступному уровню.
const DIALOG_TOPICS: DialogTopic[] = [
  // A1 — базовый бытовой
  { id: 'greetings', label_kk: 'Танысу, амандасу', label_ru: 'Знакомство, приветствие', level: 'A1' },
  { id: 'family', label_kk: 'Менің отбасым', label_ru: 'Моя семья', level: 'A1' },
  { id: 'home', label_kk: 'Менің үйім', label_ru: 'Мой дом / квартира', level: 'A1' },
  { id: 'day', label_kk: 'Менің күнім', label_ru: 'Мой день / расписание', level: 'A1' },
  { id: 'colors', label_kk: 'Түстер мен заттар', label_ru: 'Цвета / описание предмета', level: 'A1' },
  // A2 — расширенный бытовой
  { id: 'shopping', label_kk: 'Дүкенде сатып алу', label_ru: 'Покупки в магазине', level: 'A2' },
  { id: 'restaurant', label_kk: 'Мейрамханада', label_ru: 'В ресторане', level: 'A2' },
  { id: 'directions', label_kk: 'Жол сұрау', label_ru: 'Спросить дорогу', level: 'A2' },
  { id: 'station', label_kk: 'Вокзал, әуежай', label_ru: 'На вокзале / в аэропорту', level: 'A2' },
  { id: 'hotel', label_kk: 'Қонақ үй', label_ru: 'В отеле / ресепшен', level: 'A2' },
  { id: 'time', label_kk: 'Уақыт, кездесу', label_ru: 'Время / встреча по часам', level: 'A2' },
  { id: 'doctor', label_kk: 'Дәрігерде', label_ru: 'У врача', level: 'A2' },
  // B1 — прикладной / профессиональный
  { id: 'work', label_kk: 'Жұмыс туралы', label_ru: 'О работе', level: 'B1' },
  { id: 'travel', label_kk: 'Саяхат', label_ru: 'Путешествие', level: 'B1' },
  { id: 'interview', label_kk: 'Сұхбат', label_ru: 'Интервью на работу', level: 'B1' },
  { id: 'bank', label_kk: 'Банкте', label_ru: 'В банке / открытие счёта', level: 'B1' },
  { id: 'rent', label_kk: 'Пәтер жалдау', label_ru: 'Аренда квартиры', level: 'B1' },
  { id: 'emergency', label_kk: 'Жедел жәрдем (101/102/103)', label_ru: 'Звонок в экстренные службы', level: 'B1' },
  // B2 — продвинутый
  { id: 'business', label_kk: 'Іскерлік келіссөз', label_ru: 'Деловые переговоры', level: 'B2' },
  { id: 'presentation', label_kk: 'Презентация', label_ru: 'Презентация / выступление', level: 'B2' },
  { id: 'complaint', label_kk: 'Шағым / қақтығыс', label_ru: 'Жалоба / решение конфликта', level: 'B2' },
  // Свободная (любой уровень)
  { id: 'free', label_kk: 'Еркін тақырып', label_ru: 'Свободная тема', level: 'A1' },
];

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  correction?: string;
}

// Минимальный тип под Web Speech API (в Next 16 globals нет)
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

export default function DialogTrainer({ locale }: DialogTrainerProps) {
  const isKk = locale === 'kk';
  const apiLocale: 'kk' | 'ru' = isKk ? 'kk' : 'ru';
  const { user } = useCurrentUser();
  // Дефолт A1 (раньше был B1 — ломал новичков; см. audit P0).
  // Если user.language_level задан — берём его как стартовое значение.
  const [level, setLevel] = useState<string>(() => user?.language_level || 'A1');
  const [levelTouched, setLevelTouched] = useState(false);
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);
  useEffect(() => {
    if (!levelTouched && user?.language_level) setLevel(user.language_level);
  }, [user?.language_level, levelTouched]);

  const [mode, setMode] = useState<DialogMode>('text');
  const [mentor, setMentor] = useState<MentorKey>(DEFAULT_MENTOR);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  // Краткая сводка после завершения сессии (показывается на экране выбора тем).
  const [sessionSummary, setSessionSummary] = useState<{
    turns: number;
    topicLabel: string;
    progress?: { xp_gained?: number; current_streak?: number; level?: number; achievements_unlocked?: string[] } | null;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mentorProfile = MENTORS[mentor];
  const voiceMode = mode === 'voice-loop';

  useEffect(() => {
    const w = window as WindowWithSpeech;
    setSpeechSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingIdx(null);
  }, []);

  const playMessage = useCallback(async (text: string, idx: number) => {
    if (!text?.trim()) return;
    stopPlayback();
    setPlayingIdx(idx);
    try {
      const res = await fetch('/api/learn/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: mentorProfile.ttsVoice }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.audio?.audioBase64) {
        // Без Gemini TTS просто молчим — browser speechSynthesis не выговаривает kk-KZ
        // нормально (даёт английскую транслитерацию) и портит UX больше, чем помогает.
        setPlayingIdx(null);
        return;
      }
      const src = `data:${data.audio.mimeType};base64,${data.audio.audioBase64}`;
      const audio = new Audio(src);
      audio.onended = () => setPlayingIdx(null);
      audio.onerror = () => setPlayingIdx(null);
      audioRef.current = audio;
      await audio.play();
    } catch (e) {
      console.error(e);
      setPlayingIdx(null);
    }
  }, [stopPlayback, mentorProfile.ttsVoice]);

  const startDialog = async (topicId: string) => {
    setSelectedTopic(topicId);
    setLoading(true);
    const topicMeta = DIALOG_TOPICS.find((t) => t.id === topicId);
    const topicLabel = topicMeta ? (isKk ? topicMeta.label_kk : topicMeta.label_ru) : topicId;
    const startMessage = apiLocale === 'ru'
      ? `Начни диалог. Тема: ${topicLabel}. Опиши ситуацию ОДНИМ-ДВУМЯ предложениями и задай первый вопрос ученику.`
      : `Диалог бастаңыз. Тақырып: ${topicLabel}. Жағдайды бір-екі сөйлеммен сипаттап, бірінші сұрақты қойыңыз.`;
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const res = await fetch('/api/learn/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: startMessage,
          history: [],
          mentor,
          level,
          locale: apiLocale,
          mode: 'dialog',
          topic: topicLabel,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'Диалогты бастайық!';
      setMessages([{ role: 'assistant', content: reply }]);
      if (voiceMode) setTimeout(() => playMessage(reply, 0), 200);
    } catch {
      setMessages([{ role: 'assistant', content: 'Диалогты бастайық! Сәлеметсіз бе!' }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput('');
    const nextHistory: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const topicMeta = DIALOG_TOPICS.find((t) => t.id === selectedTopic);
      const topicLabel = topicMeta ? (isKk ? topicMeta.label_kk : topicMeta.label_ru) : selectedTopic;
      const res = await fetch('/api/learn/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history: messages,
          mentor,
          level,
          locale: apiLocale,
          mode: 'dialog',
          topic: topicLabel,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'Жалғастырайық!';
      const newIdx = nextHistory.length;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, correction: data.correction }]);
      if (voiceMode) setTimeout(() => playMessage(reply, newIdx), 200);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Жалғастырыңыз!' }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecognition = () => {
    const w = window as WindowWithSpeech;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    stopPlayback();
    const r = new Ctor();
    r.lang = 'kk-KZ';
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript?.trim();
      if (t) sendMessage(t);
    };
    r.onerror = () => setRecording(false);
    r.onend = () => setRecording(false);
    recogRef.current = r;
    setRecording(true);
    try { r.start(); } catch { setRecording(false); }
  };

  const stopRecognition = () => {
    try { recogRef.current?.stop(); } catch {}
    setRecording(false);
  };

  useEffect(() => () => { stopPlayback(); stopRecognition(); }, [stopPlayback]);

  // Кликабельный CEFR-selector. Заменяет статичный LevelBadge.
  const renderLevelSelector = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLevelMenuOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 text-xs font-medium hover:bg-teal-100"
        title={isKk ? 'Деңгейді ауыстыру' : 'Сменить уровень'}
      >
        {isKk ? 'Деңгей:' : 'Уровень:'} {level}
        <span aria-hidden>▾</span>
      </button>
      {levelMenuOpen && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[110px]">
          {CEFR_LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => { setLevel(lv); setLevelTouched(true); setLevelMenuOpen(false); }}
              className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-teal-50 ${level === lv ? 'font-semibold text-teal-700' : 'text-gray-700'}`}
            >
              {lv}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (mode === 'live') {
    return (
      <div>
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isKk ? 'Live дауыстық диалог' : 'Live голосовой диалог'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isKk
                ? 'AI-мен тірі дауыспен сөйлесіңіз — табиғи, жылдам, үзіле алады'
                : 'Живой разговор с AI — естественно, быстро, с возможностью перебивать'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {renderLevelSelector()}
            <ModeSwitch locale={locale} mode={mode} onChange={setMode} speechSupported={speechSupported} />
          </div>
        </div>
        <LiveVoiceDialog locale={locale} topic={selectedTopic} level={level} />
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <div>
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isKk ? 'Диалог тақырыбын таңдаңыз' : 'Выберите тему диалога'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isKk
                ? 'AI-мен нақты жағдайларда сөйлесуді жаттықтырыңыз'
                : 'Практикуйте разговор с AI в реальных ситуациях'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {renderLevelSelector()}
            <ModeSwitch locale={locale} mode={mode} onChange={setMode} speechSupported={speechSupported} />
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            {isKk ? 'Ұстазыңды таңда' : 'Выбери наставника'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(MENTORS) as MentorKey[]).map((k) => {
              const m = MENTORS[k];
              const active = mentor === k;
              return (
                <button
                  key={k}
                  onClick={() => setMentor(k)}
                  className={`text-left rounded-2xl border-2 p-3 transition-all ${
                    active ? 'border-teal-600 bg-teal-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      <Image src={m.image} alt={isKk ? m.name_kk : m.name_ru} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{isKk ? m.name_kk : m.name_ru}</div>
                      <div className="text-xs text-gray-500 truncate">{isKk ? m.role_kk : m.role_ru}</div>
                      <div className="text-[11px] text-gray-400 truncate">🎙 {isKk ? m.tone_kk : m.tone_ru}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {sessionSummary && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>✓</span>
              <div className="flex-1">
                <div className="font-semibold text-emerald-900">
                  {isKk
                    ? `Сессия аяқталды — «${sessionSummary.topicLabel}»`
                    : `Сессия завершена — «${sessionSummary.topicLabel}»`}
                </div>
                <div className="text-sm text-emerald-800 mt-1">
                  {isKk
                    ? `Сіздің реплика саны: ${sessionSummary.turns}.`
                    : `Ваших реплик: ${sessionSummary.turns}.`}
                  {sessionSummary.progress?.xp_gained && sessionSummary.progress.xp_gained > 0 ? (
                    <span className="ml-2 font-semibold text-emerald-900">+{sessionSummary.progress.xp_gained} XP</span>
                  ) : null}
                  {sessionSummary.progress?.current_streak ? (
                    <span className="ml-2">🔥 {sessionSummary.progress.current_streak}</span>
                  ) : null}
                  {sessionSummary.progress?.achievements_unlocked && sessionSummary.progress.achievements_unlocked.length > 0 ? (
                    <span className="ml-2">🏆 {sessionSummary.progress.achievements_unlocked.length}</span>
                  ) : null}
                </div>
                {sessionSummary.turns > 0 && sessionSummary.turns < 4 && (
                  <p className="text-xs text-emerald-700 mt-2">
                    {isKk
                      ? 'Тағы ұзағырақ сөйлесіңіз — XP 4+ репликадан есептеледі.'
                      : 'Поговорите чуть дольше — XP начисляется от 4 реплик.'}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSessionSummary(null)}
                className="text-emerald-700 hover:text-emerald-900 text-sm"
                aria-label={isKk ? 'Жабу' : 'Закрыть'}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="text-sm font-semibold text-gray-700 mb-2">
          {isKk ? 'Тақырып' : 'Тема'}
        </div>
        {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => {
          const topics = DIALOG_TOPICS.filter((t) => t.level === lvl);
          if (topics.length === 0) return null;
          return (
            <div key={lvl} className="mb-4">
              <div className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
                {lvl}
                {' '}
                <span className="text-gray-400 normal-case font-normal">
                  · {topics.length} {isKk ? 'тақырып' : 'тем'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((topic) => (
                  <Card key={topic.id} hover className="cursor-pointer" padding="md">
                    <button onClick={() => startDialog(topic.id)} className="text-left w-full">
                      <h3 className="font-medium text-gray-900">
                        {isKk ? topic.label_kk : topic.label_ru}
                      </h3>
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
        {/* Свободная тема — отдельно, без уровня */}
        {(() => {
          const free = DIALOG_TOPICS.find((t) => t.id === 'free');
          if (!free) return null;
          return (
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
                {isKk ? 'Кез келген деңгей' : 'Любой уровень'}
              </div>
              <Card hover className="cursor-pointer" padding="md">
                <button onClick={() => startDialog(free.id)} className="text-left w-full">
                  <h3 className="font-medium text-gray-900">
                    💬 {isKk ? free.label_kk : free.label_ru}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isKk ? 'AI өзіңіз қалаған кез келген тақырыпта сөйлеседі' : 'AI поговорит на любую тему по вашему выбору'}
                  </p>
                </button>
              </Card>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] max-h-[640px]">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
            <Image src={mentorProfile.image} alt={isKk ? mentorProfile.name_kk : mentorProfile.name_ru} fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 leading-tight truncate">
              {isKk ? mentorProfile.name_kk : mentorProfile.name_ru}
            </h2>
            <div className="text-xs text-gray-500 truncate">
              {isKk ? mentorProfile.role_kk : mentorProfile.role_ru} · 🎙 {mentorProfile.ttsVoice}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {renderLevelSelector()}
          <ModeSwitch locale={locale} mode={mode} onChange={setMode} speechSupported={speechSupported} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stopPlayback();
              stopRecognition();
              // Финализация: сообщаем серверу о завершении диалог-сессии,
              // чтобы начислить XP / streak / achievements за live-разговор.
              const userTurns = messages.filter((m) => m.role === 'user').length;
              const topicMeta = DIALOG_TOPICS.find((t) => t.id === selectedTopic);
              const topicLabel = topicMeta ? (isKk ? topicMeta.label_kk : topicMeta.label_ru) : (selectedTopic ?? '');
              if (userTurns > 0) {
                const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
                fetch('/api/dialog/finish', {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({
                    topic: topicLabel,
                    turns: userTurns,
                    mentor: mentorProfile.key,
                  }),
                })
                  .then((r) => (r.ok ? r.json() : null))
                  .then((data) => {
                    setSessionSummary({
                      turns: userTurns,
                      topicLabel,
                      progress: data?.progress ?? null,
                    });
                  })
                  .catch(() => {
                    setSessionSummary({ turns: userTurns, topicLabel, progress: null });
                  });
              }
              setSelectedTopic(null);
              setMessages([]);
            }}
          >
            {isKk ? 'Тақырып ауыстыру' : 'Сменить тему'}
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-y-auto mb-4" padding="sm">
        <div className="space-y-3 p-2">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-teal-700 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => (playingIdx === idx ? stopPlayback() : playMessage(msg.content, idx))}
                      className="ml-2 inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 align-middle"
                      title={locale === 'kk' ? 'Тыңдау' : 'Озвучить'}
                    >
                      {playingIdx === idx ? '⏸' : '🔊'}
                    </button>
                  )}
                </div>
              </div>
              {msg.correction && (
                <div className="flex justify-start mt-1 ml-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 max-w-[80%]">
                    <span className="font-medium">{locale === 'kk' ? 'Түзету: ' : 'Исправление: '}</span>
                    {msg.correction}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-400">
                {locale === 'kk' ? 'Жазып жатыр...' : 'Печатает...'}
              </div>
            </div>
          )}
        </div>
      </Card>

      {voiceMode ? (
        <div className="flex items-center justify-center gap-3 py-3">
          <button
            onClick={recording ? stopRecognition : startRecognition}
            disabled={loading || !speechSupported}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all ${
              recording
                ? 'bg-red-500 text-white animate-pulse scale-105'
                : 'bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-40'
            }`}
            title={locale === 'kk' ? 'Микрофон' : 'Микрофон'}
          >
            {recording ? '⏹' : '🎙️'}
          </button>
          <div className="text-sm text-gray-500">
            {!speechSupported
              ? (locale === 'kk' ? 'Браузер дауыс енгізуді қолдамайды — Chrome/Edge қолданыңыз' : 'Браузер не поддерживает голосовой ввод — используйте Chrome/Edge')
              : recording
              ? (locale === 'kk' ? 'Тыңдап тұр… ұзынша сөйлеңіз' : 'Слушаю… говорите')
              : (locale === 'kk' ? 'Қазақша сөйлеу үшін басыңыз' : 'Нажмите, чтобы сказать на казахском')}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={locale === 'kk' ? 'Жауабыңызды жазыңыз...' : 'Напишите ваш ответ...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            disabled={loading}
          />
          <Button onClick={() => sendMessage()} loading={loading}>
            {locale === 'kk' ? 'Жіберу' : 'Отправить'}
          </Button>
        </div>
      )}
    </div>
  );
}

function LevelBadge({ locale, level }: { locale: string; level: string }) {
  const isKk = locale === 'kk';
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 text-xs font-medium"
      title={isKk ? 'Сіздің деңгейіңіз' : 'Ваш уровень'}
    >
      {isKk ? 'Деңгей:' : 'Ваш уровень:'} {level}
    </span>
  );
}

function ModeSwitch({
  locale,
  mode,
  onChange,
  speechSupported,
}: {
  locale: string;
  mode: DialogMode;
  onChange: (m: DialogMode) => void;
  speechSupported: boolean;
}) {
  const isKk = locale === 'kk';
  const modes: { id: DialogMode; label_kk: string; label_ru: string; hint_kk: string; hint_ru: string }[] = [
    {
      id: 'text',
      label_kk: '📝 Мәтін',
      label_ru: '📝 Текст',
      hint_kk: 'Жауаптарды жазу — қарапайым чат',
      hint_ru: 'Печатайте ответы в чат',
    },
    {
      id: 'voice-loop',
      label_kk: '🎙️ Дауыс (цикл)',
      label_ru: '🎙️ Голос (цикл)',
      hint_kk: 'Сіз сөйлейсіз — AI естиді және дауыспен жауап береді',
      hint_ru: 'Скажите ответ — AI услышит и ответит голосом',
    },
    {
      id: 'live',
      label_kk: '📡 Live',
      label_ru: '📡 Live',
      hint_kk: 'Telefondegidey тірі диалог — нақты уақытта',
      hint_ru: 'Живой разговор в реальном времени, как по телефону',
    },
  ];
  return (
    <div>
      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-0.5">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            title={isKk ? m.hint_kk : m.hint_ru}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              mode === m.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isKk ? m.label_kk : m.label_ru}
          </button>
        ))}
      </div>
      {mode === 'voice-loop' && !speechSupported && (
        <div className="text-[11px] text-amber-600 mt-1">
          {isKk ? 'тек Chrome/Edge' : 'только Chrome/Edge'}
        </div>
      )}
      {mode === 'live' && (
        <div className="text-[11px] text-gray-500 mt-1">
          {isKk ? 'Gemini Live — нақты дауыстық диалог' : 'Gemini Live — живой голосовой диалог'}
        </div>
      )}
    </div>
  );
}
