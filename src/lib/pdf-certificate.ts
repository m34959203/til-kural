import { jsPDF } from 'jspdf';
import { generateCertificateNumber } from './utils';

export interface CertificateData {
  userName: string;
  level: string;
  score: number;
  date: string;
  certificateNumber?: string;
}

export function generateCertificatePDF(data: CertificateData): Buffer {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

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

  // Header
  doc.setFontSize(14);
  doc.setTextColor(0, 82, 110);
  doc.text('TIL-KURAL', width / 2, 35, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Kazakh Language Learning Center', width / 2, 42, { align: 'center' });

  // Title
  doc.setFontSize(28);
  doc.setTextColor(0, 82, 110);
  doc.text('CERTIFICATE', width / 2, 60, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('OF LANGUAGE PROFICIENCY', width / 2, 68, { align: 'center' });

  // Gold line
  doc.setDrawColor(197, 164, 60);
  doc.setLineWidth(1);
  doc.line(width / 2 - 60, 73, width / 2 + 60, 73);

  // Body text
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('This is to certify that', width / 2, 85, { align: 'center' });

  // Name
  doc.setFontSize(22);
  doc.setTextColor(0, 82, 110);
  doc.text(data.userName, width / 2, 97, { align: 'center' });

  // Gold line under name
  doc.setDrawColor(197, 164, 60);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - 50, 101, width / 2 + 50, 101);

  // Level info
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(
    'has demonstrated proficiency in the Kazakh language at level',
    width / 2,
    113,
    { align: 'center' }
  );

  // Level badge
  doc.setFontSize(36);
  doc.setTextColor(197, 164, 60);
  doc.text(data.level, width / 2, 132, { align: 'center' });

  // Score
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(`Score: ${data.score}%`, width / 2, 143, { align: 'center' });

  // Date and certificate number
  const certNumber = data.certificateNumber || generateCertificateNumber();
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Date: ${data.date}`, width / 2 - 40, height - 35, { align: 'center' });
  doc.text(`Certificate No: ${certNumber}`, width / 2 + 40, height - 35, { align: 'center' });

  // Footer
  doc.setFontSize(8);
  doc.text('til-kural.kz', width / 2, height - 25, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}
