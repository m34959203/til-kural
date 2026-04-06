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
