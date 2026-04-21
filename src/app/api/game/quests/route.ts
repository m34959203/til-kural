import questTemplates from '@/data/quest-templates.json';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  // Include per-user progress if authorized, чтобы фронт не городил второй запрос.
  const user = await getUserFromRequest(request);
  let userQuests: Array<{ quest_id: string; progress: unknown; started_at: string; completed_at?: string | null }> = [];
  if (user) {
    try {
      const rows = await db.query('user_quests', { user_id: user.id });
      userQuests = rows.map((r) => ({
        quest_id: r.quest_id,
        progress: r.progress,
        started_at: r.started_at,
        completed_at: r.completed_at ?? null,
      }));
    } catch (err) {
      console.warn('[quests] user_quests query skipped:', err);
    }
  }

  return Response.json({ quests: questTemplates, userQuests });
}

export async function POST(request: Request) {
  try {
    const { questId, action, progress } = await request.json();

    const quest = questTemplates.find((q) => q.id === questId);
    if (!quest) {
      return Response.json({ error: 'Quest not found' }, { status: 404 });
    }

    const user = await getUserFromRequest(request);

    if (action === 'start') {
      let record: { id: string; quest_id: string; progress: unknown; started_at: string } | null = null;
      if (user) {
        try {
          // upsert: если запись уже есть — обновим started_at, прогресс не сбрасываем
          const existing = await db.findOne('user_quests', { user_id: user.id, quest_id: questId });
          if (existing) {
            const updated = await db.update('user_quests', existing.id, {
              started_at: new Date().toISOString(),
            });
            if (updated) {
              record = {
                id: updated.id,
                quest_id: updated.quest_id,
                progress: updated.progress,
                started_at: updated.started_at,
              };
            }
          } else {
            const row = await db.insert('user_quests', {
              user_id: user.id,
              quest_id: questId,
              progress: { completedTasks: 0, totalTasks: quest.tasks.length },
              started_at: new Date().toISOString(),
            });
            record = {
              id: row.id,
              quest_id: row.quest_id,
              progress: row.progress,
              started_at: row.started_at,
            };
          }
        } catch (dbErr) {
          console.warn('[quests] start insert skipped:', dbErr);
        }
      }

      return Response.json({
        quest,
        progress: record?.progress ?? {
          started: true,
          completedTasks: 0,
          totalTasks: quest.tasks.length,
        },
        record,
      });
    }

    if (action === 'update' && user) {
      try {
        const existing = await db.findOne('user_quests', { user_id: user.id, quest_id: questId });
        if (existing) {
          const updated = await db.update('user_quests', existing.id, { progress });
          return Response.json({ quest, record: updated });
        }
      } catch (dbErr) {
        console.warn('[quests] update skipped:', dbErr);
      }
    }

    return Response.json({ quest });
  } catch (error) {
    return Response.json({ error: 'Quest operation failed', details: String(error) }, { status: 500 });
  }
}
