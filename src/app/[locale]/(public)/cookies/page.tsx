import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: locale === 'kk' ? 'Cookie саясаты' : 'Политика cookies',
    description: locale === 'kk'
      ? 'Тіл-құрал сайтында cookie-лердің қолданылуы.'
      : 'Как Тіл-құрал использует cookies.',
    path: `/${locale}/cookies`,
  });
}

interface CookieRow {
  name: string;
  purpose_kk: string;
  purpose_ru: string;
  lifetime: string;
  type: 'essential' | 'analytics';
}

const COOKIES: CookieRow[] = [
  {
    name: 'tk-token',
    purpose_kk: 'Авторизация сессиясы (JWT)',
    purpose_ru: 'Сессия авторизации (JWT)',
    lifetime: '7 дней',
    type: 'essential',
  },
  {
    name: 'NEXT_LOCALE',
    purpose_kk: 'Интерфейс тілін сақтау (kk/ru)',
    purpose_ru: 'Сохранение языка интерфейса (kk/ru)',
    lifetime: '1 год',
    type: 'essential',
  },
  {
    name: '_ga, _ga_*',
    purpose_kk: 'Google Analytics (тек әкімші ID-ді баптаса)',
    purpose_ru: 'Google Analytics (только если настроен ID)',
    lifetime: '2 года',
    type: 'analytics',
  },
  {
    name: '_ym_*',
    purpose_kk: 'Яндекс.Метрика (тек әкімші ID-ді баптаса)',
    purpose_ru: 'Яндекс.Метрика (только если настроен ID)',
    lifetime: '1 год',
    type: 'analytics',
  },
];

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {isKk ? 'Cookie саясаты' : 'Политика cookies'}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {isKk ? 'Жаңартылды: 2026 сәуір' : 'Обновлено: апрель 2026'}
      </p>

      <section className="space-y-4 text-gray-700 mb-8">
        <p>
          {isKk
            ? 'Cookies — бұл сіздің браузеріңізде сайт сақтайтын шағын файлдар. Олар қажетті функцияларды қамтамасыз ету және ыңғайлылықты жақсарту үшін қолданылады.'
            : 'Cookies — небольшие файлы, которые сайт сохраняет в вашем браузере. Мы используем их для работы необходимых функций и улучшения удобства.'}
        </p>
        <p>
          {isKk
            ? 'Біз cookies-ті жарнамаға немесе тыс жақтарға мәлімет сатуға қолданбаймыз.'
            : 'Мы не используем cookies для рекламы и не продаём данные третьим лицам.'}
        </p>
      </section>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        {isKk ? 'Қандай cookies қолданамыз' : 'Какие cookies мы используем'}
      </h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium text-gray-600">{isKk ? 'Атауы' : 'Название'}</th>
              <th className="px-3 py-2 font-medium text-gray-600">{isKk ? 'Мақсаты' : 'Назначение'}</th>
              <th className="px-3 py-2 font-medium text-gray-600">{isKk ? 'Қолданылу мерзімі' : 'Срок'}</th>
              <th className="px-3 py-2 font-medium text-gray-600">{isKk ? 'Түрі' : 'Тип'}</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((c) => (
              <tr key={c.name} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono text-xs text-gray-800">{c.name}</td>
                <td className="px-3 py-2 text-gray-700">{isKk ? c.purpose_kk : c.purpose_ru}</td>
                <td className="px-3 py-2 text-gray-600">{c.lifetime}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    c.type === 'essential' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.type === 'essential'
                      ? (isKk ? 'міндетті' : 'обязательный')
                      : (isKk ? 'аналитика' : 'аналитика')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        {isKk ? 'Cookies-ті басқару' : 'Управление cookies'}
      </h2>
      <div className="space-y-3 text-gray-700">
        <p>
          {isKk
            ? 'Cookies-ті браузер баптауларында өшіре аласыз (Chrome, Firefox, Safari және т.б. нұсқаулықтарынан қараңыз).'
            : 'Вы можете отключить cookies в настройках браузера (см. документацию Chrome, Firefox, Safari и т.д.).'}
        </p>
        <p>
          {isKk
            ? 'Міндетті cookies-ті өшіру авторизацияны және кейбір функцияларды бұзуы мүмкін.'
            : 'Отключение обязательных cookies может сломать авторизацию и часть функций.'}
        </p>
      </div>
    </div>
  );
}
