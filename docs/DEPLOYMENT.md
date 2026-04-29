# Deployment

## Docker

```bash
# Set environment variables
export GEMINI_API_KEY=your-key

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

## Manual Deployment

```bash
npm install
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secure random string for JWT signing
- `GEMINI_API_KEY` — Google Gemini API key
- `NEXT_PUBLIC_APP_URL` — Public URL of the application

## PostgreSQL Setup

```bash
# Create database
createdb tilkural

# Apply schema
psql tilkural < sql/001_init.sql
```

## Production Domain (P0-13 из аудита)

`NEXT_PUBLIC_APP_URL` ОБЯЗАТЕЛЬНО должен указывать на стабильный домен.
trycloudflare-туннели ротируются раз в несколько дней — после чего:
- `sitemap.xml` / `robots.txt` ведут на мёртвый URL → Google deindex;
- OG-карточки в соцсетях ломаются;
- canonical link сбивает SEO-репутацию.

Запустить production-домен:
1. Купить `til-kural.kz` (или поднять `tilkural.zhezu.kz` через DNS Hoster.kz).
2. Указать домен в Cloudflare Tunnel (named tunnel, а не trycloudflare).
3. В `.env.local` установить `NEXT_PUBLIC_APP_URL=https://til-kural.kz`.
4. Перезапустить сервер: `npm run build && pm2 restart til-kural` (или re-deploy).
5. Submit sitemap в Google Search Console + Yandex.Webmaster.

## Cron: streak-reminders + scheduled publishing

Endpoint `/api/cron/streak-reminder` принимает `POST` c заголовком
`x-cron-token: $CRON_TOKEN`. Сделать `CRON_TOKEN`:

```bash
openssl rand -hex 32   # положить в .env.local + GitHub Secret
```

Вариант A — GitHub Actions (если репо публичный, бесплатно):

```yaml
# .github/workflows/cron-streak.yml
name: Streak reminders
on:
  schedule:
    - cron: '0 18 * * *'   # 18:00 UTC = 23:00 GMT+5 (Алматы / Астана)
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -X POST "${{ secrets.APP_URL }}/api/cron/streak-reminder" \
            -H "x-cron-token: ${{ secrets.CRON_TOKEN }}"
```

Вариант B — Cloudflare Workers Cron (если домен под CF). Скрипт делает
тот же `fetch` с заголовком, расписание задаётся в `wrangler.toml`.

Вариант C — на сервере: `crontab -e`, строка
`0 18 * * * curl -fsS -X POST https://til-kural.kz/api/cron/streak-reminder -H "x-cron-token: ${CRON_TOKEN}"`.

## Web Push (VAPID)

```bash
npx web-push generate-vapid-keys
# Положить в .env.local:
#   VAPID_PUBLIC_KEY=...
#   VAPID_PRIVATE_KEY=...
#   VAPID_CONTACT_EMAIL=mailto:admin@til-kural.kz
```

Public key подтягивается фронтом из `GET /api/push/subscribe`,
opt-in компонент — `<PushOptIn />` на `/profile`.
