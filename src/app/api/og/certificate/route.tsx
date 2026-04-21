import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

// Dynamic OG image for a certificate (1200×630).
// GET /api/og/certificate?name=Aidana&level=B1&score=85
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get('name') || 'Student').slice(0, 80);
  const level = (searchParams.get('level') || 'B1').slice(0, 10);
  const score = Number(searchParams.get('score') || 0);
  const locale = searchParams.get('locale') === 'ru' ? 'ru' : 'kk';
  const isKk = locale === 'kk';

  const scoreStr = Number.isFinite(score) && score > 0 ? `${Math.min(100, Math.max(0, Math.round(score)))}%` : '—';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 60%, #064e3b 100%)',
          color: 'white',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            Т
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>TIL-KURAL</div>
            <div style={{ fontSize: 16, color: '#a7f3d0' }}>
              {isKk ? 'Қазақ тілін оқыту орталығы' : 'Центр обучения казахскому языку'}
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            marginTop: 50,
            flex: 1,
            background: 'rgba(255,255,255,0.08)',
            border: '2px solid rgba(251,191,36,0.8)',
            borderRadius: 24,
            padding: 44,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: '#fcd34d',
              letterSpacing: 6,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            {isKk ? 'Сертификат' : 'Сертификат'}
          </div>
          <div style={{ fontSize: 20, color: '#d1fae5', marginBottom: 8 }}>
            {isKk ? 'Куәландырады' : 'Подтверждает, что'}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 28,
            }}
          >
            {name}
          </div>

          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 18, color: '#d1fae5', marginBottom: 4 }}>
                {isKk ? 'Деңгей' : 'Уровень'}
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: '#fcd34d',
                  lineHeight: 1,
                }}
              >
                {level}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 18, color: '#d1fae5', marginBottom: 4 }}>
                {isKk ? 'Балл' : 'Балл'}
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {scoreStr}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 16,
            color: '#a7f3d0',
          }}
        >
          <div>til-kural.kz</div>
          <div>{isKk ? 'KAZTEST дайындығы' : 'Подготовка к KAZTEST'}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
