import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bell, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { StatusPill } from "@/components/status-pill";
import {
  bonusFromPoints,
  brl,
  pointsFor,
  totalPoints,
  useMangoStore,
} from "@/lib/mango-data";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
});

function Home() {
  const referrals = useMangoStore();
  const ativos = referrals.filter(
    (r) => r.status !== "pago" && r.status !== "nao_aprovado",
  ).length;
  const points = totalPoints(referrals);
  const aprovadasCount = referrals.filter((r) => pointsFor(r) > 0).length;
  const { earned, toNext, progress } = bonusFromPoints(points);

  return (
    <MobileShell>
      {/* Header */}
      <header className="bg-forest px-5 pb-8 pt-12 text-forest-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-mango">
              <span aria-hidden>🥭</span> mangos · extra
            </p>
            <h1 className="font-display text-lg font-semibold">Olá, Pedro 👋</h1>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>


        {/* Pontos card */}
        <div
          className="relative mt-6 overflow-hidden rounded-3xl p-5 text-charcoal shadow-xl shadow-black/20"
          style={{ background: "linear-gradient(135deg, var(--mango) 0%, var(--coral) 100%)" }}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest opacity-80">
            <Sparkles className="h-3.5 w-3.5" /> Seus pontos
          </div>
          <p className="mt-1 font-display text-5xl font-bold leading-none">
            {points}
            <span className="ml-2 text-base font-semibold opacity-70">pts</span>
          </p>

          {/* progresso até próximo bônus */}
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/15">
              <div
                className="h-full rounded-full bg-forest transition-all"
                style={{ width: `${Math.max(4, progress * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Faltam {toNext} pts p/ +{brl(100)}
              </span>
              <span className="opacity-80">{aprovadasCount} aprovadas</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard
            icon={<Trophy className="h-3 w-3" />}
            label="Bônus conquistado"
            value={brl(earned)}
            accent
          />
          <StatCard
            icon={<Sparkles className="h-3 w-3" />}
            label="Indicações ativas"
            value={String(ativos)}
          />
        </div>
      </header>

      <main className="-mt-4 flex-1 rounded-t-3xl bg-background px-5 pt-6">
        <Link
          to="/nova"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest py-4 font-display text-base font-semibold text-forest-foreground shadow-lg shadow-forest/30 transition active:scale-[0.98]"
        >
          + Nova Indicação
        </Link>

        <div className="mt-3 rounded-2xl border border-mango/30 bg-mango/10 p-3 text-xs text-forest">
          🎯 <strong>Como funciona:</strong> a cada indicação aprovada você ganha
          <strong> 10 pontos</strong>. Ao atingir <strong>100 pts</strong> você recebe
          <strong> R$ 100</strong> de bônus.
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Suas indicações</h2>
          <span className="text-xs text-muted-foreground">{referrals.length} no total</span>
        </div>

        <ul className="mt-3 space-y-3">
          {referrals.map((r) => {
            const pts = pointsFor(r);
            return (
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
                    <span
                      className={`text-xs font-semibold ${pts > 0 ? "text-money" : "text-muted-foreground"}`}
                    >
                      {pts > 0 ? `+${pts} pts` : "—"}
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </MobileShell>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-80">
        {icon} {label}
      </div>
      <p className={`mt-1 font-display text-lg font-bold ${accent ? "text-mango" : ""}`}>
        {value}
      </p>
    </div>
  );
}
