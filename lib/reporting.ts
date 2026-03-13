import type { FinanceData, MonthOption } from "@/lib/finance-types";
import {
  formatCurrency,
  getActiveInstallments,
  getGlobalBalance,
  getMonthBalance,
  getMonthExpense,
  getMonthIncome,
  getVisibleTransactions,
  monthName
} from "@/lib/finance-utils";

export async function exportFinanceWorkbook(
  data: FinanceData,
  months: MonthOption[]
) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  const transactionsSheet = months.flatMap((month) =>
    getVisibleTransactions(data, month.key).map((transaction) => ({
      mes: monthName(month.key),
      descricao: transaction.description,
      categoria: transaction.category,
      tipo: transaction.type === "income" ? "Receita" : "Despesa",
      valor: transaction.value,
      origem: transaction.source === "manual" ? "Manual" : "Parcelamento"
    }))
  );

  const cardsSheet = data.cards.map((card) => ({
    nome: card.name,
    limite: card.limit,
    vencimento: card.dueDay,
    fechamento: card.closingDay,
    final: card.lastDigits
  }));

  const installmentsSheet = months.flatMap((month) =>
    getActiveInstallments(data, month.key).map((installment) => ({
      mes: monthName(month.key),
      compra: installment.description,
      cartao: installment.cardName,
      parcela_atual: `${installment.currentInstallment}/${installment.installments}`,
      valor_mensal: installment.monthlyValue,
      valor_total: installment.totalValue
    }))
  );

  const goalsSheet = data.goals.map((goal) => ({
    meta: goal.name,
    atual: goal.current,
    alvo: goal.target
  }));

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(transactionsSheet),
    "Transacoes"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(cardsSheet),
    "Cartoes"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(installmentsSheet),
    "Parcelamentos"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(goalsSheet),
    "Metas"
  );

  XLSX.writeFile(workbook, `aurora-finance-${months[0]?.year ?? "report"}.xlsx`);
}

export async function exportFinancePdf(
  data: FinanceData,
  months: MonthOption[],
  selectedMonthKey: string
) {
  const { default: jsPDF } = await import("jspdf");
  const document = new jsPDF();
  const selectedMonthLabel = monthName(selectedMonthKey);

  document.setFont("helvetica", "bold");
  document.setFontSize(20);
  document.text("Aurora Finance", 16, 20);

  document.setFontSize(11);
  document.setFont("helvetica", "normal");
  document.text(`Resumo gerado em ${selectedMonthLabel}`, 16, 28);
  document.text(
    `Saldo global do ano: ${formatCurrency(getGlobalBalance(data, months))}`,
    16,
    36
  );

  document.setFont("helvetica", "bold");
  document.setFontSize(14);
  document.text("Indicadores do mês", 16, 50);

  document.setFont("helvetica", "normal");
  document.setFontSize(11);
  document.text(
    `Receitas: ${formatCurrency(getMonthIncome(data, selectedMonthKey))}`,
    16,
    58
  );
  document.text(
    `Despesas: ${formatCurrency(getMonthExpense(data, selectedMonthKey))}`,
    16,
    66
  );
  document.text(
    `Saldo: ${formatCurrency(getMonthBalance(data, selectedMonthKey))}`,
    16,
    74
  );

  document.setFont("helvetica", "bold");
  document.setFontSize(14);
  document.text("Transações do mês", 16, 90);

  document.setFont("helvetica", "normal");
  document.setFontSize(10);

  let y = 98;
  const transactions = getVisibleTransactions(data, selectedMonthKey);

  transactions.forEach((transaction, index) => {
    if (y > 275) {
      document.addPage();
      y = 20;
    }

    document.text(
      `${index + 1}. ${transaction.description} | ${transaction.category} | ${formatCurrency(
        transaction.value
      )}`,
      16,
      y
    );
    y += 8;
  });

  document.save(`aurora-finance-${selectedMonthKey}.pdf`);
}

export function buildReportMailto(
  data: FinanceData,
  months: MonthOption[],
  selectedMonthKey: string,
  email: string
) {
  const subject = encodeURIComponent(
    `Aurora Finance | Resumo ${monthName(selectedMonthKey)}`
  );
  const body = encodeURIComponent(
    [
      `Resumo do mês ${monthName(selectedMonthKey)}`,
      `Receitas: ${formatCurrency(getMonthIncome(data, selectedMonthKey))}`,
      `Despesas: ${formatCurrency(getMonthExpense(data, selectedMonthKey))}`,
      `Saldo: ${formatCurrency(getMonthBalance(data, selectedMonthKey))}`,
      `Saldo global do ano: ${formatCurrency(getGlobalBalance(data, months))}`
    ].join("\n")
  );

  return `mailto:${email}?subject=${subject}&body=${body}`;
}
