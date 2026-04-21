import Card from '@/components/ui/Card';
import { GOV_LANGUAGE_LINKS } from '@/lib/external-links';

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  const resources = [
    ...GOV_LANGUAGE_LINKS.map((l) => ({
      title: isKk ? l.label_kk : l.label_ru,
      url: l.href,
      desc: (isKk ? l.description_kk : l.description_ru) || '',
    })),
    { title: 'Sozdik.kz', url: 'https://sozdik.kz', desc: isKk ? 'Онлайн сөздік' : 'Онлайн словарь' },
    { title: 'Qazcorpus.kz', url: 'https://qazcorpus.kz', desc: isKk ? 'Қазақ тілінің ұлттық корпусы' : 'Национальный корпус казахского языка' },
    { title: isKk ? 'Ақорда' : 'Акорда', url: 'https://www.akorda.kz', desc: isKk ? 'ҚР Президентінің ресми сайты' : 'Официальный сайт Президента РК' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Білім ресурстары' : 'Образовательные ресурсы'}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Пайдалы сілтемелер мен платформалар' : 'Полезные ссылки и платформы'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">
            <Card hover className="h-full">
              <h3 className="font-semibold text-teal-700 mb-1">{r.title}</h3>
              <p className="text-sm text-gray-500">{r.desc}</p>
              <p className="text-xs text-gray-400 mt-2">{r.url}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
