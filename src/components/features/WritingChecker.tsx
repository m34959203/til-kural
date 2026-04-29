'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface WritingCheckerProps {
  locale: string;
}

interface Correction {
  original: string;
  corrected: string;
  rule: string;
  rule_id?: string | null;
  explanation: string;
}

interface CheckResult {
  score: number;
  corrections: Correction[];
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface WritingHistoryItem {
  id: string;
  score: number;
  created_at: string;
  preview: string;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const GENRES: Array<{ id: string; label_kk: string; label_ru: string; template_kk?: string; template_ru?: string }> = [
  { id: 'free', label_kk: 'Еркін', label_ru: 'Свободный' },
  {
    id: 'letter',
    label_kk: 'Жеке хат',
    label_ru: 'Личное письмо',
    template_ru: `Қымбатты [имя]!

Сізге қазақ тілінде жазып отырмын. Сізді сағындым…

[Опишите 3–5 предложений: где вы, что делаете, как дела]

Сізге сау-саламат болуды тілеймін.

Құрметпен,
[Ваше имя]`,
    template_kk: `Қымбатты [есім]!

Жазып отырмын… [3–5 сөйлеммен: қайдасың, не істейсің, қалай тұрасың]

Сізге сау-саламат болуды тілеймін.

Құрметпен,
[Сіздің атыңыз]`,
  },
  {
    id: 'essay',
    label_kk: 'Эссе',
    label_ru: 'Эссе / сочинение',
    template_ru: `Тақырып: [тема эссе]

Кіріспе. [Введение: 2 предложения о теме]

Негізгі бөлім. [Основная часть: 3–5 предложений с аргументами]

Қорытынды. [Заключение: 1–2 предложения с выводом]`,
    template_kk: `Тақырып: [...]

Кіріспе. [...]

Негізгі бөлім. [...]

Қорытынды. [...]`,
  },
  {
    id: 'application',
    label_kk: 'Ресми хат',
    label_ru: 'Заявление / офиц. письмо',
    template_ru: `[Должность], [ФИО]
[Кому: организация]

ӨТІНІШ

Мен, [ФИО], [причина обращения] байланысты сізге арыз беремін.

[Суть просьбы 2–3 предложения]

Сізден [конкретная просьба] өтінемін.

[Дата]
[Подпись]`,
  },
  {
    id: 'sms',
    label_kk: 'SMS / мессенджер',
    label_ru: 'SMS / мессенджер',
    template_ru: `Сәлем! [короткое сообщение, 1–3 предложения]`,
  },
  {
    id: 'congrats',
    label_kk: 'Құттықтау',
    label_ru: 'Поздравление',
    template_ru: `Қымбатты [имя]!

[Повод поздравления] құттықтаймын!

[Пожелания: 2–3 предложения о здоровье, успехе, семье]

Құрметпен,
[Ваше имя]`,
  },
];

const MIN_WORDS = 10;

// Маппинг rule_id → slug-якорь раздела /basics (для глубокой ссылки).
function ruleAnchor(ruleId?: string | null): string | null {
  if (!ruleId || !/^rule_\d+$/.test(ruleId)) return null;
  return `#${ruleId}`;
}

export default function WritingChecker({ locale }: WritingCheckerProps) {
  const isKk = locale === 'kk';
  const apiLocale: 'kk' | 'ru' = isKk ? 'kk' : 'ru';
  const { user } = useCurrentUser();

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const [level, setLevel] = useState<string>(() => user?.language_level || 'A2');
  const [genre, setGenre] = useState<string>('free');
  const [history, setHistory] = useState<WritingHistoryItem[]>([]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const currentGenre = useMemo(() => GENRES.find((g) => g.id === genre), [genre]);

  // Загружаем историю проверок (только для авторизованных).
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    fetch('/api/learn/writing-history?limit=10', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.items)) setHistory(data.items);
      })
      .catch(() => { /* not a UX blocker */ });
  }, [user, result?.score]);

  const insertTemplate = () => {
    if (!currentGenre) return;
    const tpl = isKk ? (currentGenre.template_kk || currentGenre.template_ru) : currentGenre.template_ru;
    if (tpl) setText(tpl);
  };

  const handleCheck = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const res = await fetch('/api/learn/check-writing', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: text.trim(),
          level,
          locale: apiLocale,
          genre,
        }),
      });
      const data = await res.json();
      setResult(data.result || {
        score: 75,
        corrections: [],
        feedback: data.reply || (isKk ? 'Тексеру аяқталды' : 'Проверка завершена'),
        strengths: [],
        improvements: [],
      });
    } catch {
      setResult({
        score: 0,
        corrections: [],
        feedback: isKk ? 'Тексеру кезінде қате пайда болды' : 'Ошибка при проверке',
        strengths: [],
        improvements: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Подсветка оригинального текста: каждое слово/фраза, которое попало в
  // corrections.original, оборачиваем в <mark> с тултипом-объяснением.
  const renderHighlightedText = () => {
    if (!result || result.corrections.length === 0) {
      return <span className="text-gray-700 whitespace-pre-line">{text}</span>;
    }
    // Сортируем по убыванию длины — длинные совпадения находим первыми,
    // чтобы не разрезать их вложенными короткими.
    const corrections = [...result.corrections].sort((a, b) => b.original.length - a.original.length);
    let segments: Array<{ kind: 'plain' | 'mark'; text: string; correction?: Correction }> = [
      { kind: 'plain', text },
    ];
    for (const c of corrections) {
      if (!c.original) continue;
      const next: typeof segments = [];
      for (const seg of segments) {
        if (seg.kind === 'mark') {
          next.push(seg);
          continue;
        }
        const idx = seg.text.indexOf(c.original);
        if (idx === -1) {
          next.push(seg);
        } else {
          if (idx > 0) next.push({ kind: 'plain', text: seg.text.slice(0, idx) });
          next.push({ kind: 'mark', text: c.original, correction: c });
          const rest = seg.text.slice(idx + c.original.length);
          if (rest) next.push({ kind: 'plain', text: rest });
        }
      }
      segments = next;
    }
    return (
      <span className="whitespace-pre-line text-gray-700">
        {segments.map((seg, i) =>
          seg.kind === 'plain' ? (
            <span key={i}>{seg.text}</span>
          ) : (
            <mark
              key={i}
              className="bg-amber-100 text-amber-900 rounded px-0.5 cursor-help"
              title={seg.correction ? `${seg.correction.rule}: ${seg.correction.corrected}` : undefined}
            >
              {seg.text}
            </mark>
          ),
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isKk ? 'Жазба тексеру' : 'Проверка письма'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isKk
            ? 'Мәтініңізді қазақ тілінде жазыңыз, AI грамматика мен стильді тексереді'
            : 'Напишите текст на казахском языке, AI проверит грамматику и стиль'}
        </p>
      </div>

      {/* Селекторы — уровень цели + жанр + кнопка шаблона */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-gray-700">{isKk ? 'Деңгей:' : 'Уровень:'}</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          >
            {CEFR_LEVELS.map((lv) => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-gray-700">{isKk ? 'Жанр:' : 'Жанр:'}</span>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          >
            {GENRES.map((g) => (
              <option key={g.id} value={g.id}>{isKk ? g.label_kk : g.label_ru}</option>
            ))}
          </select>
        </label>

        {currentGenre && (currentGenre.template_ru || currentGenre.template_kk) && (
          <button
            type="button"
            onClick={insertTemplate}
            disabled={loading}
            className="text-xs text-teal-700 hover:text-teal-900 underline disabled:opacity-50"
            title={isKk ? 'Жанр үлгісін енгізу' : 'Вставить шаблон жанра'}
          >
            {isKk ? '+ Үлгі' : '+ Шаблон'}
          </button>
        )}
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isKk ? 'Мәтініңізді мұнда жазыңыз...' : 'Напишите текст здесь...'}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-h-[200px] resize-y"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div className="text-xs">
            <span className={wordCount < MIN_WORDS ? 'text-amber-600' : 'text-gray-400'}>
              {wordCount} {isKk ? 'сөз' : 'слов'}
              {wordCount < MIN_WORDS && (
                <>
                  {' · '}
                  {isKk
                    ? `толық талдау үшін кемінде ${MIN_WORDS}`
                    : `минимум ${MIN_WORDS} для развёрнутого анализа`}
                </>
              )}
            </span>
          </div>
          <Button onClick={handleCheck} loading={loading} disabled={loading || wordCount === 0}>
            {loading
              ? (isKk ? 'AI тексеріп жатыр…' : 'AI проверяет текст…')
              : (isKk ? 'Тексеру' : 'Проверить')}
          </Button>
        </div>
        {loading && (
          <p className="text-xs text-gray-500 mt-2">
            {isKk
              ? 'Бұл 10–20 секунд алуы мүмкін. Мәтін ұзағырақ болса — сәл ұзағырақ.'
              : 'Это может занять 10–20 секунд. На длинном тексте — чуть дольше.'}
          </p>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {isKk ? 'Жалпы баға' : 'Общая оценка'}
              </h3>
              <span className="text-2xl font-bold text-teal-700">{result.score}/100</span>
            </div>
            <Progress value={result.score} color={result.score >= 80 ? 'green' : result.score >= 50 ? 'amber' : 'red'} />
          </Card>

          {/* Подсветка ошибок прямо в исходнике */}
          {result.corrections.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                {isKk ? 'Сіздің мәтіннің бойынша қателер' : 'Ошибки в вашем тексте'}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {isKk
                  ? 'Қате орны сары түспен белгіленген. Үстінен апарып, ұсынылған нұсқаны көріңіз.'
                  : 'Места ошибок подсвечены жёлтым. Наведите курсор, чтобы увидеть рекомендованный вариант.'}
              </p>
              <div className="text-sm leading-relaxed bg-white border border-gray-200 rounded-lg p-3">
                {renderHighlightedText()}
              </div>
            </Card>
          )}

          {/* Corrections — детальный разбор */}
          {result.corrections.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">
                {isKk ? 'Түзетулер' : 'Исправления'} ({result.corrections.length})
              </h3>
              <div className="space-y-3">
                {result.corrections.map((c, idx) => {
                  const anchor = ruleAnchor(c.rule_id);
                  return (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start gap-2 mb-1 flex-wrap">
                        <span className="line-through text-red-600 text-sm break-words">{c.original}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-600 font-medium text-sm break-words">{c.corrected}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">{c.rule}:</span> {c.explanation}
                      </p>
                      {anchor && (
                        <Link
                          href={`/${locale}/learn/basics${anchor}`}
                          className="inline-block mt-1 text-xs text-teal-700 hover:text-teal-900"
                        >
                          {isKk ? '→ Толық ереже' : '→ Подробнее об этом правиле'}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Feedback */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">
              {isKk ? 'Пікір' : 'Отзыв'}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{result.feedback}</p>

            {result.strengths.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-green-700 mb-1">
                  {isKk ? 'Күшті жақтар:' : 'Сильные стороны:'}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {result.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.improvements.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-amber-700 mb-1">
                  {isKk ? 'Жақсарту керек:' : 'Нужно улучшить:'}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {result.improvements.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">!</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* История проверок */}
      {user && history.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">
            {isKk ? 'Соңғы тексерулер' : 'Последние проверки'}
          </h3>
          <ul className="divide-y divide-gray-100 text-sm">
            {history.map((h) => (
              <li key={h.id} className="py-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-700 truncate">{h.preview}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(h.created_at).toLocaleString(isKk ? 'kk-KZ' : 'ru-RU')}
                  </p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${h.score >= 80 ? 'text-green-700' : h.score >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                  {Math.round(h.score)}/100
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
