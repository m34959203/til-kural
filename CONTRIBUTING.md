# Как контрибьютить в Тіл-құрал

## Setup

```bash
git clone https://github.com/m34959203/til-kural.git
cd til-kural
cp .env.example .env.local        # заполнить минимум JWT_SECRET + GROQ_API_KEY
npm install
docker compose up -d db           # Postgres 16 на :5442
npm run dev                       # http://localhost:3000
```

Без ключей в `.env.local` приложение поднимется в demo-режиме (in-memory store, заглушки AI). В demo-режиме админка открывается без логина при `DEV_ADMIN_BYPASS=1` — **не включать на проде**.

## Структура

- `src/app/[locale]/(public)/` — публичные страницы (kk/ru)
- `src/app/[locale]/(admin)/admin/` — 14 админ-разделов (auth-gate в `src/middleware.ts`)
- `src/app/api/` — REST-эндпоинты (auth, learn/*, test/*, game/*, admin/*, cron/*)
- `src/components/features/` — фичи (DialogTrainer, LiveVoiceDialog, PhotoChecker, KaztestPractice, …)
- `src/components/admin/` — админ-компоненты (RichTextEditor, EntityCrudTable, BilingualArticleForm, …)
- `src/lib/` — бизнес-логика (`gemini`, `llm/groq`, `tts`, `auto-post`, `telegram`, `db`, `auth`, `gamification`, `cat-engine`, …)
- `src/data/` — JSON/TS каталоги (lessons-meta, kazakh-grammar-rules, test-questions-bank, quest-templates)
- `sql/` — миграции (применяются на первой инициализации Postgres)
- `docs/` — ARCHITECTURE / DEPLOYMENT / TZ_CHECKLIST / audit-отчёты

Подробнее: [NOTES.md](./NOTES.md) — живой журнал решений.

## Стиль кода

- TypeScript strict, без `any` без обоснования в комментарии
- Tailwind 4 для стилей, без отдельных CSS-модулей
- Server-components по умолчанию; `'use client'` только где нужны state/effects
- API-роуты валидируют входящие данные через Zod-схемы из `src/lib/validators.ts`
- Без `speechSynthesis` (browser TTS): RU/KK озвучка только через Gemini TTS — см. memory-правило
- Любой админ-роут: `["admin","editor"]` + try/catch на `AuthError`

Перед PR прогнать локально:

```bash
npm run lint
npm run build
```

## Коммиты — Conventional Commits на русском

```
feat(ai,social): Groq как primary LLM + Telegram автопостинг
fix(events): авто-статус, синхронизация event_type
docs: оформить репо по стандарту dev-base
chore: bump groq-sdk → 1.1.2
refactor(api): вынести audit-проверки в общий хелпер
```

Правила:
- Префикс на английском (стандарт), описание на русском
- Глагол в инфинитиве: «добавить», «исправить», «обновить»
- Без точки в конце, длина ≤ 72 символа
- Тело коммита через пустую строку — объясняет «зачем», не «что»

## Pull Request

Шаблон автоматически подставляется при создании PR, см. [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).

Чеклист перед мержем:

- [ ] `npm run lint` и `npm run build` проходят
- [ ] Документация обновлена (README / NOTES.md / docs/)
- [ ] `.env.example` актуален (если добавлены новые переменные)
- [ ] Миграции БД приложены (если применимо)
- [ ] Реальные секреты НЕ попали в коммит (особенно `GEMINI_API_KEY`, `GROQ_API_KEY`, `JWT_SECRET`)
- [ ] Self-review проведено

## Issues

Шаблоны: [`.github/ISSUE_TEMPLATE/bug.md`](.github/ISSUE_TEMPLATE/bug.md) и [`feature.md`](.github/ISSUE_TEMPLATE/feature.md).

## Безопасность

- Реальные секреты — **никогда** не в репо. Только `.env.example` с пустыми/демо-значениями.
- Если ключ утёк — ротировать на стороне провайдера (Google AI Studio / Groq Console / `openssl rand -hex 48` для JWT). Удаления коммита недостаточно.
- В прод никогда не включать `DEV_ADMIN_BYPASS=1`.

## Дополнительно

Личный знаниевый репо разработчика: [`m34959203/dev-base`](https://github.com/m34959203/dev-base) — там скилы, плейбуки и шаблоны, которыми оформлен этот репо.
