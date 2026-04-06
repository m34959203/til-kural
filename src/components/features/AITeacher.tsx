'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MentorAvatar from './MentorAvatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITeacherProps {
  locale: string;
}

export default function AITeacher({ locale }: AITeacherProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentor, setMentor] = useState('abai');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    const greetings: Record<string, string> = {
      abai: 'Сәлеметсіз бе! Мен Абай Құнанбайұлы. "Адам бол!" — деп айтқаным бар. Қазақ тілін үйренуге дайынсыз ба? Сұрақ қойыңыз!',
      baitursynuly: 'Сәлеметсіз бе! Мен Ахмет Байтұрсынұлы. "Тіл — ұлттың жаны" деген сөзім бар. Тіл ережелерін бірге үйренейік!',
      auezov: 'Сәлеметсіз бе! Мен Мұхтар Әуезов. Қазақ тілінің сұлулығын бірге ашайық! Қандай тақырыпты талқылағыңыз келеді?',
    };
    setMessages([{ role: 'assistant', content: greetings[mentor] || greetings.abai }]);
  }, [mentor]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/learn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          mentor,
          level: 'B1',
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || data.error || 'Қате пайда болды' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Серверге қосылу мүмкін болмады.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
      {/* Mentor selector */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-700">
          {locale === 'kk' ? 'Тәлімгер:' : 'Наставник:'}
        </span>
        {['abai', 'baitursynuly', 'auezov'].map((m) => (
          <button
            key={m}
            onClick={() => setMentor(m)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              mentor === m ? 'bg-teal-100 text-teal-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MentorAvatar mentor={m} size="sm" />
            <span className="hidden sm:inline">
              {m === 'abai' ? 'Абай' : m === 'baitursynuly' ? 'Байтұрсынұлы' : 'Әуезов'}
            </span>
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <Card className="flex-1 overflow-y-auto mb-4" padding="sm">
        <div className="space-y-4 p-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && <MentorAvatar mentor={mentor} size="sm" />}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-teal-700 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.content}
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

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={locale === 'kk' ? 'Сұрағыңызды жазыңыз...' : 'Напишите ваш вопрос...'}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          disabled={loading}
        />
        <Button onClick={handleSend} loading={loading} size="lg">
          {locale === 'kk' ? 'Жіберу' : 'Отправить'}
        </Button>
      </div>
    </div>
  );
}
