import Card from '@/components/ui/Card';
import { db } from '@/lib/db';

interface RulesDoc {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk?: string | null;
  description_ru?: string | null;
  year?: string | null;
  pdf_url?: string | null;
  category?: string | null;
  sort_order?: number;
}

const CATEGORY_ORDER = ['laws', 'methodical', 'internal', 'other'];

const CATEGORY_LABELS: Record<string, { kk: string; ru: string }> = {
  laws: { kk: 'ҚР тіл туралы заңнамасы', ru: 'Законы РК о языке' },
  methodical: { kk: 'Әдістемелік құжаттар', ru: 'Методические документы' },
  internal: { kk: 'Ішкі ережелер', ru: 'Внутренние положения' },
  other: { kk: 'Басқа құжаттар', ru: 'Прочие документы' },
};

export default async function RulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  const rowsRaw = await db
    .query('rules_documents', undefined, { orderBy: 'sort_order', order: 'asc' })
    .catch(() => []);
  const docs = rowsRaw as RulesDoc[];

  const grouped = new Map<string, RulesDoc[]>();
  for (const d of docs) {
    const cat = d.category || 'other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(d);
  }

  const categories = [
    ...CATEGORY_ORDER.filter((c) => grouped.has(c)),
    ...[...grouped.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {isKk ? 'Нормативтік құжаттар' : 'Нормативные документы'}
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          {isKk
            ? 'ҚР заңнамасы, әдістемелік нұсқаулар мен орталықтың ішкі ережелері. PDF нұсқаларын жүктеуге болады.'
            : 'Законодательство РК о языке, методические материалы и внутренние положения центра. Документы доступны для скачивания в PDF.'}
        </p>
      </div>

      {docs.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-3">📜</div>
          <div className="text-gray-600 font-medium">
            {isKk ? 'Құжаттар әлі қосылмаған.' : 'Документы ещё не добавлены.'}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {isKk
              ? 'Оларды CMS / әкімші панелі арқылы қосуға болады.'
              : 'Их можно добавить через админ-панель CMS.'}
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {categories.map((cat) => {
            const list = grouped.get(cat) || [];
            const label = CATEGORY_LABELS[cat] || { kk: cat, ru: cat };
            return (
              <section key={cat}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-600" />
                  {isKk ? label.kk : label.ru}
                  <span className="text-sm text-gray-400 font-normal">({list.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {list.map((d) => (
                    <Card key={d.id} hover className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 leading-snug">
                            {isKk ? d.title_kk : d.title_ru}
                          </h3>
                          {d.year && (
                            <p className="text-xs text-gray-500 mt-1">{d.year}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-2xl" aria-hidden>
                          📄
                        </div>
                      </div>
                      {(isKk ? d.description_kk : d.description_ru) && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {isKk ? d.description_kk : d.description_ru}
                        </p>
                      )}
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        {d.pdf_url ? (
                          <a
                            href={d.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
                          >
                            <span aria-hidden>⬇</span>
                            {isKk ? 'PDF жүктеу' : 'Скачать PDF'}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {isKk ? 'Файл әлі жүктелмеген' : 'Файл ещё не загружен'}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
