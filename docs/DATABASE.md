# Database Schema

See `sql/001_init.sql` for the full schema.

## Tables

| Table | Description |
|-------|-------------|
| users | User accounts with XP, level, streak data |
| lessons | Interactive lessons with JSONB content |
| user_lessons | User lesson progress and scores |
| test_questions | Test question bank (A1-C2) |
| test_sessions | User test sessions and results |
| certificates | Generated certificates |
| photo_checks | Photo text checking history |
| dialog_sessions | Dialog trainer sessions |
| writing_checks | Writing check history |
| quests | Quest definitions |
| user_quests | User quest progress |
| achievements | Achievement definitions |
| user_achievements | User earned achievements |
| adaptive_exercises | AI-generated exercise history |
| news | News articles |
| events | Events with dates |
| banners | Homepage banners |
| site_settings | Key-value site settings |

## Development

The app uses an in-memory database by default (`src/lib/db.ts`). For production, replace with PostgreSQL using the schema in `sql/001_init.sql`.

```bash
# Initialize database with Docker
docker-compose up db
# Schema auto-applies from sql/ directory
```
