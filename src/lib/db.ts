/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Data layer: Postgres (pg) when DATABASE_URL is set, otherwise in-memory fallback.
 * The same API (query / findOne / insert / update / delete / count / raw) works for both.
 */

import type { Pool as PgPool, QueryResult } from 'pg';

export interface DBRow {
  [key: string]: any;
}

interface DB {
  query(table: string, filter?: Record<string, any>, opts?: QueryOptions): Promise<DBRow[]>;
  findOne(table: string, filter: Record<string, any>): Promise<DBRow | null>;
  insert(table: string, data: DBRow): Promise<DBRow>;
  update(table: string, id: string, data: Partial<DBRow>): Promise<DBRow | null>;
  delete(table: string, id: string): Promise<boolean>;
  count(table: string, filter?: Record<string, any>): Promise<number>;
  /**
   * Подсчёт строк с учётом equality-фильтра + ILIKE-поиска по нескольким колонкам.
   * Используется вместе с `queryWithSearch` для серверной пагинации.
   */
  countWhere(
    table: string,
    filter?: Record<string, any>,
    searchCols?: string[],
    searchQuery?: string,
  ): Promise<number>;
  /**
   * SELECT с equality-фильтром + ILIKE-поиском по нескольким колонкам (case-insensitive).
   * Для in-memory режима: includes без учёта регистра.
   */
  queryWithSearch(
    table: string,
    filter: Record<string, any> | undefined,
    searchCols: string[] | undefined,
    searchQuery: string | undefined,
    opts?: QueryOptions,
  ): Promise<DBRow[]>;
  raw<T = any>(sql: string, params?: any[]): Promise<T[]>;
  isPostgres: boolean;
}

interface QueryOptions {
  orderBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

class InMemoryDB implements DB {
  isPostgres = false;
  private tables: Record<string, DBRow[]> = {
    users: [],
    lessons: [],
    user_lessons: [],
    test_questions: [],
    test_sessions: [],
    certificates: [],
    photo_checks: [],
    dialog_sessions: [],
    writing_checks: [],
    quests: [],
    user_quests: [],
    achievements: [],
    user_achievements: [],
    adaptive_exercises: [],
    news: [],
    events: [],
    banners: [],
    site_settings: [],
    media: [],
    push_subscriptions: [],
    departments: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        name_kk: 'Әкімшілік',
        name_ru: 'Администрация',
        description_kk: 'Орталықтың әкімшілік-басқару тобы.',
        description_ru: 'Административно-управленческая группа центра.',
        head_user_id: null,
        sort_order: 0,
        created_at: new Date().toISOString(),
      },
    ],
    staff: [
      {
        id: '00000000-0000-4000-8000-000000000101',
        name_kk: 'Игенберлина Мадинат Балтина',
        name_ru: 'Игенберлина Мадинат Балтина',
        position_kk: 'Директор',
        position_ru: 'Директор',
        department_id: '00000000-0000-4000-8000-000000000001',
        photo_url: null,
        email: null,
        phone: null,
        bio_kk: null,
        bio_ru: null,
        sort_order: 0,
        created_at: new Date().toISOString(),
      },
    ],
    rules_documents: [],
    grammar_rules: [],
    history_blocks: [
      {
        id: '00000000-0000-4000-8000-000000000501',
        year: '2024',
        title_kk: 'Орталықтың негізі қаланды',
        title_ru: 'Основание центра',
        description_kk: 'КМҚК "Тіл-құрал" оқу-әдістемелік орталығы Сәтбаев қаласында ашылды.',
        description_ru: 'В городе Сатпаев открыт КГУ «Учебно-методический центр „Тіл-құрал“».',
        image_url: null,
        sort_order: 10,
        created_at: new Date().toISOString(),
      },
      {
        id: '00000000-0000-4000-8000-000000000502',
        year: '2025',
        title_kk: 'KAZTEST дайындық бағдарламасы',
        title_ru: 'Запуск программы подготовки к KAZTEST',
        description_kk: 'Қазақ тілі бойынша KAZTEST емтиханына толыққанды дайындық.',
        description_ru: 'Полноценная подготовка к государственному экзамену KAZTEST.',
        image_url: null,
        sort_order: 20,
        created_at: new Date().toISOString(),
      },
      {
        id: '00000000-0000-4000-8000-000000000503',
        year: '2026',
        title_kk: 'AI-бағыты ашылды',
        title_ru: 'Открытие AI-направления',
        description_kk: 'Gemini негізіндегі AI-тәлімгер, фото-тексеру және диалог-жаттықтырушы іске қосылды.',
        description_ru: 'Запущены AI-наставник, фото-проверка и диалог-тренажёр на базе Gemini.',
        image_url: null,
        sort_order: 30,
        created_at: new Date().toISOString(),
      },
    ],
  };

  async query(table: string, filter?: Record<string, any>, opts?: QueryOptions) {
    let rows = this.tables[table] || [];
    if (filter) {
      rows = rows.filter((row) =>
        Object.entries(filter).every(([key, val]) => row[key] === val),
      );
    }
    if (opts?.orderBy) {
      const dir = opts.order === 'desc' ? -1 : 1;
      rows = [...rows].sort((a, b) => {
        const av = a[opts.orderBy!];
        const bv = b[opts.orderBy!];
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    if (opts?.offset) rows = rows.slice(opts.offset);
    if (opts?.limit) rows = rows.slice(0, opts.limit);
    return rows;
  }

  async findOne(table: string, filter: Record<string, any>) {
    return (await this.query(table, filter))[0] || null;
  }

  async insert(table: string, data: DBRow) {
    if (!this.tables[table]) this.tables[table] = [];
    const row = { ...data, id: data.id || crypto.randomUUID(), created_at: data.created_at || new Date().toISOString() };
    this.tables[table].push(row);
    return row;
  }

  async update(table: string, id: string, data: Partial<DBRow>) {
    const rows = this.tables[table] || [];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...data };
    return rows[idx];
  }

  async delete(table: string, id: string) {
    const rows = this.tables[table] || [];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    rows.splice(idx, 1);
    return true;
  }

  async count(table: string, filter?: Record<string, any>) {
    return (await this.query(table, filter)).length;
  }

  private applySearch(rows: DBRow[], searchCols?: string[], searchQuery?: string): DBRow[] {
    const q = searchQuery?.trim().toLowerCase();
    if (!q || !searchCols || searchCols.length === 0) return rows;
    return rows.filter((r) =>
      searchCols.some((c) => {
        const v = r[c];
        return typeof v === 'string' && v.toLowerCase().includes(q);
      }),
    );
  }

  async countWhere(
    table: string,
    filter?: Record<string, any>,
    searchCols?: string[],
    searchQuery?: string,
  ) {
    const rows = await this.query(table, filter);
    return this.applySearch(rows, searchCols, searchQuery).length;
  }

  async queryWithSearch(
    table: string,
    filter: Record<string, any> | undefined,
    searchCols: string[] | undefined,
    searchQuery: string | undefined,
    opts?: QueryOptions,
  ) {
    // Сначала фильтр + сортировка (без limit/offset), потом search, потом пагинация —
    // чтобы total/offset считались по отфильтрованному множеству.
    let rows = await this.query(table, filter, {
      orderBy: opts?.orderBy,
      order: opts?.order,
    });
    rows = this.applySearch(rows, searchCols, searchQuery);
    if (opts?.offset) rows = rows.slice(opts.offset);
    if (opts?.limit) rows = rows.slice(0, opts.limit);
    return rows;
  }

  async raw<T = any>(): Promise<T[]> {
    return [];
  }
}

class PostgresDB implements DB {
  isPostgres = true;
  private pool: PgPool;

  constructor(pool: PgPool) {
    this.pool = pool;
  }

  private buildWhere(filter?: Record<string, any>, startIdx = 1) {
    if (!filter || Object.keys(filter).length === 0) return { clause: '', values: [] as any[] };
    const entries = Object.entries(filter);
    const clauses = entries.map(([k], i) => `"${k}" = $${startIdx + i}`);
    return {
      clause: ' WHERE ' + clauses.join(' AND '),
      values: entries.map(([, v]) => v),
    };
  }

  async query(table: string, filter?: Record<string, any>, opts?: QueryOptions) {
    const { clause, values } = this.buildWhere(filter);
    let sql = `SELECT * FROM "${table}"${clause}`;
    if (opts?.orderBy) sql += ` ORDER BY "${opts.orderBy}" ${opts.order === 'desc' ? 'DESC' : 'ASC'}`;
    if (opts?.limit) sql += ` LIMIT ${Number(opts.limit)}`;
    if (opts?.offset) sql += ` OFFSET ${Number(opts.offset)}`;
    try {
      const res: QueryResult = await this.pool.query(sql, values);
      return res.rows;
    } catch (err: any) {
      // 22P02: invalid_text_representation — например, '/api/lessons/not-a-uuid'
      // приводит к касту строки в UUID-колонку. Превращаем 500 в пустой результат,
      // чтобы вызывающие маршруты возвращали 404.
      if (err?.code === '22P02') return [];
      throw err;
    }
  }

  async findOne(table: string, filter: Record<string, any>) {
    const rows = await this.query(table, filter, { limit: 1 });
    return rows[0] || null;
  }

  async insert(table: string, data: DBRow) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const cols = keys.map((k) => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) RETURNING *`;
    const res = await this.pool.query(sql, values);
    return res.rows[0];
  }

  async update(table: string, id: string, data: Partial<DBRow>) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.findOne(table, { id });
    const values = Object.values(data);
    const set = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const sql = `UPDATE "${table}" SET ${set} WHERE id = $${keys.length + 1} RETURNING *`;
    try {
      const res = await this.pool.query(sql, [...values, id]);
      return res.rows[0] || null;
    } catch (err: any) {
      if (err?.code === '22P02') return null;
      throw err;
    }
  }

  async delete(table: string, id: string) {
    try {
      const res = await this.pool.query(`DELETE FROM "${table}" WHERE id = $1`, [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err: any) {
      if (err?.code === '22P02') return false;
      throw err;
    }
  }

  async count(table: string, filter?: Record<string, any>) {
    const { clause, values } = this.buildWhere(filter);
    const res = await this.pool.query(`SELECT COUNT(*)::int AS c FROM "${table}"${clause}`, values);
    return res.rows[0]?.c ?? 0;
  }

  /**
   * Собирает WHERE с equality-фильтром и опциональным ILIKE по нескольким колонкам.
   * ILIKE-часть оборачивается в скобки: `(col1 ILIKE $N OR col2 ILIKE $N ...)`.
   * Один и тот же параметр `%search%` переиспользуется для всех колонок.
   */
  private buildWhereWithSearch(
    filter?: Record<string, any>,
    searchCols?: string[],
    searchQuery?: string,
  ) {
    const base = this.buildWhere(filter);
    const q = searchQuery?.trim();
    if (!q || !searchCols || searchCols.length === 0) return base;
    const nextIdx = base.values.length + 1;
    const likeValue = `%${q}%`;
    const likeClauses = searchCols.map((c) => `"${c}" ILIKE $${nextIdx}`).join(' OR ');
    const clause = base.clause
      ? `${base.clause} AND (${likeClauses})`
      : ` WHERE (${likeClauses})`;
    return { clause, values: [...base.values, likeValue] };
  }

  async countWhere(
    table: string,
    filter?: Record<string, any>,
    searchCols?: string[],
    searchQuery?: string,
  ) {
    const { clause, values } = this.buildWhereWithSearch(filter, searchCols, searchQuery);
    const res = await this.pool.query(
      `SELECT COUNT(*)::int AS c FROM "${table}"${clause}`,
      values,
    );
    return res.rows[0]?.c ?? 0;
  }

  async queryWithSearch(
    table: string,
    filter: Record<string, any> | undefined,
    searchCols: string[] | undefined,
    searchQuery: string | undefined,
    opts?: QueryOptions,
  ) {
    const { clause, values } = this.buildWhereWithSearch(filter, searchCols, searchQuery);
    let sql = `SELECT * FROM "${table}"${clause}`;
    if (opts?.orderBy) sql += ` ORDER BY "${opts.orderBy}" ${opts.order === 'desc' ? 'DESC' : 'ASC'}`;
    if (opts?.limit) sql += ` LIMIT ${Number(opts.limit)}`;
    if (opts?.offset) sql += ` OFFSET ${Number(opts.offset)}`;
    const res: QueryResult = await this.pool.query(sql, values);
    return res.rows;
  }

  async raw<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await this.pool.query(sql, params);
    return res.rows as T[];
  }
}

let dbInstance: DB | null = null;

function createDB(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[db] DATABASE_URL not set — using in-memory store (data will NOT persist).');
    }
    return new InMemoryDB();
  }
  try {
    // Lazy require so the app builds even without pg installed in some setups
    const pg = require('pg') as typeof import('pg');
    const pool = new pg.Pool({
      connectionString: url,
      max: Number(process.env.PG_POOL_MAX || 10),
    });
    pool.on('error', (err) => console.error('[pg] pool error:', err));
    return new PostgresDB(pool);
  } catch (err) {
    console.error('[db] Failed to init pg, falling back to in-memory:', err);
    return new InMemoryDB();
  }
}

const globalForDB = globalThis as unknown as {
  __tilkural_db?: DB;
  __tilkural_seeded?: Promise<void>;
};
export const db: DB = globalForDB.__tilkural_db || (dbInstance = createDB());
if (process.env.NODE_ENV !== 'production' && !globalForDB.__tilkural_db) {
  globalForDB.__tilkural_db = dbInstance!;
}

/**
 * Заливает стартовый контент в пустую in-memory БД (lessons, test_questions, news,
 * events, banners, grammar_rules). В Postgres сиды заливаются через sql/006_content_seeds.sql,
 * поэтому в PG-режиме функция — no-op.
 *
 * Защищена идемпотентностью: повторный вызов ничего не делает.
 */
export async function ensureSeeded(): Promise<void> {
  if (db.isPostgres) return;
  if (globalForDB.__tilkural_seeded) return globalForDB.__tilkural_seeded;

  const runSeed = async () => {
    try {
      const counts = {
        lessons: 0,
        test_questions: 0,
        news: 0,
        events: 0,
        banners: 0,
        grammar_rules: 0,
      };

      if ((await db.count('lessons')) === 0) {
        const { LESSONS } = await import('@/data/lessons-meta');
        for (const l of LESSONS) {
          await db.insert('lessons', {
            id: l.id,
            title_kk: l.title_kk,
            title_ru: l.title_ru,
            description_kk: l.description_kk,
            description_ru: l.description_ru,
            topic: l.topic,
            difficulty: l.difficulty,
            content: { rule_ids: l.rule_ids || [] },
            mentor_track: l.mentor_track || null,
            required_level: l.required_level || null,
            sort_order: Number(l.id) || 0,
          });
          counts.lessons++;
        }
      }

      if ((await db.count('test_questions')) === 0) {
        const bank = (await import('@/data/test-questions-bank.json')).default as Array<Record<string, unknown>>;
        for (const q of bank) {
          await db.insert('test_questions', {
            id: q.id,
            test_type: q.test_type,
            topic: q.topic,
            difficulty: q.difficulty,
            question_kk: q.question_kk,
            question_ru: q.question_ru || null,
            options: q.options || [],
            correct_answer: q.correct_answer,
            explanation_kk: q.explanation_kk || null,
            explanation_ru: q.explanation_ru || null,
          });
          counts.test_questions++;
        }
      }

      if ((await db.count('news')) === 0) {
        const newsSeed = (await import('@/data/seeds/news.json')).default as Array<Record<string, unknown>>;
        for (const n of newsSeed) {
          await db.insert('news', n);
          counts.news++;
        }
      }

      if ((await db.count('events')) === 0) {
        const eventsSeed = (await import('@/data/seeds/events.json')).default as Array<Record<string, unknown>>;
        for (const e of eventsSeed) {
          await db.insert('events', e);
          counts.events++;
        }
      }

      if ((await db.count('banners')) === 0) {
        const bannersSeed = (await import('@/data/seeds/banners.json')).default as Array<Record<string, unknown>>;
        for (const b of bannersSeed) {
          await db.insert('banners', b);
          counts.banners++;
        }
      }

      if ((await db.count('grammar_rules')) === 0) {
        const rulesSeed = (await import('@/data/seeds/grammar-rules.json')).default as Array<Record<string, unknown>>;
        let order = 0;
        for (const r of rulesSeed) {
          order += 10;
          await db.insert('grammar_rules', {
            id: r.id,
            topic: r.topic,
            title_kk: r.title_kk,
            title_ru: r.title_ru,
            level: r.level || 'A1',
            description_kk: r.description_kk || null,
            description_ru: r.description_ru || null,
            examples: r.examples || [],
            exceptions: r.exceptions || [],
            rule_order: order,
          });
          counts.grammar_rules++;
        }
      }

      const parts = Object.entries(counts)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${k}=${n}`)
        .join(' ');
      if (parts) {
        console.log(`[db] seeded ${parts}`);
      } else {
        console.log('[db] seeded (already populated)');
      }
    } catch (err) {
      console.error('[db] ensureSeeded failed:', err);
    }
  };

  globalForDB.__tilkural_seeded = runSeed();
  return globalForDB.__tilkural_seeded;
}

// Для in-memory режима запускаем сиды сразу при первом импорте модуля,
// чтобы публичные страницы и API видели контент без ручного «прогрева».
if (!db.isPostgres) {
  // Не блокируем экспорт — промис кэшируется в globalForDB.__tilkural_seeded.
  void ensureSeeded();
}
