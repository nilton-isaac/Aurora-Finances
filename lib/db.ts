import "server-only";

import postgres from "postgres";

type SqlClient = ReturnType<typeof postgres>;

declare global {
  var __auroraSql: SqlClient | undefined;
  var __auroraFinanceStateEnsure: Promise<void> | undefined;
}

export function getRuntimeDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? null;
}

export function getDirectDatabaseUrl() {
  return process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? null;
}

export function isDatabaseConfigured() {
  return Boolean(getRuntimeDatabaseUrl());
}

export function getWorkspaceKey() {
  return process.env.AURORA_WORKSPACE_KEY ?? "default";
}

export function createDatabaseClient(connectionString: string) {
  return postgres(connectionString, {
    ssl: "require",
    prepare: false,
    max: 1,
    connect_timeout: 15,
    idle_timeout: 20
  });
}

export function getSql() {
  const databaseUrl = getRuntimeDatabaseUrl();

  if (!databaseUrl) {
    return null;
  }

  if (!globalThis.__auroraSql) {
    globalThis.__auroraSql = createDatabaseClient(databaseUrl);
  }

  return globalThis.__auroraSql;
}

export async function ensureFinanceStateTable() {
  const sql = getSql();

  if (!sql) {
    return false;
  }

  if (!globalThis.__auroraFinanceStateEnsure) {
    globalThis.__auroraFinanceStateEnsure = sql`
      create table if not exists public.finance_state (
        workspace_key text primary key,
        payload jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `.then(() => undefined);
  }

  await globalThis.__auroraFinanceStateEnsure;
  return true;
}
