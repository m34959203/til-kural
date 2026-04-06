import Card from '@/components/ui/Card';

export default async function RulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'kk' ? 'Нормативтік құжаттар' : 'Нормативные документы'}
      </h1>
      <div className="space-y-4">
        {[
          { title_kk: 'ҚР Тіл саясаты туралы Заңы', title_ru: 'Закон о языковой политике РК', year: '1997' },
          { title_kk: 'Тілдерді дамыту мен қолданудың мемлекеттік бағдарламасы', title_ru: 'Государственная программа развития и функционирования языков', year: '2020-2025' },
          { title_kk: 'Қазақ тілі емлесінің негізгі ережелері', title_ru: 'Основные правила орфографии казахского языка', year: '2023' },
          { title_kk: 'ҚАЗТЕСТ стандарттары', title_ru: 'Стандарты КАЗТЕСТ', year: '2021' },
        ].map((doc, idx) => (
          <Card key={idx} hover>
            <h3 className="font-medium text-gray-900">{locale === 'kk' ? doc.title_kk : doc.title_ru}</h3>
            <p className="text-sm text-gray-500 mt-1">{doc.year}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
