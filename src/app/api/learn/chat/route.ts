import { chatWithAI } from '@/lib/gemini';
import { buildRAGContext, getTeacherSystemPrompt } from '@/lib/kazakh-rules';
import { getUserFromRequest } from '@/lib/auth';
import { aiQuotaErrorResponse } from '@/lib/api';
import { assertUserQuota, userKeyFromRequest } from '@/lib/ai-quota';

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

    const user = await getUserFromRequest(request);

    // Level resolution. Приоритеты:
    //   1. body.level (если валиден).
    //   2. user.language_level из БД (если авторизован).
    //   3. Дефолт A1 (раньше был B1 — ломал новичков, см. audit).
    let level = 'A1';
    if (typeof levelInput === 'string' && VALID_LEVELS.has(levelInput)) {
      level = levelInput;
    } else if (user?.language_level && VALID_LEVELS.has(user.language_level)) {
      level = user.language_level;
    }

    const ragContext = buildRAGContext(message, level);
    let systemPrompt = getTeacherSystemPrompt(level, ragContext, mentor, locale);

    if (mode === 'dialog') {
      // Dialog-режим: roleplay + матрица регистров под уровень + перевод по
      // правилам, пропорциональным уровню (см. audit P0):
      //   A1: 100% реплики дублируется русским курсивом ниже
      //   A2: переводятся ключевые фразы и финальный вопрос
      //   B1: только новые/сложные слова + финальный вопрос
      //   B2+: только редкие новые слова при необходимости
      const translationRule = locale === 'ru'
        ? (level === 'A1' || level === 'A2'
            ? `ОБЯЗАТЕЛЬНО: каждое твоё сообщение состоит из двух частей. Сначала — короткая реплика на казахском (1–2 предложения, словарь ${level === 'A1' ? '≤500' : '≤1000'} базовых слов). Затем на новой строке — полный русский перевод курсивом «*перевод*». Без перевода ученик НЕ ПОНИМАЕТ.`
            : level === 'B1'
              ? 'Реплика на казахском (2–3 предложения). Переводи на русский только новые/сложные слова — в скобках сразу после слова. Финальный вопрос обязательно дублируй на русском в скобках.'
              : 'Реплика на казахском в полном объёме. Переводи только редкие или сложные слова, если они вне CEFR-уровня ученика.')
        : (level === 'A1' || level === 'A2'
            ? 'Реплика қысқа (1–2 сөйлем) болсын, қарапайым лексика. Қажет болса орысша аударманы жақшаға қос.'
            : 'Реплика табиғи қарқында жүрсін; жаңа сөздерге ғана аударма.');

      const dialogRules = locale === 'ru' ? `
РЕЖИМ ДИАЛОГА. ТЕМА: ${topic || 'свободная'}.

1. Веди живой ролевой диалог: ОДНА реплика, как в реальном разговоре. НЕ читай лекцию, НЕ выдавай 5 абзацев.
2. Каждый ответ заканчивай ОДНИМ конкретным вопросом ученику.
3. Корректируй ошибки ученика мягко, сразу с правильным вариантом и переводом в скобках. Если ошибки нет — не придумывай.
4. ${translationRule}
5. Адаптируй стиль под уровень CEFR ${level} — НЕ используй цитаты, философские вступления, «Адам бол» и пр., если ученик A1/A2.
6. Длина реплики — 2–4 предложения максимум. На A1 — 1–2 предложения.
7. Без JSON-обвязки, без markdown-блоков кода — просто текст реплики.` : `
ДИАЛОГ РЕЖИМІ. ТАҚЫРЫП: ${topic || 'еркін'}.

1. Тірі рөлдік диалог жүргіз: БІР реплика. Лекция жасама.
2. Әр жауаптың соңында БІР нақты сұрақ қой.
3. Оқушының қателерін жұмсақ түзет, дұрыс нұсқаны қос. Қате болмаса — ойдан қоспа.
4. ${translationRule}
5. CEFR ${level} деңгейіне сай стиль қолдан. A1/A2 болса — цитаталар мен философияны қолданба.
6. Реплика 2–4 сөйлемнен аспасын. A1-де — 1–2 сөйлем.
7. JSON-ға, code-блокқа ораған, тек қарапайым мәтін.`;
      systemPrompt += `\n\n${dialogRules}`;
    }

    await assertUserQuota(userKeyFromRequest(request, user?.id ?? null));

    const reply = await chatWithAI(
      systemPrompt,
      message,
      history.map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
      { purpose: mode === 'dialog' ? 'chat-dialog' : 'chat', userId: user?.id ?? null },
    );

    return Response.json({ reply, level, locale });
  } catch (error) {
    const quota = aiQuotaErrorResponse(error);
    if (quota) return quota;
    return Response.json({ error: 'Chat failed', details: String(error) }, { status: 500 });
  }
}
