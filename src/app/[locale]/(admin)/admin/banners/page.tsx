import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const PAGE_NAME = 'banners';

const titles: Record<string, Record<string, string>> = {
  lessons: { kk: 'Сабақтарды басқару', ru: 'Управление уроками' },
  tests: { kk: 'Тест сұрақтарын басқару', ru: 'Управление тестами' },
  news: { kk: 'Жаңалықтарды басқару', ru: 'Управление новостями' },
  events: { kk: 'Іс-шараларды басқару', ru: 'Управление мероприятиями' },
  users: { kk: 'Пайдаланушыларды басқару', ru: 'Управление пользователями' },
  analytics: { kk: 'Аналитика', ru: 'Аналитика' },
  banners: { kk: 'Баннерлерді басқару', ru: 'Управление баннерами' },
};

export default async function AdminSubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const title = titles[PAGE_NAME]?.[locale] || PAGE_NAME;

  const items = Array.from({ length: 5 }, (_, i) => ({
    id: String(i + 1),
    name: `${title} #${i + 1}`,
    status: i < 3 ? 'active' : 'draft',
    date: `2026-0${4 - i > 0 ? 4 - i : 1}-01`,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <Button>{locale === 'kk' ? 'Жаңа қосу' : 'Добавить'}</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-gray-500">ID</th>
                <th className="pb-3 font-medium text-gray-500">{locale === 'kk' ? 'Атауы' : 'Название'}</th>
                <th className="pb-3 font-medium text-gray-500">{locale === 'kk' ? 'Күйі' : 'Статус'}</th>
                <th className="pb-3 font-medium text-gray-500">{locale === 'kk' ? 'Күні' : 'Дата'}</th>
                <th className="pb-3 font-medium text-gray-500">{locale === 'kk' ? 'Әрекеттер' : 'Действия'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 text-gray-500">{item.id}</td>
                  <td className="py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{item.date}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">{locale === 'kk' ? 'Өңдеу' : 'Редактировать'}</Button>
                      <Button size="sm" variant="ghost">{locale === 'kk' ? 'Жою' : 'Удалить'}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
