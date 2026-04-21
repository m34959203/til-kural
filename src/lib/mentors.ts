export type MentorKey = 'abai' | 'baitursynuly' | 'auezov';

export interface MentorProfile {
  key: MentorKey;
  name_kk: string;
  name_ru: string;
  role_kk: string;
  role_ru: string;
  tone_kk: string;
  tone_ru: string;
  image: string;
  ttsVoice: string;
}

export const MENTORS: Record<MentorKey, MentorProfile> = {
  abai: {
    key: 'abai',
    name_kk: 'Абай Құнанбайұлы',
    name_ru: 'Абай Кунанбаев',
    role_kk: 'Ақын, ойшыл',
    role_ru: 'Поэт, мыслитель',
    tone_kk: 'Нақыл сөздер, терең ой',
    tone_ru: 'Афоризмы, глубокая мысль',
    image: '/mentors/abai.png',
    // Низкий, философский голос
    ttsVoice: 'Charon',
  },
  baitursynuly: {
    key: 'baitursynuly',
    name_kk: 'Ахмет Байтұрсынұлы',
    name_ru: 'Ахмет Байтурсынулы',
    role_kk: 'Тіл маманы, ғалым',
    role_ru: 'Лингвист, учёный',
    tone_kk: 'Дәл, ережелер арқылы',
    tone_ru: 'Точно, через правила',
    image: '/mentors/baitursynuly.png',
    // Чёткий, педагогический
    ttsVoice: 'Kore',
  },
  auezov: {
    key: 'auezov',
    name_kk: 'Мұхтар Әуезов',
    name_ru: 'Мухтар Ауэзов',
    role_kk: 'Жазушы, драматург',
    role_ru: 'Писатель, драматург',
    tone_kk: 'Көркем, образды',
    tone_ru: 'Художественно, образно',
    image: '/mentors/auezov.png',
    // Тёплый, повествовательный
    ttsVoice: 'Fenrir',
  },
};

export const DEFAULT_MENTOR: MentorKey = 'abai';
