import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import postgres from "postgres";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DIRECT_URL ou DATABASE_URL não estão configuradas.");
  process.exit(1);
}

const sqlFilePath = resolve(process.cwd(), "supabase", "schema.sql");
const sqlFile = await readFile(sqlFilePath, "utf8");
const client = postgres(connectionString, {
  ssl: "require",
  prepare: false,
  max: 1,
  connect_timeout: 15
});

try {
  await client.unsafe(sqlFile);
  console.log("Migração executada com sucesso.");
} catch (error) {
  console.error("Falha ao executar migração:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end({ timeout: 5 });
}
