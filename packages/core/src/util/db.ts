import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "#src/util/config.ts";

const { Pool } = pg;

let useSsl = false;
if (!["localhost", "0.0.0.0", "127.0.0.1"].includes(env.DB_HOST)) {
  useSsl = true;
}

export async function getDb() {
  const pool = new Pool({
    host: env.DB_BASTION_PROXY ?? env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });
  const db = drizzle(pool);
  return db;
}
