import Link from 'next/link';
import Image from 'next/image';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  // ────────────────── TEXT LABELS ──────────────────
  const t = {
    heroBadge: isKk ? '🇰🇿 AI × ҚАЗАҚ ТІЛІ · 2026' : '🇰🇿 AI × КАЗАХСКИЙ ЯЗЫК · 2026',
    heroTitle1: isKk ? 'Қазақ тілін' : 'Учите',
    heroTitleAi: isKk ? 'AI-мен' : 'казахский с AI',
    heroTitle2: isKk ? 'үйреніңіз' : '',
    heroDesc: isKk
      ? 'Жасанды интеллект мұғалімімен қазақ тілін оңай, қызықты және тиімді үйреніңіз — A1 деңгейінен C2-ге дейін, үйден шықпай, өз ыңғайыңызбен.'
      : 'Изучайте казахский язык с AI-учителем — легко, увлекательно и эффективно. От уровня A1 до C2, из дома, в удобном для вас ритме.',
    ctaStart: isKk ? 'Оқуды бастау' : 'Начать обучение',
    ctaTest: isKk ? 'Деңгейді тексеру' : 'Проверить уровень',
    chkFree: isKk ? 'Тегін бастау' : 'Бесплатный старт',
    chkRules: isKk ? '21 грамматика ережесі' : '21 правило грамматики',
    chkKaztest: isKk ? 'КАЗТЕСТ дайындық' : 'Подготовка к КАЗТЕСТ',
    chkPhoto: isKk ? 'AI-фото тексеру' : 'AI-проверка фото',
    statFree: isKk ? 'Тегін бастау' : 'Старт бесплатно',
    statRules: isKk ? 'Грамм. ережесі' : 'Правил грамм.',
    statLevels: isKk ? '6 деңгей' : '6 уровней',
    featSection: isKk ? 'Мүмкіндіктер' : 'Возможности',
    featTitle: isKk ? 'Платформа мүмкіндіктері' : 'Возможности платформы',
    featSubtitle: isKk
      ? 'Қазақ тілін жан-жақты меңгеруге арналған 6 қуатты құрал'
      : '6 мощных инструментов для всестороннего изучения языка',
    feat1Title: isKk ? 'AI Мұғалім' : 'AI Учитель',
    feat1Desc: isKk
      ? 'Жасанды интеллектпен интерактивті сабақтар — деңгейіңізге бейімделеді.'
      : 'Интерактивные уроки с AI-учителем — адаптируются под ваш уровень.',
    feat1Cta: isKk ? 'Бастау' : 'Начать',
    feat2Title: isKk ? 'Тестілеу' : 'Тестирование',
    feat2Desc: isKk
      ? 'A1–C2 деңгей анықтау, ҚАЗТЕСТ дайындық. 100-балдық жүйе.'
      : 'Определение уровня A1–C2, подготовка к КАЗТЕСТ. 100-балльная система.',
    feat3Title: isKk ? 'Фото тексеру' : 'Фото-проверка',
    feat3Desc: isKk
      ? 'Қолжазба мәтінді фото арқылы тексеру. Қателерді AI белгілейді.'
      : 'Проверка рукописного текста по фото. Ошибки отмечает AI.',
    feat3New: isKk ? 'Жаңа мүмкіндік' : 'Новая возможность',
    feat4Title: isKk ? 'Геймификация' : 'Геймификация',
    feat4Desc: isKk
      ? 'Квесттер, XP, деңгейлер, стриктер, жарыс кестесі, бейджілер.'
      : 'Квесты, XP, уровни, серии, таблица лидеров, бейджи.',
    feat5Title: isKk ? 'Диалог жаттықтырғыш' : 'Тренажёр диалога',
    feat5Desc: isKk
      ? 'AI-мен сөйлесу практикасы. Нақты өмірлік жағдайлар.'
      : 'Практика разговора с AI. Реальные жизненные ситуации.',
    feat5Shop: isKk ? '🏪 Дүкенде' : '🏪 В магазине',
    feat5Cafe: isKk ? '☕ Кафеде' : '☕ В кафе',
    feat5Road: isKk ? '✈️ Жолда' : '✈️ В пути',
    feat6Title: isKk ? 'Айтылым' : 'Произношение',
    feat6Desc: isKk
      ? 'Дұрыс айтылуды үйрену. Қазақ TTS + дыбыс анализі.'
      : 'Обучение правильному произношению. Казахский TTS + анализ речи.',

    cultSection: isKk ? 'Ел мәдениеті' : 'Культура народа',
    cultTitle: isKk ? 'Тілді мәдениет арқылы үйреніңіз' : 'Изучайте язык через культуру',
    cultSubtitle: isKk
      ? 'Тіл — халықтың жан-дүниесі. Әр сабақ қазақ мәдениетінің бір қырымен таныстырады.'
      : 'Язык — это душа народа. Каждый урок знакомит с гранью казахской культуры.',

    levelsSection: isKk ? 'Деңгейлер' : 'Уровни',
    levelsTitle: isKk ? 'Тіл деңгейлері' : 'Уровни владения языком',
    levelsSubtitle: isKk
      ? 'A1-ден C2-ге дейін — жүйелі түрде деңгейіңізді арттырыңыз'
      : 'От A1 до C2 — системно повышайте свой уровень',

    mentSection: isKk ? 'AI Тәлімгерлер' : 'AI Наставники',
    mentTitle: isKk ? 'Ұлы ұстаздармен сөйлесіңіз' : 'Общайтесь с великими учителями',
    mentSubtitle: isKk
      ? 'Қазақ әдебиетінің жарқын тұлғалары — AI технологиясы арқылы'
      : 'Яркие фигуры казахской литературы — через AI-технологии',
    mentTalk: isKk ? 'Әңгімелесу' : 'Начать диалог',

    ctaBadge: isKk ? '🎓 ТЕГІН ТІРКЕЛУ' : '🎓 БЕСПЛАТНАЯ РЕГИСТРАЦИЯ',
    ctaTitlePre: isKk ? 'Бүгін' : 'Начните',
    ctaTitleAccent: isKk ? 'бастаңыз!' : 'сегодня!',
    ctaDesc: isKk
      ? 'Тегін тіркеліп, AI мұғалімімен қазақ тілін үйреніңіз. Банк картасы қажет емес.'
      : 'Зарегистрируйтесь бесплатно и учите казахский с AI-учителем. Банковская карта не требуется.',
    ctaChk1: isKk ? '✓ Несие картасы қажет емес' : '✓ Банковская карта не нужна',
    ctaChk2: isKk ? '✓ 30 секундта тіркелу' : '✓ Регистрация за 30 секунд',
    ctaChk3: isKk ? '✓ Барлық мүмкіндіктер ашық' : '✓ Все функции доступны',
  };

  // ────────────────── FEATURES ──────────────────
  const levels = [
    {
      code: 'A1',
      label: isKk ? 'Бастаушы' : 'Начальный',
      sub: isKk ? 'Таныстыру, алфавит' : 'Знакомство, алфавит',
      border: 'border-[#0F4C81]',
      badgeBg: 'bg-[#0F4C81]',
      badgeText: 'text-white',
      stroke: '#0F4C81',
      icon: (
        <g>
          <circle cx="24" cy="24" r="10" />
          <path d="M14 24 L 34 24 M 24 14 L 24 34 M 17 17 L 31 31 M 31 17 L 17 31" />
        </g>
      ),
    },
    {
      code: 'A2',
      label: isKk ? 'Базалық' : 'Базовый',
      sub: isKk ? 'Күнделікті сөйлеу' : 'Повседневная речь',
      border: 'border-[#1B6FB5]',
      badgeBg: 'bg-[#1B6FB5]',
      badgeText: 'text-white',
      stroke: '#1B6FB5',
      icon: (
        <g>
          <ellipse cx="24" cy="32" rx="10" ry="8" />
          <path d="M24 4 L 24 24 M 20 12 L 28 12 M 21 18 L 27 18" />
        </g>
      ),
    },
    {
      code: 'B1',
      label: isKk ? 'Орта' : 'Средний',
      sub: isKk ? 'Әңгіме жүргізу' : 'Ведение беседы',
      border: 'border-[#E8A30C]',
      badgeBg: 'bg-[#E8A30C]',
      badgeText: 'text-white',
      stroke: '#E8A30C',
      icon: (
        <g>
          <path d="M8 8 L 24 12 L 40 8 L 40 40 L 24 36 L 8 40 Z" />
          <path d="M24 12 L 24 36" />
        </g>
      ),
    },
    {
      code: 'B2',
      label: isKk ? 'Орта+' : 'Выше среднего',
      sub: isKk ? 'Еркін сөйлеу' : 'Свободная речь',
      border: 'border-[#F5C518]',
      badgeBg: 'bg-[#F5C518]',
      badgeText: 'text-[#0B1E3D]',
      stroke: '#F5C518',
      icon: (
        <g>
          <path d="M12 36 L 30 10 L 36 14 L 18 40 Z" />
          <path d="M30 10 L 36 14 M 14 34 L 24 24" />
          <circle cx="15" cy="37" r="1.5" fill="#F5C518" />
        </g>
      ),
    },
    {
      code: 'C1',
      label: isKk ? 'Жоғары' : 'Продвинутый',
      sub: isKk ? 'Кәсіби қарым-қатынас' : 'Профессиональное общение',
      border: 'border-[#C2461A]',
      badgeBg: 'bg-[#C2461A]',
      badgeText: 'text-white',
      stroke: '#C2461A',
      icon: (
        <g>
          <path d="M8 32 L 12 16 L 20 24 L 24 12 L 28 24 L 36 16 L 40 32 Z" />
          <path d="M8 36 L 40 36" />
          <circle cx="24" cy="12" r="1.5" fill="#C2461A" />
        </g>
      ),
    },
  ];

  const cultureCards = [
    {
      img: '/outputs/img/yurt.webp',
      cat: isKk ? 'Тұрмыс' : 'Быт',
      title: isKk ? 'Киіз үй' : 'Юрта',
      sub: isKk ? 'Шаңырақ, уық, кереге' : 'Шанырак, уык, кереге',
      grad: 'from-[#0F4C81] to-[#0B1E3D]',
    },
    {
      img: '/outputs/img/dombra.webp',
      cat: isKk ? 'Өнер' : 'Искусство',
      title: isKk ? 'Домбыра' : 'Домбра',
      sub: isKk ? 'Күй, терме, жыр' : 'Кюй, терме, жыр',
      grad: 'from-[#C2461A] to-[#E8A30C]',
    },
    {
      img: '/outputs/img/tulips.webp',
      cat: isKk ? 'Табиғат' : 'Природа',
      title: isKk ? 'Қызғалдақ' : 'Тюльпан',
      sub: isKk ? 'Дала гүлі · Тұран' : 'Степной цветок · Туран',
      grad: 'from-[#F5C518] to-[#C2461A]',
    },
    {
      img: '/outputs/img/astana.webp',
      cat: isKk ? 'Қала' : 'Город',
      title: isKk ? 'Астана' : 'Астана',
      sub: isKk ? 'Мәңгілік ел · Бәйтерек' : 'Мәңгілік ел · Байтерек',
      grad: 'from-[#1B6FB5] to-[#0F4C81]',
    },
  ];

  return (
    <div className="bg-[#FAF6EC] text-[#2B2A26]">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero-pattern relative overflow-hidden">
        <Image
          src="/outputs/img/hero-steppe.webp"
          alt={isKk ? 'Қазақ даласы таң шапағында' : 'Казахская степь на рассвете'}
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-[0.22] pointer-events-none select-none"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#FAF6EC] via-[#FAF6EC]/60 to-transparent pointer-events-none" />

        {/* SVG-steppe fallback */}
        <svg className="absolute bottom-0 left-0 w-full h-[220px] opacity-[0.12] pointer-events-none" viewBox="0 0 1440 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5C518" />
              <stop offset="100%" stopColor="#E8A30C" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle cx="1180" cy="100" r="52" fill="url(#sunGradient)" />
          <g stroke="#E8A30C" strokeWidth="1.2" opacity="0.6">
            <line x1="1180" y1="30" x2="1180" y2="12" />
            <line x1="1180" y1="188" x2="1180" y2="170" />
            <line x1="1110" y1="100" x2="1092" y2="100" />
            <line x1="1268" y1="100" x2="1250" y2="100" />
            <line x1="1130" y1="50" x2="1118" y2="38" />
            <line x1="1230" y1="150" x2="1242" y2="162" />
            <line x1="1230" y1="50" x2="1242" y2="38" />
            <line x1="1130" y1="150" x2="1118" y2="162" />
          </g>
          <path d="M0 170 Q 200 120 400 150 Q 600 180 800 130 Q 1000 95 1200 140 Q 1320 160 1440 135 L 1440 220 L 0 220 Z" fill="#1B6FB5" />
          <path d="M0 190 Q 250 160 500 180 Q 750 200 1000 170 Q 1200 150 1440 185 L 1440 220 L 0 220 Z" fill="#0F4C81" />
          <g transform="translate(180 155)" fill="#0B1E3D" stroke="#0B1E3D">
            <path d="M0 40 L 8 8 L 48 8 L 56 40 Z" />
            <path d="M8 8 L 28 0 L 48 8" fill="none" strokeWidth="2" />
            <circle cx="28" cy="4" r="2" fill="#F5C518" />
            <rect x="22" y="28" width="12" height="12" fill="#F5C518" opacity="0.8" />
          </g>
          <g transform="translate(900 168)" fill="#0B1E3D">
            <ellipse cx="10" cy="14" rx="12" ry="4" />
            <rect x="2" y="6" width="16" height="10" rx="1" />
            <circle cx="10" cy="3" r="3" />
            <path d="M0 8 L -4 14 M 20 8 L 24 14" stroke="#0B1E3D" strokeWidth="1.5" fill="none" />
          </g>
        </svg>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center relative">
          {/* LEFT */}
          <div className="fade-in min-w-0">
            <div className="inline-flex items-center gap-2 bg-[#F5C518]/20 text-[#0F4C81] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#C2461A] animate-pulse" />
              {t.heroBadge}
            </div>
            <h1 className="mt-6 text-[28px] xs:text-[32px] sm:text-[44px] md:text-[56px] lg:text-[68px] font-extrabold leading-[1.05] text-[#0B1E3D] tracking-tight break-words">
              {isKk ? (
                <>
                  {t.heroTitle1}
                  <br />
                  <span className="relative inline-block">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1B6FB5] to-[#0F4C81]">
                      {t.heroTitleAi}
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 280 14" fill="none">
                      <path d="M4 10 Q 70 2 140 8 Q 210 14 276 6" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>{' '}
                  {t.heroTitle2}
                </>
              ) : (
                <>
                  {t.heroTitle1}
                  <br />
                  <span className="relative inline-block">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1B6FB5] to-[#0F4C81]">
                      {t.heroTitleAi}
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 280 14" fill="none">
                      <path d="M4 10 Q 70 2 140 8 Q 210 14 276 6" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </>
              )}
            </h1>
            <p className="mt-6 text-lg text-[#6B6A63] max-w-xl leading-relaxed">{t.heroDesc}</p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={`/${locale}/learn`}
                className="group px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-[#C2461A] text-white font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition flex items-center gap-2 min-h-[44px]"
              >
                {t.ctaStart}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="group-hover:translate-x-1 transition">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={`/${locale}/test/level`}
                className="px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-white border-2 border-[#0F4C81] text-[#0F4C81] font-bold hover:bg-[#0F4C81] hover:text-white transition flex items-center gap-2 min-h-[44px]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                {t.ctaTest}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-[#2B2A26]">
              <span className="check-dot">{t.chkFree}</span>
              <span className="check-dot">{t.chkRules}</span>
              <span className="check-dot">{t.chkKaztest}</span>
              <span className="check-dot">{t.chkPhoto}</span>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="text-3xl font-extrabold text-[#0F4C81]">0₸</div>
                <div className="text-xs text-[#6B6A63] mt-1">{t.statFree}</div>
              </div>
              <div className="border-l border-[#F3ECD8] pl-4">
                <div className="text-3xl font-extrabold text-[#0F4C81]">21</div>
                <div className="text-xs text-[#6B6A63] mt-1">{t.statRules}</div>
              </div>
              <div className="border-l border-[#F3ECD8] pl-4">
                <div className="text-3xl font-extrabold text-[#0F4C81]">A1→C2</div>
                <div className="text-xs text-[#6B6A63] mt-1">{t.statLevels}</div>
              </div>
            </div>
          </div>

          {/* RIGHT: AI-chat mock — на мобильных скрыт, чтобы hero сфокусировал
              CTA и ничего не обрезалось. На md+ показывается превью разговора
              с Ахметом Байтұрсынұлы (см. PROJECT_AUDIT chat-mock report). */}
          <div className="hidden md:block relative fade-in delay-2 min-w-0">
            <div className="absolute -top-8 -right-4 w-32 h-32 rounded-full sun-rays opacity-60 blur-sm" />
            <div className="absolute -inset-6 rounded-[48px] bg-gradient-to-br from-[#0F4C81]/10 via-transparent to-[#F5C518]/15" />

            <div className="relative bg-white rounded-[36px] shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] p-4 sm:p-6 border border-[#F3ECD8]">
              <div className="flex items-center gap-3 pb-4 border-b border-[#F3ECD8]">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl gradient-blue flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                    {isKk ? 'АБ' : 'АБ'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div>
                  <div className="font-bold text-[#0B1E3D]">{isKk ? 'Ахмет Байтұрсынұлы' : 'Ахмет Байтурсынулы'}</div>
                  <div className="text-xs text-[#6B6A63] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {isKk ? 'AI Тәлімгер · Онлайн' : 'AI Наставник · Онлайн'}
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="w-11 h-11 rounded-xl bg-[#FAF6EC] hover:bg-[#F3ECD8] flex items-center justify-center" aria-label="Sound">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F4C81" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3 py-5">
                <div className="flex gap-2">
                  <div className="bg-[#FAF6EC] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[80%] break-words [overflow-wrap:anywhere]">
                    {isKk ? 'Сәлеметсіз бе! Бүгін «Жұрнақтар» тақырыбын бастайық па?' : 'Здравствуйте! Начнём сегодня тему «Суффиксы»?'}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="gradient-blue text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] break-words [overflow-wrap:anywhere]">
                    {isKk ? 'Иә, бастайық. Мысал келтіріңізші.' : 'Да, начнём. Приведите пример.'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="bg-[#FAF6EC] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%] break-words [overflow-wrap:anywhere]">
                    <div>
                      {isKk ? 'Мынаны қараңыз: ' : 'Посмотрите: '}
                      <b className="text-[#C2461A]">
                        кітап<span className="text-[#E8A30C]">-хана</span>
                      </b>
                    </div>
                    <div className="text-xs text-[#6B6A63] mt-1">{isKk ? '«-хана» — орын жұрнағы' : '«-хана» — суффикс места'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="bg-[#FAF6EC] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B6A63] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B6A63] animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B6A63] animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-[#F3ECD8] min-w-0">
                <button className="w-11 h-11 rounded-xl bg-[#F5C518]/20 text-[#E8A30C] flex items-center justify-center shrink-0" aria-label="Mic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0 bg-[#FAF6EC] rounded-xl px-4 min-h-[44px] flex items-center text-sm text-[#6B6A63] truncate">
                  {isKk ? 'Жауап жазыңыз…' : 'Напишите ответ…'}
                </div>
                <button className="w-11 h-11 rounded-xl gradient-blue text-white flex items-center justify-center shadow-md shrink-0" aria-label="Send">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-2 px-2 snap-x">
                <button className="shrink-0 snap-start px-3 min-h-[40px] rounded-lg bg-[#1B6FB5]/10 text-[#0F4C81] text-sm font-semibold whitespace-nowrap">
                  🔊 {isKk ? 'Тыңдау' : 'Слушать'}
                </button>
                <button className="shrink-0 snap-start px-3 min-h-[40px] rounded-lg bg-[#F3ECD8] text-[#2B2A26] text-sm font-semibold whitespace-nowrap">
                  🎤 {isKk ? 'Айту' : 'Говорить'}
                </button>
                <button className="shrink-0 snap-start px-3 min-h-[40px] rounded-lg bg-[#F3ECD8] text-[#2B2A26] text-sm font-semibold whitespace-nowrap">
                  💡 {isKk ? 'Түсіндіру' : 'Объяснить'}
                </button>
                <button className="shrink-0 snap-start px-3 min-h-[40px] rounded-lg bg-[#F3ECD8] text-[#2B2A26] text-sm font-semibold whitespace-nowrap">
                  📝 {isKk ? 'Мысал' : 'Пример'}
                </button>
              </div>
            </div>

            <div className="absolute -left-4 xl:-left-12 -top-4 xl:top-8 bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] px-4 py-3 items-center gap-3 border border-[#F3ECD8] hidden xl:flex">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center text-white font-extrabold">+25</div>
              <div>
                <div className="text-xs text-[#6B6A63]">{isKk ? 'Алдыңыз' : 'Получено'}</div>
                <div className="text-sm font-bold text-[#0B1E3D]">{isKk ? '25 XP ұпай' : '25 XP очков'}</div>
              </div>
            </div>

            <div className="absolute -right-2 xl:-right-8 -bottom-4 xl:bottom-8 bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] px-4 py-3 items-center gap-3 border border-[#F3ECD8] hidden xl:flex">
              <div className="text-2xl">🔥</div>
              <div>
                <div className="text-xs text-[#6B6A63]">Streak</div>
                <div className="text-sm font-bold text-[#0B1E3D]">{isKk ? '7 күн қатарынан' : '7 дней подряд'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ornament-strip" />
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-[#C2461A] font-bold text-sm tracking-[0.2em] uppercase">{t.featSection}</div>
            <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold text-[#0B1E3D] text-balance">{t.featTitle}</h2>
            <p className="mt-4 text-[#6B6A63] text-lg">{t.featSubtitle}</p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. AI Teacher */}
            <Link
              href={`/${locale}/learn`}
              className="group card-hover bg-gradient-to-br from-[#0F4C81] to-[#1B6FB5] rounded-[28px] p-7 text-white relative overflow-hidden shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)]"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2a3 3 0 013 3v2a3 3 0 01-3 3M12 10a4 4 0 014 4v6H8v-6a4 4 0 014-4zM9 7h6" />
                  <circle cx="9" cy="15" r="1" fill="currentColor" />
                  <circle cx="15" cy="15" r="1" fill="currentColor" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold">{t.feat1Title}</h3>
              <p className="mt-2 text-white/80 text-sm leading-relaxed">{t.feat1Desc}</p>
              <div className="mt-6 flex items-center gap-2 text-[#F5C518] font-semibold text-sm">
                {t.feat1Cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* 2. Testing */}
            <Link
              href={`/${locale}/test`}
              className="group card-hover bg-white border border-[#F3ECD8] rounded-[28px] p-7 shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F5C518]/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8A30C" strokeWidth="1.8">
                  <path d="M9 11l3 3 5-5M3 12a9 9 0 1018 0 9 9 0 10-18 0z" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold text-[#0B1E3D]">{t.feat2Title}</h3>
              <p className="mt-2 text-[#6B6A63] text-sm leading-relaxed">{t.feat2Desc}</p>
              <div className="mt-5 flex gap-1.5">
                {['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => (
                  <span key={l} className="px-2 py-0.5 rounded-md bg-[#FAF6EC] text-[10px] font-bold text-[#0F4C81]">
                    {l}
                  </span>
                ))}
                <span className="px-2 py-0.5 rounded-md bg-[#F5C518] text-[10px] font-bold text-[#0B1E3D]">C2</span>
              </div>
            </Link>

            {/* 3. Photo-check */}
            <Link
              href={`/${locale}/photo-check`}
              className="group card-hover bg-white border border-[#F3ECD8] rounded-[28px] p-7 shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#C2461A]/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C2461A" strokeWidth="1.8">
                  <path d="M3 7h3l2-3h8l2 3h3v12H3z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold text-[#0B1E3D]">{t.feat3Title}</h3>
              <p className="mt-2 text-[#6B6A63] text-sm leading-relaxed">{t.feat3Desc}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-[#C2461A] font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-[#C2461A] animate-pulse" />
                {t.feat3New}
              </div>
            </Link>

            {/* 4. Gamification */}
            <Link
              href={`/${locale}/game`}
              className="group card-hover bg-gradient-to-br from-[#F5C518] to-[#E8A30C] rounded-[28px] p-7 text-white relative overflow-hidden shadow-[0_8px_32px_-4px_rgba(245,197,24,0.4)]"
            >
              <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
              <Image
                src="/outputs/img/badge.webp"
                alt=""
                width={144}
                height={144}
                className="absolute -bottom-6 -right-6 w-36 h-36 object-contain opacity-90 group-hover:rotate-6 group-hover:scale-105 transition duration-500 drop-shadow-2xl pointer-events-none"
              />
              <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center relative z-10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 21h8M12 17v4M7 4h10l-1 8a4 4 0 01-8 0L7 4zM5 4h2v5a4 4 0 01-4-4V4zM19 4h-2v5a4 4 0 004-4V4z" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold relative z-10">{t.feat4Title}</h3>
              <p className="mt-2 text-white/90 text-sm leading-relaxed relative z-10">{t.feat4Desc}</p>
              <div className="mt-6 flex items-center gap-1 relative z-10">
                <span className="text-xl">🏆</span>
                <span className="text-xl">⭐</span>
                <span className="text-xl">🔥</span>
                <span className="text-xl">🎯</span>
              </div>
            </Link>

            {/* 5. Dialog */}
            <Link
              href={`/${locale}/learn/dialog`}
              className="group card-hover bg-white border border-[#F3ECD8] rounded-[28px] p-7 shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1B6FB5]/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B6FB5" strokeWidth="1.8">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold text-[#0B1E3D]">{t.feat5Title}</h3>
              <p className="mt-2 text-[#6B6A63] text-sm leading-relaxed">{t.feat5Desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5 text-xs font-semibold">
                <span className="px-2 py-1 rounded bg-[#FAF6EC] text-[#2B2A26]">{t.feat5Shop}</span>
                <span className="px-2 py-1 rounded bg-[#FAF6EC] text-[#2B2A26]">{t.feat5Cafe}</span>
                <span className="px-2 py-1 rounded bg-[#FAF6EC] text-[#2B2A26]">{t.feat5Road}</span>
              </div>
            </Link>

            {/* 6. Pronunciation */}
            <Link
              href={`/${locale}/learn/pronunciation`}
              className="group card-hover bg-white border border-[#F3ECD8] rounded-[28px] p-7 shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0F4C81]/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F4C81" strokeWidth="1.8">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold text-[#0B1E3D]">{t.feat6Title}</h3>
              <p className="mt-2 text-[#6B6A63] text-sm leading-relaxed">{t.feat6Desc}</p>
              <div className="mt-5 flex items-end gap-0.5 h-8">
                {[30, 60, 90, 100, 75, 50, 40, 70, 55, 30].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full ${h >= 75 && h <= 100 && i < 5 ? 'bg-[#F5C518]' : 'bg-[#0F4C81]'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ CULTURE ═══════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="text-[#C2461A] font-bold text-sm tracking-[0.2em] uppercase">{t.cultSection}</div>
              <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold text-[#0B1E3D] text-balance">{t.cultTitle}</h2>
            </div>
            <p className="text-[#6B6A63] max-w-md text-base">{t.cultSubtitle}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cultureCards.map((c) => (
              <Link
                key={c.title}
                href={`/${locale}/learn`}
                className={`group card-hover relative aspect-square rounded-[24px] overflow-hidden bg-gradient-to-br ${c.grad} border border-white/10 shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)]`}
              >
                <Image
                  src={c.img}
                  alt={c.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0B1E3D] via-[#0B1E3D]/60 to-transparent">
                  <div className="text-[#F5C518] text-[10px] font-extrabold tracking-widest uppercase">{c.cat}</div>
                  <div className="text-white text-xl font-extrabold mt-1">{c.title}</div>
                  <div className="text-white/70 text-xs mt-0.5">{c.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ LEVELS ═══════════════ */}
      <section className="py-20 bg-[#FAF6EC] relative overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.06]" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0 200 L0 160 Q 150 110 300 140 Q 500 180 700 120 Q 900 90 1200 150 L1200 200 Z" fill="#0F4C81" />
          <path d="M0 200 L0 180 Q 200 150 400 170 Q 600 190 800 160 Q 1000 140 1200 180 L1200 200 Z" fill="#1B6FB5" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-[#C2461A] font-bold text-sm tracking-[0.2em] uppercase">{t.levelsSection}</div>
            <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold text-[#0B1E3D] text-balance">{t.levelsTitle}</h2>
            <p className="mt-4 text-[#6B6A63] text-lg">{t.levelsSubtitle}</p>
          </div>

          <div className="mt-16 relative">
            <div className="absolute left-0 right-0 top-[42px] h-1 bg-gradient-to-r from-[#1B6FB5] via-[#F5C518] to-[#C2461A] rounded-full hidden md:block" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {levels.map((lvl) => (
                <div key={lvl.code} className="text-center">
                  <div className={`w-[88px] h-[88px] mx-auto rounded-2xl bg-white shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] flex items-center justify-center relative border-2 ${lvl.border}`}>
                    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={lvl.stroke} strokeWidth="2">
                      {lvl.icon}
                    </svg>
                    <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-md ${lvl.badgeBg} ${lvl.badgeText} text-[10px] font-extrabold`}>
                      {lvl.code}
                    </div>
                  </div>
                  <div className="mt-3 font-bold text-[#0B1E3D]">{lvl.label}</div>
                  <div className="text-xs text-[#6B6A63] mt-1">{lvl.sub}</div>
                </div>
              ))}
              {/* C2 */}
              <div className="text-center">
                <div className="w-[88px] h-[88px] mx-auto rounded-2xl bg-gradient-to-br from-[#C2461A] to-[#E8A30C] shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] flex items-center justify-center relative">
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="white" strokeWidth="2">
                    <path d="M24 40 L 24 24 M 24 24 C 14 18 10 10 14 8 C 18 10 22 14 24 20 C 26 14 30 10 34 8 C 38 10 34 18 24 24 Z" />
                  </svg>
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-[#0B1E3D] text-[#F5C518] text-[10px] font-extrabold">C2</div>
                </div>
                <div className="mt-3 font-bold text-[#0B1E3D]">{isKk ? 'Шебер' : 'Мастер'}</div>
                <div className="text-xs text-[#6B6A63] mt-1">{isKk ? 'Ана тілі деңгейі' : 'Уровень носителя'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MENTORS ═══════════════ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-[#C2461A] font-bold text-sm tracking-[0.2em] uppercase">{t.mentSection}</div>
            <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold text-[#0B1E3D] text-balance">{t.mentTitle}</h2>
            <p className="mt-4 text-[#6B6A63] text-lg">{t.mentSubtitle}</p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {/* Abai */}
            <article className="group card-hover bg-gradient-to-b from-[#FAF6EC] to-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] border border-[#F3ECD8]">
              <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-[#0F4C81] to-[#0B1E3D]">
                <Image
                  src="/outputs/img/abai.webp"
                  alt={isKk ? 'Абай Құнанбайұлы' : 'Абай Кунанбайулы'}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-95 portrait-vintage"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D] via-[#0B1E3D]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center gap-1.5 bg-[#F5C518]/90 text-[#0B1E3D] text-[10px] font-extrabold px-2 py-1 rounded tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> AI TUTOR
                  </div>
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-extrabold text-[#0B1E3D]">{isKk ? 'Абай Құнанбайұлы' : 'Абай Кунанбайулы'}</h3>
                <div className="text-sm text-[#6B6A63] mt-1">{isKk ? 'Ақын, ойшыл, ағартушы · 1845–1904' : 'Поэт, мыслитель, просветитель · 1845–1904'}</div>
                <blockquote className="mt-5 font-serif italic text-lg text-[#0F4C81] leading-relaxed border-l-4 border-[#F5C518] pl-4">
                  «{isKk ? 'Адам бол!' : 'Будь Человеком!'}»
                </blockquote>
                <p className="mt-4 text-sm text-[#6B6A63] leading-relaxed">
                  {isKk
                    ? '45 Қара сөздер негізінде моральдық-этикалық диалог жүргізеді. Поэзия, философия, өмірлік ақыл.'
                    : 'Моральные и этические диалоги на основе 45 «Чёрных слов». Поэзия, философия, жизненная мудрость.'}
                </p>
                <Link href={`/${locale}/learn`} className="mt-5 w-full py-3 rounded-xl gradient-blue text-white font-bold text-sm hover:brightness-110 transition flex items-center justify-center gap-2">
                  {t.mentTalk}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>

            {/* Baitursynuly */}
            <article className="group card-hover bg-gradient-to-b from-[#FAF6EC] to-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] border border-[#F3ECD8] md:-mt-6">
              <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-[#C2461A] to-[#0F4C81]">
                <Image
                  src="/outputs/img/baitursynov.webp"
                  alt={isKk ? 'Ахмет Байтұрсынұлы' : 'Ахмет Байтурсынулы'}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-95 portrait-vintage"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D] via-[#0B1E3D]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center gap-1.5 bg-[#F5C518]/90 text-[#0B1E3D] text-[10px] font-extrabold px-2 py-1 rounded tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> {isKk ? 'БАСТЫ ТӘЛІМГЕР' : 'ГЛАВНЫЙ НАСТАВНИК'}
                  </div>
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-extrabold text-[#0B1E3D]">{isKk ? 'Ахмет Байтұрсынұлы' : 'Ахмет Байтурсынулы'}</h3>
                <div className="text-sm text-[#6B6A63] mt-1">{isKk ? 'Тілші, ғалым, ағартушы · 1872–1937' : 'Лингвист, учёный, просветитель · 1872–1937'}</div>
                <blockquote className="mt-5 font-serif italic text-lg text-[#0F4C81] leading-relaxed border-l-4 border-[#F5C518] pl-4">
                  «{isKk ? 'Тіл — ұлттың жаны' : 'Язык — это душа народа'}»
                </blockquote>
                <p className="mt-4 text-sm text-[#6B6A63] leading-relaxed">
                  {isKk
                    ? '«Тіл-құралы» оқулығының авторы. Грамматика, әліпби реформасы, орфография сабақтары.'
                    : 'Автор учебника «Тіл-құралы». Грамматика, реформа алфавита, уроки орфографии.'}
                </p>
                <Link href={`/${locale}/learn`} className="mt-5 w-full py-3 rounded-xl bg-[#C2461A] text-white font-bold text-sm hover:brightness-110 transition flex items-center justify-center gap-2">
                  {t.mentTalk}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>

            {/* Auezov */}
            <article className="group card-hover bg-gradient-to-b from-[#FAF6EC] to-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_-4px_rgba(15,76,129,0.12)] border border-[#F3ECD8]">
              <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-[#E8A30C] to-[#0B1E3D]">
                <Image
                  src="/outputs/img/auezov.webp"
                  alt={isKk ? 'Мұхтар Әуезов' : 'Мухтар Ауэзов'}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-95 portrait-vintage"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D] via-[#0B1E3D]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center gap-1.5 bg-[#F5C518]/90 text-[#0B1E3D] text-[10px] font-extrabold px-2 py-1 rounded tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> AI TUTOR
                  </div>
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-extrabold text-[#0B1E3D]">{isKk ? 'Мұхтар Әуезов' : 'Мухтар Ауэзов'}</h3>
                <div className="text-sm text-[#6B6A63] mt-1">{isKk ? 'Жазушы, драматург · 1897–1961' : 'Писатель, драматург · 1897–1961'}</div>
                <blockquote className="mt-5 font-serif italic text-lg text-[#0F4C81] leading-relaxed border-l-4 border-[#F5C518] pl-4">
                  «{isKk ? 'Абай жолы' : 'Путь Абая'}»
                </blockquote>
                <p className="mt-4 text-sm text-[#6B6A63] leading-relaxed">
                  {isKk
                    ? 'Көркем әдебиет, романдар талдау, диалогтар құру. Лингвистикалық-әдеби практика.'
                    : 'Художественная литература, анализ романов, построение диалогов. Лингво-литературная практика.'}
                </p>
                <Link href={`/${locale}/learn`} className="mt-5 w-full py-3 rounded-xl gradient-blue text-white font-bold text-sm hover:brightness-110 transition flex items-center justify-center gap-2">
                  {t.mentTalk}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ═══════════════ ORNAMENT DIVIDER ═══════════════ */}
      <div className="bg-[#FAF6EC] py-8 relative">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E8A30C]/40 to-[#E8A30C]/60" />
          <Image
            src="/outputs/img/ornament.webp"
            alt={isKk ? 'Қошқар мүйіз орнаменті' : 'Орнамент «қошқар мүйіз»'}
            width={200}
            height={40}
            className="h-10 w-auto object-contain opacity-80"
          />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E8A30C]/40 to-[#E8A30C]/60" />
        </div>
      </div>

      {/* ═══════════════ CTA FINAL ═══════════════ */}
      <section className="py-24 bg-[#0B1E3D] relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#F5C518" strokeWidth="1.5">
            <circle cx="150" cy="100" r="60" />
            <circle cx="150" cy="100" r="40" />
            <circle cx="150" cy="100" r="20" />
            <path d="M80 100 Q 150 20 220 100 Q 150 180 80 100 Z" />
            <circle cx="1050" cy="500" r="80" />
            <circle cx="1050" cy="500" r="50" />
            <path d="M970 500 Q 1050 400 1130 500 Q 1050 600 970 500 Z" />
            <path d="M600 50 Q 620 80 600 110 Q 580 80 600 50 Z M600 490 Q 620 520 600 550 Q 580 520 600 490 Z" />
          </g>
        </svg>

        <div className="absolute top-12 right-24 w-40 h-40 rounded-full sun-rays opacity-20 blur-xl" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#F5C518]/20 text-[#F5C518] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide">
            {t.ctaBadge}
          </div>
          <h2 className="mt-6 text-5xl lg:text-6xl font-extrabold text-white text-balance leading-[1.05]">
            {t.ctaTitlePre}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5C518] to-[#C2461A]">{t.ctaTitleAccent}</span>
          </h2>
          <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto">{t.ctaDesc}</p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href={`/${locale}/learn`} className="px-8 py-4 rounded-2xl bg-[#C2461A] text-white font-extrabold shadow-[0_8px_32px_-4px_rgba(245,197,24,0.4)] hover:brightness-110 transition flex items-center gap-2 text-lg">
              {t.ctaStart}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href={`/${locale}/test/level`} className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur text-white font-bold border border-white/20 hover:bg-white/20 transition text-lg">
              {t.ctaTest}
            </Link>
          </div>
          <div className="mt-8 text-sm text-white/50 flex justify-center gap-6 flex-wrap">
            <span>{t.ctaChk1}</span>
            <span>{t.ctaChk2}</span>
            <span>{t.ctaChk3}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
