import dynamic from "next/dynamic";

const AuroraFinanceApp = dynamic(
  () => import("@/components/aurora-finance-app"),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-lime-400/20" />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">
                Carregando Aurora Finance
              </p>
              <p className="text-sm text-slate-400">
                Preparando dashboard, gráficos e camadas de dados.
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }
);

export default function Page() {
  return <AuroraFinanceApp />;
}

