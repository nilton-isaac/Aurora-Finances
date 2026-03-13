export type MainTab = "dashboard" | "monthly" | "cards" | "reports";
export type DashboardSubTab = "overview" | "trends" | "alerts";
export type MonthlySubTab = "transactions" | "budget" | "goals";
export type CardsSubTab = "my-cards" | "installments" | "invoices";
export type TransactionType = "income" | "expense";
export type TransactionSource = "manual" | "installment" | "recurring";
export type GoalIcon = "piggy-bank" | "plane" | "house";
export type AccentColor =
  | "emerald"
  | "cyan"
  | "violet"
  | "fuchsia"
  | "amber"
  | "rose";
export type StorageMode = "local" | "database";

export interface TransactionRecurrence {
  frequency: "monthly";
  endMonthKey: string | null;
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  category: string;
  type: TransactionType;
  monthKey: string;
  createdAt: string;
  source: TransactionSource;
  cardId?: string | null;
  installmentId?: string | null;
  recurrence?: TransactionRecurrence | null;
  recurringTransactionId?: string | null;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  dueDay: number;
  closingDay: number;
  lastDigits: string;
  gradient: string;
  createdAt: string;
}

export interface InstallmentPlan {
  id: string;
  cardId: string;
  description: string;
  totalValue: number;
  installments: number;
  purchaseMonthKey: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: GoalIcon;
  accent: AccentColor;
  createdAt: string;
}

export interface ReportPreferences {
  email: string;
  enabled: boolean;
  frequency: "monthly" | "weekly";
}

export interface FinanceData {
  version: number;
  transactions: Transaction[];
  cards: CreditCard[];
  installments: InstallmentPlan[];
  goals: Goal[];
  reportPreferences: ReportPreferences;
}

export interface MonthOption {
  key: string;
  label: string;
  shortLabel: string;
  monthIndex: number;
  year: number;
}

export interface AlertItem {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  message: string;
}

export interface ToastItem {
  id: string;
  tone: "success" | "error" | "info";
  message: string;
}

export interface FinanceApiResponse {
  data: FinanceData;
  storageMode: StorageMode;
  workspaceKey: string;
  updatedAt: string | null;
}
