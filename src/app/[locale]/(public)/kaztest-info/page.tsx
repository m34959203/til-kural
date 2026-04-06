import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default async function KaztestInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {locale === 'kk' ? 'ҚАЗТЕСТ туралы' : 'О КАЗТЕСТ'}
      </h1>

      <Card className="mb-6">
        <div className="text-sm text-gray-700 space-y-4 leading-relaxed">
          {locale === 'kk' ? (
            <>
              <p>ҚАЗТЕСТ — қазақ тілін білу деңгейін анықтауға арналған стандартталған тестілеу жүйесі.</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-6">Деңгейлер:</h3>
              <ul className="space-y-2">
                <li><strong>A1 (Бастаушы)</strong> — негізгі сөздер мен сөз тіркестерін түсіну</li>
                <li><strong>A2 (Базалық)</strong> — күнделікті жағдайларда қарапайым сөйлесу</li>
                <li><strong>B1 (Орта)</strong> — жұмыста, оқуда, саяхатта қолдану</li>
                <li><strong>B2 (Орта+)</strong> — күрделі мәтіндерді түсіну, пікір білдіру</li>
                <li><strong>C1 (Жоғары)</strong> — еркін сөйлесу, іскерлік қарым-қатынас</li>
                <li><strong>C2 (Шебер)</strong> — ана тілі деңгейінде меңгеру</li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-900 mt-6">Тест құрылымы:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Тыңдау (аудирование)</li>
                <li>Оқу (чтение)</li>
                <li>Жазу (письмо)</li>
                <li>Сөйлеу (говорение)</li>
                <li>Лексика-грамматика</li>
              </ul>
            </>
          ) : (
            <>
              <p>КАЗТЕСТ — стандартизированная система тестирования для определения уровня владения казахским языком.</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-6">Уровни:</h3>
              <ul className="space-y-2">
                <li><strong>A1 (Начальный)</strong> — понимание основных слов и выражений</li>
                <li><strong>A2 (Базовый)</strong> — простое общение в повседневных ситуациях</li>
                <li><strong>B1 (Средний)</strong> — использование на работе, учёбе, в поездках</li>
                <li><strong>B2 (Выше среднего)</strong> — понимание сложных текстов, выражение мнения</li>
                <li><strong>C1 (Продвинутый)</strong> — свободное общение, деловые отношения</li>
                <li><strong>C2 (Мастер)</strong> — владение на уровне носителя</li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-900 mt-6">Структура теста:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Аудирование</li>
                <li>Чтение</li>
                <li>Письмо</li>
                <li>Говорение</li>
                <li>Лексика-грамматика</li>
              </ul>
            </>
          )}
        </div>
      </Card>

      <div className="text-center">
        <Link href={`/${locale}/test/kaztest`}>
          <Button size="lg">{locale === 'kk' ? 'ҚАЗТЕСТ дайындығына өту' : 'Перейти к подготовке КАЗТЕСТ'}</Button>
        </Link>
      </div>
    </div>
  );
}
