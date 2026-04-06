/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Database abstraction layer.
 * In production, replace with pg Pool or an ORM like Drizzle / Prisma.
 * For now provides an in-memory store so the app compiles and works without PostgreSQL.
 */

export interface DBRow {
  [key: string]: any;
}

class InMemoryDB {
  private tables: Record<string, DBRow[]> = {};

  constructor() {
    this.tables = {
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
    };
  }

  async query(table: string, filter?: Record<string, any>): Promise<DBRow[]> {
    const rows = this.tables[table] || [];
    if (!filter) return rows;
    return rows.filter((row) =>
      Object.entries(filter).every(([key, val]) => row[key] === val)
    );
  }

  async findOne(table: string, filter: Record<string, any>): Promise<DBRow | null> {
    const rows = await this.query(table, filter);
    return rows[0] || null;
  }

  async insert(table: string, data: DBRow): Promise<DBRow> {
    if (!this.tables[table]) this.tables[table] = [];
    const row = { ...data, id: data.id || crypto.randomUUID() };
    this.tables[table].push(row);
    return row;
  }

  async update(table: string, id: string, data: Partial<DBRow>): Promise<DBRow | null> {
    const rows = this.tables[table] || [];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...data };
    return rows[idx];
  }

  async delete(table: string, id: string): Promise<boolean> {
    const rows = this.tables[table] || [];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    rows.splice(idx, 1);
    return true;
  }

  async count(table: string, filter?: Record<string, any>): Promise<number> {
    const rows = await this.query(table, filter);
    return rows.length;
  }
}

const globalForDB = globalThis as unknown as { db: InMemoryDB };
export const db = globalForDB.db || new InMemoryDB();
if (process.env.NODE_ENV !== 'production') globalForDB.db = db;
