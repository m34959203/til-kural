import Link from 'next/link';
import { GOV_LANGUAGE_LINKS } from '@/lib/external-links';

interface FooterProps {
  locale: string;
  messages: {
    common: Record<string, string>;
    footer: Record<string, string>;
  };
  socials?: {
    instagram?: string;
    facebook?: string;
    telegram?: string;
  };
}

export default function Footer({ locale, messages, socials }: FooterProps) {
  const t = messages.common;
  const f = messages.footer;
  const sIg = socials?.instagram?.trim();
  const sFb = socials?.facebook?.trim();
  const sTg = socials?.telegram?.trim();

  const year = new Date().getFullYear();

  const nav = [
    { href: `/${locale}/learn`, label: t.learn || (locale === 'kk' ? 'Оқу' : 'Обучение') },
    { href: `/${locale}/test`, label: t.test || (locale === 'kk' ? 'Тестілеу' : 'Тестирование') },
    { href: `/${locale}/photo-check`, label: locale === 'kk' ? 'Фото-тексеру' : 'Фото-проверка' },
    { href: `/${locale}/game`, label: t.game || (locale === 'kk' ? 'Ойын' : 'Игра') },
    { href: `/${locale}/news`, label: t.news || (locale === 'kk' ? 'Жаңалықтар' : 'Новости') },
    { href: `/${locale}/resources`, label: locale === 'kk' ? 'Ресурстар' : 'Ресурсы' },
  ];

  const govLinks = [
    { href: 'https://www.akorda.kz', label: f.aqorda || 'Ақорда' },
    ...GOV_LANGUAGE_LINKS.map((l) => ({
      href: l.href,
      label: (f[l.key] as string | undefined) || (locale === 'kk' ? l.label_kk : l.label_ru),
    })),
  ];

  return (
    <footer className="bg-tk-night text-white/80">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* About */}
        <div>
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-blue flex items-center justify-center shadow-md">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M8 24 L 20 8 L 24 12 L 12 28 Z" fill="#F5C518" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">Тіл-құрал</div>
              <div className="text-[11px] text-white/60">
                {t.siteDescription || (locale === 'kk' ? 'Оқыту-әдістемелік орталығы' : 'Учебно-методический центр')}
              </div>
            </div>
          </Link>
          <p className="mt-5 text-sm leading-relaxed">
            {locale === 'kk'
              ? 'AI технологиясымен қазақ тілін оқытудың жаңа деңгейі. Байтұрсынұлының мұрасы — заманауи платформада.'
              : 'Новый уровень обучения казахскому языку с AI. Наследие Байтурсынулы — на современной платформе.'}
          </p>
          {(sIg || sTg || sFb) && (
            <div className="mt-5 flex gap-3">
              {sIg && (
                <a
                  href={sIg}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-tk-gold hover:text-tk-night flex items-center justify-center transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.84c-3.14 0-3.5.01-4.74.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83-.39.39-.63.76-.83 1.27-.15.39-.33.97-.38 2.04C2.69 9.5 2.68 9.86 2.68 13s.01 3.5.07 4.74c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.33 2.04.38C9.5 21.31 9.86 21.32 13 21.32s3.5-.01 4.74-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.05-1.07-.23-1.65-.38-2.04a3.4 3.4 0 0 0-.83-1.27 3.4 3.4 0 0 0-1.27-.83c-.39-.15-.97-.33-2.04-.38C15.5 4.01 15.14 4 12 4zm0 3.13a4.87 4.87 0 1 1 0 9.74 4.87 4.87 0 0 1 0-9.74zm0 8.04a3.17 3.17 0 1 0 0-6.34 3.17 3.17 0 0 0 0 6.34zm6.2-8.27a1.13 1.13 0 1 1-2.26 0 1.13 1.13 0 0 1 2.26 0z" />
                  </svg>
                </a>
              )}
              {sTg && (
                <a
                  href={sTg}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-tk-gold hover:text-tk-night flex items-center justify-center transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M9.78 17.6 9.6 14l8.96-8.07c.4-.36-.09-.54-.62-.22L7.06 12.69 2.3 11.18c-1.02-.31-1.03-1.02.22-1.5l18.6-7.18c.85-.39 1.66.21 1.34 1.51l-3.16 14.93c-.22 1.05-.85 1.3-1.72.81l-4.74-3.51-2.28 2.21c-.27.27-.49.49-.98.49z" />
                  </svg>
                </a>
              )}
              {sFb && (
                <a
                  href={sFb}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-tk-gold hover:text-tk-night flex items-center justify-center transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-extrabold text-white text-sm tracking-[0.2em] uppercase">
            {locale === 'kk' ? 'Навигация' : 'Навигация'}
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-tk-gold transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Gov resources */}
        <div>
          <h3 className="font-extrabold text-white text-sm tracking-[0.2em] uppercase">
            {f.govLinks || (locale === 'kk' ? 'Мемлекеттік ресурстар' : 'Государственные ресурсы')}
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {govLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-tk-gold transition flex items-center gap-2"
                >
                  <span>{link.label}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="font-extrabold text-white text-sm tracking-[0.2em] uppercase">
            {t.contacts || (locale === 'kk' ? 'Байланыс' : 'Контакты')}
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>
                {locale === 'kk' ? 'Ұлытау обл., Сәтбаев қ.' : 'Ұлытауская обл., г. Сатпаев'}
                <br />
                <span className="text-white/60 text-xs">
                  {locale === 'kk' ? 'Академик Қаныш Сәтбаев даңғ., 111' : 'пр. Академика Каныша Сатпаева, 111'}
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z" />
              </svg>
              <a href="tel:+77053143391" className="hover:text-tk-gold transition">+7 705 314 3391</a>
            </li>
            <li className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              <a href="mailto:info@til-kural.kz" className="hover:text-tk-gold transition">info@til-kural.kz</a>
            </li>
            <li className="text-xs text-white/50 pl-7 pt-1 leading-relaxed">
              {locale === 'kk'
                ? 'МКҚК «Тіл-құрал» ОӘО · БСН 241240033540'
                : 'КГУ УМЦ «Тіл-құрал» · БИН 241240033540'}
            </li>
          </ul>
        </div>
      </div>

      {/* Thin gold ornament strip */}
      <div className="ornament-strip opacity-30" />

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <div>&copy; {year} Тіл-құрал. {f.rights || (locale === 'kk' ? 'Барлық құқықтар қорғалған' : 'Все права защищены')}.</div>
          <div className="flex gap-5">
            <Link href={`/${locale}/privacy`} className="hover:text-tk-gold transition">
              {locale === 'kk' ? 'Құпиялылық' : 'Конфиденциальность'}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-tk-gold transition">
              {locale === 'kk' ? 'Шарттар' : 'Условия'}
            </Link>
            <Link href={`/${locale}/cookies`} className="hover:text-tk-gold transition">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
