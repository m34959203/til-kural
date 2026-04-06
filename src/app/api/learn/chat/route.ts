import { chatWithAI } from '@/lib/gemini';
import { buildRAGContext, getTeacherSystemPrompt } from '@/lib/kazakh-rules';

export async function POST(request: Request) {
  try {
    const { message, history = [], mentor = 'abai', level = 'B1', mode, topic } = await request.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const ragContext = buildRAGContext(message, level);

    let systemPrompt = getTeacherSystemPrompt(level, ragContext, mentor);

    if (mode === 'dialog') {
      systemPrompt += `\n\nДИАЛОГ РЕЖИМІ:
Тақырып: ${topic || 'еркін'}
1. Нақты жағдайды ойнап, диалогты жүргіз
2. Оқушының қателерін тікелей түзет
3. Дұрыс нұсқаны ұсын
4. Жауабыңды JSON-ға ұқсатпа, қарапайым мәтін жаз`;
    }

    const reply = await chatWithAI(
      systemPrompt,
      message,
      history.map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      }))
    );

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: 'Chat failed', details: String(error) }, { status: 500 });
  }
}
