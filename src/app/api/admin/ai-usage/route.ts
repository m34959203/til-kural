import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { getQuotaSnapshots, getSpendSnapshot, FREE_TIER, SAFETY_RATIO } from '@/lib/ai-quota';

/**
 * GET /api/admin/ai-usage
 *
 * Возвращает дашборд квот:
 *   - quotas:  снимки RPM/RPD/TPM по каждой модели + статус ok/warn/crit
 *   - spend:   расход в USD за 24ч / 7д / месяц + прогноз
 *   - recent:  последние 50 вызовов (provider, model, purpose, tokens, cost, user)
 *   - free_tier: справочник лимитов и safety_ratio (для отрисовки прогресс-баров)
 */
export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const [quotas, spend] = await Promise.all([getQuotaSnapshots(), getSpendSnapshot()]);

    let recent: unknown[] = [];
    if (db.isPostgres) {
      recent = await db.raw(
        `SELECT g.id, g.provider, g.model, g.purpose, g.prompt_tokens, g.completion_tokens,
                g.cost_usd, g.duration_ms, g.user_id, g.created_at, u.email AS user_email
         FROM ai_generations g
         LEFT JOIN users u ON u.id = g.user_id
         ORDER BY g.created_at DESC
         LIMIT 50`,
      );
    } else {
      const rows = await db.query('ai_generations', undefined, {
        orderBy: 'created_at',
        order: 'desc',
        limit: 50,
      });
      recent = rows;
    }

    return Response.json({
      quotas,
      spend,
      recent,
      free_tier: FREE_TIER,
      safety_ratio: SAFETY_RATIO,
    });
  } catch (err) {
    return apiError(500, 'Failed to load AI usage', String(err));
  }
}
