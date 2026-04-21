import { jsPDF } from 'jspdf';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { generateCertificateNumber } from './utils';

export type CertificateLocale = 'kk' | 'ru';

export interface CertificateData {
  userName: string;
  level: string;
  score: number;
  date: string;
  certificateNumber?: string;
  locale?: CertificateLocale;
}

type CertificateStrings = {
  brand: string;
  brandSub: string;
  title: string;
  subtitle: string;
  intro: string;
  body: string;
  scoreLabel: string;
  dateLabel: string;
  numberLabel: string;
  footer: string;
};

const STRINGS: Record<CertificateLocale, CertificateStrings> = {
  ru: {
    brand: 'ТІЛ-ҚҰРАЛ',
    brandSub: 'Учебно-методический центр казахского языка',
    title: 'СЕРТИФИКАТ',
    subtitle: 'О ВЛАДЕНИИ КАЗАХСКИМ ЯЗЫКОМ',
    intro: 'Настоящим подтверждается, что',
    body: 'продемонстрировал(а) владение казахским языком на уровне',
    scoreLabel: 'Балл',
    dateLabel: 'Выдан',
    numberLabel: '№',
    footer: 'УМЦ «Тіл-құрал» · til-kural.kz',
  },
  kk: {
    brand: 'ТІЛ-ҚҰРАЛ',
    brandSub: 'Қазақ тілін оқыту оқу-әдістемелік орталығы',
    title: 'СЕРТИФИКАТ',
    subtitle: 'ҚАЗАҚ ТІЛІН МЕҢГЕРУ ТУРАЛЫ',
    intro: 'Осымен расталады',
    body: 'қазақ тілін келесі деңгейде меңгергенін көрсетті',
    scoreLabel: 'Балл',
    dateLabel: 'Берілген күні',
    numberLabel: '№',
    footer: 'ОӘО «Тіл-құрал» · til-kural.kz',
  },
};

let cachedRegular: string | null = null;
let cachedBold: string | null = null;

function loadFont(fileName: string): string {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', fileName);
  const buf = readFileSync(fontPath);
  return buf.toString('base64');
}

function ensureFonts(doc: jsPDF) {
  if (!cachedRegular) cachedRegular = loadFont('NotoSans-Regular.ttf');
  if (!cachedBold) cachedBold = loadFont('NotoSans-Bold.ttf');

  doc.addFileToVFS('NotoSans-Regular.ttf', cachedRegular);
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  doc.addFileToVFS('NotoSans-Bold.ttf', cachedBold);
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
}

export function generateCertificatePDF(data: CertificateData): Buffer {
  const locale: CertificateLocale = data.locale === 'kk' ? 'kk' : 'ru';
  const t = STRINGS[locale];

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  ensureFonts(doc);

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Border
  doc.setDrawColor(0, 82, 110); // Deep teal
  doc.setLineWidth(2);
  doc.rect(10, 10, width - 20, height - 20);

  // Inner border
  doc.setDrawColor(197, 164, 60); // Gold
  doc.setLineWidth(0.5);
  doc.rect(15, 15, width - 30, height - 30);

  // Ornamental corners (simplified Kazakh ornament)
  doc.setDrawColor(197, 164, 60);
  doc.setLineWidth(1);
  // Top-left
  doc.line(20, 20, 40, 20);
  doc.line(20, 20, 20, 40);
  doc.line(20, 25, 35, 25);
  doc.line(25, 20, 25, 35);
  // Top-right
  doc.line(width - 20, 20, width - 40, 20);
  doc.line(width - 20, 20, width - 20, 40);
  doc.line(width - 20, 25, width - 35, 25);
  doc.line(width - 25, 20, width - 25, 35);
  // Bottom-left
  doc.line(20, height - 20, 40, height - 20);
  doc.line(20, height - 20, 20, height - 40);
  // Bottom-right
  doc.line(width - 20, height - 20, width - 40, height - 20);
  doc.line(width - 20, height - 20, width - 20, height - 40);

  // Header (brand)
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 82, 110);
  doc.text(t.brand, width / 2, 35, { align: 'center' });

  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(t.brandSub, width / 2, 42, { align: 'center' });

  // Title
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(0, 82, 110);
  doc.text(t.title, width / 2, 60, { align: 'center' });

  // Subtitle
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(t.subtitle, width / 2, 68, { align: 'center' });

  // Gold line
  doc.setDrawColor(197, 164, 60);
  doc.setLineWidth(1);
  doc.line(width / 2 - 60, 73, width / 2 + 60, 73);

  // Intro text
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(t.intro, width / 2, 85, { align: 'center' });

  // Name
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 82, 110);
  doc.text(data.userName, width / 2, 97, { align: 'center' });

  // Gold line under name
  doc.setDrawColor(197, 164, 60);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - 50, 101, width / 2 + 50, 101);

  // Body text
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(t.body, width / 2, 113, { align: 'center' });

  // Level badge
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(197, 164, 60);
  doc.text(data.level, width / 2, 132, { align: 'center' });

  // Score
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(`${t.scoreLabel}: ${data.score}%`, width / 2, 143, { align: 'center' });

  // Date and certificate number
  const certNumber = data.certificateNumber || generateCertificateNumber();
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `${t.dateLabel}: ${data.date}  ·  ${t.numberLabel} ${certNumber}`,
    width / 2,
    height - 35,
    { align: 'center' }
  );

  // Footer
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(t.footer, width / 2, height - 25, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}
