import postgres from "postgres";

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  console.error("DATABASE_URL ou DIRECT_URL não estão configuradas.");
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: "require",
  prepare: false,
  max: 1,
  connect_timeout: 15
});

try {
  const result = await sql`select now() as now, current_database() as database`;
  console.log("Conexão OK:", result[0]);
} catch (error) {
  console.error("Falha na conexão:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
