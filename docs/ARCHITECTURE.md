# Architecture

## Overview

Тіл-құрал uses Next.js 15 App Router with a locale-based routing structure.

## Routing

```
/[locale]/(public)/      — Public-facing pages
/[locale]/(admin)/admin/ — Admin panel (route group)
/api/                    — API routes (no locale prefix)
```

## Data Flow

1. **Client Components** make fetch calls to `/api/` routes
2. **API Routes** use `src/lib/` modules (gemini, db, auth, etc.)
3. **Gemini AI** handles: chat, exercise generation, writing checks, photo OCR, TTS
4. **RAG System** provides grammar rules context to AI via `src/lib/kazakh-rules.ts`

## Key Libraries

- `src/lib/gemini.ts` — Gemini API client (text + vision)
- `src/lib/kazakh-rules.ts` — RAG context builder from grammar rules database
- `src/lib/gamification.ts` — XP, levels, streaks, leaderboard logic
- `src/lib/auth.ts` — JWT-based authentication
- `src/lib/pdf-certificate.ts` — jsPDF certificate generation
- `src/lib/i18n.ts` — Bilingual message loading (KZ/RU)

## Component Architecture

- **UI Components** (`src/components/ui/`): Reusable primitives (Button, Card, Input, etc.)
- **Layout Components** (`src/components/layout/`): Header, Footer, AdminSidebar, MobileNav
- **Feature Components** (`src/components/features/`): Domain-specific (AITeacher, PhotoChecker, etc.)
