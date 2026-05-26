import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import {
  pointsForStatus,
  Status,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/mango-data";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { updateReferralStatus, useReferrals } from "@/lib/use-referrals";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Admin,
});

const COLS: Status[] = [
  "recebido", "em_analise", "em_simulacao", "aprovado", "contrato", "pago", "nao_aprovado",
];

const STATUS_COLOR: Record<Status, string> = {
  recebido: "bg-mango/20 text-[color:oklch(0.35_0.1_125)] border-mango/40",
  em_analise: "bg-coral/15 text-coral border-coral/30",
  em_simulacao: "bg-forest/10 text-forest border-forest/30",
  aprovado: "bg-money/15 text-[color:oklch(0.35_0.12_145)] border-money/30",
  contrato: "bg-forest/15 text-forest border-forest/40",
  pago: "bg-money/25 text-[color:oklch(0.3_0.13_145)] border-money/50",
  nao_aprovado: "bg-destructive/10 text-destructive border-destructive/30",
};

function Admin() {
  const { isAdmin, isStaff, loading } = useAuth();
  const nav = useNavigate();
  const { data: referrals } = useReferrals();
  const [open, setOpen] = useState<Status | null>("recebido");

  useEffect(() => {
    if (!loading && !isStaff) {
      toast.error("Acesso restrito");
      nav({ to: "/" });
    }
  }, [isStaff, loading, nav]);

  if (!isStaff) return null;

  const totalLeads = referrals.length;
  const aprovadas = referrals.filter((r) => ["aprovado","contrato","pago"].includes(r.status)).length;
  const pagas = referrals.filter((r) => r.status === "pago").length;
  const reprovadas = referrals.filter((r) => r.status === "nao_aprovado").length;

  async function move(id: string, currentStatus: Status, dir: 1 | -1) {
    if (currentStatus === "nao_aprovado") return;
    const idx = STATUS_ORDER.indexOf(currentStatus);
    const next = STATUS_ORDER[idx + dir];
    if (!next) return;
    try {
      await updateReferralStatus(id, next);
      toast.success(`→ ${STATUS_LABEL[next]}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  }

  async function reprovar(id: string) {
    try {
      await updateReferralStatus(id, "nao_aprovado");
      toast("Lead marcado como não aprovado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro");
    }
  }

  async function reativar(id: string) {
    try {
      await updateReferralStatus(id, "em_analise");
      toast.success("Lead voltou para análise");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro");
    }
  }

  return (
    <MobileShell>
      <header className="bg-forest px-5 pb-5 pt-12 text-forest-foreground">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-mango">Painel Admin</p>
            <h1 className="font-display text-xl font-bold">Indicações por status</h1>
          </div>
          {isAdmin && (
            <div className="flex flex-col gap-1.5">
              <Link to="/admin/usuarios" className="rounded-full bg-mango px-3 py-1 text-[11px] font-bold text-mango-foreground shadow-md shadow-mango/30">
                Usuários
              </Link>
              <Link to="/admin/notificacoes" className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold">
                Notificar
              </Link>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          <Kpi label="Leads" value={String(totalLeads)} />
          <Kpi label="Aprovadas" value={String(aprovadas)} />
          <Kpi label="Pagas" value={String(pagas)} />
          <Kpi label="Reprov." value={String(reprovadas)} />
        </div>
      </header>

      <main className="-mt-3 flex-1 rounded-t-3xl bg-background px-4 pt-5">
        <ul className="space-y-3">
          {COLS.map((status) => {
            const items = referrals.filter((r) => r.status === status);
            const isOpen = open === status;
            return (
              <li key={status} className={`rounded-2xl border bg-card shadow-sm ${STATUS_COLOR[status]}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : status)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="flex-1 font-display text-sm font-bold uppercase tracking-wider">
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/70 px-2 font-display text-sm font-bold">
                    {items.length}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-current/10 bg-background/60 px-3 pb-3 pt-2">
                    {items.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        Nenhum lead aqui
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {items.map((r) => {
                          const pts = pointsForStatus(r.status);
                          const isReprovado = r.status === "nao_aprovado";
                          const isPago = r.status === "pago";
                          return (
                            <li key={r.id} className="rounded-xl bg-card p-3 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mango/20 font-display text-xs font-bold text-forest">
                                  {r.client_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-foreground">{r.client_name}</p>
                                  <p className="truncate text-[11px] text-muted-foreground">{r.product}</p>
                                  {r.indicador_name && (
                                    <p className="truncate text-[10px] text-forest/70">por {r.indicador_name}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Link to="/indicacao/$id" params={{ id: r.id }} className="text-[11px] font-semibold text-forest underline">
                                    Ver
                                  </Link>
                                  {pts > 0 && (
                                    <span className="text-[10px] font-semibold text-money">+{pts}pts</span>
                                  )}
                                </div>
                              </div>

                              {isReprovado ? (
                                <button onClick={() => reativar(r.id)} className="mt-2 w-full rounded-lg bg-forest py-1.5 text-[11px] font-semibold text-forest-foreground">
                                  Reativar
                                </button>
                              ) : (
                                <div className="mt-2 flex gap-1.5">
                                  <button onClick={() => move(r.id, r.status, -1)} disabled={STATUS_ORDER.indexOf(r.status) === 0} className="flex-1 rounded-lg border border-border py-1.5 text-[11px] font-semibold disabled:opacity-40">
                                    ← Voltar
                                  </button>
                                  {!isPago && (
                                    <button onClick={() => reprovar(r.id)} className="rounded-lg border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-destructive" aria-label="Reprovar">
                                      <XCircle className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <button onClick={() => move(r.id, r.status, 1)} disabled={STATUS_ORDER.indexOf(r.status) === STATUS_ORDER.length - 1} className="flex-1 rounded-lg bg-forest py-1.5 text-[11px] font-semibold text-forest-foreground disabled:opacity-40">
                                    Avançar →
                                  </button>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </MobileShell>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-2 backdrop-blur">
      <p className="text-[9px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="font-display text-base font-bold">{value}</p>
    </div>
  );
}
