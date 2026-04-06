import Card from '@/components/ui/Card';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'kk' ? 'Біз туралы' : 'О нас'}
      </h1>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">
          {locale === 'kk' ? '\"Тіл-құрал\" оқу-әдістемелік орталығы' : 'Учебно-методический центр \"Тіл-құрал\"'}
        </h2>
        <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
          {locale === 'kk' ? (
            <>
              <p>«Тіл-құрал» — қазақ тілін оқытудың заманауи платформасы. Біздің миссиямыз — жасанды интеллект технологияларын қолдана отырып, қазақ тілін оқытудың сапасын арттыру.</p>
              <p>Платформа мүмкіндіктері:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>AI мұғалімімен интерактивті сабақтар</li>
                <li>A1-C2 деңгей анықтау тесті</li>
                <li>ҚАЗТЕСТ-ке дайындық</li>
                <li>Қолжазба мәтінді фото арқылы тексеру</li>
                <li>Диалог жаттықтырғыш</li>
                <li>Айтылым практикасы</li>
                <li>Геймификация: квесттер, XP, деңгейлер</li>
                <li>PDF сертификат алу</li>
              </ul>
              <p>Орталық 2024 жылы құрылған. Біздің ұжымда тіл мамандары, бағдарламашылар және AI зерттеушілері жұмыс істейді.</p>
            </>
          ) : (
            <>
              <p>«Тіл-құрал» — современная платформа для обучения казахскому языку. Наша миссия — повышение качества обучения казахскому языку с использованием технологий искусственного интеллекта.</p>
              <p>Возможности платформы:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Интерактивные уроки с AI учителем</li>
                <li>Тест определения уровня A1-C2</li>
                <li>Подготовка к КАЗТЕСТ</li>
                <li>Проверка рукописного текста по фото</li>
                <li>Тренажёр диалогов</li>
                <li>Практика произношения</li>
                <li>Геймификация: квесты, XP, уровни</li>
                <li>Получение PDF сертификата</li>
              </ul>
              <p>Центр основан в 2024 году. В нашей команде работают специалисты по языку, программисты и исследователи AI.</p>
            </>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <p className="text-3xl font-bold text-teal-700">5000+</p>
          <p className="text-sm text-gray-500">{locale === 'kk' ? 'Пайдаланушылар' : 'Пользователей'}</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-teal-700">50+</p>
          <p className="text-sm text-gray-500">{locale === 'kk' ? 'Сабақтар' : 'Уроков'}</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-teal-700">20+</p>
          <p className="text-sm text-gray-500">{locale === 'kk' ? 'Грамматика ережелері' : 'Правил грамматики'}</p>
        </Card>
      </div>
    </div>
  );
}
