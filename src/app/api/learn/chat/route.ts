import { chatWithAI } from '@/lib/gemini';
import { buildRAGContext, getTeacherSystemPrompt } from '@/lib/kazakh-rules';
import { getUserFromRequest } from '@/lib/auth';

const VALID_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      history = [],
      mentor = 'abai',
      level: levelInput,
      locale: localeInput,
      mode,
      topic,
    } = body ?? {};

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Locale: явно из body, иначе считаем kk (старое поведение).
    const locale: 'kk' | 'ru' = localeInput === 'ru' ? 'ru' : 'kk';

    // Level resolution. Приоритеты:
    //   1. body.level (если валиден).
    //   2. user.language_level из БД (если авторизован).
    //   3. Дефолт A1 (раньше был B1 — ломал новичков, см. audit).
    let level = 'A1';
    if (typeof levelInput === 'string' && VALID_LEVELS.has(levelInput)) {
      level = levelInput;
    } else {
      const user = await getUserFromRequest(request);
      if (user?.language_level && VALID_LEVELS.has(user.language_level)) {
        level = user.language_level;
      }
    }

    const ragContext = buildRAGContext(message, level);
    let systemPrompt = getTeacherSystemPrompt(level, ragContext, mentor, locale);

    if (mode === 'dialog') {
      // Dialog-режим: краткий формат + roleplay.
      if (locale === 'ru') {
        systemPrompt += `\n\nРЕЖИМ ДИАЛОГА:\nТема: ${topic || 'свободная'}\n1. Веди живой ролевой диалог.\n2. Корректируй ошибки ученика мягко, сразу с правильным вариантом.\n3. Без JSON-обвязки — просто текст реплики.`;
      } else {
        systemPrompt += `\n\nДИАЛОГ РЕЖИМІ:\nТақырып: ${topic || 'еркін'}\n1. Нақты жағдайды ойнап, диалогты жүргіз.\n2. Оқушының қателерін тікелей түзет.\n3. Дұрыс нұсқаны ұсын.\n4. JSON-ға ұқсатпа, қарапайым мәтін жаз.`;
      }
    }

    const reply = await chatWithAI(
      systemPrompt,
      message,
      history.map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
    );

    return Response.json({ reply, level, locale });
  } catch (error) {
    return Response.json({ error: 'Chat failed', details: String(error) }, { status: 500 });
  }
}
