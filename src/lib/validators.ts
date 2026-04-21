/**
 * Form validators for Тіл-құрал.
 *
 * Historically this file exposed hand-rolled `validateLogin` / `validateRegistration`
 * helpers (still used by /api/auth/**).  Admin CRUD entities now use Zod schemas
 * with per-field error messages — both the server and the client share the same
 * definitions, so a field rename is a one-line change.
 *
 * IMPORTANT: preserve the existing non-Zod helpers — they are wired into routes
 * outside our edit zone.  Do not remove them.
 */
import { z, ZodType } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

/* -------------------------------------------------------------------------- */
/* Legacy (email/password)                                                    */
/* -------------------------------------------------------------------------- */

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (password.length < 6) {
    errors.push({ field: 'password', message: 'Құпиясөз кемінде 6 таңбадан тұруы керек' });
  }
  return errors;
}

export function validateRegistration(data: {
  email?: string;
  password?: string;
  name?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Жарамды email енгізіңіз' });
  }
  if (!data.password) {
    errors.push({ field: 'password', message: 'Құпиясөз міндетті' });
  } else {
    errors.push(...validatePassword(data.password));
  }
  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Аты-жөніңізді енгізіңіз (кемінде 2 таңба)' });
  }

  return errors;
}

export function validateLogin(data: {
  email?: string;
  password?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Жарамды email енгізіңіз' });
  }
  if (!data.password) {
    errors.push({ field: 'password', message: 'Құпиясөз міндетті' });
  }

  return errors;
}

export function validateTestAnswer(data: {
  questionId?: string;
  answer?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.questionId) {
    errors.push({ field: 'questionId', message: 'Сұрақ ID міндетті' });
  }
  if (!data.answer) {
    errors.push({ field: 'answer', message: 'Жауап міндетті' });
  }

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Zod schemas for admin CRUD                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Коммон-билдеры. Поля описания делаем «мягкими» — API принимают строку, пустую
 * строку ('') или null. URL проверяем строго, но тоже допускаем пустой input.
 */
const optionalText = (max = 10_000) =>
  z
    .union([z.string().max(max), z.literal(''), z.null()])
    .optional();

const optionalUrl = () =>
  z
    .union([z.string().url('Жарамды URL енгізіңіз'), z.literal(''), z.null()])
    .optional();

const slugLike = () =>
  z
    .union([
      z.string().regex(/^[a-z0-9-]*$/, 'Slug тек a-z, 0-9, -'),
      z.literal(''),
      z.null(),
    ])
    .optional();

const sortOrder = () =>
  z.coerce.number().int('Бүтін сан болуы керек').min(0).default(0);

/* ---------------------------- News ---------------------------- */
export const NewsSchema = z.object({
  title_kk: z.string().min(2, 'Кемінде 2 таңба').max(500),
  title_ru: z.string().min(2, 'Кемінде 2 таңба').max(500),
  slug: slugLike(),
  excerpt_kk: optionalText(1000),
  excerpt_ru: optionalText(1000),
  content_kk: optionalText(),
  content_ru: optionalText(),
  image_url: optionalUrl(),
  video_url: optionalUrl(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  published_at: z.union([z.string(), z.null()]).optional(),
});
export type NewsInput = z.infer<typeof NewsSchema>;

/* --------------------------- Events --------------------------- */
export const EventsSchema = z.object({
  title_kk: z.string().min(2).max(500),
  title_ru: z.string().min(2).max(500),
  description_kk: optionalText(),
  description_ru: optionalText(),
  image_url: optionalUrl(),
  event_type: z.string().min(1).max(50).optional().default('event'),
  start_date: z.string().min(1, 'Басталу күні міндетті'),
  end_date: z.union([z.string(), z.literal(''), z.null()]).optional(),
  location: optionalText(500),
  registration_url: optionalUrl(),
  status: z
    .enum(['upcoming', 'ongoing', 'past', 'cancelled'])
    .default('upcoming'),
});
export type EventsInput = z.infer<typeof EventsSchema>;

/* --------------------------- Lessons -------------------------- */
export const LessonsSchema = z.object({
  title_kk: z.string().min(2).max(500),
  title_ru: z.string().min(2).max(500),
  description_kk: optionalText(),
  description_ru: optionalText(),
  topic: z.string().min(1, 'Тақырып міндетті').max(100),
  difficulty: z.string().min(1, 'Деңгей міндетті').max(20),
  // JSON blob — strict validation is up to каждой темы/уровня
  content: z.any().optional(),
  sort_order: sortOrder(),
});
export type LessonsInput = z.infer<typeof LessonsSchema>;

/* --------------------------- Banners -------------------------- */
export const BannersSchema = z.object({
  title: optionalText(500),
  subtitle_kk: optionalText(500),
  subtitle_ru: optionalText(500),
  image_url: z.string().url('Жарамды URL енгізіңіз').min(1, 'Сурет URL міндетті'),
  link_url: optionalUrl(),
  position: z.string().min(1).max(50).default('hero'),
  is_active: z.coerce.boolean().default(true),
  sort_order: sortOrder(),
});
export type BannersInput = z.infer<typeof BannersSchema>;

/* ---------------------------- Staff --------------------------- */
export const StaffSchema = z.object({
  name_kk: z.string().min(2).max(255),
  name_ru: z.string().min(2).max(255),
  position_kk: optionalText(500),
  position_ru: optionalText(500),
  department_id: z.union([z.string().uuid('UUID-формат'), z.literal(''), z.null()]).optional(),
  photo_url: z
    .union([
      z.string().url('Жарамды URL енгізіңіз'),
      // допускаем относительные пути /uploads/...
      z.string().regex(/^\/[^\s]+$/, 'URL немесе /uploads/... жолы'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  email: z
    .union([z.string().email('Жарамды email енгізіңіз'), z.literal(''), z.null()])
    .optional(),
  phone: optionalText(100),
  bio_kk: optionalText(),
  bio_ru: optionalText(),
  sort_order: sortOrder(),
});
export type StaffInput = z.infer<typeof StaffSchema>;

/* ------------------------- Departments ------------------------ */
export const DepartmentsSchema = z.object({
  name_kk: z.string().min(2).max(255),
  name_ru: z.string().min(2).max(255),
  description_kk: optionalText(),
  description_ru: optionalText(),
  head_user_id: z.union([z.string().uuid('UUID-формат'), z.literal(''), z.null()]).optional(),
  sort_order: sortOrder(),
});
export type DepartmentsInput = z.infer<typeof DepartmentsSchema>;

/* ------------------------- Rules docs ------------------------- */
export const RulesDocsSchema = z.object({
  title_kk: z.string().min(2).max(500),
  title_ru: z.string().min(2).max(500),
  description_kk: optionalText(),
  description_ru: optionalText(),
  year: z.union([z.string().max(10), z.number(), z.null()]).optional(),
  pdf_url: optionalUrl(),
  category: z.string().min(1).max(50).default('other'),
  sort_order: sortOrder(),
});
export type RulesDocsInput = z.infer<typeof RulesDocsSchema>;

/* ------------------------ Grammar rules ----------------------- */
export const GrammarRulesSchema = z.object({
  topic: z.string().min(1, 'Тақырып міндетті').max(100),
  title_kk: z.string().min(2).max(500),
  title_ru: z.string().min(2).max(500),
  level: z.string().min(1).max(10).default('A1'),
  description_kk: optionalText(),
  description_ru: optionalText(),
  // Поддерживаем как массив, так и JSON-строку (UI может отправлять либо то, либо то).
  examples: z.union([z.array(z.any()), z.string(), z.null()]).optional(),
  exceptions: z.union([z.array(z.any()), z.string(), z.null()]).optional(),
  rule_order: sortOrder(),
});
export type GrammarRulesInput = z.infer<typeof GrammarRulesSchema>;

/* ----------------------- Test questions ----------------------- */
export const TestQuestionsSchema = z.object({
  test_type: z.string().min(1, 'Тест түрі міндетті').max(50),
  topic: z.string().min(1, 'Тақырыбы міндетті').max(100),
  difficulty: z.string().min(1, 'Деңгей міндетті').max(20),
  question_kk: z.string().min(2, 'Кемінде 2 таңба'),
  question_ru: optionalText(),
  options: z.union([z.array(z.any()), z.string(), z.null()]).optional(),
  correct_answer: z.string().min(1, 'Дұрыс жауап міндетті'),
  explanation_kk: optionalText(),
  explanation_ru: optionalText(),
});
export type TestQuestionsInput = z.infer<typeof TestQuestionsSchema>;

/* --------------------------- History -------------------------- */
export const HistorySchema = z.object({
  year: z.union([z.string().max(20), z.number(), z.null()]).optional(),
  title_kk: z.string().min(2).max(500),
  title_ru: z.string().min(2).max(500),
  description_kk: optionalText(),
  description_ru: optionalText(),
  image_url: optionalUrl(),
  sort_order: sortOrder(),
});
export type HistoryInput = z.infer<typeof HistorySchema>;

/* -------------------------------------------------------------------------- */
/* SCHEMAS map (apiPath → schema) — клиент подхватывает автоматически         */
/* -------------------------------------------------------------------------- */

export const SCHEMAS: Record<string, ZodType> = {
  '/api/news': NewsSchema,
  '/api/events': EventsSchema,
  '/api/lessons': LessonsSchema,
  '/api/banners': BannersSchema,
  '/api/staff': StaffSchema,
  '/api/departments': DepartmentsSchema,
  '/api/rules-docs': RulesDocsSchema,
  '/api/grammar-rules': GrammarRulesSchema,
  '/api/tests': TestQuestionsSchema,
  '/api/history': HistorySchema,
};

/* -------------------------------------------------------------------------- */
/* validateBody helper — единая форма ответа                                  */
/* -------------------------------------------------------------------------- */

export type ValidateOk<T> = { ok: true; data: T };
export type ValidateFail = { ok: false; errors: ValidationError[] };

/**
 * Runs a Zod schema over arbitrary JSON body and returns a normalized result:
 *   { ok: true, data } | { ok: false, errors: [{field, message}, ...] }
 *
 * `field` is the dot-path of the error; top-level missing keys produce the
 * key name itself (e.g. `title_kk`) which matches our form field names 1:1.
 */
export function validateBody<T>(
  schema: ZodType<T>,
  body: unknown,
): ValidateOk<T> | ValidateFail {
  const res = schema.safeParse(body);
  if (res.success) {
    return { ok: true, data: res.data as T };
  }
  const errors: ValidationError[] = res.error.issues.map((issue) => ({
    field: issue.path.length ? issue.path.join('.') : '_root',
    message: issue.message,
  }));
  return { ok: false, errors };
}
