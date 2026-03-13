import { differenceInCalendarMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type {
  AlertItem,
  CreditCard,
  FinanceData,
  Goal,
  InstallmentPlan,
  MonthOption,
  Transaction,
  TransactionRecurrence
} from "@/lib/finance-types";

export const STORAGE_KEY = "aurora-finance:data:v1";
export const UI_STORAGE_KEY = "aurora-finance:ui:v1";
export const REPORT_FREQUENCIES = [
  { label: "Mensal", value: "monthly" as const },
  { label: "Semanal", value: "weekly" as const }
];
export const EXPENSE_DEFAULT_CATEGORY = "Geral";
export const CREDIT_CATEGORY = "Cartão de Crédito";

export function createId() {
  return crypto.randomUUID();
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

export function toMonthKey(date: Date) {
  return format(date, "yyyy-MM");
}

export function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function buildMonths(year = new Date().getFullYear()): MonthOption[] {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const baseDate = new Date(year, monthIndex, 1);
    return {
      key: format(baseDate, "yyyy-MM"),
      label: format(baseDate, "MMMM", { locale: ptBR }).replace(
        /^./,
        (char) => char.toUpperCase()
      ),
      shortLabel: format(baseDate, "MMM", { locale: ptBR }).replace(".", ""),
      monthIndex,
      year
    };
  });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function monthName(monthKey: string) {
  return format(parseMonthKey(monthKey), "MMMM yyyy", {
    locale: ptBR
  }).replace(/^./, (char) => char.toUpperCase());
}

export function valueFormatter(value: number) {
  return formatCompactCurrency(value);
}

export function sortTransactions(items: Transaction[]) {
  return [...items].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
}

export function getInstallmentMonthlyValue(plan: InstallmentPlan) {
  return Number((plan.totalValue / plan.installments).toFixed(2));
}

export function getInstallmentOccurrence(plan: InstallmentPlan, monthKey: string) {
  const diff = differenceInCalendarMonths(
    parseMonthKey(monthKey),
    parseMonthKey(plan.purchaseMonthKey)
  );

  if (diff < 0 || diff >= plan.installments) {
    return null;
  }

  return diff + 1;
}

export function getInstallmentTransaction(
  plan: InstallmentPlan,
  card: CreditCard | undefined,
  monthKey: string
): Transaction | null {
  const occurrence = getInstallmentOccurrence(plan, monthKey);

  if (!occurrence || !card) {
    return null;
  }

  const purchaseDate = parseMonthKey(plan.purchaseMonthKey);
  const createdAt = new Date(
    purchaseDate.getFullYear(),
    purchaseDate.getMonth() + (occurrence - 1),
    5
  ).toISOString();

  return {
    id: `${plan.id}:${monthKey}`,
    description: `Fatura ${card.name} (${plan.description})`,
    value: getInstallmentMonthlyValue(plan),
    category: CREDIT_CATEGORY,
    type: "expense",
    monthKey,
    createdAt,
    source: "installment",
    cardId: card.id,
    installmentId: plan.id
  };
}

function getRecurringTransactionCreatedAt(
  transaction: Transaction,
  targetMonthKey: string
) {
  const originalDate = new Date(transaction.createdAt);
  const targetDate = parseMonthKey(targetMonthKey);
  const lastDayOfMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0
  ).getDate();
  const day = Math.min(originalDate.getDate(), lastDayOfMonth);

  return new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    day,
    originalDate.getHours(),
    originalDate.getMinutes(),
    originalDate.getSeconds(),
    originalDate.getMilliseconds()
  ).toISOString();
}

function isRecurringTransactionActive(
  transaction: Transaction,
  monthKey: string,
  recurrence: TransactionRecurrence
) {
  const diff = differenceInCalendarMonths(
    parseMonthKey(monthKey),
    parseMonthKey(transaction.monthKey)
  );

  if (diff < 0) {
    return false;
  }

  if (recurrence.endMonthKey && monthKey > recurrence.endMonthKey) {
    return false;
  }

  return recurrence.frequency === "monthly";
}

export function getRecurringTransactionOccurrence(
  transaction: Transaction,
  monthKey: string
): Transaction | null {
  const recurrence = transaction.recurrence;

  if (!recurrence || !isRecurringTransactionActive(transaction, monthKey, recurrence)) {
    return null;
  }

  return {
    ...transaction,
    id: `${transaction.id}:${monthKey}`,
    monthKey,
    createdAt: getRecurringTransactionCreatedAt(transaction, monthKey),
    source: "recurring",
    recurringTransactionId: transaction.id
  };
}

export function getVisibleTransactions(data: FinanceData, monthKey: string) {
  const manualItems = data.transactions.filter(
    (transaction) =>
      transaction.source === "manual" &&
      transaction.monthKey === monthKey &&
      !transaction.recurrence
  );
  const recurringItems = data.transactions
    .filter(
      (transaction) => transaction.source === "manual" && Boolean(transaction.recurrence)
    )
    .map((transaction) => getRecurringTransactionOccurrence(transaction, monthKey))
    .filter((item): item is Transaction => item !== null);
  const installmentItems = data.installments
    .map((plan) =>
      getInstallmentTransaction(
        plan,
        data.cards.find((card) => card.id === plan.cardId),
        monthKey
      )
    )
    .filter((item): item is Transaction => item !== null);

  return sortTransactions([...manualItems, ...recurringItems, ...installmentItems]);
}

export function getMonthIncome(data: FinanceData, monthKey: string) {
  return getVisibleTransactions(data, monthKey)
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.value, 0);
}

export function getMonthExpense(data: FinanceData, monthKey: string) {
  return getVisibleTransactions(data, monthKey)
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.value, 0);
}

export function getMonthBalance(data: FinanceData, monthKey: string) {
  return getMonthIncome(data, monthKey) - getMonthExpense(data, monthKey);
}

export function getAnnualIncome(data: FinanceData, months: MonthOption[]) {
  return months.reduce((sum, month) => sum + getMonthIncome(data, month.key), 0);
}

export function getAnnualExpense(data: FinanceData, months: MonthOption[]) {
  return months.reduce((sum, month) => sum + getMonthExpense(data, month.key), 0);
}

export function getGlobalBalance(data: FinanceData, months: MonthOption[]) {
  return months.reduce((sum, month) => sum + getMonthBalance(data, month.key), 0);
}

export function getExpenseCategories(data: FinanceData, monthKey: string) {
  const categories = new Map<string, number>();

  getVisibleTransactions(data, monthKey)
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      categories.set(
        transaction.category,
        (categories.get(transaction.category) ?? 0) + transaction.value
      );
    });

  return Array.from(categories.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
}

export function getSixMonthWindow(months: MonthOption[], selectedMonthKey: string) {
  const selectedIndex = months.findIndex((month) => month.key === selectedMonthKey);
  const start = Math.max(0, selectedIndex - 5);
  return months.slice(start, selectedIndex + 1);
}

export function getCardInvoiceAmount(
  data: FinanceData,
  cardId: string,
  monthKey: string
) {
  return data.installments
    .filter((plan) => plan.cardId === cardId)
    .reduce((sum, plan) => {
      return getInstallmentOccurrence(plan, monthKey)
        ? sum + getInstallmentMonthlyValue(plan)
        : sum;
    }, 0);
}

export function getCardOutstandingAmount(
  data: FinanceData,
  cardId: string,
  monthKey: string
) {
  return data.installments
    .filter((plan) => plan.cardId === cardId)
    .reduce((sum, plan) => {
      const occurrence = getInstallmentOccurrence(plan, monthKey);

      if (!occurrence) {
        return sum;
      }

      const remainingInstallments = plan.installments - occurrence + 1;
      return sum + getInstallmentMonthlyValue(plan) * remainingInstallments;
    }, 0);
}

export function getActiveInstallments(data: FinanceData, monthKey: string) {
  return data.installments
    .map((plan) => {
      const currentInstallment = getInstallmentOccurrence(plan, monthKey);

      if (!currentInstallment) {
        return null;
      }

      return {
        ...plan,
        currentInstallment,
        monthlyValue: getInstallmentMonthlyValue(plan),
        cardName:
          data.cards.find((card) => card.id === plan.cardId)?.name ?? "Sem cartão"
      };
    })
    .filter((item) => item !== null)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getAlerts(data: FinanceData, monthKey: string): AlertItem[] {
  const alerts: AlertItem[] = [];
  const monthBalance = getMonthBalance(data, monthKey);

  if (monthBalance < 0) {
    alerts.push({
      id: "negative-balance",
      type: "danger",
      title: "Saldo negativo",
      message:
        "As despesas do mês superaram as receitas. Revise gastos variáveis e faturas."
    });
  }

  data.cards.forEach((card) => {
    const usage = getCardOutstandingAmount(data, card.id, monthKey) / card.limit;

    if (usage >= 0.8) {
      alerts.push({
        id: `card-usage-${card.id}`,
        type: usage >= 1 ? "danger" : "warning",
        title: `${card.name} com limite pressionado`,
        message: `Utilização atual em ${formatPercent(
          usage
        )}. Considere reduzir novas compras neste ciclo.`
      });
    }
  });

  if (alerts.length === 0) {
    alerts.push({
      id: "all-good",
      type: "info",
      title: "Tudo sob controle",
      message:
        "Nenhum alerta crítico encontrado para o mês selecionado. O fluxo financeiro está saudável."
    });
  }

  return alerts;
}

export function goalProgress(goal: Goal) {
  return goal.target > 0 ? Math.min(goal.current / goal.target, 1) : 0;
}

export function clampPositive(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function parseMoneyInput(value: string) {
  const numeric = Number(value.replace(",", "."));
  return Number.isFinite(numeric) ? numeric : NaN;
}

export function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
