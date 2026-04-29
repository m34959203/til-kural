'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MarkdownMini from '@/components/ui/MarkdownMini';
import MentorAvatar from './MentorAvatar';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITeacherProps {
  locale: string;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const GREETINGS: Record<string, { kk: string; ru: string }> = {
  abai: {
    kk: 'Сәлеметсіз бе! Мен Абай Құнанбайұлы. "Адам бол!" — деп айтқаным бар. Қазақ тілін үйренуге дайынсыз ба? Сұрақ қойыңыз!',
    ru: 'Здравствуйте! Я — Абай Кунанбаев, ваш AI-наставник. Готов помочь вам шаг за шагом учить казахский. Задайте вопрос или выберите тему ниже.',
  },
  baitursynuly: {
    kk: 'Сәлеметсіз бе! Мен Ахмет Байтұрсынұлы. "Тіл — ұлттың жаны" деген сөзім бар. Тіл ережелерін бірге үйренейік!',
    ru: 'Здравствуйте! Я — Ахмет Байтурсынулы. «Язык — душа народа». Будем разбирать правила казахского языка вместе. С чего начнём?',
  },
  auezov: {
    kk: 'Сәлеметсіз бе! Мен Мұхтар Әуезов. Қазақ тілінің сұлулығын бірге ашайық! Қандай тақырыпты талқылағыңыз келеді?',
    ru: 'Здравствуйте! Я — Мухтар Ауэзов. Откроем красоту казахского языка вместе. Какую тему хотите обсудить?',
  },
};

const QUICK_PROMPTS: Record<'kk' | 'ru', Array<{ icon: string; label: string; prompt: string }>> = {
  ru: [
    { icon: '🇰🇿', label: 'Алфавит и звуки', prompt: 'Расскажи на русском про казахский алфавит — особенно про 9 специфических звуков (ә, і, ң, ғ, ү, ұ, қ, ө, һ). Дай транскрипцию.' },
    { icon: '👋', label: 'Базовые приветствия', prompt: 'Научи меня здороваться по-казахски. Дай 5 базовых фраз с переводом и транскрипцией.' },
    { icon: '🙋', label: 'Как представиться', prompt: 'Объясни на русском, как представиться по-казахски: имя, возраст, откуда. Дай шаблон с примером.' },
    { icon: '🔢', label: 'Числа 1–10', prompt: 'Числа от 1 до 10 на казахском с произношением и переводом.' },
    { icon: '🛒', label: 'Слова в магазине', prompt: 'Дай 10 базовых слов и фраз для покупок в магазине на казахском.' },
    { icon: '✏️', label: 'Проверь моё письмо', prompt: 'Я хочу отправить тебе текст на казахском, чтобы ты проверил его на ошибки. Объясни, как лучше всего сформулировать просьбу.' },
  ],
  kk: [
    { icon: '🇰🇿', label: 'Әліпби', prompt: 'Қазақ тіліндегі 9 ерекше дыбыс туралы қысқаша түсіндіріп берші.' },
    { icon: '👋', label: 'Сәлемдесу', prompt: '5 базалық сәлемдесу сөз тіркесін мысалмен берші.' },
    { icon: '🙋', label: 'Танысу', prompt: 'Қалай дұрыс танысуға болады? Мысалмен үлгі берші.' },
    { icon: '🔢', label: '1–10 сандар', prompt: '1-ден 10-ға дейінгі сандарды дыбысталуымен жаз.' },
    { icon: '🛒', label: 'Дүкенде', prompt: 'Дүкенде қажетті 10 сөз бен сөз тіркесін берші.' },
    { icon: '✏️', label: 'Жазуымды тексер', prompt: 'Қазақша мәтінімді тексеруіңді өтінемін. Қалай дұрыс сұрауға болады?' },
  ],
};

export default function AITeacher({ locale }: AITeacherProps) {
  const isKk = locale === 'kk';
  const apiLocale: 'kk' | 'ru' = isKk ? 'kk' : 'ru';
  const { user } = useCurrentUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Mentor selector
  const [mentor, setMentor] = useState<string>('abai');
  const [mentorTouched, setMentorTouched] = useState(false);

  // Level selector. Если не сдан тест — A1 (см. P0-2 audit). Раньше был жёсткий B1.
  const [level, setLevel] = useState<string>(() => user?.language_level || 'A1');
  const [levelTouched, setLevelTouched] = useState(false);
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);

  const [confirmSwitchTo, setConfirmSwitchTo] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mentorTouched && user?.mentor_avatar) setMentor(user.mentor_avatar);
  }, [user?.mentor_avatar, mentorTouched]);

  useEffect(() => {
    if (!levelTouched && user?.language_level) setLevel(user.language_level);
  }, [user?.language_level, levelTouched]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  // Стартовое приветствие — берём билингвальное и показываем по локали интерфейса.
  // Меняется при первом маунте + при смене ментора, если история была сброшена.
  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETINGS[mentor]?.[apiLocale] ?? GREETINGS.abai[apiLocale] }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMentor = (m: string, keepHistory: boolean) => {
    setMentor(m);
    setMentorTouched(true);
    if (!keepHistory) {
      setMessages([{ role: 'assistant', content: GREETINGS[m]?.[apiLocale] ?? GREETINGS.abai[apiLocale] }]);
    } else {
      // Префиксуем «приходом» нового наставника как ассистент-сообщение.
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: GREETINGS[m]?.[apiLocale] ?? GREETINGS.abai[apiLocale],
        },
      ]);
    }
  };

  const handleMentorClick = (m: string) => {
    if (m === mentor) return;
    // Если в чате только приветствие или ничего — спокойно меняем без вопроса.
    if (messages.length <= 1) {
      switchMentor(m, false);
      return;
    }
    setConfirmSwitchTo(m);
  };

  const clearHistory = () => {
    setMessages([{ role: 'assistant', content: GREETINGS[mentor]?.[apiLocale] ?? GREETINGS.abai[apiLocale] }]);
  };

  const send = async (textOverride?: string) => {
    const userMessage = (textOverride ?? input).trim();
    if (!userMessage || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

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
          message: userMessage,
          history: messages,
          mentor,
          level,
          locale: apiLocale,
        }),
      });
      const data = await res.json();
      const reply: string = data.reply || data.error || (isKk ? 'Қате пайда болды' : 'Произошла ошибка');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: isKk ? 'Серверге қосылу мүмкін болмады.' : 'Не удалось связаться с сервером.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
      {/* Mentor selector + level + clear */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm font-medium text-gray-700">{isKk ? 'Тәлімгер:' : 'Наставник:'}</span>
        {['abai', 'baitursynuly', 'auezov'].map((m) => (
          <button
            key={m}
            onClick={() => handleMentorClick(m)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              mentor === m ? 'bg-teal-100 text-teal-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MentorAvatar mentor={m} size="sm" />
            <span className="hidden sm:inline">{m === 'abai' ? 'Абай' : m === 'baitursynuly' ? 'Байтұрсынұлы' : 'Әуезов'}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => setLevelMenuOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 text-xs font-medium hover:bg-teal-100"
            title={isKk ? 'Деңгейді ауыстыру' : 'Сменить уровень'}
          >
            {isKk ? 'Деңгей:' : 'Уровень:'} {levelTouched || user?.language_level ? level : (isKk ? 'анықталмаған' : 'не определён')}
            <span aria-hidden>▾</span>
          </button>
          {levelMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
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
          {messages.length > 1 && (
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-red-600 underline"
              title={isKk ? 'Тарихты тазалау' : 'Очистить историю'}
            >
              {isKk ? 'Тазалау' : 'Очистить'}
            </button>
          )}
        </div>
      </div>

      {/* Confirm dialog при смене наставника */}
      {confirmSwitchTo && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 flex items-center gap-3 flex-wrap">
          <span>
            {isKk
              ? 'Тәлімгерді ауыстырғыңыз келеді ме? Әңгіме тарихын сақтап қалуға болады.'
              : 'Сменить наставника? Можно сохранить историю диалога.'}
          </span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => { switchMentor(confirmSwitchTo, true); setConfirmSwitchTo(null); }}
              className="px-3 py-1 rounded bg-teal-600 text-white text-xs"
            >
              {isKk ? 'Тарихты сақтап ауысу' : 'Сменить, сохранить историю'}
            </button>
            <button
              onClick={() => { switchMentor(confirmSwitchTo, false); setConfirmSwitchTo(null); }}
              className="px-3 py-1 rounded border border-gray-300 text-xs"
            >
              {isKk ? 'Жаңадан бастау' : 'Начать заново'}
            </button>
            <button
              onClick={() => setConfirmSwitchTo(null)}
              className="px-2 py-1 rounded text-gray-500 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <Card className="flex-1 overflow-y-auto mb-4" padding="sm">
        <div className="space-y-4 p-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && <MentorAvatar mentor={mentor} size="sm" />}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-700 text-white rounded-br-md whitespace-pre-wrap'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownMini className="prose-mini break-words [overflow-wrap:anywhere]">{msg.content}</MarkdownMini>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <MentorAvatar mentor={mentor} size="sm" />
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </Card>

      {/* Quick-prompt chips — показываем пока юзер ничего не написал, чтобы не отвлекать */}
      {messages.length <= 2 && !loading && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {QUICK_PROMPTS[apiLocale].map((q) => (
            <button
              key={q.label}
              onClick={() => send(q.prompt)}
              className="shrink-0 snap-start inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-full bg-white border border-gray-300 hover:border-teal-400 hover:bg-teal-50 text-xs text-gray-700 whitespace-nowrap"
            >
              <span aria-hidden>{q.icon}</span>
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 min-w-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={isKk ? 'Сұрағыңызды жазыңыз...' : 'Напишите ваш вопрос...'}
          className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          disabled={loading}
        />
        <Button onClick={() => send()} loading={loading} size="lg">
          {isKk ? 'Жіберу' : 'Отправить'}
        </Button>
      </div>
    </div>
  );
}
