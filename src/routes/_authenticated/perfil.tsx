import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, BellOff, LogOut, Sparkles, Trophy } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { bonusFromPoints, brl } from "@/lib/mango-data";
import { useAuth } from "@/hooks/use-auth";
import { useReferrals } from "@/lib/use-referrals";
import { usePush } from "@/lib/use-push";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: Perfil,
});

function Perfil() {
  const { profile, user, signOut, isAdmin, isStaff } = useAuth();
  const { data: referrals } = useReferrals();
  const push = usePush();
  const nav = useNavigate();

  const points = profile?.points ?? 0;
  const { earned, toNext, progress } = bonusFromPoints(points);
  const aprovadas = referrals.filter(
    (r) => ["aprovado", "contrato", "pago"].includes(r.status),
  ).length;

  const initials = (profile?.name ?? user?.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await signOut();
    nav({ to: "/login", replace: true });
  }

  async function togglePush() {
    try {
      if (push.state === "granted-on") {
        await push.disable();
        toast.success("Notificações desativadas");
      } else {
        const ok = await push.enable();
        if (ok) toast.success("Pronto! Você vai receber notificações 🔔");
      }
    } catch (e) {
      toast.error("Não foi possível ativar as notificações");
      console.error(e);
    }
  }

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
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold">{profile?.name ?? "Indicador"}</p>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            {isAdmin ? (
              <Link to="/admin" className="mt-1 inline-block rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-bold text-coral">
                👑 ADMIN — abrir painel
              </Link>
            ) : isStaff ? (
              <Link to="/admin" className="mt-1 inline-block rounded-full bg-forest/15 px-2 py-0.5 text-[10px] font-bold text-forest">
                💼 CONSULTOR — abrir painel
              </Link>
            ) : null}
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
            <div className="h-full rounded-full bg-mango" style={{ width: `${Math.max(4, progress * 100)}%` }} />
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
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Indicações aprovadas</p>
            <p className="mt-1 font-display text-xl font-bold">{aprovadas}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest">
              {push.state === "granted-on" ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">Notificações no celular</p>
              <p className="text-xs text-muted-foreground">
                {push.state === "unsupported" && "Seu navegador não suporta push."}
                {push.state === "denied" && "Permissão bloqueada. Libere nas configurações do navegador."}
                {push.state === "prompt" && "Ative para receber avisos mesmo com o app fechado."}
                {push.state === "granted-off" && "Toque em ativar para receber notificações."}
                {push.state === "granted-on" && "Ativadas. Você vai receber atualizações 🎉"}
              </p>
            </div>
            {(push.state === "prompt" || push.state === "granted-off" || push.state === "granted-on") && (
              <button
                onClick={togglePush}
                disabled={push.busy}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                  push.state === "granted-on"
                    ? "border border-border text-foreground"
                    : "bg-forest text-forest-foreground"
                }`}
              >
                {push.busy ? "..." : push.state === "granted-on" ? "Desativar" : "Ativar"}
              </button>
            )}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            💡 No iPhone, instale o app primeiro (Compartilhar → Adicionar à Tela de Início) para receber notificações.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </main>
    </MobileShell>
  );
}
