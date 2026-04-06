import questTemplates from '@/data/quest-templates.json';

export async function GET() {
  return Response.json({ quests: questTemplates });
}

export async function POST(request: Request) {
  try {
    const { questId, action } = await request.json();

    const quest = questTemplates.find((q) => q.id === questId);
    if (!quest) {
      return Response.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (action === 'start') {
      return Response.json({
        quest,
        progress: { started: true, completedTasks: 0, totalTasks: quest.tasks.length },
      });
    }

    return Response.json({ quest });
  } catch (error) {
    return Response.json({ error: 'Quest operation failed', details: String(error) }, { status: 500 });
  }
}
