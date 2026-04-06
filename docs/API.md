# API Reference

## Authentication

### POST /api/auth/register
Register a new user. Body: `{ email, password, name, phone? }`

### POST /api/auth/login
Login. Body: `{ email, password }`. Returns JWT token.

### GET /api/auth/me
Get current user. Requires `Authorization: Bearer <token>`.

## Learning

### POST /api/learn/chat
AI Teacher chat. Body: `{ message, history[], mentor, level, mode?, topic? }`

### POST /api/learn/exercises
Generate adaptive exercises. Body: `{ topic, level, weakPoints[] }`

### POST /api/learn/check-writing
Check written text. Body: `{ text, level }`

### POST /api/learn/tts
Get pronunciation guide. Body: `{ text }`

## Testing

### GET /api/test/questions?type=level&difficulty=B1&topic=grammar&limit=20
Get test questions with filters.

### POST /api/test/evaluate
Evaluate test answers. Body: `{ answers[], questionIds[] }`

### POST /api/test/certificate
Generate PDF certificate. Body: `{ userName, level, score, certificateId? }`

## Photo Check

### POST /api/photo-check
Check handwritten text from photo. Body: `{ image }` (base64 data URL)

## Gamification

### POST /api/game/progress
Update XP and streak. Body: `{ action, score? }`. Requires auth.

### GET /api/game/quests
Get available quests.

### GET /api/game/leaderboard
Get leaderboard data.

## Content

### GET /api/news
Get news list.

### GET /api/events
Get events list.

### POST /api/upload
Upload file. Multipart form data with `file` field.
