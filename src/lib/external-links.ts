export interface GovLink {
  key: string;
  href: string;
  label_kk: string;
  label_ru: string;
  description_kk?: string;
  description_ru?: string;
}

export const GOV_LANGUAGE_LINKS: GovLink[] = [
  {
    key: 'baitursynuly',
    href: 'https://tbi.kz',
    label_kk: 'Байтұрсынұлы',
    label_ru: 'Байтурсынулы',
    description_kk: 'А. Байтұрсынұлы атындағы Тіл білімі институты',
    description_ru: 'Институт языкознания им. А. Байтурсынулы',
  },
  {
    key: 'tilalemi',
    href: 'https://tilalemi.kz',
    label_kk: 'Тіл әлемі',
    label_ru: 'Тіл әлемі',
    description_kk: '«Тіл-Қазына» ҰҒПО — қазақ тілін үйрету порталы',
    description_ru: 'Портал «Тіл-Қазына» — обучение казахскому языку',
  },
  {
    key: 'termincom',
    href: 'https://termincom.kz',
    label_kk: 'Termincom.kz',
    label_ru: 'Termincom.kz',
    description_kk: 'Ресми терминдер базасы (Терминком)',
    description_ru: 'Официальная база терминов (Терминком)',
  },
  {
    key: 'emle',
    href: 'https://emle.kz',
    label_kk: 'Emle.kz',
    label_ru: 'Emle.kz',
    description_kk: 'Қазақ тілінің орфографиялық электрондық базасы',
    description_ru: 'Электронная база орфографии казахского языка',
  },
];
