import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function chatWithAI(
  systemPrompt: string,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<string> {
  if (!apiKey) {
    return simulateAIResponse(userMessage);
  }

  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const contents = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const result = await model.generateContent({
    contents,
    systemInstruction: systemPrompt,
  });

  return result.response.text();
}

export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!apiKey) {
    return simulatePhotoCheckResponse();
  }

  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  return result.response.text();
}

export async function generateExercises(
  topic: string,
  level: string,
  weakPoints: string[] = []
): Promise<string> {
  const systemPrompt = `Сен қазақ тілі мұғалімісің. Берілген тақырып пен деңгейге сай жаттығулар жаса.
Деңгей: ${level}
Тақырып: ${topic}
${weakPoints.length > 0 ? `Әлсіз тұстар: ${weakPoints.join(', ')}` : ''}

JSON форматында 5 жаттығу бер:
[{"question": "...", "options": ["..."], "correct": "...", "explanation": "..."}]`;

  return chatWithAI(systemPrompt, `${topic} тақырыбынан ${level} деңгейіне сай 5 жаттығу жаса`);
}

export async function checkWriting(text: string, level: string): Promise<string> {
  const systemPrompt = `Сен қазақ тілі мамансың. Берілген мәтінді тексер.
Деңгей: ${level}

JSON форматында жауап бер:
{
  "score": 0-100,
  "corrections": [{"original": "...", "corrected": "...", "rule": "...", "explanation": "..."}],
  "feedback": "Жалпы пікір",
  "strengths": ["..."],
  "improvements": ["..."]
}`;

  return chatWithAI(systemPrompt, `Мәтінді тексер: "${text}"`);
}

function simulateAIResponse(message: string): string {
  const responses = [
    'Сәлеметсіз бе! Мен сіздің қазақ тілі мұғаліміңізбін. Сұрағыңызға жауап берейін.',
    'Жақсы сұрақ! Қазақ тілінде бұл тақырып өте маңызды.',
    'Дұрыс! Жаттығуды жалғастырайық. Келесі тапсырманы орындаңыз.',
    'Қазақ тілін үйрену — ұлы іс! Жалғастырыңыз!',
  ];
  return responses[Math.floor(Math.random() * responses.length)] +
    `\n\n(Демо режим — Gemini API кілтін .env файлына қосыңыз)\nСіздің сұрағыңыз: "${message}"`;
}

function simulatePhotoCheckResponse(): string {
  return JSON.stringify({
    recognized_text: 'Бұл демо режимдегі мәтін танылуы.',
    errors: [
      { word: 'мысал', correction: 'мысалы', rule: 'Буын үндестігі', position: 0 },
    ],
    overall_score: 75,
    feedback: 'Жалпы жақсы жазылған. Кейбір орфографиялық қателер бар.',
  });
}
