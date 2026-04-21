import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

// Dynamic OG image for achievement badge (1200×630).
// GET /api/og/badge?title=First%20Lesson&icon=🏆&description=Прошёл%20первый%20урок
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Achievement').slice(0, 120);
  const description = (searchParams.get('description') || '').slice(0, 200);
  const icon = (searchParams.get('icon') || '🏆').slice(0, 10);
  const locale = searchParams.get('locale') === 'ru' ? 'ru' : 'kk';
  const isKk = locale === 'kk';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
          color: '#064e3b',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#0f766e',
              color: 'white',
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
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1, color: '#115e59' }}>TIL-KURAL</div>
            <div style={{ fontSize: 16, color: '#047857' }}>
              {isKk ? 'Қазақ тілін оқыту орталығы' : 'Центр обучения казахскому языку'}
            </div>
          </div>
        </div>

        {/* Badge body */}
        <div
          style={{
            marginTop: 30,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 40,
          }}
        >
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'white',
              border: '6px solid #0f766e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 140,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div
              style={{
                fontSize: 22,
                color: '#047857',
                letterSpacing: 6,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              {isKk ? 'Жетістік' : 'Достижение'}
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: 16,
                color: '#064e3b',
              }}
            >
              {title}
            </div>
            {description && (
              <div style={{ fontSize: 24, color: '#115e59', lineHeight: 1.3 }}>
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 16,
            color: '#047857',
          }}
        >
          <div>til-kural.kz</div>
          <div>{isKk ? 'Ойынға қатысу' : 'Игровой прогресс'}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
