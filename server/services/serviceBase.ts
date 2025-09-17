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
  const ssl = process.env.PGSSL?.toLowerCase();
  if (ssl === "require" || ssl === "true" || ssl === "1") return { rejectUnauthorized: false };
  return undefined as any;
}

type QueryParams = any[] | Record<string, any>;

function buildQuery(sql: string, params: QueryParams): { sql: string; values: any[] } {
  if (Array.isArray(params)) return { sql, values: params };
  const keys = Object.keys(params);
  const values = keys.map((k) => (params as any)[k]);
  let newSql = sql;
  keys.forEach((k, i) => {
    const placeholder = new RegExp(`:${k}\\b`, "g");
    newSql = newSql.replace(placeholder, `$${i + 1}`);
  });
  return { sql: newSql, values };
}

export async function queryDb<T = any>(sql: string, params: QueryParams = []): Promise<T[]> {
  const p = getPool();
  if (!p) {
    console.warn("queryDb called without DATABASE_URL; returning empty result.", { sql });
    return [] as T[];
  }
  try {
    const { sql: finalSql, values } = buildQuery(sql, params);
    const res = await p.query(finalSql, values);
    return res.rows as T[];
  } catch (err) {
    console.warn("queryDb error; returning empty result.", String(err));
    return [] as T[];
  }
}

export async function executeDb(sql: string, params: any[] = []): Promise<{ rowCount: number }>{
  const p = getPool();
  if (!p) {
    console.warn("executeDb called without DATABASE_URL; no-op.", { sql });
    return { rowCount: 0 };
  }
  try {
    const res = await p.query(sql, params);
    return { rowCount: res.rowCount };
  } catch (err) {
    console.warn("executeDb error; no-op.", String(err));
    return { rowCount: 0 };
  }
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
