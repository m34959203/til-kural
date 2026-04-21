import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, clientKey, rateLimitResponse } from './lib/rate-limit';

const locales = ['kk', 'ru'];
const defaultLocale = 'kk';

const SECURITY_HEADERS: Record<string, string> = {
  'x-frame-options': 'SAMEORIGIN',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(self), geolocation=()',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
};

function applySecurityHeaders(res: NextResponse) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Rate limiting for API ---
  if (pathname.startsWith('/api/')) {
    let rule: { limit: number; windowMs: number; scope: string } | null = null;
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
      rule = { limit: 10, windowMs: 60_000, scope: 'auth' };
    } else if (pathname.startsWith('/api/photo-check')) {
      rule = { limit: 15, windowMs: 60_000, scope: 'photo' };
    } else if (pathname.startsWith('/api/learn/tts')) {
      rule = { limit: 30, windowMs: 60_000, scope: 'tts' };
    } else if (pathname.startsWith('/api/learn/')) {
      rule = { limit: 40, windowMs: 60_000, scope: 'ai' };
    } else if (pathname.startsWith('/api/upload')) {
      rule = { limit: 20, windowMs: 60_000, scope: 'upload' };
    } else if (pathname.startsWith('/api/push')) {
      rule = { limit: 10, windowMs: 60_000, scope: 'push' };
    } else if (pathname.startsWith('/api/contact')) {
      rule = { limit: 5, windowMs: 60_000, scope: 'contact' };
    }
    if (rule) {
      const key = clientKey(request, rule.scope);
      const r = rateLimit(key, rule.limit, rule.windowMs);
      if (!r.ok) return rateLimitResponse(r);
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // Skip static files and favicons
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/uploads/') || pathname.includes('.')) {
    return applySecurityHeaders(NextResponse.next());
  }

  // i18n routing
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
  if (pathnameHasLocale) return applySecurityHeaders(NextResponse.next());

  // Let sitemap/robots through unprefixed
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname === '/manifest.webmanifest') {
    return applySecurityHeaders(NextResponse.next());
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return applySecurityHeaders(NextResponse.redirect(url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
