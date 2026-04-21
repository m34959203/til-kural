import Card from '@/components/ui/Card';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { HISTORY_TABLE, sortBlocks, HistoryBlock } from '@/lib/history-blocks';

interface Department {
  id: string;
  name_kk: string;
  name_ru: string;
  description_kk?: string | null;
  description_ru?: string | null;
  sort_order?: number;
}

interface Staff {
  id: string;
  name_kk: string;
  name_ru: string;
  position_kk?: string | null;
  position_ru?: string | null;
  department_id?: string | null;
  photo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  bio_kk?: string | null;
  bio_ru?: string | null;
  sort_order?: number;
}

const GOSZAKUP_URL = 'https://goszakup.gov.kz/ru/registry/show_supplier/745311';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  const [departmentsRaw, staffRaw, historyRaw, settings] = await Promise.all([
    db.query('departments', undefined, { orderBy: 'sort_order', order: 'asc' }).catch(() => []),
    db.query('staff', undefined, { orderBy: 'sort_order', order: 'asc' }).catch(() => []),
    db.query(HISTORY_TABLE, undefined, { orderBy: 'sort_order', order: 'asc' }).catch(() => []),
    getSettings(),
  ]);

  const departments = departmentsRaw as Department[];
  const staff = staffRaw as Staff[];
  const history = sortBlocks(historyRaw as HistoryBlock[]);

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: isKk
      ? settings.org_full_name_kk || settings.org_short_name || 'УМЦ «Тіл-құрал»'
      : settings.org_full_name_ru || settings.org_short_name || 'УМЦ «Тіл-құрал»',
    legalName: settings.org_full_name_ru,
    alternateName: settings.org_short_name,
    taxID: settings.org_bin,
    foundingDate: settings.org_registered_at,
    telephone: settings.contact_phone,
    email: settings.contact_email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: isKk ? settings.contact_address_kk : settings.contact_address_ru,
      addressLocality: isKk ? 'Сәтбаев' : 'Сатпаев',
      addressRegion: isKk ? 'Ұлытау обл.' : 'Ұлытауская обл.',
      addressCountry: 'KZ',
    },
    sameAs: [GOSZAKUP_URL],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white mb-10">
        <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-teal-100/80 mb-4">
            <span className="h-px w-8 bg-teal-200/70" />
            {isKk ? 'Біз туралы' : 'О нас'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight max-w-3xl">
            {isKk
              ? 'Сәтбаев қаласының тіл дамыту орталығы'
              : 'Центр развития языков города Сатпаев'}
          </h1>
          <p className="mt-5 text-teal-50/90 max-w-3xl text-base sm:text-lg leading-relaxed">
            {isKk ? settings.org_full_name_kk : settings.org_full_name_ru}
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -left-10 -top-10 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
      </section>

      {/* История центра (CMS) */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isKk ? 'Орталық тарихы' : 'История центра'}
          </h2>
          {history.length > 0 && (
            <p className="text-sm text-gray-500">
              {isKk ? `Кезеңдер: ${history.length}` : `Этапов: ${history.length}`}
            </p>
          )}
        </div>
        {history.length === 0 ? (
          <Card>
            <p className="text-gray-600 italic">
              {isKk
                ? 'Орталықтың тарихы толықтырылуда. Бұл блокты редакторлар CMS арқылы толтырады.'
                : 'История центра наполняется. Этот блок редакторы смогут заполнить через CMS.'}
            </p>
          </Card>
        ) : (
          <ol className="relative border-l-2 border-teal-200 ml-3 space-y-6">
            {history.map((h) => {
              const title = isKk ? h.title_kk : h.title_ru;
              const description = isKk ? h.description_kk : h.description_ru;
              return (
                <li key={h.id} className="pl-6 relative">
                  <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-teal-600 border-4 border-white shadow" />
                  <Card hover className="flex flex-col sm:flex-row gap-4">
                    {h.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={h.image_url}
                        alt={title}
                        className="w-full sm:w-40 h-40 sm:h-28 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {h.year && (
                        <div className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-1">
                          {h.year}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {title}
                      </h3>
                      {description && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                          {description}
                        </p>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Миссия / возможности */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Card>
          <p className="text-3xl font-bold text-teal-700">2024</p>
          <p className="text-sm text-gray-500">{isKk ? 'Құрылған жылы' : 'Год основания'}</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-teal-700">KAZTEST</p>
          <p className="text-sm text-gray-500">{isKk ? 'Дайындық бағыты' : 'Подготовка к экзамену'}</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-teal-700">AI</p>
          <p className="text-sm text-gray-500">{isKk ? 'Заманауи әдістеме' : 'Современная методика'}</p>
        </Card>
      </section>

      {/* Отделы */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isKk ? 'Бөлімдер' : 'Отделы'}
          </h2>
          <p className="text-sm text-gray-500">
            {isKk ? `Барлығы: ${departments.length}` : `Всего: ${departments.length}`}
          </p>
        </div>
        {departments.length === 0 ? (
          <Card className="text-center text-gray-400">
            {isKk ? 'Бөлімдер қосылмаған.' : 'Отделы пока не добавлены.'}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d) => (
              <Card key={d.id} hover>
                <div className="flex items-start gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl">
                    🏢
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">
                      {isKk ? d.name_kk : d.name_ru}
                    </h3>
                  </div>
                </div>
                {(isKk ? d.description_kk : d.description_ru) && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {isKk ? d.description_kk : d.description_ru}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Сотрудники */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isKk ? 'Қызметкерлер' : 'Сотрудники'}
          </h2>
          <p className="text-sm text-gray-500">
            {isKk ? `Барлығы: ${staff.length}` : `Всего: ${staff.length}`}
          </p>
        </div>
        {staff.length === 0 ? (
          <Card className="text-center text-gray-400">
            {isKk ? 'Қызметкерлер қосылмаған.' : 'Сотрудники пока не добавлены.'}
          </Card>
        ) : (
          <div className="space-y-8">
            {departments.map((d) => {
              const people = staff.filter((s) => s.department_id === d.id);
              if (people.length === 0) return null;
              return (
                <div key={d.id}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {isKk ? d.name_kk : d.name_ru}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {people.map((s) => (
                      <StaffCard key={s.id} s={s} isKk={isKk} />
                    ))}
                  </div>
                </div>
              );
            })}
            {(() => {
              const orphan = staff.filter(
                (s) => !s.department_id || !departments.find((d) => d.id === s.department_id),
              );
              if (orphan.length === 0) return null;
              return (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {isKk ? 'Басқалар' : 'Прочие'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orphan.map((s) => (
                      <StaffCard key={s.id} s={s} isKk={isKk} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* Реквизиты */}
      <section className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          {isKk ? 'Реквизиттер' : 'Реквизиты'}
        </h2>
        <Card>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <Row
              label={isKk ? 'Толық атауы' : 'Полное наименование'}
              value={isKk ? settings.org_full_name_kk : settings.org_full_name_ru}
            />
            <Row
              label={isKk ? 'Қысқаша атауы' : 'Краткое наименование'}
              value={settings.org_short_name}
            />
            <Row label="БИН / БСН" value={settings.org_bin} />
            <Row
              label={isKk ? 'Директор' : 'Руководитель'}
              value={settings.org_director}
            />
            <Row
              label={isKk ? 'Тіркелген күні' : 'Дата регистрации'}
              value={settings.org_registered_at}
            />
            <Row
              label={isKk ? 'Мекенжай' : 'Адрес'}
              value={isKk ? settings.contact_address_kk : settings.contact_address_ru}
            />
            <Row label={isKk ? 'Телефон' : 'Телефон'} value={settings.contact_phone} />
            <Row label="Email" value={settings.contact_email} />
          </dl>
          <div className="mt-5 pt-4 border-t border-gray-100 text-sm">
            <a
              href={GOSZAKUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 font-medium"
            >
              {isKk
                ? 'goszakup.gov.kz тізімінде тексеру'
                : 'Проверить в реестре goszakup.gov.kz'}
              <span aria-hidden>↗</span>
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium mt-0.5 break-words">{value || '—'}</dd>
    </div>
  );
}

function StaffCard({ s, isKk }: { s: Staff; isKk: boolean }) {
  const name = isKk ? s.name_kk : s.name_ru;
  const position = isKk ? s.position_kk : s.position_ru;
  return (
    <Card hover className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {s.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.photo_url}
            alt={name}
            className="h-14 w-14 rounded-full object-cover bg-gray-100"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-lg font-semibold">
            {name?.trim().charAt(0) || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 leading-tight">{name}</div>
          {position && <div className="text-xs text-teal-700 mt-0.5">{position}</div>}
        </div>
      </div>
      {(s.email || s.phone) && (
        <div className="text-xs text-gray-500 space-y-0.5 pt-2 border-t border-gray-100">
          {s.email && (
            <div>
              <a href={`mailto:${s.email}`} className="hover:text-teal-700 break-all">
                {s.email}
              </a>
            </div>
          )}
          {s.phone && (
            <div>
              <a href={`tel:${s.phone}`} className="hover:text-teal-700">
                {s.phone}
              </a>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
