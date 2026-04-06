import { generateCertificatePDF } from '@/lib/pdf-certificate';
import { formatDate } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { userName = 'Student', level = 'B1', score = 75, certificateId } = await request.json();

    const pdfBuffer = generateCertificatePDF({
      userName,
      level,
      score,
      date: formatDate(new Date(), 'ru'),
      certificateNumber: certificateId,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${level}.pdf"`,
      },
    });
  } catch (error) {
    return Response.json({ error: 'Certificate generation failed', details: String(error) }, { status: 500 });
  }
}
