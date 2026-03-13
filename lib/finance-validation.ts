import type { FinanceData } from "@/lib/finance-types";

export function isFinanceData(value: unknown): value is FinanceData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<FinanceData>;

  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.transactions) &&
    Array.isArray(candidate.cards) &&
    Array.isArray(candidate.installments) &&
    Array.isArray(candidate.goals) &&
    Boolean(candidate.reportPreferences) &&
    typeof candidate.reportPreferences?.email === "string" &&
    typeof candidate.reportPreferences?.enabled === "boolean" &&
    (candidate.reportPreferences?.frequency === "monthly" ||
      candidate.reportPreferences?.frequency === "weekly")
  );
}
