import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Sparkles, Trophy } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import {
  bonusFromPoints,
  brl,
  totalPoints,
  useMangoStore,
} from "@/lib/mango-data";

export const Route = createFileRoute("/perfil")({
  component: Perfil,
});

function Perfil() {
  const all = useMangoStore();
  const points = totalPoints(all);
  const { earned, toNext, progress } = bonusFromPoints(points);
  const aprovadas = all.filter(
    (r) => r.status === "aprovado" || r.status === "contrato" || r.status === "pago",
  ).length;

  return (
    <MobileShell>
      <header className="flex items-center gap-3 bg-forest px-5 pb-8 pt-12 text-forest-foreground">
        <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold">Perfil</h1>
      </header>
      <main className="px-5 pt-6">
        <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mango font-display text-lg font-bold text-mango-foreground">
            PM
          </div>
          <div>
            <p className="font-display text-lg font-bold">Pedro Martins</p>
            <p className="text-sm text-muted-foreground">indicador@mangos.app</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-mango/30 bg-mango/10 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-forest/70">
            <Sparkles className="h-4 w-4" /> Total de pontos
          </div>
          <p className="mt-1 font-display text-3xl font-bold text-forest">
            {points} <span className="text-base font-semibold opacity-60">pts</span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-forest/10">
            <div
              className="h-full rounded-full bg-mango"
              style={{ width: `${Math.max(4, progress * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-forest/70">
            Faltam <strong>{toNext} pts</strong> para o próximo bônus de {brl(100)}.
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Trophy className="h-3 w-3" /> Bônus conquistado
            </div>
            <p className="mt-1 font-display text-xl font-bold text-money">{brl(earned)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Indicações aprovadas
            </p>
            <p className="mt-1 font-display text-xl font-bold">{aprovadas}</p>
          </div>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold text-destructive">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </main>
    </MobileShell>
  );
}
