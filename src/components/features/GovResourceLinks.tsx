interface GovResourceLinksProps {
  locale: string;
}

export default function GovResourceLinks({ locale }: GovResourceLinksProps) {
  const links = [
    { href: 'https://www.akorda.kz', label: locale === 'kk' ? 'Ақорда' : 'Акорда' },
    { href: 'https://baitursynuly.kz', label: locale === 'kk' ? 'Байтұрсынұлы' : 'Байтурсынулы' },
    { href: 'https://tilalemi.kz', label: 'Тіл әлемі' },
    { href: 'https://terminkom.kz', label: 'Терминком.кз' },
    { href: 'https://emle.kz', label: 'Емле.кз' },
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
