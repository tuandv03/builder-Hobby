import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "yugiohDb",
  password: "1",
  port: 5432,
});
type QueryParams = any[] | Record<string, any>;

function buildQuery(sql: string, params: QueryParams): { sql: string; values: any[] } {
  if (Array.isArray(params)) {
    // Dùng trực tiếp nếu params là array
    return { sql, values: params };
  }

  // Nếu params là object => map thành array + thay key thành $n
  const keys = Object.keys(params);
  const values = keys.map(k => params[k]);

  let newSql = sql;
  keys.forEach((k, i) => {
    const placeholder = new RegExp(`:${k}\\b`, "g"); // match :key
    newSql = newSql.replace(placeholder, `$${i + 1}`);
  });

  return { sql: newSql, values };
}

export async function queryDb<T = any>(
  sql: string,
  params: QueryParams = []
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const { sql: finalSql, values } = buildQuery(sql, params);
   // console.log("Executing SQL:", finalSql, values);
    const result = await client.query(finalSql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function executeDb(sql: string, params?: any[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(sql, params);
  } finally {
    client.release();
  }
}