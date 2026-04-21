#!/usr/bin/env node
// Заливает news/events/banners/test_questions сиды из src/data/seeds/ и
// src/data/test-questions-bank.json в Postgres напрямую.
// Вызов: DATABASE_URL=... node scripts/seed-postgres.mjs
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();

async function countRows(table) {
  const r = await client.query(`SELECT count(*)::int FROM ${table}`);
  return r.rows[0].count;
}

async function seed(table, rows, cols, mapper, opts = {}) {
  const existing = await countRows(table);
  if (existing > 0) { console.log(`[seed] ${table} уже содержит ${existing} записей, пропускаю`); return; }
  if (!rows.length) { console.log(`[seed] ${table}: нет данных для сидирования`); return; }
  const placeholders = (i) => '(' + cols.map((_, j) => `$${i * cols.length + j + 1}`).join(', ') + ')';
  const values = rows.map((r, i) => placeholders(i)).join(', ');
  const params = rows.flatMap(mapper);
  const onConflict = opts.onConflict === false ? '' : 'ON CONFLICT (id) DO NOTHING';
  const q = `INSERT INTO ${table} (${cols.join(', ')}) VALUES ${values} ${onConflict}`.trim();
  const res = await client.query(q, params);
  console.log(`[seed] ${table}: +${res.rowCount}`);
}

const load = (p) => JSON.parse(readFileSync(resolve(p), 'utf8'));

try {
  const news = load('src/data/seeds/news.json');
  await seed('news', news, ['id','slug','title_kk','title_ru','content_kk','content_ru','excerpt_kk','excerpt_ru','image_url','video_url','status','published_at','updated_at'],
    (n) => [n.id, n.slug, n.title_kk, n.title_ru, n.content_kk || null, n.content_ru || null, n.excerpt_kk || null, n.excerpt_ru || null, n.image_url || null, n.video_url || null, n.status || 'published', n.published_at || new Date().toISOString(), n.updated_at || new Date().toISOString()]);

  const events = load('src/data/seeds/events.json');
  await seed('events', events, ['id','title_kk','title_ru','description_kk','description_ru','image_url','event_type','start_date','end_date','location','registration_url','status'],
    (e) => [e.id, e.title_kk, e.title_ru, e.description_kk || null, e.description_ru || null, e.image_url || null, e.event_type || 'event', e.start_date, e.end_date || null, e.location || null, e.registration_url || null, e.status || 'upcoming']);

  const banners = load('src/data/seeds/banners.json');
  await seed('banners', banners, ['id','title','subtitle_kk','subtitle_ru','image_url','link_url','position','is_active','sort_order'],
    (b) => [b.id, b.title || null, b.subtitle_kk || null, b.subtitle_ru || null, b.image_url, b.link_url || null, b.position || 'hero', b.is_active !== false, b.sort_order ?? 0]);

  // test_questions — из src/data/test-questions-bank.json
  const tq = load('src/data/test-questions-bank.json');
  await seed('test_questions', tq, ['test_type','topic','difficulty','question_kk','question_ru','options','correct_answer','explanation_kk','explanation_ru'],
    (q) => [q.test_type, q.topic, q.difficulty, q.question_kk, q.question_ru || null, JSON.stringify(q.options || []), q.correct_answer, q.explanation_kk || null, q.explanation_ru || null],
    { onConflict: false });
  // тут id autogen через gen_random_uuid, не требуем id в cols

  // Создать первичного admin, если нет ни одного.
  // Пароль можно передать через TIL_ADMIN_PASSWORD, email — через TIL_ADMIN_EMAIL.
  // На проде ОБЯЗАТЕЛЬНО смените пароль через /admin/users → «Сбросить пароль».
  const adminCount = await client
    .query(`SELECT count(*)::int FROM users WHERE role='admin'`)
    .then((r) => r.rows[0].count);
  if (adminCount === 0) {
    const email = process.env.TIL_ADMIN_EMAIL || 'admin@til-kural.kz';
    const pwd = process.env.TIL_ADMIN_PASSWORD || 'ChangeMe2026!';
    const bcrypt = (await import('bcryptjs')).default;
    const hash = await bcrypt.hash(pwd, 12);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO NOTHING`,
      [email, hash, 'Admin'],
    );
    console.log(`[seed] admin создан: ${email} (пароль: ${pwd})`);
  } else {
    console.log(`[seed] admin уже есть (${adminCount}), пропускаю`);
  }
} catch (err) {
  console.error('[seed] FAILED', err);
  process.exitCode = 1;
} finally {
  await client.end();
}
