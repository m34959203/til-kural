'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { GoogleGenAI, Modality } from '@google/genai';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { createPcmBlob, decodeAudioData, decodeBase64 } from '@/lib/audio/pcm';
import { MENTORS, type MentorKey, DEFAULT_MENTOR } from '@/lib/mentors';

interface Props {
  locale: string;
  topic?: string | null;
}

interface TranscriptLine {
  role: 'user' | 'model';
  text: string;
  at: number;
}

// Глобальный тип Web Audio уже покрывает всё нужное.
// Только webkit-фоллбэк для старых Safari:
type AudioCtxCtor = typeof AudioContext;
type WindowWithWebkitAudio = Window & { webkitAudioContext?: AudioCtxCtor };

function getAudioCtxCtor(): AudioCtxCtor {
  const w = window as WindowWithWebkitAudio;
  return window.AudioContext || w.webkitAudioContext!;
}

export default function LiveVoiceDialog({ locale, topic }: Props) {
  const isKk = locale === 'kk';
  const [mentor, setMentor] = useState<MentorKey>(DEFAULT_MENTOR);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [draftUser, setDraftUser] = useState('');
  const [draftAi, setDraftAi] = useState('');

  type LiveSession = Awaited<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>>;
  const sessionRef = useRef<LiveSession | null>(null);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const scriptRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const outSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isSpeakingRef = useRef(false);
  const isGreetedRef = useRef(false);
  const userTextRef = useRef('');
  const aiTextRef = useRef('');
  const closedRef = useRef(false);

  const mentorProfile = MENTORS[mentor];

  const cleanupAudio = useCallback(() => {
    try { scriptRef.current?.disconnect(); } catch {}
    try { sourceNodeRef.current?.disconnect(); } catch {}
    scriptRef.current = null;
    sourceNodeRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    outSourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    outSourcesRef.current.clear();
    try { inputCtxRef.current?.close(); } catch {}
    try { outputCtxRef.current?.close(); } catch {}
    inputCtxRef.current = null;
    outputCtxRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    closedRef.current = true;
    try { sessionRef.current?.close(); } catch {}
    sessionRef.current = null;
    sessionPromiseRef.current = null;
    cleanupAudio();
    setConnected(false);
    setConnecting(false);
    setMicOn(false);
    setSpeaking(false);
    isSpeakingRef.current = false;
  }, [cleanupAudio]);

  useEffect(() => () => disconnect(), [disconnect]);

  const connect = useCallback(async () => {
    if (connecting || connected) return;
    setError(null);
    setConnecting(true);
    closedRef.current = false;
    isGreetedRef.current = false;
    userTextRef.current = '';
    aiTextRef.current = '';
    setTranscript([]);
    setDraftUser('');
    setDraftAi('');

    try {
      // 1. Ephemeral token с привязанным наставником
      const tokenRes = await fetch('/api/ai/live-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentor, level: 'B1', topic }),
      });
      if (!tokenRes.ok) throw new Error(`token HTTP ${tokenRes.status}`);
      const { token, model } = await tokenRes.json();
      if (!token) throw new Error('no token returned');

      // 2. Микрофон
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Audio contexts
      const Ctor = getAudioCtxCtor();
      inputCtxRef.current = new Ctor({ sampleRate: 16000 });
      outputCtxRef.current = new Ctor({ sampleRate: 24000 });

      // 4. Подключение к Live API с ephemeral токеном вместо apiKey.
      //    В @google/genai v1 токен передаётся как apiKey + apiVersion=v1alpha.
      const ai = new GoogleGenAI({ apiKey: token, apiVersion: 'v1alpha' } as { apiKey: string; apiVersion: string });

      const sessionPromise = ai.live.connect({
        model,
        callbacks: {
          onopen: () => {
            if (closedRef.current) return;
            setConnected(true);
            setConnecting(false);
            setMicOn(true);

            // 5. Мик → 16kHz PCM → Live input
            const source = inputCtxRef.current!.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            const processor = inputCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (!isGreetedRef.current) return;
              if (isSpeakingRef.current) return;
              if (!sessionRef.current) return;
              const floats = e.inputBuffer.getChannelData(0);
              const blob = createPcmBlob(floats);
              sessionRef.current.sendRealtimeInput({ media: blob });
            };

            source.connect(processor);
            processor.connect(inputCtxRef.current!.destination);

            // 6. Пнём AI чтобы начал первым. `ai.live.connect` может
            //    запустить WebSocket + вызвать onopen СИНХРОННО внутри
            //    вызова — `const sessionPromise = ai.live.connect(...)` ещё
            //    в TDZ, а `sessionPromiseRef.current` ещё null. Отложим на
            //    микротаск, чтобы внешний const успел инициализироваться.
            const topicLine = topic ? `Тақырыбы: ${topic}. ` : '';
            const greet = `Сәлеметсіз бе! Сіз — ${mentorProfile.name_kk}. ${topicLine}Қазақ тілінде қысқа амандасып, оқушыға бір сұрақ қойыңыз.`;
            queueMicrotask(() => {
              const p = sessionPromiseRef.current;
              if (!p) return;
              p.then((s) => {
                if (closedRef.current) return;
                s.sendClientContent({
                  turns: [{ role: 'user', parts: [{ text: greet }] }],
                  turnComplete: true,
                });
              }).catch(() => {});
            });
          },

          onmessage: async (message) => {
            if (closedRef.current) return;
            const sc = message.serverContent;
            if (!sc) return;

            if (sc.inputTranscription?.text) {
              userTextRef.current += sc.inputTranscription.text;
              setDraftUser(userTextRef.current);
            }
            if (sc.outputTranscription?.text) {
              aiTextRef.current += sc.outputTranscription.text;
              setDraftAi(aiTextRef.current);
            }

            const inlineData = sc.modelTurn?.parts?.[0]?.inlineData;
            if (inlineData?.data) {
              isSpeakingRef.current = true;
              setSpeaking(true);
              const ctx = outputCtxRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decodeBase64(inlineData.data), ctx, 24000, 1);
              const src = ctx.createBufferSource();
              src.buffer = audioBuffer;
              src.connect(ctx.destination);
              src.addEventListener('ended', () => {
                outSourcesRef.current.delete(src);
                if (outSourcesRef.current.size === 0) {
                  isSpeakingRef.current = false;
                  setSpeaking(false);
                }
              });
              src.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              outSourcesRef.current.add(src);
            }

            if (sc.turnComplete) {
              if (!isGreetedRef.current) isGreetedRef.current = true;
              const u = userTextRef.current.trim();
              const a = aiTextRef.current.trim();
              if (u || a) {
                setTranscript((prev) => {
                  const next = [...prev];
                  if (u) next.push({ role: 'user', text: u, at: Date.now() });
                  if (a) next.push({ role: 'model', text: a, at: Date.now() + 1 });
                  return next;
                });
              }
              userTextRef.current = '';
              aiTextRef.current = '';
              setDraftUser('');
              setDraftAi('');
            }
          },

          onerror: (e) => {
            console.error('[live] error', e);
            setError(isKk ? 'Байланыс қатесі' : 'Ошибка соединения');
            disconnect();
          },

          onclose: () => {
            if (!closedRef.current) disconnect();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: mentorProfile.ttsVoice } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });

      sessionPromiseRef.current = sessionPromise;
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('[live] connect failed', err);
      setError(String(err instanceof Error ? err.message : err));
      disconnect();
    }
  }, [connecting, connected, mentor, mentorProfile, topic, isKk, disconnect]);

  const stopAiSpeaking = () => {
    outSourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    outSourcesRef.current.clear();
    isSpeakingRef.current = false;
    setSpeaking(false);
  };

  return (
    <div>
      {/* Mentor picker — меняется только пока не подключены */}
      {!connected && (
        <div className="mb-5">
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
                  disabled={connecting}
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
                      <div className="text-[11px] text-gray-400 truncate">🎙 {m.ttsVoice}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <Card padding="md" className="mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
              <Image src={mentorProfile.image} alt={isKk ? mentorProfile.name_kk : mentorProfile.name_ru} fill className="object-cover" sizes="48px" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">{isKk ? mentorProfile.name_kk : mentorProfile.name_ru}</div>
              <div className="text-xs text-gray-500 truncate">
                {isKk ? mentorProfile.role_kk : mentorProfile.role_ru} · 🎙 {mentorProfile.ttsVoice}
              </div>
              <div className="text-[11px] mt-0.5">
                {connecting && <span className="text-amber-600">⋯ {isKk ? 'Қосылуда…' : 'Подключение…'}</span>}
                {connected && !speaking && <span className="text-green-600">● {isKk ? 'Байланыс орнатылды' : 'На связи'}</span>}
                {speaking && <span className="text-teal-600 animate-pulse">🔊 {isKk ? 'Сөйлеп тұр' : 'Говорит'}</span>}
                {!connected && !connecting && <span className="text-gray-400">{isKk ? 'Ажыратылған' : 'Не подключено'}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {speaking && (
              <Button size="sm" variant="outline" onClick={stopAiSpeaking}>
                ⏸ {isKk ? 'Үзу' : 'Прервать'}
              </Button>
            )}
            {connected ? (
              <Button size="sm" variant="danger" onClick={disconnect}>
                ⏹ {isKk ? 'Аяқтау' : 'Завершить'}
              </Button>
            ) : (
              <Button size="sm" onClick={connect} loading={connecting}>
                🎙 {isKk ? 'Әңгіме бастау' : 'Начать разговор'}
              </Button>
            )}
          </div>
        </div>
        {micOn && connected && (
          <div className="mt-3 text-xs text-gray-500">
            {isKk
              ? 'Микрофон қосулы. Қазақша табиғи сөйлеңіз — AI сізді тыңдайды.'
              : 'Микрофон включён. Говорите по-казахски — AI слушает.'}
          </div>
        )}
        {error && <div className="mt-3 text-sm text-red-600">⚠️ {error}</div>}
      </Card>

      {/* Транскрипт */}
      <Card padding="sm" className="min-h-[300px] max-h-[500px] overflow-y-auto">
        <div className="space-y-3 p-2">
          {transcript.length === 0 && !draftUser && !draftAi && (
            <div className="text-sm text-gray-400 text-center py-12">
              {connected
                ? (isKk ? 'Сөйлей беріңіз — транскрипт осында көрінеді' : 'Говорите — транскрипт появится здесь')
                : (isKk ? 'Разговорға әзір болғанда "Әңгіме бастау" басыңыз' : 'Нажмите «Начать разговор», чтобы перейти к живому диалогу')}
            </div>
          )}
          {transcript.map((line, i) => (
            <div key={i} className={`flex ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                line.role === 'user' ? 'bg-teal-700 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                {line.text}
              </div>
            </div>
          ))}
          {draftUser && (
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm bg-teal-700/60 text-white rounded-br-md italic">
                {draftUser}…
              </div>
            </div>
          )}
          {draftAi && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm bg-gray-100 text-gray-600 rounded-bl-md italic">
                {draftAi}…
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
