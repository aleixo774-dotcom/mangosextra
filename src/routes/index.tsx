import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bell, TrendingUp, Wallet } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { StatusPill } from "@/components/status-pill";
import { brl, useMangoStore } from "@/lib/mango-data";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const referrals = useMangoStore();
  const ativos = referrals.filter((r) => r.status !== "pago").length;
  const disponivel = referrals
    .filter((r) => r.status === "aprovado" || r.status === "contrato")
    .reduce((s, r) => s + r.commission, 0);
  const total = referrals
    .filter((r) => r.status === "pago")
    .reduce((s, r) => s + r.commission, 0);

  return (
    <MobileShell>
      {/* Header */}
      <header className="bg-forest px-5 pb-8 pt-12 text-forest-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-70">Mangos Extra</p>
            <h1 className="font-display text-lg font-semibold">Olá, Pedro 👋</h1>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>

        {/* Balance card */}
        <div className="relative mt-6 overflow-hidden rounded-3xl p-5 text-charcoal shadow-xl shadow-black/20"
          style={{ background: "linear-gradient(135deg, var(--mango) 0%, var(--coral) 100%)" }}>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-widest opacity-80">Saldo total</p>
          <p className="mt-1 font-display text-4xl font-bold">{brl(total + disponivel)}</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> +18% este mês
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard label="Indicações ativas" value={String(ativos)} />
          <StatCard label="Disponível p/ saque" value={brl(disponivel)} accent />
        </div>
      </header>

      <main className="-mt-4 flex-1 rounded-t-3xl bg-background px-5 pt-6">
        <Link
          to="/nova"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest py-4 font-display text-base font-semibold text-forest-foreground shadow-lg shadow-forest/30 transition active:scale-[0.98]"
        >
          + Nova Indicação
        </Link>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Suas indicações</h2>
          <span className="text-xs text-muted-foreground">{referrals.length} no total</span>
        </div>

        <ul className="mt-3 space-y-3">
          {referrals.map((r) => (
            <li key={r.id}>
              <Link
                to="/indicacao/$id"
                params={{ id: r.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition active:scale-[0.99]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mango/20 font-display text-sm font-bold text-forest">
                  {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.product}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusPill status={r.status} />
                  <span className="text-xs font-semibold text-money">{brl(r.commission)}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </MobileShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-80">
        <Wallet className="h-3 w-3" /> {label}
      </div>
      <p className={`mt-1 font-display text-lg font-bold ${accent ? "text-mango" : ""}`}>{value}</p>
    </div>
  );
}
