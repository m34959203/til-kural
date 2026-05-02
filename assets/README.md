# assets/

Скриншоты и графика для README. Никакой логики кода здесь нет — только бинарные ассеты.

## Что класть

| Файл | Что | Откуда |
|---|---|---|
| `screenshot-home.png` | Главная (RU или KK) | браузер на `/kk` |
| `screenshot-learn.png` | Личный кабинет ученика, AITeacher + RecommendedTopics | `/kk/learn` |
| `screenshot-lessons.png` | Каталог уроков с MentorTrack | `/kk/learn/lessons` |
| `screenshot-dialog.png` | DialogTrainer (3 режима: Текст / Голос / 📡 Live) | `/kk/learn/dialog` |
| `screenshot-photo-check.png` | Фото-проверка рукописи (Gemini Vision) | `/kk/photo-check` |
| `screenshot-kaztest.png` | КАЗТЕСТ практик с таймером и 5 секциями | `/kk/test/kaztest` |
| `screenshot-game.png` | Геймификация (XP/streak/level + лидерборд) | `/kk/game` |
| `screenshot-admin-dashboard.png` | Админ-дашборд (Top-N + Аналитика) | `/ru/admin` |
| `screenshot-admin-editor.png` | TipTap RichTextEditor с AI-suggestions | `/ru/admin/news/[id]` |
| `screenshot-admin-ai-usage.png` | AI-квоты и спенд по моделям | `/ru/admin/ai-usage` |

## Размер и формат

- PNG, ширина ≥ 1200 px (retina-friendly)
- Без персональных данных в скриншотах (анонимизировать email/имена)
- Если PNG > 500 КБ — пожать через `optipng -o7 file.png`

## Как обновить

1. Снять скриншот через DevTools «Capture full size screenshot» (Cmd+Shift+P → Capture)
2. Положить в `assets/` под одним из имён выше (или добавить новое)
3. Закоммитить `feat(assets): обновить скриншот <название>`

После добавления — README уже ссылается на эти файлы, ничего править не нужно.
