# til-kural — сводный аудит 2026-04-28

3 параллельных аудита (User / Admin / Product Owner). Ниже — дедуплицированные находки, сгруппированные по тяжести и теме. Многие проблемы фигурировали у двух-трёх агентов одновременно.

---

## P0 — БЛОКИРУЕТ ПРОДАКШН / СЛОМАН ОСНОВНОЙ ФУНКЦИОНАЛ

### Безопасность (4 пункта)

1. **JWT_SECRET = `"til-kural-dev-jwt-secret-change-in-prod"`** — `.env.local:4`. Любой имеющий репо минтит admin-токены. **Перед прод-деплоем обязательно ротировать** (`openssl rand -hex 64`), все сессии инвалидируются.

2. **CSRF не защищён.** Cross-origin POST с cookie-токеном **успешно создал banner** в curl-проверке. SameSite=Lax не блокирует top-level POST во всех браузерных версиях. Фикс: в `requireAdminApi` (src/lib/api.ts:4) проверять Origin/Referer для не-GET, или ввести double-submit CSRF-токен.

3. **PUT `/api/admin/users/:id` возвращает `password_hash`** в JSON-ответе. GET-list санитайзит, PUT — нет (`src/app/api/admin/users/[id]/route.ts:20`). Фикс: `sanitize(user)` на выходе.

4. **`/api/upload` принимает любого залогиненного юзера** (не только admin/editor) + SVG разрешён в whitelist (XSS-вектор) + MAX_FILE_SIZE=10MB из env игнорируется (вшит 15MB). Фикс: `requireAdminApi`, выкинуть `image/svg+xml`, читать env.

### Сломан основной продуктовый флоу (5 пунктов)

5. **Уроки нельзя завершить из UI.** `POST /api/lessons/:id/complete` (созданный вчера) **никем не вызывается** — нет кнопки "завершить" на странице урока. Все юзеры навсегда `lessons_completed=0`, XP/streak/ачивок от уроков не получают. Фикс: добавить `<MarkComplete />` в LessonPage / AdaptiveExercise finish handler.

6. **`/game` страница показывает hardcoded XP=1250, level=4, streak=12, rank=#7.** Real data игнорируется (`src/app/[locale]/(public)/game/page.tsx:19-32`). Реальный admin (xp=75, streak=1) видит фейковые цифры. Фикс: подтянуть `/api/profile/stats` + `/api/game/leaderboard`.

7. **`/game/achievements` hardcoded `earned = ['first_lesson','streak_7','polyglot']`** для всех. Новый юзер видит 3 фейковых "earned". Игнорирует реальную таблицу `user_achievements`. Фикс: server-fetch user-specific badges.

8. **`/game/quests` hardcoded started/progress по индексу** (`page.tsx:21-22`: started={idx<2}, progress 57/23/0). Endpoint `/api/game/quests` есть, но не используется.

9. **`/test/results` показывает фейковые demo-данные** (4 теста с датами 2026-04-01, 03-28, 03-25, 03-20 baked in `TestResults.tsx:11-16`). Все юзеры видят одни и те же фейковые "ҚАЗТЕСТ 72%".

### Сломанные админ-сценарии (2 пункта)

10. **`/admin/settings` физически не работает.** `setSetting()` пытается INSERT'ить колонку `id`, которой нет в схеме `site_settings` → все PUT дают **500**. Админ не может править контакты, GA, меню, ничего. Фикс: убрать `id` из insert, использовать `INSERT ... ON CONFLICT (key) DO UPDATE`.

11. **`/api/lessons/{bad-id}` возвращает 500 вместо 404.** Postgres падает при касте non-UUID к UUID-колонке. Фикс: валидация UUID-shape, возвращать 404.

### Контент / маркетинг (3 пункта)

12. **Hero показывает `50K+ Білімалушы`** на лендинге (`page.tsx:322`). Продукт не запущен на эфемерном trycloudflare-URL. Это **выдуманная метрика**, репутационный/правовой риск для гос-УМЦ.

13. **Production URL — trycloudflare** (`pittsburgh-enemies-decorative-changing.trycloudflare.com`). Все canonicals/OG/sitemap указывают на эфемерный хост, ротируется → Google не индексирует, OG-карточки сломаются.

14. **`sql/006_content_seeds.sql` устарел.** На свежей БД зальёт старый контент со вчерашними P0-ошибками (`жаң`, `Макал`, кальки пословиц и т.д.). Регрессия-бомба.

### Retention loop полностью мёртв (1 пункт)

15. **Push opt-in / email reminders / cron — всё неподключено.** PushOptIn компонент написан, но не импортирован ни на одной странице. VAPID/CRON_TOKEN/SMTP в `.env.local` пустые. `/api/cron/streak-reminder` существует, но никто не вызывает (нет scheduler). Streak-петля даркнет.

### Recovery (1 пункт)

16. **Нет восстановления пароля.** Залогинился — забыл — забанен навсегда. Нет ссылки `Құпиясөзді ұмыттыңыз ба?`, нет `/api/auth/forgot-password`, нет токенов на reset.

---

## P1 — СУЩЕСТВЕННЫЕ ПРОБЛЕМЫ (но не блокаторы)

### Безопасность / privacy

- **Rate-limit отсутствует на `/api/admin/*`** (60 GET'ов прошли подряд). Только public endpoints под rate-limit.
- **Админ может удалить себя или понизить себе роль** → lock-out риск. В DELETE/PUT добавить `if id===auth.id reject`. Также защитить "последнего admin".
- **Нет cookie-consent banner** + GA4 + Yandex.Metrica загружаются безусловно. Нарушение KZ-закона о ПДн.
- **Privacy-policy обещает right-to-delete, но `DELETE /api/profile/me` не существует.**
- **Photo-check без rate-limit для anon** → можно жечь Gemini Vision API.
- **Register не ставит httpOnly cookie** (login ставит, register нет — `src/app/api/auth/register/route.ts:36`). Только что зарегистрированный admin/editor отбрасывается middleware на `/login`.

### Сломанные демо-данные / hardcode

- **Profile `completedLessonIds={[]}` hardcoded** (`profile/page.tsx:276`). MentorTrack никогда не показывает урок как пройденный.
- **WritingChecker hardcoded `level: 'B1'`** независимо от реального уровня юзера.
- **Mentor selection не сохраняется на сервер** — клик меняет только React state, refresh откатывает.

### Контент

- **Уроки не имеют тела.** Только title + description + linked rule + AdaptiveExercise. Нет theory/dialogue/audio/video. У 4 уроков `rule_ids: []` — вообще пусто.
- **`speechSynthesis` все ещё в `PronunciationPractice.tsx` и `DialogTrainer.tsx`** как fallback. Нарушает твоё memory-правило (KK на browser-TTS не звучит).
- **C2 имеет только 8 вопросов** при заявленном "сертификат C2 достижим". Юзер выучит банк за сессию.
- **Thematic тесты для B1+ отсутствуют** (только A1+A2 с 1-2 вопросов на тему). Юзер кликает «Тамақ», получает один вопрос → "результат" 100%/0%.
- **Thematic тест не сохраняет результат** (`ThematicTest.tsx:32-50` finished branch не POST'ит). XP не начисляется.
- **Lesson и Live-dialog не дают XP** — самое ценное действие даёт 0 поинтов.
- **Draft news публично доступны** по slug — `loadNews` не фильтрует `status='published'`. Confirmed: `/kk/news/draft-slug` 200 с пустым body.
- **Certificate page принимает любой id** (`/test/certificate/anything?level=C2&score=100&name=Hacker` рендерит "valid-looking" сертификат). PDF без auth.

### Админ-CRUD

- **`/admin/lessons` форма не показывает `content`/`rule_ids`/`mentor_track`** — урок создаётся, но без тела, без правил, без наставника.
- **Auto-slug делает кириллицу** для ru-заголовков (`русское-название`).
- **Settings labels только на RU.**
- **`menu_json` без валидации** — невалидный JSON тихо ломает меню.
- **`correct_answer` в тестах не валидируется против `options`** — можно сохранить нерешаемые вопросы.
- **`window.prompt()` для reset password** (старомодный UX, виден на экране, нет валидации).
- **`/api/admin/users` LIMIT=500, без пагинации.**

### UI / UX

- **No site search** — ни по урокам, ни по новостям, ни по правилам. Ключ `common.search: "Іздеу"` есть в i18n, UI отсутствует.
- **No push/email opt-in UI** — даже если бэкенд бы работал, нет toggle в profile.
- **`/learn/pronunciation` не в главной навигации** (Header dropdown пропускает).
- **Profile не показывает certificates/achievements/test history/recent activity** — данные приходят из `/api/profile/stats`, но не рендерятся.
- **Mic permission запрашивается без объяснения** (LiveVoiceDialog), error message — raw exception text вместо локализованного.
- **i18n: ~30+ inline ternary** (`locale==='kk' ? '…' : '…'`) в TSX вместо `messages/kk.json`. Редакторы не могут переводить через JSON.

### Инфра / ops

- **Нет error monitoring** (Sentry или аналог).
- **Нет backup-стратегии Postgres** для user XP/streak/certificates.
- **Один AI-провайдер (Gemini).** TTS/Live/Vision/text — на одном ключе. `gemini-3.1-flash-tts-preview` это preview-модель. Нет fallback на ElevenLabs (как требует twoя memory).
- **Нет cost-monitoring на Gemini.** Live audio ~$0.10-0.25/min, при 1000 WAU × 5 min = ~$1k/мес. Без cap, без alert.
- **Нет E2E тестов** (Playwright). CI прогоняет только eslint.

### Бизнес / юзер-флоу

- **`/about` пустой при свежем deploy** (staff/departments из БД, но `006_content_seeds.sql` устарел).
- **Нет OAuth (Google/Yandex) и нет KZ-specific identity (Kundelik/eGov).** Регистрация требует name + email + password + confirm = 4 поля.
- **Нет captcha** на register/contact (только IP rate-limit). Спам-боты создадут фейк-юзеров и забьют лидерборд.

---

## P2 — ПОЛИРОВКА / NICE-TO-HAVE

- Footer social icons: все `href="#"` (Twitter/Telegram/FB/YouTube placeholders).
- Нет org-info/favicon/OG-image полей в settings UI.
- AISuggestionsPanel.tsx — orphan code (написан, нигде не импортирован). Либо подключить к editor, либо удалить.
- Дубликат API `/api/admin/test-questions` шадоит `/api/tests`.
- Analytics dashboard: KK/RU заголовки идентичные ru-строки; нет date-range picker, нет CSV export, нет KPI lessons_completed-per-day, dialog_sessions, % users active в 7d.
- Banners/staff/rules/departments — UUID/URL поля как free text input (нет MediaLibrary picker, нет user picker).
- News status select в admin/news пропускает `archived`.
- Editor: нет Preview button, нет concurrency check.
- Media: нет "used by" reference tracking, нет alt-text edit UI, нет CDN/object-storage.
- Нет `audit_log` таблицы.
- Нет optimistic locking — два админа = last-write-wins.
- Mentor track auezov: A1→A1→**B1**→B2 (нет A2), смутный onboarding.
- Mentor RU labels: «С Абай Кунанбаев» вместо «С Абаем»; «Әуезовпен» хак.
- Hamburger breakpoint mismatch: Header `lg:hidden` (1024px), MobileNav `xl:hidden` (1280px) — 1024-1280px дрова в DOM но недоступны.
- Quest completion celebration отсутствует (нет toast/animation).
- "Грамматика" одинаково kk/ru.
- Mentor TTS voice = "Charon" (generic Gemini), не Kazakh-specific actor.
- Photo-check copy «10MB дейін», но input без size check (50MB→silent fail).
- Anon photo-check / writing-check не показывает «сохранить = войти».
- Expired session: flashes «Жүктелуде…» перед редиректом.
- Нет EN locale (диаспора, иностранцы).
- Нет donation / B2B / school-portal CTA.
- Нет real testimonials / school logos.
- Color contrast: `text-[#6B6A63]` на `bg-[#FAF6EC]` ~3.9:1 (ниже WCAG AA 4.5:1).
- Нет skip-to-content link для a11y.

---

## ИТОГО

| Категория | P0 | P1 | P2 |
|---|---:|---:|---:|
| Безопасность / privacy | 4 | 6 | 2 |
| Hardcoded demo / сломанный флоу | 5 | 3 | — |
| Контент | 3 | 8 | 4 |
| Админ-CRUD | 1 | 7 | 8 |
| UI / UX / i18n | — | 6 | 7 |
| Инфра / ops | 2 | 5 | 4 |
| Бизнес / trust | — | 3 | 5 |
| **ВСЕГО** | **15** | **38** | **30** |

Всего: **83 находки**.

---

## Топ-5 стратегических приоритетов (next 30 days)

1. **Закрыть петлю «урок → complete → XP → streak → push» на стабильном домене.** Это превращает 60% уже написанного кода из косметического в нагруженный:
   - `<MarkComplete />` button в LessonPage + auto-advance
   - Заменить hardcoded demo на `/game`, `/game/achievements`, `/game/quests`, `/test/results`, `profile.completedLessonIds` на реальные API
   - Сгенерировать VAPID, SMTP (SendGrid free / Yandex.SMTP), CRON_TOKEN
   - Подключить `<PushOptIn />` в `/profile`
   - GitHub Actions cron `0 18 * * *` → `/api/cron/streak-reminder`

2. **Безопасность перед прод-деплоем** (≤ 1 день):
   - Ротация JWT_SECRET (`openssl rand -hex 64`)
   - CSRF: Origin-check в `requireAdminApi`
   - Sanitize PUT `/api/admin/users/:id` (убрать password_hash из ответа)
   - Fix `/admin/settings` (убрать `id` из insert)
   - Rate-limit на `/api/admin/*`
   - `/api/upload` → `requireAdminApi`, удалить SVG из mime-whitelist
   - Photo-check rate-limit для anon
   - DELETE/PUT users: запрет на self-delete и self-demote

3. **Production домен + SEO**:
   - Поднять `til-kural.kz` или `tilkural.zhezu.kz`
   - Поправить `NEXT_PUBLIC_APP_URL`, регенерировать sitemap/OG
   - Submit в Google Search Console + Yandex.Webmaster
   - **Обновить `sql/006_content_seeds.sql`** из текущих JSON (иначе следующий deploy регрессирует контент)

4. **Trust / гигиена** (≤ 1 день):
   - Удалить «50K+» с Hero (или заменить на реальные счётчики users.count)
   - Cookie-consent banner перед GA/Метрика (KZ-закон о ПДн)
   - Удалить `speechSynthesis` fallback из PronunciationPractice/DialogTrainer
   - Footer social `href="#"` → реальные ссылки или убрать
   - DELETE `/api/profile/me` (анонимизация + revoke JWT)

5. **Контентные дыры** (3-5 дней):
   - Forgot-password flow (страница + endpoint + email-link)
   - Расширить C2 банк до 30+ вопросов ИЛИ убрать C2 из маркетинга
   - News: фильтр `status='published'` в публичном loadNews
   - Lesson form в admin: добавить content/rule_ids/mentor_track поля
   - Lesson body: либо markdown поле + 21 мини-урок, либо явно перевести в "только правило+упражнения"

После этого второй спринт: OAuth, Sentry, Playwright smoke, audit_log, /admin/lessons UI rich-editor, Library picker в формы, search, EN locale, ElevenLabs fallback для TTS, B2B/school portal.

---

## Рекомендация PO

> Если бы я был PO, я бы сфокусировался на **закрытии петли «урок → streak → push» на стабильном домене**, потому что каждая другая фича (gamification, лидерборд, сертификаты, рекомендатель) — это downstream-потребитель этой петли, а сейчас петля сломана в трёх местах одновременно: уроки нельзя завершить из UI, prod-URL ротируется каждые несколько дней, push/email не запланированы. Платформа — красиво построенный двигатель с отсоединённым топливопроводом, и один спринт «топливо + зажигание» превращает 60% существующего кода из косметического в нагруженный, что даёт больше роста, чем любая новая фича за то же время.
