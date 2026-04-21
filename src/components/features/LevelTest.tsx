'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import LevelBadge from '@/components/ui/LevelBadge';
import { cn } from '@/lib/utils';
import questionsData from '@/data/test-questions-bank.json';

interface LevelTestProps {
  locale: string;
}

export default function LevelTest({ locale }: LevelTestProps) {
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState('');

  const [downloading, setDownloading] = useState(false);

  const questions = questionsData.filter((q) => q.test_type === 'level').slice(0, 15);

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
        body: JSON.stringify({ userName, level, score }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `til-kural-certificate-${level}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(locale === 'kk' ? 'Сертификатты жүктеу сәтсіз аяқталды' : 'Не удалось скачать сертификат');
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (finished) {
      let correct = 0;
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correct_answer) correct++;
      });
      const pct = Math.round((correct / questions.length) * 100);
      setScore(pct);
      if (pct >= 90) setLevel('C1');
      else if (pct >= 75) setLevel('B2');
      else if (pct >= 60) setLevel('B1');
      else if (pct >= 45) setLevel('A2');
      else setLevel('A1');
    }
  }, [finished, answers, questions]);

  if (!started) {
    return (
      <Card className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {locale === 'kk' ? 'Деңгей анықтау тесті' : 'Тест на определение уровня'}
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {locale === 'kk'
            ? 'Бұл тест сіздің қазақ тілі деңгейіңізді A1-ден C2-ге дейін анықтайды. 15 сұрақ.'
            : 'Этот тест определит ваш уровень казахского языка от A1 до C2. 15 вопросов.'}
        </p>
        <Button size="lg" onClick={() => setStarted(true)}>
          {locale === 'kk' ? 'Тестті бастау' : 'Начать тест'}
        </Button>
      </Card>
    );
  }

  if (finished) {
    return (
      <Card className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {locale === 'kk' ? 'Тест нәтижесі' : 'Результат теста'}
        </h2>
        <div className="mb-4">
          <LevelBadge level={level} size="lg" />
        </div>
        <p className="text-4xl font-bold text-teal-700 mb-2">{score}%</p>
        <p className="text-gray-500 mb-6">
          {locale === 'kk' ? `Сіздің деңгейіңіз: ${level}` : `Ваш уровень: ${level}`}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => { setStarted(false); setFinished(false); setAnswers({}); setCurrentIdx(0); }}>
            {locale === 'kk' ? 'Қайта тапсыру' : 'Пересдать'}
          </Button>
          <Button onClick={handleDownloadCertificate} disabled={downloading}>
            {downloading
              ? locale === 'kk' ? 'Жүктелуде…' : 'Загрузка…'
              : locale === 'kk' ? 'Сертификат алу' : 'Получить сертификат'}
          </Button>
        </div>
      </Card>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {locale === 'kk' ? 'Сұрақ' : 'Вопрос'} {currentIdx + 1}/{questions.length}
        </span>
        <LevelBadge level={q.difficulty} size="sm" />
      </div>
      <Progress value={currentIdx + 1} max={questions.length} color="teal" />

      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'kk' ? q.question_kk : (q.question_ru || q.question_kk)}
        </h3>
        <div className="space-y-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswers({ ...answers, [currentIdx]: opt })}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm',
                answers[currentIdx] === opt
                  ? 'bg-teal-50 border-teal-500 text-teal-800'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
        >
          ← {locale === 'kk' ? 'Алдыңғы' : 'Назад'}
        </Button>
        {currentIdx < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIdx((prev) => prev + 1)}
            disabled={!answers[currentIdx]}
          >
            {locale === 'kk' ? 'Келесі' : 'Далее'} →
          </Button>
        ) : (
          <Button
            onClick={() => setFinished(true)}
            disabled={Object.keys(answers).length < questions.length}
            variant="secondary"
          >
            {locale === 'kk' ? 'Аяқтау' : 'Завершить'}
          </Button>
        )}
      </div>
    </div>
  );
}
