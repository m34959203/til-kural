# Тіл-құрал — Kazakh Language Learning Platform

AI-powered Kazakh language education platform built with Next.js 15, featuring interactive lessons, language proficiency testing, handwritten text checking via Gemini Vision, and gamification.

## Features

- **AI Teacher**: Interactive lessons with Gemini AI, adapted to user level
- **Dialog Trainer**: Conversation practice in real-life scenarios
- **Writing Checker**: Grammar, spelling, and style checking
- **Pronunciation Practice**: TTS-powered pronunciation training
- **Testing Platform**: Level assessment (A1-C2), thematic tests, KAZTEST preparation
- **Photo Text Checking**: Upload handwritten Kazakh text for OCR + error analysis via Gemini Vision
- **Gamification**: AI mentors (Abai, Baitursynuly, Auezov), quests, XP, levels, streaks, leaderboard
- **PDF Certificates**: Auto-generated language proficiency certificates
- **Bilingual**: Kazakh (primary) / Russian interface
- **Admin Panel**: Full content management dashboard

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# With Docker
docker-compose up
```

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `GEMINI_API_KEY` — Google Gemini API key for AI features
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT tokens
