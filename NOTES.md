# Тіл-құрал — живой документ проекта

> Рабочие заметки для будущих сессий. Обновлять при каждом значимом изменении.
> Адрес кода: `/home/ubuntu/til-kural`, GitHub: `m34959203/til-kural` (PUBLIC).

## Обзор

Next.js 16.2 (App Router, Turbopack) + React 19 + TypeScript 5 + Tailwind 4.
Двуязычный сайт (kk/ru, kk — основной) учебно-методического центра «Тіл-құрал».
Стек AI — Google Gemini (2.5 Flash для текста/vision, 3.1 Flash TTS preview для казахского).

## Стек

- **БД:** Postgres 16 через `pg` (fallback in-memory если `DATABASE_URL` не задан).
  Схема: `sql/001_init.sql` + `sql/002_additions.sql` (media, push_subscriptions, расширения news/events/banners).
- **Auth:** JWT (bcryptjs + jsonwebtoken). Токены в localStorage на клиенте, `Bearer` в `authorization` заголовке.
- **TTS:** `gemini-3.1-flash-tts-preview` → raw PCM → обёрнут в WAV в `src/lib/tts.ts`.
  Web Speech API — fallback если `GEMINI_API_KEY` нет.
- **Push:** Web Push (VAPID), требует `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`.
  SW: `public/sw.js`. Opt-in UI: `<PushOptIn />`.
- **Email:** nodemailer, настройки `SMTP_HOST/PORT/USER/PASS/FROM`, получатель `CONTACT_TO`.
- **Аналитика:** GA4 + Яндекс.Метрика через компонент `src/components/layout/Analytics.tsx`, ID из `site_settings` (`ga_id`, `ym_id`). Только в production.
- **Карта:** 2GIS виджет (если указан `map_2gis_id`) или OpenStreetMap по `map_lat/map_lng`.

## Команды

```bash
npm run dev                 # dev-сервер (Turbopack)
npm run build               # production-сборка
npm run lint                # ESLint
docker compose up -d db     # Postgres 16 на 5432
docker compose up --build   # сборка + БД + app
```

## ENV (см. .env.local)

| Переменная                     | Зачем                                          |
|--------------------------------|------------------------------------------------|
| `DATABASE_URL`                 | Postgres connection string (без неё in-memory) |
| `JWT_SECRET`                   | Подпись JWT (обязательно в prod)               |
| `GEMINI_API_KEY`               | Gemini API (без неё AI в демо-режиме)          |
| `GEMINI_TTS_MODEL`             | По умолчанию `gemini-3.1-flash-tts-preview`    |
| `VAPID_PUBLIC_KEY` / `_PRIVATE_KEY` | Web Push (сгенерировать: `npx web-push generate-vapid-keys`) |
| `VAPID_CONTACT_EMAIL`          | `mailto:...` для VAPID                         |
| `SMTP_HOST/PORT/USER/PASS/FROM/SECURE` | Почта (nodemailer)                     |
| `CONTACT_TO`                   | Куда отправлять форму контактов                |
| `CRON_TOKEN`                   | Токен для `/api/cron/streak-reminder`          |
| `NEXT_PUBLIC_APP_URL`          | Канонический URL (для SEO/OG)                  |

## Архитектура

```
src/
├── app/
│   ├── layout.tsx                  # html/body, JSON-LD Organization, Analytics
│   ├── [locale]/
│   │   ├── layout.tsx              # generateMetadata, валидация локали
│   │   ├── (public)/...            # сайт
│   │   └── (admin)/admin/...       # админка
│   ├── api/
│   │   ├── auth/                   # login/register/me
│   │   ├── news/[id]?              # полный CRUD
│   │   ├── events/[id]?            # полный CRUD
│   │   ├── lessons/[id]?           # полный CRUD
│   │   ├── banners/[id]?           # полный CRUD
│   │   ├── admin/settings          # GET/PUT site_settings
│   │   ├── upload/[id]?            # медиатека
│   │   ├── push/subscribe          # Web Push
│   │   ├── cron/streak-reminder    # POST с X-CRON-TOKEN
│   │   ├── learn/chat|tts|exercises|check-writing
│   │   ├── photo-check             # Gemini Vision OCR
│   │   ├── game/leaderboard|progress|quests
│   │   └── test/evaluate|certificate|questions
│   ├── robots.ts / sitemap.ts / manifest.ts
├── components/
│   ├── features/                   # 22 функц. компонента
│   ├── layout/ (Header, Footer, MobileNav, AdminSidebar, Analytics)
│   └── ui/
├── lib/
│   ├── db.ts                       # Postgres (pg) или in-memory
│   ├── seo.ts                      # buildMetadata, JSON-LD helpers
│   ├── settings.ts                 # site_settings + getMenuItems + кеш TTL
│   ├── rate-limit.ts               # token bucket
│   ├── api.ts                      # requireAdminApi, apiError, slugify
│   ├── auth.ts                     # JWT helpers
│   ├── gemini.ts + gemini-vision.ts + tts.ts
│   ├── push.ts                     # sendPushToUser + sendEmail
│   ├── gamification.ts
│   ├── kazakh-rules.ts
│   ├── pdf-certificate.ts
│   ├── i18n.ts                     # locales, getMessages, t()
│   └── validators.ts
├── messages/ (kk.json, ru.json)
└── middleware.ts                   # i18n routing + rate-limit + security headers
```

## CMS: какими правами что управляется

Все CRUD требуют `admin`/`editor`/`moderator` роли в JWT. Проверка — `requireAdminApi()`.
Админ-навигация: `Сабақтар → Тесттер → Жаңалықтар → Іс-шаралар → Пайдаланушылар → Аналитика → Баннерлер → Медиатека → Баптаулар`.

### Что хранится в `site_settings`

`ga_id`, `ym_id`, `contact_phone|email|address_kk|address_ru`, `map_lat`, `map_lng`, `map_2gis_id`, `social_instagram|facebook|telegram`, `menu_json` (JSON для пользовательского меню в Header).

## Rate-limit

Middleware применяет token-bucket по IP:

| Путь                    | Лимит   |
|-------------------------|---------|
| `/api/auth/login|register` | 10/мин |
| `/api/photo-check`      | 15/мин  |
| `/api/learn/tts`        | 30/мин  |
| `/api/learn/*`          | 40/мин  |
| `/api/upload`           | 20/мин  |
| `/api/push/*`           | 10/мин  |

Для multi-instance — заменить на Redis (`src/lib/rate-limit.ts`).

## SEO

- `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts` — нативные Next.js.
- `buildMetadata()` в `src/lib/seo.ts` — генерит OG/Twitter/hreflang/canonical.
- JSON-LD: `organizationJsonLd` в root, `newsArticleJsonLd` на `/news/[slug]`, `eventJsonLd[]` на `/events`.

## Известные ограничения / TODO

- [ ] **Cron на streak-reminder** — надо настроить внешний планировщик (GitHub Actions cron, либо `/api/cron/streak-reminder` POST c токеном из Cloudflare Workers).
- [ ] **Админ-UI для news/events/lessons/banners** — API готов (CRUD), но формы в `src/app/[locale]/(admin)/admin/*/page.tsx` могут быть заглушками. Проверять при доработке.
- [ ] **Capthca** на `/api/contact` и `/api/auth/register` — сейчас только rate-limit.
- [ ] **Image optimization** — `<img>` вместо `<Image />`, добавить next/image где уместно.
- [ ] **Cookie-based auth** — сейчас токен в localStorage, для SSR-защищённых роутов стоит перейти на httpOnly cookie.
- [ ] **E2E тесты** — отсутствуют.

## Деплой

- Docker: `docker-compose.yml` поднимает Postgres + app на 3000.
- Plesk/Cloudflare: см. общую memory `feedback_zhezu_deploy.md` если будем деплоить под `*.zhezu.kz` или Hoster.kz.
- GitHub Pages НЕ подходит (server routes есть).

## КАЗТЕСТ — scoring

`src/lib/kaztest-score.ts` — веса секций: L20 / R20 / G25 / V15 / W20.
Пороги уровня: C1 ≥ 90, B2 ≥ 75, B1 ≥ 60, A2 ≥ 45, A1 ≥ 30, иначе FAIL.
Sampling `buildQuestions()` берёт стратифицированно: 4L/4R/6G/4V/2W = 20.

## Уроки ↔ Правила

`src/data/lessons-meta.ts` — каталог из 10 уроков с `rule_ids[]`, маппинг на `kazakh-grammar-rules.json` (21 правило). Страница `/learn/lessons/[id]` показывает связанные правила с deep-link `/learn/basics#rule_XX`.

## Adaptive recommender

Глобальный движок слабых тем: `src/lib/adaptive-recommender.ts` (weakness_score = 100 − avg% + decay 1.5/день, новая тема = 55). Таблица `user_topic_stats` (sql/003_topic_stats.sql, уникальность по user_id+topic_slug) апсертится из `POST /api/test/evaluate` после JWT-аутентификации. `GET /api/recommend/next` отдаёт топ-3 слабых тем + `nextAction` с маппингом на `/learn/lessons/:id`, `/test/topics/:slug` или `/learn/basics#rule_XX`. UI — блок «Сізге ұсынамыз / Рекомендуем вам» на `/learn` (`src/components/features/RecommendedTopics.tsx`) перед AITeacher; незалогиненным показывается приглашение на тест уровня.

## Адаптивный входной тест (CAT) — A1→C2

Движок: `src/lib/cat-engine.ts` (stateless). Вся история ответов передаётся клиентом на каждый запрос.
- Старт: B1. Переход X→X+1 после 2 правильных подряд на X; X→X-1 после 2 неправильных подряд.
- Длина: 10–15 вопросов; досрочный стоп при стабилизации 6 последних ответов на одном уровне.
- Финал: mode уровней последних 4 правильных. Если ≥3 правильных C2 — итог C2 (сертификат C2 достижим).
- API: `POST /api/test/next-question` → `{done, question?, currentLevel, progress}`; `POST /api/test/evaluate { mode:'adaptive', answered:[{questionId,correct,difficulty}] }` → итоговый `level`+`score`.
- Банк: в `src/data/test-questions-bank.json` минимум по 8 level-вопросов на каждый уровень A1/A2/B1/B2/C1/C2.
- UI: `src/components/features/LevelTest.tsx` — динамическое дерево, индикатор «текущий уровень» и progress bar «N / 15».

## История существенных изменений

- **2026-04-21** — Адаптивный CAT-входной тест A1-C2 с branching по сложности: `cat-engine.ts`, `/api/test/next-question`, режим `adaptive` в `/api/test/evaluate`, переписанный `LevelTest.tsx` (динамические вопросы + live current level). Банк пополнен до 8+ level-вопросов на уровень. Сертификат C2 достижим при 3+ правильных C2.
- **2026-04-19 (вторая сессия)** — КАЗТЕСТ 100-балльная шкала с секциями и разбором ошибок, банк вопросов 5 → 40, раздел `/learn/basics` (21 правило грамматики), каталог уроков с привязкой к правилам.
- **2026-04-19** — Большой рефакторинг (Opus 4.7): Postgres-слой, rate-limit, SEO (sitemap/robots/JSON-LD), полный админ-CRUD (news/events/lessons/banners/settings), медиатека с реальным сохранением файлов, Gemini TTS (kk), GA4+Метрика, 2GIS/OSM карта, Web Push + email-reminders, динамическое меню из `site_settings`. Аудит до ≈ 92%.
- **≤ 2026-04-06** — базовая платформа: i18n, AI-teacher, тесты (входной/тематические/КАЗТЕСТ), PDF-сертификаты, фото-проверка (Vision), геймификация (аватары, квесты, уровни, стрики, лидерборд).
