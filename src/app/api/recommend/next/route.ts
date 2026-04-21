import { getUserFromRequest } from '@/lib/auth';
import { getRecommendations } from '@/lib/adaptive-recommender';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await getRecommendations(user.id);
    return Response.json(payload);
  } catch (error) {
    return Response.json(
      { error: 'Recommendation failed', details: String(error) },
      { status: 500 },
    );
  }
}
