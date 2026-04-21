/**
 * Статический каталог уроков с привязкой к правилам из kazakh-grammar-rules.json.
 * В будущем заменить на БД.
 */

export type MentorKey = 'abai' | 'baitursynuly' | 'auezov';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LessonMeta {
  id: string;
  title_kk: string;
  title_ru: string;
  topic: string;
  difficulty: string;
  description_kk: string;
  description_ru: string;
  rule_ids: string[];
  /** Тематическая привязка урока к наставнику («учебный путь»). */
  mentor_track?: MentorKey;
  /** Минимальный CEFR-уровень пользователя, при котором урок доступен. */
  required_level?: CefrLevel;
}

export const LESSONS: LessonMeta[] = [
  {
    id: '1',
    title_kk: 'Амандасу және танысу',
    title_ru: 'Приветствие и знакомство',
    topic: 'conversation',
    difficulty: 'A1',
    description_kk: 'Қазақша сәлемдесу, өзіңізді таныстыру, қарапайым сұрақ қою.',
    description_ru: 'Казахские приветствия, представление себя, простые вопросы.',
    rule_ids: ['rule_01'],
    mentor_track: 'abai',
    required_level: 'A1',
  },
  {
    id: '2',
    title_kk: 'Сандар мен уақыт',
    title_ru: 'Числа и время',
    topic: 'vocabulary',
    difficulty: 'A1',
    description_kk: '1-ден 100-ге дейінгі сандар, уақытты айту.',
    description_ru: 'Числа от 1 до 100, как называть время.',
    rule_ids: [],
    mentor_track: 'auezov',
    required_level: 'A1',
  },
  {
    id: '3',
    title_kk: 'Менің отбасым',
    title_ru: 'Моя семья',
    topic: 'vocabulary',
    difficulty: 'A1',
    description_kk: 'Отбасы мүшелерінің атаулары, тәуелдік жалғаулары.',
    description_ru: 'Названия членов семьи, притяжательные окончания.',
    rule_ids: ['rule_05'],
    mentor_track: 'auezov',
    required_level: 'A1',
  },
  {
    id: '4',
    title_kk: 'Көптік жалғау',
    title_ru: 'Множественное число',
    topic: 'grammar',
    difficulty: 'A1',
    description_kk: 'Көптік жалғауларының (-лар/-лер/-дар/-дер/-тар/-тер) қолданылуы.',
    description_ru: 'Использование окончаний множественного числа.',
    rule_ids: ['rule_03', 'rule_01', 'rule_02'],
    mentor_track: 'baitursynuly',
    required_level: 'A2',
  },
  {
    id: '5',
    title_kk: 'Дүкенде сатып алу',
    title_ru: 'Покупки в магазине',
    topic: 'conversation',
    difficulty: 'A2',
    description_kk: 'Дүкенде сөйлесу, баға сұрау, бағалау.',
    description_ru: 'Разговор в магазине, вопросы о цене.',
    rule_ids: [],
    mentor_track: 'auezov',
    required_level: 'B1',
  },
  {
    id: '6',
    title_kk: 'Септік жалғаулары',
    title_ru: 'Падежные окончания',
    topic: 'grammar',
    difficulty: 'A2',
    description_kk: 'Қазақ тіліндегі 7 септік және олардың жалғаулары.',
    description_ru: '7 падежей казахского языка и их окончания.',
    rule_ids: ['rule_04', 'rule_02'],
    mentor_track: 'baitursynuly',
    required_level: 'A2',
  },
  {
    id: '7',
    title_kk: 'Етістік шақтары',
    title_ru: 'Времена глагола',
    topic: 'grammar',
    difficulty: 'A2',
    description_kk: 'Осы, өткен және келер шақ жасалуы.',
    description_ru: 'Образование настоящего, прошедшего и будущего времён.',
    rule_ids: ['rule_07', 'rule_08', 'rule_09', 'rule_10'],
    mentor_track: 'baitursynuly',
    required_level: 'B2',
  },
  {
    id: '8',
    title_kk: 'Мейрамханада тапсырыс',
    title_ru: 'Заказ в ресторане',
    topic: 'conversation',
    difficulty: 'B1',
    description_kk: 'Тапсырыс беру, тағамдар атаулары.',
    description_ru: 'Заказ блюд, названия еды.',
    rule_ids: [],
    mentor_track: 'auezov',
    required_level: 'B2',
  },
  {
    id: '9',
    title_kk: 'Сын есімнің шырайлары',
    title_ru: 'Степени сравнения прилагательных',
    topic: 'grammar',
    difficulty: 'B1',
    description_kk: 'Жай, салыстырмалы, күшейтпелі, асырмалы шырайлар.',
    description_ru: 'Простая, сравнительная, усилительная, превосходная степени.',
    rule_ids: ['rule_06'],
    mentor_track: 'baitursynuly',
    required_level: 'B1',
  },
  {
    id: '10',
    title_kk: 'Іскерлік қазақ тілі',
    title_ru: 'Деловой казахский',
    topic: 'business',
    difficulty: 'B2',
    description_kk: 'Іскерлік хат, ресми стиль, сыпайы тұлғалар.',
    description_ru: 'Деловое письмо, официальный стиль, вежливые формы.',
    rule_ids: [],
    mentor_track: 'abai',
    required_level: 'C1',
  },
  {
    id: '11',
    title_kk: 'Сөйлемдегі сөздердің орны',
    title_ru: 'Порядок слов в предложении',
    topic: 'grammar',
    difficulty: 'A2',
    description_kk: 'Қазақ тілінде SOV құрылымы: бастауыш–толықтауыш–баяндауыш.',
    description_ru: 'Казахский — SOV-язык: подлежащее, дополнение, сказуемое.',
    rule_ids: ['rule_11'],
    mentor_track: 'baitursynuly',
    required_level: 'A2',
  },
  {
    id: '12',
    title_kk: 'Сұраулы сөйлемдер',
    title_ru: 'Вопросительные предложения',
    topic: 'grammar',
    difficulty: 'A1',
    description_kk: 'Ма/ме/ба/бе сұраулық шылауы, сұрау сөздер, интонация.',
    description_ru: 'Вопросительные частицы ма/ме/ба/бе, вопросительные слова.',
    rule_ids: ['rule_12'],
    mentor_track: 'baitursynuly',
    required_level: 'A1',
  },
  {
    id: '13',
    title_kk: 'Септеулік шылаулар',
    title_ru: 'Послелоги',
    topic: 'grammar',
    difficulty: 'B1',
    description_kk: 'Арқылы, үшін, туралы, бойынша, қарсы — септеулік шылаулардың қолданылуы.',
    description_ru: 'Послелоги арқылы, үшін, туралы, бойынша, қарсы и их употребление.',
    rule_ids: ['rule_13'],
    mentor_track: 'baitursynuly',
    required_level: 'B1',
  },
  {
    id: '14',
    title_kk: 'Сан есімдер және есептеу',
    title_ru: 'Числительные и счёт',
    topic: 'grammar',
    difficulty: 'A1',
    description_kk: 'Есептік, реттік, жинақтық, болжалдық сан есімдер.',
    description_ru: 'Количественные, порядковые, собирательные, приблизительные числительные.',
    rule_ids: ['rule_14'],
    mentor_track: 'baitursynuly',
    required_level: 'A1',
  },
  {
    id: '15',
    title_kk: 'Жіктеу есімдіктері',
    title_ru: 'Личные местоимения',
    topic: 'grammar',
    difficulty: 'A1',
    description_kk: 'Мен, сен, сіз, ол, біз, сендер, сіздер, олар — жіктелуі.',
    description_ru: 'Мен, сен, сіз, ол, біз, сендер, сіздер, олар — склонение.',
    rule_ids: ['rule_15'],
    mentor_track: 'auezov',
    required_level: 'A1',
  },
  {
    id: '16',
    title_kk: 'Сөз тудырушы жұрнақтар',
    title_ru: 'Словообразовательные суффиксы',
    topic: 'grammar',
    difficulty: 'B1',
    description_kk: '-шы/-ші, -лық/-лік, -хана, -стан және басқа сөз тудырушы жұрнақтар.',
    description_ru: 'Суффиксы -шы/-ші, -лық/-лік, -хана, -стан и другие словообразовательные.',
    rule_ids: ['rule_16'],
    mentor_track: 'baitursynuly',
    required_level: 'B1',
  },
  {
    id: '17',
    title_kk: 'Етістіктің рай категориясы',
    title_ru: 'Наклонения глагола',
    topic: 'grammar',
    difficulty: 'B2',
    description_kk: 'Ашық, бұйрық, шартты, қалау, тілек райлары.',
    description_ru: 'Изъявительное, повелительное, условное, желательное наклонения.',
    rule_ids: ['rule_17'],
    mentor_track: 'baitursynuly',
    required_level: 'B2',
  },
  {
    id: '18',
    title_kk: 'Қазақ тіліне тән дыбыстар',
    title_ru: 'Специфические звуки казахского',
    topic: 'phonetics',
    difficulty: 'A1',
    description_kk: 'Ә, ғ, қ, ң, ө, ұ, ү, һ, і — 9 тән дыбысты игеру.',
    description_ru: 'Ә, ғ, қ, ң, ө, ұ, ү, һ, і — девять специфических звуков.',
    rule_ids: ['rule_18'],
    mentor_track: 'baitursynuly',
    required_level: 'A1',
  },
  {
    id: '19',
    title_kk: 'Бас әріп ережелері',
    title_ru: 'Правила заглавной буквы',
    topic: 'orthography',
    difficulty: 'A2',
    description_kk: 'Сөйлем басы, жалқы есімдер, географиялық атаулар, мекемелер.',
    description_ru: 'Начало предложения, имена собственные, географические названия.',
    rule_ids: ['rule_19'],
    mentor_track: 'baitursynuly',
    required_level: 'A2',
  },
  {
    id: '20',
    title_kk: 'Есімше формалары',
    title_ru: 'Причастные формы',
    topic: 'grammar',
    difficulty: 'B2',
    description_kk: 'Осы, өткен, келер шақ есімшелері: оқитын, оқыған, оқыйтын.',
    description_ru: 'Причастия настоящего, прошедшего и будущего времени.',
    rule_ids: ['rule_20'],
    mentor_track: 'baitursynuly',
    required_level: 'B2',
  },
  {
    id: '21',
    title_kk: 'Қазақ мақал-мәтелдері',
    title_ru: 'Казахские пословицы и поговорки',
    topic: 'culture',
    difficulty: 'B1',
    description_kk: 'Халық даналығы, жиі кездесетін мақал-мәтелдер және олардың мағынасы.',
    description_ru: 'Народная мудрость: частые пословицы и их значение.',
    rule_ids: ['rule_21'],
    mentor_track: 'abai',
    required_level: 'B1',
  },
];

export function findLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}

/** Метаданные наставников для UI. */
export const MENTOR_META: Record<
  MentorKey,
  {
    key: MentorKey;
    icon: string;
    name_kk: string;
    name_ru: string;
    track_kk: string;
    track_ru: string;
    accent: string;
  }
> = {
  abai: {
    key: 'abai',
    icon: '🪶',
    name_kk: 'Абай',
    name_ru: 'Абай',
    track_kk: 'Абаймен жол',
    track_ru: 'Путь с Абаем',
    accent: 'indigo',
  },
  baitursynuly: {
    key: 'baitursynuly',
    icon: '✒️',
    name_kk: 'Байтұрсынұлы',
    name_ru: 'Байтұрсынұлы',
    track_kk: 'Байтұрсынұлымен жол',
    track_ru: 'Путь с Байтұрсынұлы',
    accent: 'emerald',
  },
  auezov: {
    key: 'auezov',
    icon: '📖',
    name_kk: 'Әуезов',
    name_ru: 'Әуезов',
    track_kk: 'Әуезовпен жол',
    track_ru: 'Путь с Әуезовым',
    accent: 'amber',
  },
};

const LEVEL_ORDER: Record<CefrLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

/**
 * Достаточен ли у пользователя уровень, чтобы открыть урок с required_level.
 * Если у урока нет required_level — всегда доступно.
 * Если у пользователя нет уровня — считаем A1.
 */
export function hasLevelAccess(
  userLevel: string | null | undefined,
  required: CefrLevel | undefined
): boolean {
  if (!required) return true;
  const u = (userLevel as CefrLevel) || 'A1';
  const userRank = LEVEL_ORDER[u] ?? 1;
  const reqRank = LEVEL_ORDER[required];
  return userRank >= reqRank;
}

/** Уроки, привязанные к наставнику, в порядке каталога. */
export function lessonsByMentor(mentor: MentorKey): LessonMeta[] {
  return LESSONS.filter((l) => l.mentor_track === mentor);
}
