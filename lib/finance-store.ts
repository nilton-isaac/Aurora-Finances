import "server-only";

import type { FinanceApiResponse, FinanceData } from "@/lib/finance-types";
import { createSeedFinanceData } from "@/lib/seed-data";
import {
  ensureFinanceStateTable,
  getSql,
  getWorkspaceKey,
  isDatabaseConfigured
} from "@/lib/db";

type FinanceStateRow = {
  payload: FinanceData;
  updated_at: string;
};

export async function loadFinanceState(): Promise<FinanceApiResponse | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const sql = getSql();

  if (!sql) {
    return null;
  }

  await ensureFinanceStateTable();

  const workspaceKey = getWorkspaceKey();
  const rows = await sql<FinanceStateRow[]>`
    select payload, updated_at
    from public.finance_state
    where workspace_key = ${workspaceKey}
    limit 1
  `;

  if (rows.length === 0) {
    const seed = createSeedFinanceData();
    const inserted = await saveFinanceState(seed);

    return {
      data: inserted.data,
      storageMode: "database",
      workspaceKey,
      updatedAt: inserted.updatedAt
    };
  }

  return {
    data: rows[0].payload,
    storageMode: "database",
    workspaceKey,
    updatedAt: rows[0].updated_at
  };
}

export async function saveFinanceState(data: FinanceData) {
  const sql = getSql();

  if (!sql) {
    throw new Error("DATABASE_URL or DIRECT_URL is not configured.");
  }

  await ensureFinanceStateTable();

  const workspaceKey = getWorkspaceKey();
  const payload = JSON.parse(JSON.stringify(data));
  const rows = await sql<FinanceStateRow[]>`
    insert into public.finance_state (workspace_key, payload, updated_at)
    values (${workspaceKey}, ${sql.json(payload)}, now())
    on conflict (workspace_key)
    do update set
      payload = excluded.payload,
      updated_at = now()
    returning payload, updated_at
  `;

  return {
    data: rows[0].payload,
    updatedAt: rows[0].updated_at
  };
}

export async function checkFinanceDatabaseConnection() {
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      reason: "DATABASE_URL e DIRECT_URL não estão configuradas."
    };
  }

  const sql = getSql();

  if (!sql) {
    return {
      ok: false,
      reason: "Não foi possível criar o client SQL."
    };
  }

  await ensureFinanceStateTable();
  await sql`select 1`;

  return {
    ok: true,
    reason: null
  };
}
