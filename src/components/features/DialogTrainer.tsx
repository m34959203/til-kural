'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MENTORS, type MentorKey, DEFAULT_MENTOR } from '@/lib/mentors';
import LiveVoiceDialog from '@/components/features/LiveVoiceDialog';

type DialogMode = 'text' | 'voice-loop' | 'live';

interface DialogTrainerProps {
  locale: string;
}

const DIALOG_TOPICS = [
  { id: 'greetings', label_kk: 'Танысу, амандасу', label_ru: 'Знакомство, приветствие' },
  { id: 'shopping', label_kk: 'Дүкенде сатып алу', label_ru: 'Покупки в магазине' },
  { id: 'restaurant', label_kk: 'Мейрамханада', label_ru: 'В ресторане' },
  { id: 'directions', label_kk: 'Жол сұрау', label_ru: 'Спросить дорогу' },
  { id: 'doctor', label_kk: 'Дәрігерде', label_ru: 'У врача' },
  { id: 'work', label_kk: 'Жұмыс туралы', label_ru: 'О работе' },
  { id: 'travel', label_kk: 'Саяхат', label_ru: 'Путешествие' },
  { id: 'free', label_kk: 'Еркін тақырып', label_ru: 'Свободная тема' },
];

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
  const [mode, setMode] = useState<DialogMode>('text');
  const [mentor, setMentor] = useState<MentorKey>(DEFAULT_MENTOR);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
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
        // Fallback: browser TTS на kk-KZ (работает так себе, но хоть что-то)
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'kk-KZ';
          u.onend = () => setPlayingIdx(null);
          window.speechSynthesis.speak(u);
          return;
        }
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
    try {
      const res = await fetch('/api/learn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Диалог бастаңыз. Тақырып: ${topicId}. Сіз жағдайды сипаттап, бірінші сұрақты қойыңыз.`,
          history: [],
          mentor,
          level: 'B1',
          mode: 'dialog',
          topic: topicId,
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
      const res = await fetch('/api/learn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          mentor,
          level: 'B1',
          mode: 'dialog',
          topic: selectedTopic,
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
          <ModeSwitch locale={locale} mode={mode} onChange={setMode} speechSupported={speechSupported} />
        </div>
        <LiveVoiceDialog locale={locale} topic={selectedTopic} />
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
          <ModeSwitch locale={locale} mode={mode} onChange={setMode} speechSupported={speechSupported} />
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

        <div className="text-sm font-semibold text-gray-700 mb-2">
          {isKk ? 'Тақырып' : 'Тема'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIALOG_TOPICS.map((topic) => (
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
          <ModeSwitch locale={locale} mode={mode} onChange={setMode} speechSupported={speechSupported} />
          <Button variant="ghost" size="sm" onClick={() => { stopPlayback(); stopRecognition(); setSelectedTopic(null); setMessages([]); }}>
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
  const modes: { id: DialogMode; label_kk: string; label_ru: string; hint_kk?: string; hint_ru?: string }[] = [
    { id: 'text', label_kk: '📝 Мәтін', label_ru: '📝 Текст' },
    { id: 'voice-loop', label_kk: '🎙️ Дауыс (цикл)', label_ru: '🎙️ Голос (цикл)' },
    { id: 'live', label_kk: '📡 Live', label_ru: '📡 Live' },
  ];
  return (
    <div>
      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-0.5">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
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
