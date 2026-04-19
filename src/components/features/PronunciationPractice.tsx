'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface PronunciationPracticeProps {
  locale: string;
}

const PRACTICE_WORDS = [
  { word: 'Сәлеметсіз бе!', translation: 'Здравствуйте!' },
  { word: 'Рақмет', translation: 'Спасибо' },
  { word: 'Қалайсыз?', translation: 'Как дела?' },
  { word: 'Жақсы, рақмет', translation: 'Хорошо, спасибо' },
  { word: 'Менің атым...', translation: 'Меня зовут...' },
  { word: 'Қазақстан', translation: 'Казахстан' },
  { word: 'Кітап оқу', translation: 'Читать книгу' },
  { word: 'Мектепке бару', translation: 'Идти в школу' },
  { word: 'Ауа райы қандай?', translation: 'Какая погода?' },
  { word: 'Бүгін жақсы күн', translation: 'Сегодня хороший день' },
  { word: 'Тіл — қарудан да күшті', translation: 'Язык сильнее оружия' },
  { word: 'Білім — бақыт кілті', translation: 'Знание — ключ к счастью' },
];

export default function PronunciationPractice({ locale }: PronunciationPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guide, setGuide] = useState('');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState<'normal' | 'slow' | null>(null);
  const currentWord = PRACTICE_WORDS[currentIndex];

  const playBrowserFallback = (text: string, rate = 0.9) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'kk-KZ';
      u.rate = rate;
      speechSynthesis.speak(u);
    }
  };

  const speak = async (text: string, slow = false) => {
    setLoadingAudio(slow ? 'slow' : 'normal');
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
      } else {
        playBrowserFallback(text, slow ? 0.6 : 0.9);
      }
    } catch {
      playBrowserFallback(text, slow ? 0.6 : 0.9);
    } finally {
      setLoadingAudio(null);
    }
  };

  const getGuide = async () => {
    setLoadingGuide(true);
    try {
      const res = await fetch('/api/learn/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentWord.word, mode: 'guide' }),
      });
      const data = await res.json();
      setGuide(data.guide || '');
    } catch {
      setGuide(locale === 'kk' ? 'Қол жетімді емес' : 'Недоступно');
    } finally {
      setLoadingGuide(false);
    }
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % PRACTICE_WORDS.length);
    setGuide('');
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + PRACTICE_WORDS.length) % PRACTICE_WORDS.length);
    setGuide('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {locale === 'kk' ? 'Айтылым практикасы' : 'Практика произношения'}
        </h2>
        <p className="text-gray-500 text-sm">
          {locale === 'kk'
            ? 'Сөздер мен сөз тіркестерін тыңдап, қайталаңыз'
            : 'Слушайте и повторяйте слова и фразы'}
        </p>
      </div>

      <Card className="text-center py-8">
        <p className="text-xs text-gray-400 mb-2">
          {currentIndex + 1} / {PRACTICE_WORDS.length}
        </p>
        <h3 className="text-3xl font-bold text-teal-800 mb-2">{currentWord.word}</h3>
        <p className="text-gray-500 mb-6">{currentWord.translation}</p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Button variant="outline" size="lg" onClick={() => speak(currentWord.word)} loading={loadingAudio === 'normal'}>
            🔊 {locale === 'kk' ? 'Тыңдау' : 'Слушать'}
          </Button>
          <Button variant="ghost" size="lg" onClick={() => speak(currentWord.word, true)} loading={loadingAudio === 'slow'}>
            🔄 {locale === 'kk' ? 'Баяу' : 'Медленно'}
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={getGuide} loading={loadingGuide}>
          {locale === 'kk' ? '📖 Айтылу нұсқаулығы' : '📖 Руководство по произношению'}
        </Button>

        {guide && (
          <div className="mt-4 bg-teal-50 border border-teal-100 rounded-lg p-4 text-left text-sm text-teal-800 whitespace-pre-wrap">
            {guide}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prev}>
          ← {locale === 'kk' ? 'Алдыңғы' : 'Предыдущий'}
        </Button>
        <Button onClick={next}>
          {locale === 'kk' ? 'Келесі' : 'Следующий'} →
        </Button>
      </div>
    </div>
  );
}
