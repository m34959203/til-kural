import { GOV_LANGUAGE_LINKS } from '@/lib/external-links';

interface GovResourceLinksProps {
  locale: string;
}

export default function GovResourceLinks({ locale }: GovResourceLinksProps) {
  const isKk = locale === 'kk';
  const links = [
    { href: 'https://www.akorda.kz', label: isKk ? 'Ақорда' : 'Акорда' },
    ...GOV_LANGUAGE_LINKS.map((l) => ({ href: l.href, label: isKk ? l.label_kk : l.label_ru })),
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-200 hover:text-white transition-colors whitespace-nowrap"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
