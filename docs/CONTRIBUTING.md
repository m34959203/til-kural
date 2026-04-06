# Contributing

## Development Setup

```bash
git clone <repo>
cd til-kural
npm install
cp .env.example .env
npm run dev
```

## Code Style

- TypeScript strict mode
- ESLint with Next.js config
- Tailwind CSS for styling
- Server Components by default, `'use client'` only when needed

## File Naming

- Components: PascalCase (`Button.tsx`, `AITeacher.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Libraries: camelCase (`gemini.ts`, `kazakh-rules.ts`)
- Data files: kebab-case (`test-questions-bank.json`)

## Internationalization

- All user-facing text must be in both KK and RU
- Messages stored in `src/messages/kk.json` and `src/messages/ru.json`
- Kazakh is the primary language
