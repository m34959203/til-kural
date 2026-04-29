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

- **2026-04-29** — Закрыты все P0/P1 находки `docs/PROJECT_AUDIT_2026-04-28.md` (15 P0 + 38 P1):
  **Безопасность:**
  - JWT_SECRET ротирован (`openssl rand -hex 64` → `.env.local`).
  - CSRF Origin/Referer-чек в `requireAdminApi` для всех мутирующих запросов; safelist через `NEXT_PUBLIC_APP_URL` + host.
  - PUT `/api/admin/users/:id` теперь sanitize'ит response (без `password_hash`); защита от self-delete / self-demote / удаления «последнего» admin'а.
  - `/api/upload` → admin-only (`requireAdminApi`); SVG исключён (XSS); MAX_FILE_SIZE читается из env.
  - Rate-limit добавлен на `/api/admin/*` (60/min), photo-check для anon ужесточён до 5/min.
  - Register теперь ставит httpOnly cookie `tk-token` (как login), middleware больше не отбрасывает свежезарегистрированного admin/editor на `/login`.
  **Сломанный продуктовый flow:**
  - Кнопка `<MarkComplete />` в `/learn/lessons/[id]`; AdaptiveExercise при finish автоматически вызывает `/api/lessons/:id/complete` со score → XP/streak/achievements.
  - `/game` — реальные XP/level/streak из `/api/profile/stats`; rank — из `/api/game/leaderboard`.
  - `/game/achievements` — earned-коды из нового `/api/profile/achievements` (читает `user_achievements`).
  - `/game/quests` — `started`/`progress` из `/api/game/quests` (поле `userQuests`).
  - `/test/results` (`TestResults.tsx`) — данные из `/api/profile/stats.recent.tests`.
  - `/admin/settings` setSetting → `INSERT … ON CONFLICT (key) DO UPDATE`; убран паразитный `id`-инсерт.
  - `/api/lessons/{bad-id}` теперь 404, а не 500 (Postgres error 22P02 ловится в `db.query/update/delete`); добавлен helper `isUuid`.
  - Hero убрал «50K+ Білімалушы»: статистика теперь честные «0₸ / 21 правило / A1→C2».
  **Retention loop:**
  - `<PushOptIn />` подключён в `/profile` (новый блок «Хабарландырулар»); ENV-плейсхолдеры для VAPID/SMTP/CRON_TOKEN.
  - В `docs/DEPLOYMENT.md` — гайд по `production-домен`, GitHub Actions cron, VAPID.
  - Forgot-password flow: `/api/auth/forgot-password`, `/api/auth/reset-password`, страницы `/{kk,ru}/forgot-password` и `/reset-password`. SQL миграция `008_password_resets.sql` (применена к til-kural-db-1).
  **Контент:**
  - `sql/006_content_seeds.sql` регенерирован из живой БД (`bash scripts/regenerate-content-seeds.sh`); 146 INSERT'ов с ON CONFLICT DO NOTHING.
  - `loadNews(slug)` фильтрует по `status='published'`; черновики/архив для публики → 404.
  - Сертификат `/test/certificate/[id]` теперь проверяет cert по `certificates`; `/anything` → 404 (раньше рендерил «valid-looking» PDF).
  - speechSynthesis fallback удалён из `DialogTrainer` и `PronunciationPractice` (нарушал memory-правило `feedback_no_browser_tts.md`).
  - ThematicTest на финиш постит результат в `/api/test/evaluate?mode=thematic` → XP/streak.
  - DialogTrainer на «Сменить тему» вызывает `/api/dialog/finish` (XP при ≥4 turn'ах юзера).
  - Lesson #5 (Дүкенде сатып алу) `required_level: B1 → A2` (auezov-track теперь A1→A2→B1→B2 без скачка).
  **Профиль:**
  - `MentorTrack` сохраняет выбор через PUT `/api/profile/mentor` (новый endpoint).
  - `WritingChecker` использует фактический `user.language_level` вместо hardcoded 'B1'.
  - Profile подгружает `completedLessonIds` из `/api/profile/lessons` для MentorTrack.
  - DELETE `/api/profile/me` — анонимизация по политике (email→`deleted-{id}@…`, чистка push subs).
  **Privacy / GDPR-style:**
  - `<CookieConsent />` подключён в `[locale]/layout.tsx`; `<Analytics />` грузит GA4/YM ТОЛЬКО после `data-cc="accepted"` на `<html>`.
  **Админ CRUD:**
  - `/admin/lessons` форма: добавлены `required_level`, `mentor_track`, `rule_ids`, `content`.
  - `slugify()` транслитерирует кириллицу (включая kk-специфику ә/ғ/қ/ң/ө/ұ/ү/і) → URL-friendly slug.
  - `/api/admin/settings` валидирует `menu_json` (must be JSON array of objects with `href: string`).
  - `/api/tests` POST — проверка `correct_answer ∈ options` (нерешаемые вопросы → 400).
  **UX/UI:**
  - Footer соц-иконы — реальные ссылки из `site_settings.social_*` (если пусто, блок не рендерится).
  - Skip-to-content link для a11y.
  - Header/MobileNav breakpoint выровнены на `lg:hidden` (раньше Header lg, MobileNav xl — между 1024-1280px меню было «в DOM, но недоступно»).
  **DB-слой:**
  - `db.query/update/delete` в Postgres-режиме ловят `22P02` (invalid_text_representation) → возвращают пустой результат вместо throw, что превращает «GET /api/lessons/bad-id» из 500 в 404 для всех `[id]`-роутов разом.
  - ✅ `npm run build` прошёл; smoke-тесты на :3015: bad-uuid → 404, home → 200, forgot-password → 200, CSRF без Origin → 403, upload anon → 401, news draft → 404.
  - ⚠️ Lint выдаёт 21 ошибку «set-state-in-effect» / «refs-during-render» — это новое правило `next/typescript`, попадает и на старый код (analytics, resizable-image и т.п.). Не блокирует build, разбираться отдельно.
- **2026-04-28 (вечер 2)** — Применены P0+P1+P2 правки контентного аудита (см. `docs/CONTENT_AUDIT_2026-04-28.md`):
  - **Грамматические правила** (`src/data/kazakh-grammar-rules.json` + `src/data/seeds/grammar-rules.json` + БД через UPDATE по id): rule_02, 05, 06, 07, 08, 09, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21 — переписаны/уточнены. Все 21 правил синхронизированы.
  - **Уроки** (`src/data/lessons-meta.ts` + БД UPDATE по sort_order): Lesson 1, 5, 8, 9, 15, 17, 18, 19, 20 — описания и переводы исправлены.
  - **MENTOR_META**: name_ru транслитерированы (`Байтұрсынұлы` → `Байтурсынулы`, `Әуезов` → `Ауэзов`).
  - **Тесты** (`src/data/test-questions-bank.json` + БД UPDATE по question_kk LIKE): 13 правок — q002 (объяснение арабизм), q008 (-ім опции), q009 (термин), q016 (RU калька), q032 (кеңшілік→аумақ), q039 (бірлесе→бірден), q040 (-ты-→-ні), q046 (H₂O), kz091/kz111 (термин), kz101 (қанша→неше), kz102 (формулировка), kz108 (аталады→тойланады), kz118 (-п→-ыз).
  - ✅ Build + restart + smoke: API `/api/grammar-rules` возвращает свежие данные (rule_18 examples с `таң`, rule_21 topic `Мақал-мәтелдер`); БД обновлена. Всего применено 17 правил + 21 урок (через DB UPDATE) + 13 тестов = **51 правка**.
  - ⚠️ `sql/006_content_seeds.sql` остаётся со СТАРЫМИ значениями — на свежей БД этот seed засеит устаревший контент. TODO: регенерировать 006 из текущих JSON/TS перед deploy на новую среду.
- **2026-04-28 (вечер)** — В `/admin/editor` добавлена возможность удалять статьи:
  - `src/components/admin/DeleteArticleButton.tsx` — клиентский компонент с confirm() + DELETE через `/api/news/[id]`. Bearer-токен берёт из `localStorage.token`, плюс `credentials:'include'` для cookie-fallback.
  - Подключён в список (`editor/page.tsx`, рядом с "Редактировать") и в форму редактирования (`editor/[id]/page.tsx`, кнопка вверху справа, после удаления редирект на список).
  - Smoke: DELETE без auth → 401, с Bearer → 200, запись удалена из БД, страница списка рендерится 200.
- **2026-04-28** — Server-side gamification engine (XP/streak/level/achievements):
  - `src/lib/award-progress.ts` — единая транзакционная точка начисления; perfect-bonus при score≥90; streak milestones 7/30/100; пересчёт level.
  - `sql/099_seed_achievements.sql` — каталог 13 ачивок (idempotent ON CONFLICT по code). Применён к til-kural-db-1.
  - Интеграция в endpoints: `/api/test/evaluate` (adaptive + legacy ветви), `/api/learn/check-writing`, `/api/photo-check`, новый `POST /api/lessons/[id]/complete` (idempotent upsert score/weak_points + awardProgress).
  - Все вызовы awardProgress обёрнуты в try/catch, чтобы провал начисления не валил основной ответ endpoint-а.
  - Admin password reset: `admin@til-kural.kz / Admin#TilKural2026`.
  - ⚠️ Ловушка: `weak_points` jsonb — node-pg сериализует JS-массив как PG array literal `{...}`. В route.ts передаём `JSON.stringify(weakPoints)`. Та же ловушка возможна в любых будущих jsonb-инсёртах через `db.insert`.
  - ✅ Build + E2E smoke прошли (admin@til-kural.kz): первый POST `/api/lessons/:id/complete` со score=95 → XP +75 (50+25 perfect-bonus), streak=1, ачивка `first_lesson` выдана. Повторный POST с тем же lesson_id → `progress: null`, xp не задублирован, но score/weak_points обновлены.
- **2026-04-21** — Адаптивный CAT-входной тест A1-C2 с branching по сложности: `cat-engine.ts`, `/api/test/next-question`, режим `adaptive` в `/api/test/evaluate`, переписанный `LevelTest.tsx` (динамические вопросы + live current level). Банк пополнен до 8+ level-вопросов на уровень. Сертификат C2 достижим при 3+ правильных C2.
- **2026-04-19 (вторая сессия)** — КАЗТЕСТ 100-балльная шкала с секциями и разбором ошибок, банк вопросов 5 → 40, раздел `/learn/basics` (21 правило грамматики), каталог уроков с привязкой к правилам.
- **2026-04-19** — Большой рефакторинг (Opus 4.7): Postgres-слой, rate-limit, SEO (sitemap/robots/JSON-LD), полный админ-CRUD (news/events/lessons/banners/settings), медиатека с реальным сохранением файлов, Gemini TTS (kk), GA4+Метрика, 2GIS/OSM карта, Web Push + email-reminders, динамическое меню из `site_settings`. Аудит до ≈ 92%.
- **≤ 2026-04-06** — базовая платформа: i18n, AI-teacher, тесты (входной/тематические/КАЗТЕСТ), PDF-сертификаты, фото-проверка (Vision), геймификация (аватары, квесты, уровни, стрики, лидерборд).
