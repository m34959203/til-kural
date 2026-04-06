import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'kk' ? 'Байланыс' : 'Контакты'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'kk' ? 'Байланыс ақпараты' : 'Контактная информация'}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium">{locale === 'kk' ? 'Мекенжай' : 'Адрес'}</p>
                  <p className="text-gray-500">{locale === 'kk' ? 'Астана қаласы, Мәңгілік ел к-сі, 1' : 'г. Астана, пр. Мангилик Ел, 1'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📞</span>
                <div>
                  <p className="font-medium">{locale === 'kk' ? 'Телефон' : 'Телефон'}</p>
                  <p className="text-gray-500">+7 (7172) 00-00-00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📧</span>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-500">info@til-kural.kz</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🕐</span>
                <div>
                  <p className="font-medium">{locale === 'kk' ? 'Жұмыс уақыты' : 'Время работы'}</p>
                  <p className="text-gray-500">{locale === 'kk' ? 'Дс-Жм: 9:00-18:00' : 'Пн-Пт: 9:00-18:00'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Map placeholder */}
          <Card>
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-2">🗺️</p>
                <p className="text-sm">{locale === 'kk' ? 'Интерактивті карта' : 'Интерактивная карта'}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'kk' ? 'Хабарлама жіберу' : 'Отправить сообщение'}
          </h2>
          <form className="space-y-4">
            <Input
              label={locale === 'kk' ? 'Аты-жөні' : 'ФИО'}
              placeholder={locale === 'kk' ? 'Аты-жөніңізді жазыңыз' : 'Введите ФИО'}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
            />
            <Input
              label={locale === 'kk' ? 'Тақырып' : 'Тема'}
              placeholder={locale === 'kk' ? 'Хабарлама тақырыбы' : 'Тема сообщения'}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'kk' ? 'Хабарлама' : 'Сообщение'}
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[120px] resize-y"
                placeholder={locale === 'kk' ? 'Хабарламаңызды жазыңыз...' : 'Напишите сообщение...'}
              />
            </div>
            <Button className="w-full">{locale === 'kk' ? 'Жіберу' : 'Отправить'}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
