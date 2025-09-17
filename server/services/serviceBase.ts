import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool | null {
  try {
    if (pool) return pool;
    const connString = process.env.DATABASE_URL;
    if (!connString) return null;
    pool = new Pool({ connectionString: connString, ssl: getSslOption() });
    return pool;
  } catch (err) {
    console.warn("DB pool init failed:", err);
    return null;
  }
}

function getSslOption(): any {
  // Allow non-SSL by default unless explicitly required in env
  const ssl = process.env.PGSSL?.toLowerCase();
  if (ssl === "require" || ssl === "true" || ssl === "1") return { rejectUnauthorized: false };
  return undefined as any;
}

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  if (!p) {
    console.warn("queryDb called without DATABASE_URL; returning empty result.", { sql });
    return [] as T[];
  }
  const res = await p.query(sql, params);
  return res.rows as T[];
}

export async function executeDb(sql: string, params: any[] = []): Promise<{ rowCount: number }>{
  const p = getPool();
  if (!p) {
    console.warn("executeDb called without DATABASE_URL; no-op.", { sql });
    return { rowCount: 0 };
  }
  const res = await p.query(sql, params);
  return { rowCount: res.rowCount };
}
