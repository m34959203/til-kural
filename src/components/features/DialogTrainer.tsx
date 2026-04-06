'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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

export default function DialogTrainer({ locale }: DialogTrainerProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
          mentor: 'baitursynuly',
          level: 'B1',
          mode: 'dialog',
          topic: topicId,
        }),
      });
      const data = await res.json();
      setMessages([{ role: 'assistant', content: data.reply || 'Диалогты бастайық!' }]);
    } catch {
      setMessages([{ role: 'assistant', content: 'Диалогты бастайық! Сәлеметсіз бе!' }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/learn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages,
          mentor: 'baitursynuly',
          level: 'B1',
          mode: 'dialog',
          topic: selectedTopic,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Жалғастырайық!', correction: data.correction },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Жалғастырыңыз!' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTopic) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {locale === 'kk' ? 'Диалог тақырыбын таңдаңыз' : 'Выберите тему диалога'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {locale === 'kk'
            ? 'AI-мен нақты жағдайларда сөйлесуді жаттықтырыңыз'
            : 'Практикуйте разговор с AI в реальных ситуациях'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIALOG_TOPICS.map((topic) => (
            <Card key={topic.id} hover className="cursor-pointer" padding="md">
              <button onClick={() => startDialog(topic.id)} className="text-left w-full">
                <h3 className="font-medium text-gray-900">
                  {locale === 'kk' ? topic.label_kk : topic.label_ru}
                </h3>
              </button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] max-h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {locale === 'kk' ? 'Диалог жаттықтырғыш' : 'Тренажёр диалогов'}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedTopic(null); setMessages([]); }}>
          {locale === 'kk' ? 'Тақырып ауыстыру' : 'Сменить тему'}
        </Button>
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
        <Button onClick={sendMessage} loading={loading}>
          {locale === 'kk' ? 'Жіберу' : 'Отправить'}
        </Button>
      </div>
    </div>
  );
}
