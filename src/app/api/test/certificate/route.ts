import { generateCertificatePDF } from '@/lib/pdf-certificate';
import { formatDate } from '@/lib/utils';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

function makeCertNumber(level: string) {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TK-${year}-${level}-${rand}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userName = 'Student',
      level = 'B1',
      score = 75,
      certificateId,
      testSessionId,
      download = false,
      locale,
    } = body;
    const certLocale: 'kk' | 'ru' = locale === 'kk' ? 'kk' : 'ru';

    const user = await getUserFromRequest(request);
    const certificate_number = certificateId || makeCertNumber(level);

    // Персистим только для авторизованных, и только если ещё не сохранили этот номер
    let certRecord: { id: string; certificate_number: string } | null = null;
    if (user) {
      try {
        const existing = await db.findOne('certificates', { certificate_number });
        if (existing) {
          certRecord = { id: existing.id, certificate_number: existing.certificate_number };
        } else {
          const row = await db.insert('certificates', {
            user_id: user.id,
            test_session_id: testSessionId || null,
            level,
            score,
            certificate_number,
            issued_at: new Date().toISOString(),
          });
          certRecord = { id: row.id, certificate_number: row.certificate_number };
        }
      } catch (dbErr) {
        console.warn('[certificate] db insert skipped:', dbErr);
      }
    }

    // По умолчанию возвращаем PDF, но если клиент попросил ?/ download:false — вернём метаданные
    if (!download && certRecord) {
      // Если вызывающий явно хочет JSON — пусть передаст download:false.
      // По умолчанию всё-таки стримим PDF, см. ниже.
    }

    const pdfBuffer = generateCertificatePDF({
      userName: user?.name || userName,
      level,
      score,
      date: formatDate(new Date(), certLocale),
      certificateNumber: certificate_number,
      locale: certLocale,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${level}.pdf"`,
        'X-Certificate-Number': certificate_number,
        'X-Certificate-Id': certRecord?.id || '',
      },
    });
  } catch (error) {
    return Response.json({ error: 'Certificate generation failed', details: String(error) }, { status: 500 });
  }
}
