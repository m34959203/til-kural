# Тіл-құрал

[![CI](https://img.shields.io/github/actions/workflow/status/m34959203/til-kural/ci.yml?branch=master)](https://github.com/m34959203/til-kural/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20·%20Postgres%20·%20Groq-black)]()
[![AI](https://img.shields.io/badge/AI-Groq%20%2B%20Gemini%20fallback%20·%20бесплатно-success)]()
[![Coverage](https://img.shields.io/badge/ТЗ-24%2F24%20·%20100%25-brightgreen)](docs/TZ_CHECKLIST.md)

> AI-платформа для изучения казахского языка: A1→C2 CAT-тест, диалоги с
> наставниками (Абай / Байтұрсынұлы / Әуезов), фото-проверка рукописи,
> КАЗТЕСТ, геймификация. Двуязычная (kk/ru), с админкой и отложенной
> публикацией в Telegram.

## Проблема

В Казахстане казахский — государственный язык, но порог входа для русскоязычных взрослых высокий: учебники не адаптированы под уровень, тесты КАЗТЕСТ доступны только в платных центрах, нет инструмента, который проверяет рукописное письмо и объясняет ошибку через грамматическое правило. Учитель-наставник нужен 1-на-1, но это редкий и дорогой ресурс — особенно за пределами Алматы и Астаны.

## Решение

Цифровая платформа УМЦ «Тіл-құрал» (г. Сатпаев), которая делает всё то же, что делает живой методист, только в браузере и бесплатно для ученика:

- **AI-наставник** в стиле Абая / Байтұрсынұлы / Әуезова — отвечает на казахском с переводом, адаптирует регистр под уровень ученика
- **Адаптивный CAT-тест A1→C2** (branching по сложности, C2-сертификат достижим)
- **Диалоговый тренажёр** в трёх режимах: чат / голос (ASR + TTS) / **Live** через Gemini native-audio (WebSocket, speech-to-speech)
- **Фото-проверка рукописи** через Gemini Vision: OCR → анализ ошибок → объяснение правила → тренд грамотности
- **Геймификация** — XP/уровни/streak/квесты/лидерборд, разблокировка контента по CEFR-уровню
- **Админ-панель** для методиста: редактор статей (TipTap + AI-suggestions), отложенная публикация, авто-пост в Telegram

## Why этот стек

| Решение | Почему |
|---|---|
| **Next.js 16 (App Router, Turbopack)** | Server Components резко режут JS-bundle на public-страницах; edge-middleware на WebCrypto делает auth-gate без cold-start |
| **Groq как primary LLM** | Free-tier 14 400 RPD, 300 tok/s, json_schema поддерживается → счёт за чат/упражнения остаётся **$0**; при rate-limit auto-failover на Gemini |
| **Gemini 3.1 Flash TTS preview** | Единственная модель, которая поддерживает kk-KZ нативно (Edge TTS даёт казахский голос, но точность ниже для уроков языка) |
| **Postgres 16 + in-memory fallback** | На dev-машине поднимается без Docker за 0 секунд; на проде — реальные транзакции и индексы |
| **Zod 4 на клиенте и сервере** | Один источник схем для CRUD-форм и API-валидации — нельзя послать невалидные данные мимо UI |

Подробнее: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Demo

- **Live:** через cloudflared — актуальный URL в `NEXT_PUBLIC_APP_URL` (`.env.local`); production-домен ещё не зарегистрирован
- **Скриншоты:** ниже (полный набор в [`assets/`](assets/))

| Главная (kk, AI-наставник) | Каталог уроков с MentorTrack |
|---|---|
| ![home](assets/screenshot-home.png) | ![lessons](assets/screenshot-lessons.png) |

| Диалог (3 режима: Текст / Голос / 📡 Live) | Фото-проверка рукописи |
|---|---|
| ![dialog](assets/screenshot-dialog.png) | ![photo-check](assets/screenshot-photo-check.png) |

| КАЗТЕСТ практик (5 секций, 30 мин) | Геймификация (XP/streak/leaderboard) |
|---|---|
| ![kaztest](assets/screenshot-kaztest.png) | ![game](assets/screenshot-game.png) |

| Админ-дашборд (Top-N + Аналитика) | TipTap-редактор статей с AI |
|---|---|
| ![admin-dashboard](assets/screenshot-admin-dashboard.png) | ![admin-editor](assets/screenshot-admin-editor.png) |

## Архитектура

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│   Browser       │────▶│  Next.js 16 App (port 3015 prod /    │
│  (KK / RU)      │     │  3017 dev через Turbopack)           │
└─────────────────┘     └────┬─────────────────────────────────┘
                             │
        ┌────────────────────┼─────────────────────────────────┐
        │                    │                                 │
        ▼                    ▼                                 ▼
┌──────────────┐    ┌────────────────┐               ┌────────────────────┐
│  Postgres 16 │    │  Groq Cloud    │               │  Gemini API        │
│  (5442)      │    │  (chat / JSON) │               │  (Vision + TTS kk) │
│              │    │  primary       │               │  + LLM fallback    │
└──────────────┘    └────────────────┘               └────────────────────┘
                             │                                 │
                             ▼                                 ▼
                    ┌────────────────────┐         ┌────────────────────┐
                    │  Telegram Bot API  │         │  Web Push (VAPID)  │
                    │  (auto-post news/  │         │  + email fallback  │
                    │   events)          │         │  для streak        │
                    └────────────────────┘         └────────────────────┘
```

3 ключевых решения:

1. **Edge-middleware** (`src/middleware.ts`) — i18n routing + admin-gate (HS256 через WebCrypto) + security headers. Без Node.js runtime, отдаётся за миллисекунды.
2. **AI dispatcher** (`src/lib/gemini.ts`) — `chatWithAI()` маршрутизирует на Groq (если ключ есть и `LLM_PROVIDER=groq`), при `AIRateLimitError` уходит на Gemini. Vision (`analyzeImage`) и TTS остаются на Gemini.
3. **Auto-post** (`src/lib/auto-post.ts`) — fire-and-forget Telegram-публикация при переходе `news.status='published'` или `events.status='upcoming'`, двуязычный режим (kk + ru как два сообщения).

Подробнее: [NOTES.md](NOTES.md) — живой журнал решений, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — детали слоёв.

## Quick Start

### Минимально (in-memory fallback, без Postgres)

```bash
git clone https://github.com/m34959203/til-kural.git
cd til-kural
cp .env.example .env.local
# Заполнить минимум:
#   JWT_SECRET=$(openssl rand -hex 48)
#   GROQ_API_KEY=gsk_...   ← console.groq.com/keys (бесплатно)
#   LLM_PROVIDER=groq
npm install
npm run dev
# открыть http://localhost:3000/kk
```

Без AI-ключей приложение поднимется в demo-режиме (заглушки).

### С Postgres в Docker

```bash
docker compose up -d db                                # Postgres 16 на :5442
for f in sql/00*.sql; do
  docker exec -i til-kural-db-1 psql -U tilkural < "$f"
done
DATABASE_URL=postgresql://tilkural:tilkural_secret@localhost:5442/tilkural \
  TIL_ADMIN_EMAIL=admin@til-kural.kz \
  TIL_ADMIN_PASSWORD='ChangeMe2026!' \
  node scripts/seed-postgres.mjs                       # сиды контента + admin
npm run build && bash scripts/deploy-local.sh          # production standalone на :3015
```

Cron для отложенной публикации:

```cron
* * * * * curl -fsS -X POST https://til-kural.kz/api/cron/publish-scheduled \
  -H "Authorization: Bearer $CRON_SECRET" >/dev/null
```

Подробная инструкция и production-чеклист: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Стек

| Слой | Технология |
|---|---|
| **Frontend / Backend** | Next.js 16.2 (App Router, Turbopack), React 19, TypeScript 5, Tailwind 4 |
| **БД** | PostgreSQL 16 через `pg` (с in-memory fallback в dev) |
| **AI (chat / JSON)** | Groq (`llama-3.3-70b-versatile`, `openai/gpt-oss-120b`) с auto-failover на Gemini |
| **AI (Vision)** | Gemini 2.5 Flash Vision — фото-проверка рукописи |
| **AI (TTS / Live)** | Gemini 3.1 Flash TTS preview (kk-KZ), 2.5 Flash Native Audio (Live WebSocket) |
| **Auth** | bcryptjs + JWT HS256 (httpOnly cookie `tk-token`) + Edge-middleware admin-gate |
| **Editor** | TipTap 3 + StarterKit + Image/Link/TextAlign + AI-suggestions через Gemini |
| **Push** | Web Push (VAPID) + email fallback (nodemailer) |
| **PDF** | jsPDF + Noto Sans TTF (кириллица + KZ-специфика) |
| **Social** | Telegram Bot API (auto-post при публикации, двуязычно) |
| **Хостинг** | Hoster.kz (Plesk), cloudflared tunnel в dev |

## Roadmap

- [x] **Релиз 1** (Q2 2026) — 24/24 пунктов ТЗ закрыты, AI-стек на Groq, Telegram автопост, security-аудит P0/P1 закрыт
- [ ] **Q3 2026** — Контент уроков L3–L21, аудио-банк listening для КАЗТЕСТ, Reading-секция на казахском, daily missions + streak freeze
- [ ] **Q4 2026** — IRT-3PL CAT-движок, Sentry + cost-monitoring, Playwright E2E, Instagram автопост
- [ ] **2027** — Production-домен `til-kural.kz`, открытое REST API, mobile-app

Подробнее: [docs/PENDING_AUDIT_TASKS.md](docs/PENDING_AUDIT_TASKS.md).

## Документация

| | |
|---|---|
| [NOTES.md](NOTES.md) | Живой журнал решений (AI-провайдеры, автопостинг, история волн разработки) |
| [docs/TZ_CHECKLIST.md](docs/TZ_CHECKLIST.md) | 24 функциональных пункта ТЗ — статус каждого |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Устройство слоёв, edge-middleware, AI dispatcher |
| [docs/API.md](docs/API.md) | REST-эндпоинты |
| [docs/DATABASE.md](docs/DATABASE.md) | Таблицы, миграции |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Env, прод-чеклист, cron-задачи |
| [docs/GAMIFICATION.md](docs/GAMIFICATION.md) | XP / уровни / квесты / стрики / ачивки |
| [docs/CONTENT_AUDIT_2026-04-28.md](docs/CONTENT_AUDIT_2026-04-28.md) | Аудит грамматики/уроков/тестов |
| [docs/PROJECT_AUDIT_2026-04-28.md](docs/PROJECT_AUDIT_2026-04-28.md) | Технический аудит (83 находки) |
| [docs/PENDING_AUDIT_TASKS.md](docs/PENDING_AUDIT_TASKS.md) | Незакрытые задачи (контент + крупные техподсистемы) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setup, структура, стиль, коммиты |
| [CLAUDE.md](CLAUDE.md) | Краткая справка для AI-ассистентов |

## Команда

| | | |
|---|---|---|
| ![avatar](https://github.com/m34959203.png?size=80) | **Дмитрий М.** | Solo founder · TechnoKod AI · [@m34959203](https://github.com/m34959203) |

## Контакты

- Заказчик: КГУ «Учебно-методический центр «Тіл-құрал» (г. Сатпаев, БИН 241240033540)
- Goszakup: [карточка поставщика](https://www.goszakup.gov.kz/ru/registry/show_supplier/745311)
- Адрес: Ұлытау обл., г. Сатпаев, пр. Академика Каныша Сатпаева, 111
- Поддержка: см. [CONTRIBUTING.md](CONTRIBUTING.md)

## Лицензия

[MIT](LICENSE) © 2026 КГУ «УМЦ «Тіл-құрал».

Open-source зависимости: MIT / OFL (Noto Sans) / Apache 2.0 — см. [`package.json`](package.json).
