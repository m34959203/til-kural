# Тіл-құрал

**Двуязычный сайт учебно-методического центра «Тіл-құрал» (г. Сатпаев, Казахстан)** с AI-инструментами для изучения казахского языка.

> КГУ «Учебно-методический центр «Тіл-құрал» · БИН 241240033540 · Ұлытау обл., г. Сатпаев, пр. Академика Каныша Сатпаева, 111 · [Goszakup карточка](https://www.goszakup.gov.kz/ru/registry/show_supplier/745311)

## Покрытие ТЗ

**100% (24/24 функциональных пункта).** Живой чек-лист: [docs/TZ_CHECKLIST.md](./docs/TZ_CHECKLIST.md).

## Ключевой функционал

### 🎓 Обучение
- **Адаптивный CAT-тест** уровня A1–C2 (branching по сложности, C2 достижим)
- **Диалоговый тренажёр** с 3 наставниками (Абай / Байтұрсынұлы / Әуезов) в 3 режимах:
  - Текст-чат · Голос (ASR + TTS) · **Live** — WebSocket через Gemini native-audio
- **21 урок** A1–B2 с привязкой к правилам грамматики и наставникам (mentor_track)
- **КАЗТЕСТ** — 30 мин, 100 баллов, 5 секций (L/R/G/V/W)
- **Тесты по темам** + результаты с детальной аналитикой
- **Фото-проверка** рукописи через Gemini Vision: OCR → грамматика → объяснения правил → тренд грамотности

### 🎮 Геймификация
- 6 квестов с прогрессом · XP · 11 уровней «Бастаушы → Дана» · разблокировка контента по уровню
- Streak 7/30/100 дней + Push (VAPID) + email-fallback
- 13 именных бейджей · живой лидерборд · шеринг в соцсети (Web Share + OG-image)
- Адаптивная сложность упражнений (weakness_score + recommend/next)

### ⚙️ Админ-панель (14 разделов, lucide-иконки)
- **Обзор:** Дашборд (+ Top-N), Аналитика (time-series 7/30/90 дней)
- **Контент:** Уроки, Тесты, Грамматика, **Редактор статей (TipTap + KK/RU + AI-анализ)**, Новости, События, Баннеры, Медиатека (drag-drop), Отделы, Сотрудники, Правила-документы, История
- **Сообщество:** Пользователи (создание, сброс пароля, роли)
- **Система:** Настройки сайта
- Общие фичи: Zod-валидация, Markdown-preview, серверная пагинация+поиск, запланированная публикация (cron)

### 🔐 Auth
- JWT + httpOnly cookie `tk-token` · middleware-гейт на `/admin/*`
- Роли: `user` / `editor` / `moderator` / `admin`
- `/login`, `/register`, сброс пароля через админку
- Условное меню в шапке: гость («Войти»+«Начать обучение») / юзер («Личный кабинет»+«Начать обучение») / админ («Личный кабинет»+«Админ-панель»)

### 🎨 Редактор статей (TipTap + AI)
- WYSIWYG: B/I/U/H1-H3/lists/quote/code/link/image/align/undo
- Табы **KK/RU** для title/excerpt/content, общие поля (slug, cover, status, scheduled_at)
- **AI-анализ** через Gemini: score 0–100, suggestions (low/medium/high), strengths, «Применить улучшение» для заголовка/excerpt
- **Autosave** в localStorage каждые 30 секунд

---

## Стек

| Слой | Технология |
|---|---|
| Frontend | Next.js 16.2 (App Router, Turbopack), React 19, TypeScript 5, Tailwind 4 |
| Backend | Route Handlers + Middleware (Edge HS256-verify через WebCrypto) |
| БД | PostgreSQL 16 через `pg` (fallback in-memory при отсутствии `DATABASE_URL`) |
| AI | Gemini 2.5 Flash (text + Vision), 3.1 Flash TTS (kk-KZ), 2.5 Flash Native Audio (Live) |
| Auth | bcryptjs + jsonwebtoken |
| Validation | Zod 4 (client + server через общий `SCHEMAS[apiPath]`) |
| Editor | TipTap 2 + StarterKit + Image/Link/Placeholder/TextAlign/Underline + resizable-image/video |
| PDF | jsPDF + Noto Sans TTF (regular + bold) для кириллицы |
| Icons | lucide-react |
| Push | Web Push (VAPID) + email fallback (nodemailer) |
| Charts | SVG без библиотек (TimeSeries, Literacy trend, TopN horizontal bars) |

## AI-модели и голоса наставников

| Модель | Использование |
|---|---|
| `gemini-2.5-flash` | Чат, анализ ошибок, объяснение правил, AI-анализ статей |
| `gemini-2.5-flash` Vision | Фото-проверка рукописи (OCR + grammar) |
| `gemini-3.1-flash-tts-preview` | Казахский TTS — **единственная модель с поддержкой kk-KZ** |
| `gemini-2.5-flash-native-audio-preview-12-2025` | Live-режим (WebSocket, speech-to-speech) |

| Наставник | Стиль | Голос TTS |
|---|---|---|
| Абай Құнанбайұлы | Философский, афоризмы | `Charon` |
| Ахмет Байтұрсынұлы | Точный, педагогический | `Kore` |
| Мұхтар Әуезов | Тёплый, образный | `Fenrir` |

---

## Быстрый старт

### С Postgres в Docker

```bash
git clone https://github.com/m34959203/til-kural.git
cd til-kural
npm install

# Postgres
docker compose up -d db
# Миграции (однократно, если БД пуста — 001 применится из entrypoint-initdb.d)
for f in sql/002_*.sql sql/003_*.sql sql/004_*.sql sql/005_*.sql sql/006_*.sql sql/007_*.sql; do
  docker exec -i til-kural-db-1 psql -U tilkural < "$f"
done

# .env.local
cat > .env.local <<EOF
DATABASE_URL=postgresql://tilkural:tilkural_secret@localhost:5442/tilkural
JWT_SECRET=change-me
GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_APP_URL=http://localhost:3015
NEXT_PUBLIC_DEFAULT_LOCALE=kk
CRON_SECRET=change-me
# DEV only (не включать в prod):
DEV_ADMIN_BYPASS=1
EOF

# Сиды контента + первый admin
DATABASE_URL=postgresql://tilkural:tilkural_secret@localhost:5442/tilkural \
  TIL_ADMIN_EMAIL=admin@til-kural.kz \
  TIL_ADMIN_PASSWORD='ChangeMe2026!' \
  node scripts/seed-postgres.mjs

# Dev
npm run dev
# ИЛИ production standalone
npm run build && bash scripts/deploy-local.sh
```

Открыть `http://localhost:3015/ru` (или `:3000` в dev-режиме).

### Cron для запланированной публикации

```bash
* * * * * curl -X POST https://til-kural.kz/api/cron/publish-scheduled \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Структура

```
src/
  app/
    [locale]/
      (public)/          # публичные страницы (kk/ru)
      (admin)/admin/     # 14 админ-разделов
    api/                 # REST API (auth, admin/*, ai/*, cron/*, learn/*, test/*, game/*, ...)
  components/
    admin/               # EntityCrudTable, RichTextEditor, BilingualArticleForm,
                         # AISuggestionsPanel, AnalyticsDashboard, UserManagement, ...
    features/            # DialogTrainer, LiveVoiceDialog, PhotoChecker, KaztestPractice,
                         # LevelTest, CertificateView, MentorTrack, ...
    layout/              # Header, Footer, MobileNav, AdminSidebar, UserMenu
    ui/                  # Button, Card, Input, LevelBadge, Progress
  data/                  # lessons-meta.ts, test-questions-bank.json,
                         # kazakh-grammar-rules.json, quest-templates.json, seeds/*
  lib/                   # db, auth, api, seo, validators, mentors, gamification,
                         # adaptive-recommender, cat-engine, tts, gemini,
                         # pdf-certificate, audio/pcm, level-gate, ...
  hooks/                 # useCurrentUser, useAutosave
sql/                     # 001..007 — миграции
docs/                    # ARCHITECTURE, API, DATABASE, DEPLOYMENT, TZ_CHECKLIST, audit
scripts/
  deploy-local.sh        # build + симлинки + restart на :3015
  seed-postgres.mjs      # сиды + первый admin
  create-admin.mjs       # standalone admin-юзер
  prep-pdf-fonts.sh      # Noto Sans TTF через jsdelivr
```

---

## Итерации разработки

Проект прошёл 6 волн параллельной разработки через sub-agents:

1. **Волна 1** (5 агентов) — базовый AI-функционал, Live-диалог, профиль
2. **Волна 2** (5 агентов) — интеграции, UI polish, auth infrastructure
3. **Волна 3** (4 агента) — фиксы из ручного аудита: CMS↔public, фото/видео, JSON-LD, baseUrl, PDF кириллица, /learn/exercises
4. **Волна 4** (5 агентов) — Content migration → БД, Grammar CRUD, Admin auth+cookie, Media+Analytics, EntityCrudTable UX
5. **Волна 5** (3 агента) — миграции из smart-library-cbs: Top-N, server-side pagination, scheduled publishing
6. **Волна 6** (3 агента) — миграции из AIMAK: TipTap RichTextEditor, BilingualArticleForm, AI suggestions + useAutosave

Детали в [docs/TZ_CHECKLIST.md](./docs/TZ_CHECKLIST.md) и [NOTES.md](./NOTES.md).

---

## Лицензия

Собственность КГУ «УМЦ «Тіл-құрал» (г. Сатпаев).

Open-source зависимости: MIT / OFL (Noto Sans) / Apache 2.0 — см. `package.json`.
