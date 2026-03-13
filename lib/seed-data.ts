import type { FinanceData } from "@/lib/finance-types";
import {
  createId,
  EXPENSE_DEFAULT_CATEGORY,
  toMonthKey
} from "@/lib/finance-utils";

export function createEmptyFinanceData(): FinanceData {
  return {
    version: 1,
    transactions: [],
    cards: [],
    installments: [],
    goals: [],
    reportPreferences: {
      email: "",
      enabled: false,
      frequency: "monthly"
    }
  };
}

export function createSeedFinanceData(referenceDate = new Date()): FinanceData {
  const year = referenceDate.getFullYear();
  const currentMonthIndex = referenceDate.getMonth();
  const currentMonthKey = toMonthKey(referenceDate);
  const january = `${year}-01`;
  const february = `${year}-02`;
  const march = `${year}-03`;
  const relativeMonthKey = (offset: number) =>
    toMonthKey(new Date(year, currentMonthIndex + offset, 1));

  const cards = [
    {
      id: createId(),
      name: "Nubank Platinum",
      limit: 9000,
      dueDay: 8,
      closingDay: 1,
      lastDigits: "4821",
      gradient: "from-violet-600 via-fuchsia-600 to-slate-900",
      createdAt: new Date(year, 0, 4).toISOString()
    },
    {
      id: createId(),
      name: "XP Visa Infinite",
      limit: 18000,
      dueDay: 14,
      closingDay: 7,
      lastDigits: "1059",
      gradient: "from-cyan-500 via-sky-500 to-slate-900",
      createdAt: new Date(year, 1, 6).toISOString()
    }
  ];

  return {
    version: 1,
    cards,
    installments: [
      {
        id: createId(),
        cardId: cards[0].id,
        description: "MacBook Air",
        totalValue: 7200,
        installments: 10,
        purchaseMonthKey: january,
        createdAt: new Date(year, 0, 11).toISOString()
      },
      {
        id: createId(),
        cardId: cards[1].id,
        description: "Viagem de inverno",
        totalValue: 4800,
        installments: 6,
        purchaseMonthKey: february,
        createdAt: new Date(year, 1, 15).toISOString()
      }
    ],
    goals: [
      {
        id: createId(),
        name: "Reserva de emergência",
        target: 15000,
        current: 9100,
        icon: "piggy-bank",
        accent: "emerald",
        createdAt: new Date(year, 0, 5).toISOString()
      },
      {
        id: createId(),
        name: "Viagem 2026",
        target: 8500,
        current: 3100,
        icon: "plane",
        accent: "violet",
        createdAt: new Date(year, 0, 8).toISOString()
      },
      {
        id: createId(),
        name: "Entrada apartamento",
        target: 50000,
        current: 13200,
        icon: "house",
        accent: "cyan",
        createdAt: new Date(year, 0, 12).toISOString()
      }
    ],
    reportPreferences: {
      email: "financeiro@aurora.app",
      enabled: false,
      frequency: "monthly"
    },
    transactions: [
      {
        id: createId(),
        description: "Salário",
        value: 9500,
        category: "Trabalho",
        type: "income",
        monthKey: january,
        createdAt: new Date(year, 0, 5).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Freelance design",
        value: 1800,
        category: "Projetos",
        type: "income",
        monthKey: january,
        createdAt: new Date(year, 0, 19).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Aluguel",
        value: 2500,
        category: "Moradia",
        type: "expense",
        monthKey: january,
        createdAt: new Date(year, 0, 6).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Supermercado",
        value: 860,
        category: "Alimentação",
        type: "expense",
        monthKey: january,
        createdAt: new Date(year, 0, 9).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Academia",
        value: 189,
        category: "Saúde",
        type: "expense",
        monthKey: january,
        createdAt: new Date(year, 0, 12).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Salário",
        value: 9500,
        category: "Trabalho",
        type: "income",
        monthKey: february,
        createdAt: new Date(year, 1, 5).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Bônus trimestral",
        value: 2200,
        category: "Trabalho",
        type: "income",
        monthKey: february,
        createdAt: new Date(year, 1, 22).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Aluguel",
        value: 2500,
        category: "Moradia",
        type: "expense",
        monthKey: february,
        createdAt: new Date(year, 1, 6).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Mercado",
        value: 920,
        category: "Alimentação",
        type: "expense",
        monthKey: february,
        createdAt: new Date(year, 1, 11).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Streaming",
        value: 94,
        category: "Assinaturas",
        type: "expense",
        monthKey: february,
        createdAt: new Date(year, 1, 17).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Salário",
        value: 9600,
        category: "Trabalho",
        type: "income",
        monthKey: march,
        createdAt: new Date(year, 2, 5).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Consultoria",
        value: 1400,
        category: "Projetos",
        type: "income",
        monthKey: currentMonthKey,
        createdAt: new Date(year, 2, 9).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Aluguel",
        value: 2600,
        category: "Moradia",
        type: "expense",
        monthKey: currentMonthKey,
        createdAt: new Date(year, 2, 6).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Mercado",
        value: 980,
        category: "Alimentação",
        type: "expense",
        monthKey: currentMonthKey,
        createdAt: new Date(year, 2, 10).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Internet",
        value: 139,
        category: "Casa",
        type: "expense",
        monthKey: currentMonthKey,
        createdAt: new Date(year, 2, 12).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Lazer",
        value: 460,
        category: EXPENSE_DEFAULT_CATEGORY,
        type: "expense",
        monthKey: currentMonthKey,
        createdAt: new Date(year, 2, 13).toISOString(),
        source: "manual"
      },
      {
        id: createId(),
        description: "Reembolso combustível",
        value: 320,
        category: "Mobilidade",
        type: "income",
        monthKey: relativeMonthKey(-1),
        createdAt: new Date(year, currentMonthIndex - 1, 20).toISOString(),
        source: "manual"
      }
    ]
  };
}
