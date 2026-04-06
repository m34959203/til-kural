import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return Response.json({ user });
}
