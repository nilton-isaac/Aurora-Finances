"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Badge,
  BarChart,
  Card,
  DonutChart,
  LineChart,
  Metric,
  ProgressBar,
  Text,
  Title
} from "@tremor/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  Landmark,
  Mail,
  Minus,
  PiggyBank,
  Plane,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  TriangleAlert,
  Wallet
} from "lucide-react";

import { buildReportMailto, exportFinancePdf, exportFinanceWorkbook } from "@/lib/reporting";
import type {
  CardsSubTab,
  DashboardSubTab,
  FinanceApiResponse,
  FinanceData,
  Goal,
  GoalIcon,
  MainTab,
  MonthlySubTab,
  StorageMode,
  ToastItem,
  TransactionType
} from "@/lib/finance-types";
import { createSeedFinanceData } from "@/lib/seed-data";
import {
  buildMonths,
  clampPositive,
  createId,
  EXPENSE_DEFAULT_CATEGORY,
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  getActiveInstallments,
  getAlerts,
  getAnnualExpense,
  getAnnualIncome,
  getCardInvoiceAmount,
  getCardOutstandingAmount,
  getExpenseCategories,
  getGlobalBalance,
  getMonthBalance,
  getMonthExpense,
  getMonthIncome,
  getSixMonthWindow,
  getVisibleTransactions,
  goalProgress,
  monthName,
  parseMoneyInput,
  REPORT_FREQUENCIES,
  sanitizeText,
  STORAGE_KEY,
  toMonthKey,
  UI_STORAGE_KEY,
  validateEmail,
  valueFormatter
} from "@/lib/finance-utils";

const CARD_GRADIENTS = [
  "from-violet-600 via-fuchsia-600 to-slate-900",
  "from-cyan-500 via-sky-500 to-slate-900",
  "from-emerald-500 via-teal-500 to-slate-900",
  "from-amber-500 via-orange-500 to-slate-900"
];

const MAIN_TABS: Array<{
  id: MainTab;
  label: string;
  icon: typeof BarChart3;
}> = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "monthly", label: "Controle Mensal", icon: Calendar },
  { id: "cards", label: "Cartões", icon: CreditCard },
  { id: "reports", label: "Relatórios", icon: FileText }
];

const DASHBOARD_SUBTABS: DashboardSubTab[] = ["overview", "trends", "alerts"];
const MONTHLY_SUBTABS: MonthlySubTab[] = ["transactions", "budget", "goals"];
const CARDS_SUBTABS: CardsSubTab[] = ["my-cards", "installments", "invoices"];

const GOAL_ICONS: Record<GoalIcon, typeof PiggyBank> = {
  "piggy-bank": PiggyBank,
  plane: Plane,
  house: Home
};

const GOAL_STYLES: Record<
  Goal["accent"],
  { panel: string; text: string; progress: "emerald" | "cyan" | "violet" | "fuchsia" | "amber" | "rose" }
> = {
  emerald: {
    panel: "from-emerald-400/15 to-emerald-500/5 border-emerald-300/20",
    text: "text-emerald-300",
    progress: "emerald"
  },
  cyan: {
    panel: "from-cyan-400/15 to-sky-500/5 border-cyan-300/20",
    text: "text-cyan-300",
    progress: "cyan"
  },
  violet: {
    panel: "from-violet-400/15 to-violet-500/5 border-violet-300/20",
    text: "text-violet-300",
    progress: "violet"
  },
  fuchsia: {
    panel: "from-fuchsia-400/15 to-fuchsia-500/5 border-fuchsia-300/20",
    text: "text-fuchsia-300",
    progress: "fuchsia"
  },
  amber: {
    panel: "from-amber-400/15 to-orange-500/5 border-amber-300/20",
    text: "text-amber-300",
    progress: "amber"
  },
  rose: {
    panel: "from-rose-400/15 to-rose-500/5 border-rose-300/20",
    text: "text-rose-300",
    progress: "rose"
  }
};

type TransactionFormState = {
  description: string;
  value: string;
  category: string;
};

type CardFormState = {
  name: string;
  limit: string;
  dueDay: string;
  closingDay: string;
  lastDigits: string;
};

type InstallmentFormState = {
  cardId: string;
  description: string;
  totalValue: string;
  installments: string;
};

type GoalFormState = {
  name: string;
  target: string;
  current: string;
  icon: GoalIcon;
  accent: Goal["accent"];
};

type PersistedUiState = {
  mainTab: MainTab;
  dashboardSubTab: DashboardSubTab;
  monthlySubTab: MonthlySubTab;
  cardsSubTab: CardsSubTab;
  selectedMonthKey: string;
};

type SyncStatus = "booting" | "local" | "saving" | "synced" | "error";

function readFinanceData() {
  if (typeof window === "undefined") {
    return createSeedFinanceData();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createSeedFinanceData();
  }

  try {
    return JSON.parse(raw) as FinanceData;
  } catch {
    return createSeedFinanceData();
  }
}

function readUiState(currentMonthKey: string): PersistedUiState {
  if (typeof window === "undefined") {
    return {
      mainTab: "dashboard",
      dashboardSubTab: "overview",
      monthlySubTab: "transactions",
      cardsSubTab: "my-cards",
      selectedMonthKey: currentMonthKey
    };
  }

  const raw = window.localStorage.getItem(UI_STORAGE_KEY);

  if (!raw) {
    return {
      mainTab: "dashboard",
      dashboardSubTab: "overview",
      monthlySubTab: "transactions",
      cardsSubTab: "my-cards",
      selectedMonthKey: currentMonthKey
    };
  }

  try {
    const parsed = JSON.parse(raw) as PersistedUiState;
    return {
      mainTab: parsed.mainTab ?? "dashboard",
      dashboardSubTab: parsed.dashboardSubTab ?? "overview",
      monthlySubTab: parsed.monthlySubTab ?? "transactions",
      cardsSubTab: parsed.cardsSubTab ?? "my-cards",
      selectedMonthKey: parsed.selectedMonthKey ?? currentMonthKey
    };
  } catch {
    return {
      mainTab: "dashboard",
      dashboardSubTab: "overview",
      monthlySubTab: "transactions",
      cardsSubTab: "my-cards",
      selectedMonthKey: currentMonthKey
    };
  }
}

function toneClass(tone: ToastItem["tone"]) {
  if (tone === "success") {
    return "alert-success";
  }

  if (tone === "error") {
    return "alert-error";
  }

  return "alert-info";
}

async function getApiError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? `Erro HTTP ${response.status}`;
  } catch {
    return `Erro HTTP ${response.status}`;
  }
}

export default function AuroraFinanceApp() {
  const today = new Date();
  const currentMonthKey = toMonthKey(today);
  const months = buildMonths(today.getFullYear());
  const [data, setData] = useState<FinanceData>(() => readFinanceData());
  const [ui, setUi] = useState<PersistedUiState>(() => readUiState(currentMonthKey));
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("booting");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const remoteLoadedRef = useRef(false);
  const remotePersistenceEnabledRef = useRef(false);
  const skipNextRemoteSaveRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("income");
  const [transactionForm, setTransactionForm] = useState<TransactionFormState>({
    description: "",
    value: "",
    category: ""
  });
  const [cardForm, setCardForm] = useState<CardFormState>({
    name: "",
    limit: "",
    dueDay: "8",
    closingDay: "1",
    lastDigits: ""
  });
  const [installmentForm, setInstallmentForm] = useState<InstallmentFormState>({
    cardId: "",
    description: "",
    totalValue: "",
    installments: "1"
  });
  const [goalForm, setGoalForm] = useState<GoalFormState>({
    name: "",
    target: "",
    current: "",
    icon: "piggy-bank",
    accent: "emerald"
  });

  const selectedMonth =
    months.find((month) => month.key === ui.selectedMonthKey) ??
    months[Math.min(today.getMonth(), months.length - 1)];
  const visibleTransactions = getVisibleTransactions(data, selectedMonth.key);
  const monthIncome = getMonthIncome(data, selectedMonth.key);
  const monthExpense = getMonthExpense(data, selectedMonth.key);
  const monthBalance = getMonthBalance(data, selectedMonth.key);
  const annualIncome = getAnnualIncome(data, months);
  const annualExpense = getAnnualExpense(data, months);
  const globalBalance = getGlobalBalance(data, months);
  const expenseCategories = getExpenseCategories(data, selectedMonth.key);
  const sixMonthWindow = getSixMonthWindow(months, selectedMonth.key);
  const activeInstallments = getActiveInstallments(data, selectedMonth.key);
  const alerts = getAlerts(data, selectedMonth.key);
  const totalCardSpend = data.cards.reduce(
    (sum, card) => sum + getCardInvoiceAmount(data, card.id, selectedMonth.key),
    0
  );
  const areaChartData = months.map((month) => ({
    month: month.shortLabel,
    Receitas: getMonthIncome(data, month.key),
    Despesas: getMonthExpense(data, month.key)
  }));
  const barChartData = sixMonthWindow.map((month) => ({
    month: month.shortLabel,
    Saldo: getMonthBalance(data, month.key)
  }));
  const lineChartData = sixMonthWindow.map((month) => ({
    month: month.shortLabel,
    Cartões: data.cards.reduce(
      (sum, card) => sum + getCardInvoiceAmount(data, card.id, month.key),
      0
    )
  }));
  const lastSyncedLabel = lastSyncedAt
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
      }).format(new Date(lastSyncedAt))
    : null;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(ui));
  }, [ui]);

  useEffect(() => {
    let cancelled = false;

    async function loadRemoteState() {
      try {
        const response = await fetch("/api/finance", {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(await getApiError(response));
        }

        const payload = (await response.json()) as FinanceApiResponse;

        if (cancelled) {
          return;
        }

        setData(payload.data);
        setStorageMode(payload.storageMode);
        setLastSyncedAt(payload.updatedAt);
        setSyncStatus("synced");
        remotePersistenceEnabledRef.current = payload.storageMode === "database";
        skipNextRemoteSaveRef.current = true;

        if (payload.storageMode === "database") {
          pushToast("success", "Conexão com Supabase/Postgres ativada.");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStorageMode("local");
        setSyncStatus("local");
        remotePersistenceEnabledRef.current = false;
        pushToast(
          "info",
          error instanceof Error
            ? `${error.message} Usando cache local por enquanto.`
            : "Conexão indisponível. Usando cache local por enquanto."
        );
      } finally {
        remoteLoadedRef.current = true;
      }
    }

    loadRemoteState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!remoteLoadedRef.current || !remotePersistenceEnabledRef.current) {
      return;
    }

    if (skipNextRemoteSaveRef.current) {
      skipNextRemoteSaveRef.current = false;
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    setSyncStatus("saving");

    saveTimerRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/finance", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ data })
        });

        if (!response.ok) {
          throw new Error(await getApiError(response));
        }

        const payload = (await response.json()) as { updatedAt?: string };
        setLastSyncedAt(payload.updatedAt ?? new Date().toISOString());
        setSyncStatus("synced");
      } catch (error) {
        setSyncStatus("error");
        pushToast(
          "error",
          error instanceof Error
            ? `Falha ao sincronizar com o banco: ${error.message}`
            : "Falha ao sincronizar com o banco."
        );
      }
    }, 700);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [data]);

  function pushToast(tone: ToastItem["tone"], message: string) {
    const id = createId();

    setToasts((current) => [{ id, tone, message }, ...current].slice(0, 3));

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3400);
  }

  function updateUi<K extends keyof PersistedUiState>(
    key: K,
    value: PersistedUiState[K]
  ) {
    setUi((current) => ({ ...current, [key]: value }));
  }

  function openTransactionModal(nextType: TransactionType) {
    setTransactionType(nextType);
    setTransactionForm({
      description: "",
      value: "",
      category: nextType === "expense" ? EXPENSE_DEFAULT_CATEGORY : ""
    });
    setShowTransactionModal(true);
  }

  function submitTransaction() {
    const description = sanitizeText(transactionForm.description);
    const parsedValue = parseMoneyInput(transactionForm.value);
    const category = sanitizeText(transactionForm.category || "");

    if (!description) {
      pushToast("error", "A descrição da transação é obrigatória.");
      return;
    }

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      pushToast("error", "Informe um valor maior que zero.");
      return;
    }

    setData((current) => ({
      ...current,
      transactions: [
        {
          id: createId(),
          description,
          value: parsedValue,
          category:
            transactionType === "expense"
              ? category || EXPENSE_DEFAULT_CATEGORY
              : category || "Receita",
          type: transactionType,
          monthKey: selectedMonth.key,
          createdAt: new Date().toISOString(),
          source: "manual"
        },
        ...current.transactions
      ]
    }));

    setShowTransactionModal(false);
    pushToast(
      "success",
      transactionType === "income"
        ? "Receita adicionada com sucesso."
        : "Despesa adicionada com sucesso."
    );
  }

  function deleteTransaction(id: string, source: FinanceData["transactions"][number]["source"]) {
    if (source !== "manual") {
      pushToast("info", "Parcelamentos são removidos pela aba Cartões.");
      return;
    }

    if (!window.confirm("Remover esta transação?")) {
      return;
    }

    setData((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.id !== id)
    }));
    pushToast("success", "Transação removida.");
  }

  function submitCard() {
    const name = sanitizeText(cardForm.name);
    const limit = parseMoneyInput(cardForm.limit);
    const dueDay = Number(cardForm.dueDay);
    const closingDay = Number(cardForm.closingDay);
    const lastDigits = sanitizeText(cardForm.lastDigits).slice(-4);

    if (!name) {
      pushToast("error", "Informe o nome do cartão.");
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      pushToast("error", "O limite do cartão precisa ser maior que zero.");
      return;
    }

    setData((current) => ({
      ...current,
      cards: [
        {
          id: createId(),
          name,
          limit,
          dueDay: dueDay >= 1 && dueDay <= 28 ? dueDay : 8,
          closingDay: closingDay >= 1 && closingDay <= 28 ? closingDay : 1,
          lastDigits: lastDigits || String(Math.floor(1000 + Math.random() * 9000)),
          gradient: CARD_GRADIENTS[current.cards.length % CARD_GRADIENTS.length],
          createdAt: new Date().toISOString()
        },
        ...current.cards
      ]
    }));

    setCardForm({
      name: "",
      limit: "",
      dueDay: "8",
      closingDay: "1",
      lastDigits: ""
    });
    setShowCardModal(false);
    pushToast("success", "Cartão cadastrado.");
  }

  function deleteCard(cardId: string) {
    const card = data.cards.find((item) => item.id === cardId);

    if (!card) {
      return;
    }

    if (
      !window.confirm(
        `Excluir ${card.name} e remover parcelamentos vinculados a ele?`
      )
    ) {
      return;
    }

    setData((current) => ({
      ...current,
      cards: current.cards.filter((item) => item.id !== cardId),
      installments: current.installments.filter((item) => item.cardId !== cardId)
    }));
    pushToast("success", "Cartão removido.");
  }

  function submitInstallment() {
    const description = sanitizeText(installmentForm.description);
    const totalValue = parseMoneyInput(installmentForm.totalValue);
    const installments = Number(installmentForm.installments);

    if (!installmentForm.cardId) {
      pushToast("error", "Selecione um cartão para o parcelamento.");
      return;
    }

    if (!description) {
      pushToast("error", "A descrição da compra é obrigatória.");
      return;
    }

    if (!Number.isFinite(totalValue) || totalValue <= 0) {
      pushToast("error", "O valor total precisa ser maior que zero.");
      return;
    }

    if (!Number.isFinite(installments) || installments < 1) {
      pushToast("error", "O número de parcelas deve ser no mínimo 1.");
      return;
    }

    setData((current) => ({
      ...current,
      installments: [
        {
          id: createId(),
          cardId: installmentForm.cardId,
          description,
          totalValue,
          installments,
          purchaseMonthKey: selectedMonth.key,
          createdAt: new Date().toISOString()
        },
        ...current.installments
      ]
    }));

    setInstallmentForm({
      cardId: data.cards[0]?.id ?? "",
      description: "",
      totalValue: "",
      installments: "1"
    });
    setShowInstallmentModal(false);
    pushToast("success", "Compra parcelada criada e integrada ao mês.");
  }

  function deleteInstallment(installmentId: string) {
    if (!window.confirm("Excluir este parcelamento?")) {
      return;
    }

    setData((current) => ({
      ...current,
      installments: current.installments.filter(
        (installment) => installment.id !== installmentId
      )
    }));
    pushToast("success", "Parcelamento removido.");
  }

  function submitGoal() {
    const name = sanitizeText(goalForm.name);
    const target = parseMoneyInput(goalForm.target);
    const current = parseMoneyInput(goalForm.current || "0");

    if (!name) {
      pushToast("error", "Informe um nome para a meta.");
      return;
    }

    if (!Number.isFinite(target) || target <= 0) {
      pushToast("error", "A meta precisa ter valor alvo maior que zero.");
      return;
    }

    if (!Number.isFinite(current) || current < 0) {
      pushToast("error", "O valor atual da meta não pode ser negativo.");
      return;
    }

    setData((currentData) => ({
      ...currentData,
      goals: [
        {
          id: createId(),
          name,
          target,
          current,
          icon: goalForm.icon,
          accent: goalForm.accent,
          createdAt: new Date().toISOString()
        },
        ...currentData.goals
      ]
    }));

    setGoalForm({
      name: "",
      target: "",
      current: "",
      icon: "piggy-bank",
      accent: "emerald"
    });
    setShowGoalModal(false);
    pushToast("success", "Meta adicionada.");
  }

  function updateGoalCurrent(goalId: string, nextValue: number) {
    setData((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, current: clampPositive(nextValue) }
          : goal
      )
    }));
  }

  function deleteGoal(goalId: string) {
    if (!window.confirm("Excluir esta meta?")) {
      return;
    }

    setData((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== goalId)
    }));
    pushToast("success", "Meta removida.");
  }

  function saveReportPreferences() {
    if (!validateEmail(data.reportPreferences.email)) {
      pushToast("error", "Informe um email válido para os relatórios.");
      return;
    }

    pushToast("success", "Preferências de relatório atualizadas.");
  }

  function sendEmailSummary() {
    const email = data.reportPreferences.email;

    if (!validateEmail(email)) {
      pushToast("error", "Configure um email válido antes do envio.");
      return;
    }

    window.location.href = buildReportMailto(data, months, selectedMonth.key, email);
  }

  function resetDemoData() {
    if (!window.confirm("Restaurar os dados demo do Aurora Finance?")) {
      return;
    }

    setData(createSeedFinanceData(today));
    updateUi("selectedMonthKey", currentMonthKey);
    pushToast("info", "Dados demo restaurados.");
  }

  return (
    <main className="aurora-app min-h-screen pb-12">
      <div className="aurora-noise" />

      <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 xl:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 text-slate-950 shadow-lg shadow-lime-500/20">
                <Landmark className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-white">
                    Aurora <span className="text-lime-300">Finance</span>
                  </h1>
                  <Badge color={storageMode === "database" ? "emerald" : "gray"}>
                    {storageMode === "database" ? "Banco conectado" : "Modo local"}
                  </Badge>
                  <Badge
                    color={
                      syncStatus === "synced"
                        ? "emerald"
                        : syncStatus === "saving"
                          ? "yellow"
                          : syncStatus === "error"
                            ? "rose"
                            : "gray"
                    }
                  >
                    {syncStatus === "synced"
                      ? "Sincronizado"
                      : syncStatus === "saving"
                        ? "Salvando"
                        : syncStatus === "error"
                          ? "Erro sync"
                          : syncStatus === "booting"
                            ? "Conectando"
                            : "Cache local"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">
                  Dashboard financeiro funcional em React, Tremor e daisyUI.
                  {lastSyncedLabel ? ` Última sync: ${lastSyncedLabel}.` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricPanel
                label="Receita anual"
                value={formatCompactCurrency(annualIncome)}
                tone="emerald"
              />
              <MetricPanel
                label="Despesa anual"
                value={formatCompactCurrency(annualExpense)}
                tone="rose"
              />
              <MetricPanel
                label="Saldo global"
                value={formatCompactCurrency(globalBalance)}
                tone="cyan"
              />
              <MetricPanel
                label="Cartões ativos"
                value={String(data.cards.length)}
                tone="violet"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {MAIN_TABS.map((tab) => (
              <MainTabPill
                key={tab.id}
                active={ui.mainTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => updateUi("mainTab", tab.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-8 sm:px-6 xl:px-8">
        <section className="glass-panel rounded-[2rem] p-4 shadow-2xl shadow-slate-950/20 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Mês ativo
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {monthName(selectedMonth.key)}
              </h2>
              <p className="text-sm text-slate-400">
                Todas as visões usam o mês selecionado como referência.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-ghost btn-sm rounded-2xl text-slate-200"
                onClick={() => {
                  const previousMonth = months[selectedMonth.monthIndex - 1];
                  if (previousMonth) {
                    updateUi("selectedMonthKey", previousMonth.key);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <select
                className="select select-bordered w-full min-w-52 rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                value={selectedMonth.key}
                onChange={(event) =>
                  updateUi("selectedMonthKey", event.target.value)
                }
              >
                {months.map((month) => (
                  <option key={month.key} value={month.key}>
                    {month.label} {month.year}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-ghost btn-sm rounded-2xl text-slate-200"
                onClick={() => {
                  const nextMonth = months[selectedMonth.monthIndex + 1];
                  if (nextMonth) {
                    updateUi("selectedMonthKey", nextMonth.key);
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {ui.mainTab === "dashboard" && (
          <section className="section-enter space-y-6">
            <div className="flex flex-wrap gap-2">
              {DASHBOARD_SUBTABS.map((tab) => (
                <TabPill
                  key={tab}
                  active={ui.dashboardSubTab === tab}
                  label={tab === "overview" ? "Visão geral" : tab === "trends" ? "Tendências" : "Alertas"}
                  onClick={() => updateUi("dashboardSubTab", tab)}
                />
              ))}
            </div>

            {ui.dashboardSubTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <HighlightCard
                    icon={ArrowDownLeft}
                    title="Receita mensal"
                    value={formatCurrency(monthIncome)}
                    caption="Entradas confirmadas no período"
                    tone="emerald"
                  />
                  <HighlightCard
                    icon={ArrowUpRight}
                    title="Despesas totais"
                    value={formatCurrency(monthExpense)}
                    caption="Inclui parcelamentos ativos"
                    tone="rose"
                  />
                  <HighlightCard
                    icon={Wallet}
                    title="Saldo do mês"
                    value={formatCurrency(monthBalance)}
                    caption={monthBalance >= 0 ? "Fluxo positivo" : "Atenção ao caixa"}
                    tone={monthBalance >= 0 ? "cyan" : "amber"}
                  />
                  <HighlightCard
                    icon={CreditCard}
                    title="Gasto em cartões"
                    value={formatCurrency(totalCardSpend)}
                    caption={`${data.cards.length} cartões acompanhados`}
                    tone="violet"
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                  <Card className="glass-panel rounded-[1.75rem] border-0 p-0 shadow-none">
                    <div className="p-6">
                      <Title className="text-white">Evolução anual</Title>
                      <Text className="text-slate-400">
                        Receitas e despesas do ano corrente.
                      </Text>
                    </div>
                    <AreaChart
                      className="h-80 px-3 pb-6"
                      data={areaChartData}
                      index="month"
                      categories={["Receitas", "Despesas"]}
                      colors={["emerald", "rose"]}
                      valueFormatter={valueFormatter}
                      showAnimation
                      yAxisWidth={72}
                    />
                  </Card>

                  <Card className="glass-panel rounded-[1.75rem] border-0 p-0 shadow-none">
                    <div className="p-6">
                      <Title className="text-white">Distribuição</Title>
                      <Text className="text-slate-400">
                        Gastos por categoria no mês ativo.
                      </Text>
                    </div>
                    {expenseCategories.length > 0 ? (
                      <DonutChart
                        className="h-80 px-3 pb-6"
                        data={expenseCategories}
                        category="value"
                        index="name"
                        colors={["emerald", "violet", "cyan", "rose", "amber", "blue"]}
                        valueFormatter={valueFormatter}
                        showAnimation
                      />
                    ) : (
                      <SectionEmpty
                        title="Sem despesas lançadas"
                        description="Cadastre despesas para visualizar a distribuição por categoria."
                      />
                    )}
                  </Card>
                </div>
              </div>
            )}

            {ui.dashboardSubTab === "trends" && (
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="glass-panel rounded-[1.75rem] border-0 p-0 shadow-none">
                  <div className="p-6">
                    <Title className="text-white">Saldo dos últimos 6 meses</Title>
                    <Text className="text-slate-400">
                      Tendência de caixa até o mês selecionado.
                    </Text>
                  </div>
                  <BarChart
                    className="h-80 px-3 pb-6"
                    data={barChartData}
                    index="month"
                    categories={["Saldo"]}
                    colors={["cyan"]}
                    valueFormatter={valueFormatter}
                    showAnimation
                    yAxisWidth={72}
                  />
                </Card>

                <Card className="glass-panel rounded-[1.75rem] border-0 p-0 shadow-none">
                  <div className="p-6">
                    <Title className="text-white">Gastos com cartão</Title>
                    <Text className="text-slate-400">
                      Parcelamentos vigentes nos últimos 6 meses.
                    </Text>
                  </div>
                  <LineChart
                    className="h-80 px-3 pb-6"
                    data={lineChartData}
                    index="month"
                    categories={["Cartões"]}
                    colors={["violet"]}
                    valueFormatter={valueFormatter}
                    showAnimation
                    yAxisWidth={72}
                  />
                </Card>
              </div>
            )}

            {ui.dashboardSubTab === "alerts" && (
              <div className="grid gap-4 lg:grid-cols-2">
                {alerts.map((alert) => (
                  <article
                    key={alert.id}
                    className={`glass-panel rounded-[1.75rem] border p-6 ${
                      alert.type === "danger"
                        ? "border-rose-400/30"
                        : alert.type === "warning"
                          ? "border-amber-400/30"
                          : "border-cyan-400/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl ${
                          alert.type === "danger"
                            ? "bg-rose-400/15 text-rose-300"
                            : alert.type === "warning"
                              ? "bg-amber-400/15 text-amber-300"
                              : "bg-cyan-400/15 text-cyan-300"
                        }`}
                      >
                        {alert.type === "danger" ? (
                          <ShieldAlert className="h-5 w-5" />
                        ) : alert.type === "warning" ? (
                          <TriangleAlert className="h-5 w-5" />
                        ) : (
                          <Sparkles className="h-5 w-5" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">
                          {alert.title}
                        </h3>
                        <p className="text-sm leading-6 text-slate-300">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {ui.mainTab === "monthly" && (
          <section className="section-enter space-y-6">
            <div className="flex flex-wrap gap-2">
              {MONTHLY_SUBTABS.map((tab) => (
                <TabPill
                  key={tab}
                  active={ui.monthlySubTab === tab}
                  label={
                    tab === "transactions"
                      ? "Transações"
                      : tab === "budget"
                        ? "Orçamento"
                        : "Metas"
                  }
                  onClick={() => updateUi("monthlySubTab", tab)}
                />
              ))}
            </div>

            {ui.monthlySubTab === "transactions" && (
              <section className="glass-panel overflow-hidden rounded-[1.75rem]">
                <div className="flex flex-col gap-4 border-b border-white/10 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Todas as transações
                    </h3>
                    <p className="text-sm text-slate-400">
                      Receitas, despesas manuais e parcelas do mês.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="btn rounded-2xl border-0 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
                      onClick={() => openTransactionModal("income")}
                    >
                      <Plus className="h-4 w-4" />
                      Receita
                    </button>
                    <button
                      className="btn rounded-2xl border-0 bg-rose-400/15 text-rose-200 hover:bg-rose-400/25"
                      onClick={() => openTransactionModal("expense")}
                    >
                      <Plus className="h-4 w-4" />
                      Despesa
                    </button>
                  </div>
                </div>

                {visibleTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Descrição</th>
                          <th className="px-6 py-4">Categoria</th>
                          <th className="px-6 py-4">Tipo</th>
                          <th className="px-6 py-4 text-right">Valor</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6">
                        {visibleTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-white/4">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                    transaction.type === "income"
                                      ? "bg-emerald-400/15 text-emerald-300"
                                      : "bg-rose-400/15 text-rose-300"
                                  }`}
                                >
                                  {transaction.type === "income" ? (
                                    <ArrowDownLeft className="h-4 w-4" />
                                  ) : (
                                    <ArrowUpRight className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-white">
                                    {transaction.description}
                                  </p>
                                  {transaction.source === "installment" && (
                                    <p className="text-xs text-violet-300">
                                      Lançamento automático de parcelamento
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-200">
                                {transaction.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                color={
                                  transaction.type === "income" ? "emerald" : "rose"
                                }
                              >
                                {transaction.type === "income" ? "Receita" : "Despesa"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right font-semibold">
                              <span
                                className={
                                  transaction.type === "income"
                                    ? "text-emerald-300"
                                    : "text-rose-300"
                                }
                              >
                                {transaction.type === "income" ? "+ " : "- "}
                                {formatCurrency(transaction.value)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                className={`btn btn-ghost btn-sm rounded-2xl ${
                                  transaction.source === "manual"
                                    ? "text-slate-400 hover:text-rose-300"
                                    : "text-slate-600"
                                }`}
                                onClick={() =>
                                  deleteTransaction(transaction.id, transaction.source)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <SectionEmpty
                    title="Nenhuma transação cadastrada"
                    description="Cadastre receitas ou despesas para acompanhar o mês."
                  />
                )}
              </section>
            )}

            {ui.monthlySubTab === "budget" && (
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="glass-panel rounded-[1.75rem] border-0 p-6 shadow-none">
                  <Title className="text-white">Orçamento por categoria</Title>
                  <Text className="text-slate-400">
                    Participação de cada categoria nas despesas do mês.
                  </Text>

                  <div className="mt-6 space-y-5">
                    {expenseCategories.length > 0 ? (
                      expenseCategories.map((category) => (
                        <div key={category.name} className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-slate-200">
                              {category.name}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {formatCurrency(category.value)}
                            </span>
                          </div>
                          <ProgressBar
                            value={
                              monthExpense > 0
                                ? Math.min((category.value / monthExpense) * 100, 100)
                                : 0
                            }
                            color="emerald"
                          />
                        </div>
                      ))
                    ) : (
                      <SectionEmpty
                        title="Sem categorias ainda"
                        description="As despesas do mês serão distribuídas aqui automaticamente."
                      />
                    )}
                  </div>
                </Card>

                <Card className="glass-panel rounded-[1.75rem] border-0 p-6 shadow-none">
                  <Title className="text-white">Resumo do mês</Title>
                  <Text className="text-slate-400">
                    Consolidação financeira do período selecionado.
                  </Text>

                  <div className="mt-6 space-y-4">
                    <SummaryRow
                      label="Receitas"
                      value={formatCurrency(monthIncome)}
                      tone="emerald"
                    />
                    <SummaryRow
                      label="Despesas"
                      value={formatCurrency(monthExpense)}
                      tone="rose"
                    />
                    <SummaryRow
                      label="Saldo"
                      value={formatCurrency(monthBalance)}
                      tone={monthBalance >= 0 ? "cyan" : "amber"}
                    />
                  </div>
                </Card>
              </div>
            )}

            {ui.monthlySubTab === "goals" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Metas financeiras
                    </h3>
                    <p className="text-sm text-slate-400">
                      Atualize os saldos atuais e acompanhe o progresso.
                    </p>
                  </div>
                  <button
                    className="btn rounded-2xl border-0 bg-violet-400/15 text-violet-200 hover:bg-violet-400/25"
                    onClick={() => setShowGoalModal(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Nova meta
                  </button>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  {data.goals.map((goal) => {
                    const Icon = GOAL_ICONS[goal.icon];
                    const styles = GOAL_STYLES[goal.accent];

                    return (
                      <article
                        key={goal.id}
                        className={`glass-panel rounded-[1.75rem] border bg-gradient-to-br p-6 ${styles.panel}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{goal.name}</h4>
                              <p className={`text-sm ${styles.text}`}>
                                {formatCurrency(goal.current)} de{" "}
                                {formatCurrency(goal.target)}
                              </p>
                            </div>
                          </div>

                          <button
                            className="btn btn-ghost btn-sm rounded-2xl text-slate-400 hover:text-rose-300"
                            onClick={() => deleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-6">
                          <ProgressBar
                            value={goalProgress(goal) * 100}
                            color={styles.progress}
                          />
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-300">Progresso</span>
                            <span className={`font-medium ${styles.text}`}>
                              {formatPercent(goalProgress(goal))}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-slate-500">
                            Atualizar valor atual
                          </label>
                          <input
                            className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                            type="number"
                            min="0"
                            step="0.01"
                            value={goal.current}
                            onChange={(event) =>
                              updateGoalCurrent(goal.id, Number(event.target.value))
                            }
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}
        {ui.mainTab === "cards" && (
          <section className="section-enter space-y-6">
            <div className="flex flex-wrap gap-2">
              {CARDS_SUBTABS.map((tab) => (
                <TabPill
                  key={tab}
                  active={ui.cardsSubTab === tab}
                  label={
                    tab === "my-cards"
                      ? "Meus cartões"
                      : tab === "installments"
                        ? "Parcelamentos"
                        : "Faturas"
                  }
                  onClick={() => updateUi("cardsSubTab", tab)}
                />
              ))}
            </div>

            {ui.cardsSubTab === "my-cards" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Cartões cadastrados
                    </h3>
                    <p className="text-sm text-slate-400">
                      Visualização com limite, uso atual e dados do ciclo.
                    </p>
                  </div>
                  <button
                    className="btn rounded-2xl border-0 bg-violet-400/15 text-violet-200 hover:bg-violet-400/25"
                    onClick={() => setShowCardModal(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar cartão
                  </button>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  {data.cards.map((card) => {
                    const outstanding = getCardOutstandingAmount(
                      data,
                      card.id,
                      selectedMonth.key
                    );
                    const usage = card.limit > 0 ? outstanding / card.limit : 0;

                    return (
                      <div key={card.id} className="card-flip h-72">
                        <div className="card-flip-inner">
                          <div
                            className={`card-face border border-white/10 bg-gradient-to-br ${card.gradient} p-6`}
                          >
                            <div className="flex h-full flex-col justify-between">
                              <div className="flex items-start justify-between">
                                <div className="h-10 w-14 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-400 opacity-90" />
                                <button
                                  className="btn btn-ghost btn-sm rounded-2xl text-slate-200 hover:text-rose-300"
                                  onClick={() => deleteCard(card.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
                                  Limite utilizado
                                </p>
                                <p className="mt-2 text-3xl font-semibold text-white">
                                  {formatCurrency(outstanding)}
                                </p>
                                <p className="text-sm text-slate-200/75">
                                  de {formatCurrency(card.limit)}
                                </p>
                              </div>

                              <div className="space-y-3">
                                <ProgressBar
                                  value={Math.min(usage * 100, 100)}
                                  color={usage >= 0.8 ? "rose" : "violet"}
                                />
                                <div className="flex items-center justify-between text-sm text-white">
                                  <span>{card.name}</span>
                                  <span>•••• {card.lastDigits}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="card-face card-face-back glass-panel p-6">
                            <div className="flex h-full flex-col justify-between">
                              <div className="space-y-3">
                                <div className="h-12 rounded-xl bg-black/80" />
                                <div>
                                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                                    Fechamento
                                  </p>
                                  <p className="mt-1 text-lg font-semibold text-white">
                                    Dia {card.closingDay}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                                    Vencimento
                                  </p>
                                  <p className="mt-1 text-lg font-semibold text-white">
                                    Dia {card.dueDay}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                                  Fatura atual
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-violet-200">
                                  {formatCurrency(
                                    getCardInvoiceAmount(data, card.id, selectedMonth.key)
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {ui.cardsSubTab === "installments" && (
              <section className="glass-panel overflow-hidden rounded-[1.75rem]">
                <div className="flex flex-col gap-4 border-b border-white/10 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Parcelamentos ativos
                    </h3>
                    <p className="text-sm text-slate-400">
                      Compras em andamento no mês selecionado.
                    </p>
                  </div>
                  <button
                    className="btn rounded-2xl border-0 bg-violet-400/15 text-violet-200 hover:bg-violet-400/25 disabled:bg-slate-800 disabled:text-slate-500"
                    disabled={data.cards.length === 0}
                    onClick={() => {
                      setInstallmentForm((current) => ({
                        ...current,
                        cardId: current.cardId || data.cards[0]?.id || ""
                      }));
                      setShowInstallmentModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Nova compra
                  </button>
                </div>

                {activeInstallments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Compra</th>
                          <th className="px-6 py-4">Cartão</th>
                          <th className="px-6 py-4">Parcelas</th>
                          <th className="px-6 py-4">Valor mensal</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6">
                        {activeInstallments.map((installment) => (
                          <tr key={installment.id} className="hover:bg-white/4">
                            <td className="px-6 py-4 font-medium text-white">
                              {installment.description}
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {installment.cardName}
                            </td>
                            <td className="px-6 py-4">
                              <Badge color="violet">
                                {installment.currentInstallment}/
                                {installment.installments}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-white">
                              {formatCurrency(installment.monthlyValue)}
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {formatCurrency(installment.totalValue)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                className="btn btn-ghost btn-sm rounded-2xl text-slate-400 hover:text-rose-300"
                                onClick={() => deleteInstallment(installment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <SectionEmpty
                    title="Nenhum parcelamento ativo"
                    description="Adicione compras parceladas para distribuir o gasto ao longo dos meses."
                  />
                )}
              </section>
            )}

            {ui.cardsSubTab === "invoices" && (
              <div className="grid gap-6 xl:grid-cols-2">
                {data.cards.map((card) => {
                  const cardItems = activeInstallments.filter(
                    (installment) => installment.cardId === card.id
                  );

                  return (
                    <Card
                      key={card.id}
                      className="glass-panel rounded-[1.75rem] border-0 p-6 shadow-none"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Title className="text-white">{card.name}</Title>
                          <Text className="text-slate-400">
                            Fecha dia {card.closingDay} e vence dia {card.dueDay}
                          </Text>
                        </div>
                        <Metric className="text-violet-200">
                          {formatCurrency(
                            getCardInvoiceAmount(data, card.id, selectedMonth.key)
                          )}
                        </Metric>
                      </div>

                      <div className="mt-6 space-y-3">
                        {cardItems.length > 0 ? (
                          cardItems.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-white">
                                    {item.description}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Parcela {item.currentInstallment} de{" "}
                                    {item.installments}
                                  </p>
                                </div>
                                <span className="font-medium text-white">
                                  {formatCurrency(item.monthlyValue)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <SectionEmpty
                            title="Sem compras no ciclo"
                            description="Não há parcelamentos ativos para este cartão no mês selecionado."
                          />
                        )}
                      </div>

                      <button
                        className="btn mt-6 rounded-2xl border-0 bg-violet-400/15 text-violet-200 hover:bg-violet-400/25"
                        onClick={() => {
                          updateUi("mainTab", "monthly");
                          updateUi("monthlySubTab", "transactions");
                          pushToast(
                            "info",
                            "As parcelas da fatura já estão refletidas nas despesas do mês."
                          );
                        }}
                      >
                        Ver lançamentos do mês
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {ui.mainTab === "reports" && (
          <section className="section-enter space-y-6">
            <div className="grid gap-4 xl:grid-cols-3">
              <ActionCard
                icon={FileText}
                title="Exportar Excel"
                description="Baixa os dados financeiros completos em planilha."
                tone="emerald"
                onClick={() => exportFinanceWorkbook(data, months)}
              />
              <ActionCard
                icon={BarChart3}
                title="Gerar PDF"
                description="Cria um resumo em PDF do mês selecionado."
                tone="cyan"
                onClick={() => exportFinancePdf(data, months, selectedMonth.key)}
              />
              <ActionCard
                icon={Mail}
                title="Enviar resumo"
                description="Abre o email padrão com um resumo financeiro pronto."
                tone="violet"
                onClick={sendEmailSummary}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="glass-panel rounded-[1.75rem] border-0 p-6 shadow-none">
                <Title className="text-white">Preferências de relatório</Title>
                <Text className="text-slate-400">
                  Estrutura pronta para plugar Supabase Edge Functions ou Vercel Cron.
                </Text>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Email de destino
                    </label>
                    <input
                      className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                      type="email"
                      value={data.reportPreferences.email}
                      onChange={(event) =>
                        setData((current) => ({
                          ...current,
                          reportPreferences: {
                            ...current.reportPreferences,
                            email: event.target.value
                          }
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Frequência
                    </label>
                    <select
                      className="select select-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                      value={data.reportPreferences.frequency}
                      onChange={(event) =>
                        setData((current) => ({
                          ...current,
                          reportPreferences: {
                            ...current.reportPreferences,
                            frequency: event.target.value as "monthly" | "weekly"
                          }
                        }))
                      }
                    >
                      {REPORT_FREQUENCIES.map((frequency) => (
                        <option key={frequency.value} value={frequency.value}>
                          {frequency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    className="toggle toggle-success"
                    type="checkbox"
                    checked={data.reportPreferences.enabled}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        reportPreferences: {
                          ...current.reportPreferences,
                          enabled: event.target.checked
                        }
                      }))
                    }
                  />
                  <span className="text-sm text-slate-300">
                    Manter preferências ativas para integração futura com envio automático
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    className="btn rounded-2xl border-0 bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/25"
                    onClick={saveReportPreferences}
                  >
                    <Save className="h-4 w-4" />
                    Salvar preferências
                  </button>
                  <button
                    className="btn rounded-2xl border-0 bg-white/8 text-white hover:bg-white/12"
                    onClick={resetDemoData}
                  >
                    Restaurar demo
                  </button>
                </div>
              </Card>

              <Card className="glass-panel rounded-[1.75rem] border-0 p-6 shadow-none">
                <Title className="text-white">Pronto para deploy</Title>
                <Text className="text-slate-400">
                  Base preparada para Vercel e conexão com Supabase.
                </Text>

                <div className="mt-6 space-y-4">
                  <StatusRow label="Persistência local funcional" active />
                  <StatusRow label="Tailwind + daisyUI + Tremor integrados" active />
                  <StatusRow label="Schema Supabase incluído" active />
                  <StatusRow
                    label="Conexão ativa com Postgres/Supabase"
                    active={storageMode === "database"}
                  />
                </div>
              </Card>
            </div>
          </section>
        )}
      </div>

      <ModalShell
        open={showTransactionModal}
        title={transactionType === "income" ? "Nova receita" : "Nova despesa"}
        description={`Cadastro para ${monthName(selectedMonth.key)}.`}
        onClose={() => setShowTransactionModal(false)}
      >
        <div className="grid gap-4">
          <FormField label="Descrição">
            <input
              className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
              value={transactionForm.description}
              onChange={(event) =>
                setTransactionForm((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              placeholder="Ex.: salário, aluguel, mercado"
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Valor">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                type="number"
                min="0"
                step="0.01"
                value={transactionForm.value}
                onChange={(event) =>
                  setTransactionForm((current) => ({
                    ...current,
                    value: event.target.value
                  }))
                }
              />
            </FormField>
            <FormField label="Categoria">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                value={transactionForm.category}
                onChange={(event) =>
                  setTransactionForm((current) => ({
                    ...current,
                    category: event.target.value
                  }))
                }
                placeholder={transactionType === "expense" ? "Geral" : "Receita"}
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="btn rounded-2xl border-white/10 bg-white/6 text-white hover:bg-white/10"
            onClick={() => setShowTransactionModal(false)}
          >
            Cancelar
          </button>
          <button
            className={`btn rounded-2xl border-0 ${
              transactionType === "income"
                ? "bg-emerald-400/20 text-emerald-200 hover:bg-emerald-400/30"
                : "bg-rose-400/20 text-rose-200 hover:bg-rose-400/30"
            }`}
            onClick={submitTransaction}
          >
            Salvar
          </button>
        </div>
      </ModalShell>

      <ModalShell
        open={showCardModal}
        title="Novo cartão"
        description="Cadastro com limite e detalhes do ciclo."
        onClose={() => setShowCardModal(false)}
      >
        <div className="grid gap-4">
          <FormField label="Nome do cartão">
            <input
              className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
              value={cardForm.name}
              onChange={(event) =>
                setCardForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Limite total">
            <input
              className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
              type="number"
              min="0"
              step="0.01"
              value={cardForm.limit}
              onChange={(event) =>
                setCardForm((current) => ({ ...current, limit: event.target.value }))
              }
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Fechamento">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                type="number"
                min="1"
                max="28"
                value={cardForm.closingDay}
                onChange={(event) =>
                  setCardForm((current) => ({
                    ...current,
                    closingDay: event.target.value
                  }))
                }
              />
            </FormField>
            <FormField label="Vencimento">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                type="number"
                min="1"
                max="28"
                value={cardForm.dueDay}
                onChange={(event) =>
                  setCardForm((current) => ({ ...current, dueDay: event.target.value }))
                }
              />
            </FormField>
            <FormField label="4 últimos dígitos">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                value={cardForm.lastDigits}
                maxLength={4}
                onChange={(event) =>
                  setCardForm((current) => ({
                    ...current,
                    lastDigits: event.target.value
                  }))
                }
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="btn rounded-2xl border-white/10 bg-white/6 text-white hover:bg-white/10"
            onClick={() => setShowCardModal(false)}
          >
            Cancelar
          </button>
          <button
            className="btn rounded-2xl border-0 bg-violet-400/20 text-violet-200 hover:bg-violet-400/30"
            onClick={submitCard}
          >
            Criar cartão
          </button>
        </div>
      </ModalShell>

      <ModalShell
        open={showInstallmentModal}
        title="Nova compra parcelada"
        description={`Lançamento automático em ${monthName(selectedMonth.key)}.`}
        onClose={() => setShowInstallmentModal(false)}
      >
        <div className="grid gap-4">
          <FormField label="Cartão">
            <select
              className="select select-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
              value={installmentForm.cardId}
              onChange={(event) =>
                setInstallmentForm((current) => ({
                  ...current,
                  cardId: event.target.value
                }))
              }
            >
              <option value="">Selecione</option>
              {data.cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Descrição">
            <input
              className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
              value={installmentForm.description}
              onChange={(event) =>
                setInstallmentForm((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              placeholder="Ex.: notebook, viagem, sofá"
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Valor total">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                type="number"
                min="0"
                step="0.01"
                value={installmentForm.totalValue}
                onChange={(event) =>
                  setInstallmentForm((current) => ({
                    ...current,
                    totalValue: event.target.value
                  }))
                }
              />
            </FormField>
            <FormField label="Parcelas">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                type="number"
                min="1"
                value={installmentForm.installments}
                onChange={(event) =>
                  setInstallmentForm((current) => ({
                    ...current,
                    installments: event.target.value
                  }))
                }
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="btn rounded-2xl border-white/10 bg-white/6 text-white hover:bg-white/10"
            onClick={() => setShowInstallmentModal(false)}
          >
            Cancelar
          </button>
          <button
            className="btn rounded-2xl border-0 bg-violet-400/20 text-violet-200 hover:bg-violet-400/30"
            onClick={submitInstallment}
          >
            Criar parcelamento
          </button>
        </div>
      </ModalShell>

      <ModalShell
        open={showGoalModal}
        title="Nova meta"
        description="Cadastre objetivos e acompanhe o progresso."
        onClose={() => setShowGoalModal(false)}
      >
        <div className="grid gap-4">
          <FormField label="Nome da meta">
            <input
              className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
              value={goalForm.name}
              onChange={(event) =>
                setGoalForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Valor alvo">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                type="number"
                min="0"
                step="0.01"
                value={goalForm.target}
                onChange={(event) =>
                  setGoalForm((current) => ({ ...current, target: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Valor atual">
              <input
                className="input input-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                type="number"
                min="0"
                step="0.01"
                value={goalForm.current}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    current: event.target.value
                  }))
                }
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Ícone">
              <select
                className="select select-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                value={goalForm.icon}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    icon: event.target.value as GoalIcon
                  }))
                }
              >
                <option value="piggy-bank">Reserva</option>
                <option value="plane">Viagem</option>
                <option value="house">Moradia</option>
              </select>
            </FormField>
            <FormField label="Cor">
              <select
                className="select select-bordered w-full rounded-2xl border-white/10 bg-slate-900/70 text-slate-100"
                value={goalForm.accent}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    accent: event.target.value as Goal["accent"]
                  }))
                }
              >
                {Object.keys(GOAL_STYLES).map((accent) => (
                  <option key={accent} value={accent}>
                    {accent}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="btn rounded-2xl border-white/10 bg-white/6 text-white hover:bg-white/10"
            onClick={() => setShowGoalModal(false)}
          >
            Cancelar
          </button>
          <button
            className="btn rounded-2xl border-0 bg-emerald-400/20 text-emerald-200 hover:bg-emerald-400/30"
            onClick={submitGoal}
          >
            Criar meta
          </button>
        </div>
      </ModalShell>

      <ToastViewport toasts={toasts} />
    </main>
  );
}

function MetricPanel({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "cyan" | "violet";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "rose"
        ? "text-rose-300"
        : tone === "cyan"
          ? "text-cyan-300"
          : "text-violet-300";

  return (
    <div className="glass-panel rounded-[1.5rem] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function MainTabPill({
  active,
  icon: Icon,
  label,
  onClick
}: {
  active: boolean;
  icon: typeof BarChart3;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`btn rounded-2xl border px-5 ${
        active
          ? "border-lime-300/40 bg-lime-300/10 text-lime-200"
          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function TabPill({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-white text-slate-900"
          : "bg-white/6 text-slate-300 hover:bg-white/10"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function HighlightCard({
  icon: Icon,
  title,
  value,
  caption,
  tone
}: {
  icon: typeof Wallet;
  title: string;
  value: string;
  caption: string;
  tone: "emerald" | "rose" | "cyan" | "amber" | "violet";
}) {
  const badgeClass =
    tone === "emerald"
      ? "bg-emerald-400/15 text-emerald-300"
      : tone === "rose"
        ? "bg-rose-400/15 text-rose-300"
        : tone === "cyan"
          ? "bg-cyan-400/15 text-cyan-300"
          : tone === "amber"
            ? "bg-amber-400/15 text-amber-300"
            : "bg-violet-400/15 text-violet-300";

  return (
    <article className="glass-panel rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${badgeClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <Badge color={tone === "amber" ? "yellow" : tone}>{title}</Badge>
      </div>
      <p className="mt-5 text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{caption}</p>
    </article>
  );
}

function SectionEmpty({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-80 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 text-slate-300">
        <Minus className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-medium text-white">{title}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "cyan" | "amber";
}) {
  const classes =
    tone === "emerald"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
      : tone === "rose"
        ? "border-rose-300/20 bg-rose-400/10 text-rose-200"
        : tone === "cyan"
          ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
          : "border-amber-300/20 bg-amber-400/10 text-amber-200";

  return (
    <div className={`rounded-[1.5rem] border px-4 py-4 ${classes}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-100">{label}</span>
        <span className="text-lg font-semibold">{value}</span>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  tone,
  onClick
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  tone: "emerald" | "cyan" | "violet";
  onClick: () => void;
}) {
  const classes =
    tone === "emerald"
      ? "from-emerald-400/15 to-emerald-500/5 border-emerald-300/20 text-emerald-200"
      : tone === "cyan"
        ? "from-cyan-400/15 to-cyan-500/5 border-cyan-300/20 text-cyan-200"
        : "from-violet-400/15 to-violet-500/5 border-violet-300/20 text-violet-200";

  return (
    <button
      className={`glass-panel rounded-[1.75rem] border bg-gradient-to-br p-6 text-left transition hover:-translate-y-1 ${classes}`}
      onClick={onClick}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </button>
  );
}

function StatusRow({
  label,
  active
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-slate-200">{label}</span>
      <Badge color={active ? "emerald" : "gray"}>
        {active ? "OK" : "Pendente"}
      </Badge>
    </div>
  );
}

function ModalShell({
  open,
  title,
  description,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal modal-open">
      <div className="modal-backdrop bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-box glass-panel max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/85 p-0 shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert pointer-events-auto shadow-xl ${toneClass(toast.tone)}`}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
