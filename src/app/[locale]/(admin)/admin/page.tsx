import Card from '@/components/ui/Card';

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const stats = [
    { label: locale === 'kk' ? 'Барлық пайдаланушылар' : 'Всего пользователей', value: '5,234', icon: '👥', change: '+12%' },
    { label: locale === 'kk' ? 'Бүгін белсенді' : 'Активных сегодня', value: '342', icon: '📊', change: '+5%' },
    { label: locale === 'kk' ? 'Бүгінгі тесттер' : 'Тестов сегодня', value: '89', icon: '✅', change: '+8%' },
    { label: locale === 'kk' ? 'Орташа балл' : 'Средний балл', value: '73%', icon: '📈', change: '+2%' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {locale === 'kk' ? 'Басқару тақтасы' : 'Панель управления'}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-xs text-green-600 mt-2">{stat.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'kk' ? 'Соңғы белсенділік' : 'Последняя активность'}
          </h2>
          <div className="space-y-3">
            {[
              { user: 'Айгерім Т.', action: locale === 'kk' ? 'Деңгей тестін тапсырды (B1)' : 'Сдала тест уровня (B1)', time: '5 мин' },
              { user: 'Нұрлан К.', action: locale === 'kk' ? 'Фото тексеруді жасады' : 'Выполнил проверку фото', time: '12 мин' },
              { user: 'Дарья М.', action: locale === 'kk' ? 'Жаңа квестті бастады' : 'Начала новый квест', time: '25 мин' },
              { user: 'Асан Б.', action: locale === 'kk' ? 'Тіркелді' : 'Зарегистрировался', time: '1 сағат' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">{item.user}</span>
                  <span className="text-gray-500 ml-2">{item.action}</span>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'kk' ? 'Танымал сабақтар' : 'Популярные уроки'}
          </h2>
          <div className="space-y-3">
            {[
              { title: locale === 'kk' ? 'Амандасу және танысу' : 'Приветствие и знакомство', views: 1234 },
              { title: locale === 'kk' ? 'Көптік жалғау' : 'Множественное число', views: 987 },
              { title: locale === 'kk' ? 'Септік жалғаулары' : 'Падежные окончания', views: 876 },
              { title: locale === 'kk' ? 'Етістік шақтары' : 'Времена глагола', views: 765 },
            ].map((lesson, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{lesson.title}</span>
                <span className="text-gray-400">{lesson.views} {locale === 'kk' ? 'рет' : 'раз'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
