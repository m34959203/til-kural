import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getSettings } from '@/lib/settings';

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const s = await getSettings();
  const address = locale === 'kk' ? s.contact_address_kk : s.contact_address_ru;
  const lat = s.map_lat || '49.8047';
  const lng = s.map_lng || '73.1094';
  const widgetId = s.map_2gis_id;

  const mapSrc = widgetId
    ? `https://widgets.2gis.com/widget?type=firmsonmap&options=${encodeURIComponent(
        JSON.stringify({
          pos: { lat: Number(lat), lon: Number(lng), zoom: 16 },
          opt: { city: 'karaganda' },
          org: widgetId,
        }),
      )}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.01}%2C${Number(lat) - 0.005}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'kk' ? 'Байланыс' : 'Контакты'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'kk' ? 'Байланыс ақпараты' : 'Контактная информация'}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium">{locale === 'kk' ? 'Мекенжай' : 'Адрес'}</p>
                  <p className="text-gray-500">{address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📞</span>
                <div>
                  <p className="font-medium">{locale === 'kk' ? 'Телефон' : 'Телефон'}</p>
                  <a href={`tel:${s.contact_phone}`} className="text-teal-700 hover:underline">{s.contact_phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📧</span>
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${s.contact_email}`} className="text-teal-700 hover:underline">{s.contact_email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🕐</span>
                <div>
                  <p className="font-medium">{locale === 'kk' ? 'Жұмыс уақыты' : 'Время работы'}</p>
                  <p className="text-gray-500">{locale === 'kk' ? 'Дс-Жм: 9:00-18:00' : 'Пн-Пт: 9:00-18:00'}</p>
                </div>
              </div>
              {(s.social_instagram || s.social_facebook || s.social_telegram) && (
                <div className="flex items-center gap-3 pt-2">
                  {s.social_instagram && <a href={s.social_instagram} target="_blank" rel="noopener" className="text-teal-700 hover:underline text-sm">Instagram</a>}
                  {s.social_facebook && <a href={s.social_facebook} target="_blank" rel="noopener" className="text-teal-700 hover:underline text-sm">Facebook</a>}
                  {s.social_telegram && <a href={s.social_telegram} target="_blank" rel="noopener" className="text-teal-700 hover:underline text-sm">Telegram</a>}
                </div>
              )}
            </div>
          </Card>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <iframe
              title={locale === 'kk' ? 'Карта' : 'Карта'}
              src={mapSrc}
              className="w-full h-[360px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'kk' ? 'Хабарлама жіберу' : 'Отправить сообщение'}
          </h2>
          <form className="space-y-4" method="POST" action="/api/contact">
            <Input name="name" required label={locale === 'kk' ? 'Аты-жөні' : 'ФИО'} placeholder={locale === 'kk' ? 'Аты-жөніңізді жазыңыз' : 'Введите ФИО'} />
            <Input name="email" required label="Email" type="email" placeholder="email@example.com" />
            <Input name="subject" label={locale === 'kk' ? 'Тақырып' : 'Тема'} placeholder={locale === 'kk' ? 'Хабарлама тақырыбы' : 'Тема сообщения'} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'kk' ? 'Хабарлама' : 'Сообщение'}
              </label>
              <textarea
                name="message"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[120px] resize-y"
                placeholder={locale === 'kk' ? 'Хабарламаңызды жазыңыз...' : 'Напишите сообщение...'}
              />
            </div>
            <Button type="submit" className="w-full">{locale === 'kk' ? 'Жіберу' : 'Отправить'}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
