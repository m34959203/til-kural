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
    const res: QueryResult = await this.pool.query(sql, values);
    return res.rows;
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
    const res = await this.pool.query(sql, [...values, id]);
    return res.rows[0] || null;
  }

  async delete(table: string, id: string) {
    const res = await this.pool.query(`DELETE FROM "${table}" WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async count(table: string, filter?: Record<string, any>) {
    const { clause, values } = this.buildWhere(filter);
    const res = await this.pool.query(`SELECT COUNT(*)::int AS c FROM "${table}"${clause}`, values);
    return res.rows[0]?.c ?? 0;
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

const globalForDB = globalThis as unknown as { __tilkural_db?: DB };
export const db: DB = globalForDB.__tilkural_db || (dbInstance = createDB());
if (process.env.NODE_ENV !== 'production' && !globalForDB.__tilkural_db) {
  globalForDB.__tilkural_db = dbInstance!;
}
