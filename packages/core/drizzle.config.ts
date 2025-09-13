import { defineConfig } from "drizzle-kit";
import { env } from "#src/util/config.ts";

let useSsl = false;
if (!["localhost", "0.0.0.0", "127.0.0.1"].includes(env.DB_HOST)) {
  useSsl = true;
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/*.schema.ts",
  out: "./drizzle.kit",
  dbCredentials: {
    host: env.DB_BASTION_PROXY ?? env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  },
});
