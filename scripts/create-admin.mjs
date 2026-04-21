#!/usr/bin/env node
// Standalone-скрипт для prod: создать (или «починить») admin-юзера без запуска сидов.
// Если юзер с таким email уже есть — обновит password_hash + повысит роль до 'admin'.
// Вызов:
//   DATABASE_URL=postgres://... \
//   TIL_ADMIN_EMAIL=admin@til-kural.kz \
//   TIL_ADMIN_PASSWORD='StrongPass123!' \
//   node scripts/create-admin.mjs
import pg from 'pg';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[create-admin] DATABASE_URL not set');
  process.exit(1);
}

const email = (process.env.TIL_ADMIN_EMAIL || '').trim();
const pwd = process.env.TIL_ADMIN_PASSWORD || '';
const name = process.env.TIL_ADMIN_NAME || 'Admin';

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('[create-admin] TIL_ADMIN_EMAIL не задан или некорректен');
  process.exit(1);
}
if (!pwd || pwd.length < 8) {
  console.error('[create-admin] TIL_ADMIN_PASSWORD пустой или короче 8 символов');
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();

try {
  const hash = await bcrypt.hash(pwd, 12);
  const existing = await client.query(`SELECT id, email, role FROM users WHERE email = $1`, [email]);
  if (existing.rowCount > 0) {
    const row = existing.rows[0];
    await client.query(
      `UPDATE users SET password_hash = $1, role = 'admin', name = COALESCE(NULLIF(name, ''), $2) WHERE id = $3`,
      [hash, name, row.id],
    );
    console.log(`[create-admin] OK: обновлён существующий пользователь ${email} (id=${row.id}), роль → admin, пароль заменён`);
  } else {
    const res = await client.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin') RETURNING id`,
      [email, hash, name],
    );
    console.log(`[create-admin] OK: создан admin ${email} (id=${res.rows[0].id})`);
  }
  console.log(`[create-admin] Логин: POST /api/auth/login { email: '${email}', password: '***' }`);
} catch (err) {
  console.error('[create-admin] FAILED', err);
  process.exitCode = 1;
} finally {
  await client.end();
}
