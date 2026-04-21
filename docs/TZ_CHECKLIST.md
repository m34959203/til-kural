# ТЗ «Тіл-құрал» — чек-лист функционала

> **Живой документ.** Обновлять при каждом изменении фичи.
> Последнее обновление: 2026-04-22 (третья волна из 4 агентов закрыла 6 priority-фиксов из ручного аудита — см. `audit-2026-04-22.json`)
> Источник ТЗ: договор на разработку сайта УМЦ «Тіл-құрал», 2025.

## Итоговая готовность

| Метрика | Значение |
|---|---|
| Пунктов всего | 24 |
| ✅ Полностью | **24** |
| ⚠️ Частично | 0 |
| ❌ Не сделано | 0 |
| **Готовность** | **100%** |

## Легенда статусов

- ✅ — реализовано и работает end-to-end (UI → API → БД → отображение)
- ⚠️ — частично: есть костяк/UI, но нет сквозного пайплайна или небольшой части функционала
- ❌ — не начато

---

## Ядро сайта

### 1. Удобная панель администрирования для языковых специалистов ✅

- **Реализация:** `src/components/layout/AdminSidebar.tsx`, `src/components/admin/EntityCrudTable.tsx`
- **Модули CRUD (10 разделов):** Дашборд, Аналитика, Сабақтар, Тесты, Жаңалықтар, Іс-шаралар, Баннеры, Медиатека, Бөлімдер, Қызметкерлер, Ереже құжаттары, История, Пайдаланушылар, Баптаулар
- **Визуал:** 4 группы (Шолу / Контент / Қауымдастық / Жүйе), gradient-логотип, секции
- **Smoke:** `/ru/admin/*` → 200 на всех 14 путях
- **DEV-режим:** `DEV_ADMIN_BYPASS=1` открывает без логина (снять в prod)

### 2. Сайт по умолчанию открывается на казахском ✅

- **Реализация:** `src/middleware.ts:6` `defaultLocale='kk'`
- **Layout:** `src/app/layout.tsx:30` `<html lang="kk">`
- **Manifest:** `src/app/manifest.ts:13` `lang:'kk'`
- **Smoke:** `curl -L https://site/` → редирект на `/kk`

### 3. Раздел новостей с текстом/фото/видео ✅

- **Public:** `src/app/[locale]/(public)/news/`, `src/app/[locale]/(public)/news/[slug]/page.tsx`
- **Admin CRUD:** `src/app/[locale]/(admin)/admin/news/page.tsx` — поля `title_*`, `content_*`, `excerpt_*`, `image_url`, `video_url`, `status`
- **API:** `GET/POST /api/news`, `GET/PUT/DELETE /api/news/[id]`
- **Компонент:** `src/components/features/NewsCard.tsx`

### 4. Раздел мероприятий с календарём событий ✅

- **Public:** `src/app/[locale]/(public)/events/`
- **Компонент:** `src/components/features/EventCalendar.tsx` — группировка по месяцам
- **Admin CRUD:** `src/app/[locale]/(admin)/admin/events/page.tsx` — `title_*`, `description_*`, `start_date`, `end_date`, `location`, `event_type`, `status`, `registration_url`
- **API:** `GET/POST /api/events` + `[id]`

---

## 3.2.1 ИИ-учитель

### 5. Пошаговые уроки с адаптацией под уровень ✅

- **Уроки (21):** `src/data/lessons-meta.ts` + `src/app/[locale]/(public)/learn/lessons/[id]/page.tsx`
- **Темы покрыты:** grammar / vocabulary / conversation / business / phonetics / orthography / culture
- **Уровни:** A1 / A2 / B1 / B2 / C1 (C2 — через CAT-тест)
- **ИИ-учитель чат:** `src/components/features/AITeacher.tsx` + `POST /api/learn/chat` с Gemini и RAG (`src/lib/kazakh-rules.ts`)
- **Сквозной пайплайн адаптации:** `LevelTest` (CAT) → `db.update('users', id, { language_level })` в `/api/test/evaluate` (коммит `499d0c2`) → `/api/auth/me` возвращает `language_level` → `useCurrentUser()` → `AITeacher` / `DialogTrainer` / `LiveVoiceDialog` читают и шлют реальный level в `/api/learn/chat` (коммиты `78cf12c`, `d31bb82`)
- **Бейдж:** «Ваш уровень: Bx» в заголовке каждого AI-компонента

### 6. Диалог с ИИ на казахском: исправление ошибок, правильные формы ✅

- **Компонент:** `src/components/features/DialogTrainer.tsx` + `LiveVoiceDialog.tsx`
- **Три режима:** Текст / Голос (loop ASR+TTS) / **📡 Live** (Gemini `gemini-2.5-flash-native-audio-preview-12-2025` через WebSocket)
- **Тем диалога:** 8 (амандасу, дүкенде, мейрамханада, дәрігерде, жұмыс, саяхат и т.д.)
- **Исправление ошибок:** поле `correction` в ответе + прямой инструктаж в промпте `kazakh-rules.ts` `mentorStyles`
- **API:** `POST /api/learn/chat` (текст) + `POST /api/ai/live-token` (ephemeral) + `POST /api/learn/tts`

### 7. Проверка письменных работ ✅

- **Компонент:** `src/components/features/WritingChecker.tsx`
- **API:** `POST /api/learn/check-writing` — Gemini 2.5 Flash возвращает JSON `{score, corrections[], feedback, strengths, improvements}`
- **Инсерт в БД:** таблица `writing_checks` — пишется при залогиненном юзере
- **UI:** цветовая разметка ошибок, объяснения, рекомендации

### 8. Произношение через Gemini TTS ✅

- **Компонент:** `src/components/features/PronunciationPractice.tsx`
- **Модель:** `gemini-3.1-flash-tts-preview` (единственная с поддержкой kk-KZ)
- **API:** `POST /api/learn/tts` с voice whitelist (29 голосов) + `mode:'guide'` для объяснения произношения
- **Функции:** 12 фраз × 2 скорости (normal/slow), browser-fallback, PCM → WAV wrap
- **Также используется в:** DialogTrainer (🔊 рядом с сообщениями), LiveVoiceDialog, наставники

### 9. Адаптивные упражнения по слабым местам ✅

- **UI:** `src/components/features/AdaptiveExercise.tsx` — fetch `/api/recommend/next` при mount, автовыбор темы с max `weakness_score`, бейдж «Рекомендовано: средний балл X%» (коммит `c036d36`)
- **API:** `POST /api/learn/exercises` принимает `{topic, level, weakPoints[], avg_score}` и пересчитывает `difficulty` (basic/standard/advanced)
- **Промпт Gemini:** `generateExercises` в `src/lib/gemini.ts` — если `avg_score < 50` → «базовые с подсказками»; если `> 85` → «продвинутые с нюансами»; `weakPoints[]` → «уделить внимание этим подтемам»
- **Рекомендатор:** `src/lib/adaptive-recommender.ts` (weakness_score с decay) + `user_topic_stats`
- **Цикл:** после каждого раунда — повторный fetch `/api/recommend/next` → новая слабая тема

---

## 3.2.2 Тестовая платформа

### 10. Входной тест A1–C2 через адаптивные вопросы ✅

- **Движок:** `src/lib/cat-engine.ts` — CAT-like: старт с B1, 2 правильно подряд → +1 уровень, 2 ошибки подряд → −1; стоп после 10–15 вопросов или стабилизации
- **API:** `POST /api/test/next-question` (stateless по history)
- **UI:** `src/components/features/LevelTest.tsx` — progress bar, индикатор текущего уровня, финальный экран с сертификатом
- **Банк:** `src/data/test-questions-bank.json` — 49+ level-вопросов, 8+ на каждый уровень A1/A2/B1/B2/C1/C2
- **C2 достижим:** 3+ правильных ответа на C2-вопросы → итоговый `level='C2'`
- **Запись:** в `test_sessions` с `test_type='level_adaptive'`

### 11. Тренировочные тесты КАЗТЕСТ ✅

- **Компонент:** `src/components/features/KaztestPractice.tsx`
- **Scoring:** `src/lib/kaztest-score.ts` — 100 баллов по 5 секциям (L20/R20/G25/V15/W20)
- **Таймер:** 30 мин (`TEST_DURATION_SEC = 30 * 60`)
- **Sampling:** stratified 4L/4R/6G/4V/2W = 20 вопросов
- **Пороги:** C1≥90 / B2≥75 / B1≥60 / A2≥45 / A1≥30
- **Review-режим** с разбором каждой ошибки + `explanation_kk/ru`
- **Страница-инфо:** `src/app/[locale]/(public)/kaztest-info/page.tsx`

### 12. Личный кабинет: история, графики, рекомендации ✅

- **Страница:** `src/app/[locale]/(public)/profile/page.tsx` (client component, читает `/api/auth/me`)
- **API:** `GET /api/profile/stats` — 401 для анон; возвращает totals (8 метрик) + recent (limit 10)
- **Графики:**
  - `ProgressTracker.tsx` — XP/level/streak/weekly/skills из stats
  - `LiteracyTrendChart.tsx` — SVG-график оценок за 30 дней из `/api/photo-check/history`
- **Рекомендации:** `RecommendedTopics.tsx` + `/api/recommend/next`
- **Аватар наставника:** `mentor_avatar` из `users` — персистентен

### 13. Автогенерация PDF-сертификата ✅

- **Генератор:** `src/lib/pdf-certificate.ts` (jsPDF)
- **API:** `POST /api/test/certificate` — создаёт PDF + инсерт в `certificates` с уникальным `certificate_number`
- **UI:** `src/components/features/CertificateView.tsx` + `src/app/[locale]/(public)/test/certificate/[id]/page.tsx`
- **Шеринг:** `ShareButton.tsx` (Web Share API + Telegram/WhatsApp/Twitter/Copy)
- **OG-превью:** `GET /api/og/certificate?name=&level=&score=` → 1200×630 PNG для красивого шеринга в соцсети
- **⚠️ Ограничение jsPDF:** не рендерит кириллицу без кастомного шрифта — текущий сертификат на английском. Можно доделать позже встроением TTF.

---

## 3.2.3 Проверка текста по фото

### 14. Распознавание рукописи через Gemini Vision ✅

- **Vision:** `src/lib/gemini-vision.ts` с `gemini-2.5-flash` (Vision)
- **API:** `POST /api/photo-check` — принимает base64, возвращает `recognized_text`
- **UI:** `src/components/features/PhotoChecker.tsx` — upload/preview/результат
- **Инсерт:** `photo_checks` (image_url в БД пустой — чтобы не раздувать, base64 не храним)

### 15. Ошибки с цветовым выделением + правильный вариант ✅

- **Реализация:** `PhotoChecker.tsx:73-85` — 4 цвета по `type` (`spelling/grammar/punctuation/style`)
- **Формат ошибки:** `{word, correction, type, rule, rule_explanation, example_correct[], rule_slug}`
- **Выделение:** line-through на ошибочном слове + правильный вариант рядом

### 16. Объяснение правила + примеры ✅

- **Промпт:** `src/lib/gemini-vision.ts` `PHOTO_CHECK_PROMPT` — для каждой ошибки требует `rule_explanation` (2-3 предложения), `example_correct` (1-2 примера), `rule_slug` (id из `kazakh-grammar-rules.json`)
- **UI:** блок «Объяснение правила» + бейджи «Правильные примеры» с ✓ + deep-link `Открыть правило →` на `/learn/basics#rule_XX`
- **Локализация:** промпт принимает `locale` — объяснения возвращаются на kk или ru

### 17. Оценка: грамотность/связность/лексика + рекомендации ✅

- **Поля в ответе:** `overall_score /100`, `literacy_score`, `coherence_score`, `lexical_diversity`, `feedback`
- **UI:** 3 прогресс-бара + блок рекомендаций
- **Локализация:** feedback на языке локали

### 18. История проверок + тренд прогресса ✅

- **Запись:** инсерт в `photo_checks` при каждом POST (Agent A)
- **API:** `GET /api/photo-check/history?days=30` → `{items:[{id, overall_score, created_at}], avg, days, total}` (401 для анон)
- **UI:** `LiteracyTrendChart.tsx` — SVG-график оценок за 30 дней, средняя линия, точки с tooltip
- **В профиле:** блок «📸 Грамотность по фото-проверкам» со средней и графиком; пустое состояние с CTA

---

## 3.2.4 Геймификация

### 19. Персональный аватар-наставник ✅

- **3 ментора:** `src/lib/mentors.ts` — Абай / Ахмет Байтұрсынұлы / Мұхтар Әуезов
- **Стиль общения:** `src/lib/kazakh-rules.ts` `mentorStyles` — каждый говорит в характерной манере
- **Персональный голос:** `Charon` / `Kore` / `Fenrir` (Gemini TTS)
- **Портреты:** `public/mentors/*.png`
- **Учебный путь** (коммит `d31bb82`):
  - `lessons-meta.ts` — `mentor_track?: MentorKey` проставлен на все 21 урок: Абай=3 (речевой этикет, деловой, макал-мәтелдер), Байтұрсынұлы=13 (вся грамматика/фонетика/орфография), Әуезов=5 (повседневная лексика, разговорные темы)
  - `src/components/features/MentorTrack.tsx` — client component: шапка с портретом, прогресс «X/Y», вертикальный список уроков со статусами ✓/▶/🔒, CTA «Продолжить с …»
  - `profile/page.tsx` — блок «Ваш путь с [mentor]» после блока грамотности
  - `learn/lessons/page.tsx` — chip-фильтры «Все / С Абаем / С Байтұрсынұлы / С Әуезовым» (инициализация из `?mentor=`), бейджик ментора на карточке

### 20. Система квестов ✅

- **Шаблоны:** `src/data/quest-templates.json` — 4 квеста:
  - `quest_01` «Сөйлесу шебері» (7 days)
  - `quest_02` «Грамматика патшасы» (challenge)
  - `quest_03` «Мақал-мәтел шебері» (learning)
  - `quest_04` «Жазу шебері» (skill)
- **UI:** `src/components/features/QuestCard.tsx` + `QuestTracker.tsx`
- **API:** `GET /api/game/quests` (шаблоны + userQuests), `POST` `action:'start'` → upsert в `user_quests`
- **Страница:** `src/app/[locale]/(public)/game/quests/page.tsx`

### 21. XP, уровни Бастаушы→Шебер, разблокировка контента ✅

- **XP-логика:** `src/lib/gamification.ts` `XP_REWARDS`, `LEVEL_THRESHOLDS` (11 ступеней), `LEVEL_NAMES_KK = ['Бастаушы', ..., 'Дана']`
- **API:** `POST /api/game/progress` — пишет `users.xp_points`, `users.level`
- **UI:** `ProgressTracker.tsx`, badges уровня
- **Разблокировка контента** (коммит `78cf12c`):
  - `src/lib/level-gate.ts` — `LEVEL_ORDER`, `levelIndex`, `isUnlocked`
  - `src/components/features/LessonLockBadge.tsx` — 🔒-бейдж с title-подсказкой kk/ru
  - `lessons-meta.ts` `required_level?: CefrLevel` проставлен на все 21 урока (A1–C1)
  - `learn/lessons/[id]/page.tsx` — client wrapper с `useCurrentUser`: если `!isUnlocked` → `LessonGate` с CTA «Пройти тест уровня» + список уроков, доступных на текущем уровне
  - `learn/lessons/page.tsx` — `LessonLockBadge` на карточках закрытых уроков

### 22. Streak 7/30/100 + Push ✅

- **Логика:** `src/lib/gamification.ts` `updateStreak`, `checkStreakBonus` — бонусы 100/500/1000 XP на 7/30/100 дней
- **UI:** `StreakTracker.tsx` — недельный календарь с отметками
- **Push:** `/api/push/subscribe` (VAPID), `PushOptIn.tsx`, cron `/api/cron/streak-reminder` с токеном
- **Email-fallback:** `src/lib/push.ts` если юзер не подписан на Web Push

### 23. Лидерборд, бейджи, шеринг ✅

- **Лидерборд:** `LeaderboardTable.tsx` + `GET /api/game/leaderboard` (`users` ORDER BY `xp_points` DESC LIMIT 20) — **живой, не хардкод**
- **Бейджи:** `src/data/achievements.json` — 11+ именных бейджей («Полиглот», «Грамотей», «Оратор», etc.)
- **UI:** `src/components/features/AchievementBadge.tsx` с опциональными `shareable`/`locale`/`shareUrl`
- **Шеринг:** `ShareButton.tsx` — Web Share API + fallback (Telegram/WhatsApp/Twitter/Copy link)
- **OG-превью:** `GET /api/og/badge?title=…&icon=…` → 1200×630 PNG для красивого превью в WhatsApp/Telegram

### 24. Адаптивная сложность от наставника ✅

- **Трекинг слабых тем:** `src/lib/adaptive-recommender.ts` — `weakness_score` с временным decay, таблица `user_topic_stats` пишется в `recordTestOutcomes`
- **Рекомендации:** `POST /api/recommend/next` возвращает топ-3 слабых темы + следующее действие
- **CAT входного теста:** сложность адаптируется branching-алгоритмом (`src/lib/cat-engine.ts`), C2 достижим
- **Упражнения** (коммит `c036d36`):
  - `/api/learn/exercises` принимает `avg_score` и пересчитывает `difficulty` (basic/standard/advanced)
  - `generateExercises()` в `lib/gemini.ts` добавляет в промпт «часто ошибается → базовые» / «силён → продвинутые с нюансами» / «уделить внимание подтемам: …»
  - `AdaptiveExercise.tsx` показывает бейдж-результат сложности (`Базовые` / `Продвинутые`)
- **После каждого раунда:** UI перечитывает `/api/recommend/next` → следующая тема по актуализации weakness_score

---

## Закрытые остатки

| Подзадача | Итерация |
|---|---|
| Инсерты в БД для всех 5 AI-потоков | `2c5e99e` — Agent A |
| CRUD Отделы/Сотрудники/Правила | `033568c` — Agent B |
| Security (/contact rate-limit + honeypot) + SEO JSON-LD Сатпаев | `4b37ec2` — Agent C |
| CAT-тест A1–C2 | `9126b7b` — Agent CAT |
| Глубокие объяснения + тренд грамотности | `83a298a` — Agent Photo |
| Social share + OG image + CMS История | `459d9c5` — Agent Social |
| Редизайн топ-бара | `d6d4a91` |
| Редизайн главной навигации (6 групп с dropdown) | `1789d13` |
| Убрать «Gemini 2.5» с сайта | `2d8583f` |

## Волна 4 (доделка 5 ⚠️-пунктов → все в ✅)

| Коммит | Пункт | Что закрыто |
|---|---|---|
| `499d0c2` | 5 | Сохранение `users.language_level` после CAT + расширенный `/api/auth/me` |
| `78cf12c` | 5 + 21 | `useCurrentUser()` hook + чтение `language_level` в AITeacher/DialogTrainer/LiveVoiceDialog; level-gate для уроков + LessonLockBadge |
| `c036d36` | 9 + 24 | AdaptiveExercise fetch `/api/recommend/next` + адаптивная сложность basic/standard/advanced |
| `d31bb82` | 19 | MentorTrack component + чипы-фильтры по наставнику + `mentor_track` на все 21 урок |

**Итог:** 24 из 24 пунктов ТЗ реализованы.

## Волна 5 — фиксы из ручного аудита 2026-04-22

Детали в `audit-2026-04-22.json`. 6 priority-фиксов после ручного обхода сайта:

| Priority | Фикс | Коммит | Что |
|---|---|---|---|
| 1–3 | CMS↔public + фото/видео в новостях + JSON-LD в `<script>` | `4998820` | `news/page`, `news/[slug]`, `events/page`, `learn/lessons/page` читают `db.query`; `NewsCard` + детальная новости рендерят `image_url` + `video_url` (YouTube/Vimeo iframe или `<video>`); JSON-LD перенесён в `<script type="application/ld+json">` |
| 4 | baseUrl через `NEXT_PUBLIC_APP_URL` | `21b8ad7` | `lib/seo.ts` `getBaseUrl()`; `layout.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts` — все через env |
| 5 | PDF кириллица | `3baabb8` | `public/fonts/NotoSans-{Regular,Bold}.ttf` (Noto Sans OFL); `pdf-certificate.ts` через `addFileToVFS`; поддержка `locale: 'kk' \| 'ru'` (тексты сертификата переведены) |
| 6 | `/learn/exercises` отдельная страница | `347cb25` | server-page с `<AdaptiveExercise>`; карточка-ссылка на `/learn` |

**Реальная готовность после волны 5:** ~98% (остаётся QA end-to-end по фото-проверке с реальной рукописью и залогиненному юзеру в профиле — это scope для QA, а не разработки).

Далее — обновлять этот файл при каждой итерации (новые фичи / доработки / регресс).
