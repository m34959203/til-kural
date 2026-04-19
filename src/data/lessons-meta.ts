/**
 * Статический каталог уроков с привязкой к правилам из kazakh-grammar-rules.json.
 * В будущем заменить на БД.
 */

export interface LessonMeta {
  id: string;
  title_kk: string;
  title_ru: string;
  topic: string;
  difficulty: string;
  description_kk: string;
  description_ru: string;
  rule_ids: string[];
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
  },
];

export function findLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}
