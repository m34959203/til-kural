# Тіл-құрал — Kazakh Language Learning Platform

## Project Overview
AI-powered Kazakh language education platform with interactive lessons, testing, handwritten text checking, and gamification.

## Tech Stack
- Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- PostgreSQL 16 (in-memory DB for dev)
- Google Gemini 2.5 Flash API (text + Vision + TTS)
- Docker Compose

## Key Commands
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint
```

## Project Structure
- `src/app/[locale]/(public)/` — Public pages (KZ/RU bilingual)
- `src/app/[locale]/(admin)/admin/` — Admin panel
- `src/app/api/` — API routes
- `src/components/ui/` — Reusable UI components
- `src/components/layout/` — Layout components (Header, Footer, etc.)
- `src/components/features/` — Feature components (AITeacher, PhotoChecker, etc.)
- `src/lib/` — Core libraries (auth, db, gemini, i18n, etc.)
- `src/data/` — JSON data files (grammar rules, test questions, quests, achievements)
- `src/messages/` — i18n message files (kk.json, ru.json)
- `sql/` — Database schema

## Important Notes
- **Live doc:** `NOTES.md` in repo root — read it first, update on significant changes.
- Kazakh (kk) is primary language, Russian (ru) is secondary
- params in pages/layouts are Promises (Next.js 15+)
- **AI dispatch:** `LLM_PROVIDER=groq` (default) → Groq (`llama-3.3-70b-versatile` / `openai/gpt-oss-120b`) с auto-failover на Gemini при 429. Vision и TTS остаются на Gemini. См. NOTES.md → "AI provider abstraction".
- DB auto-switches to Postgres when `DATABASE_URL` is set, otherwise in-memory (dev fallback)
- TTS: `gemini-3.1-flash-tts-preview` is the only Gemini model that supports kk-KZ natively
- **Telegram autopost:** при `news.status='published'` / `events.status='upcoming'` шлёт двуязычный пост в `TELEGRAM_CHAT_ID`. Без токенов — тихо пропускается.
- Cron: `POST /api/cron/streak-reminder` (header `x-cron-token: $CRON_TOKEN`); `GET/POST /api/cron/publish-scheduled` (Bearer `$CRON_SECRET` или `?token=$CRON_SECRET`).
