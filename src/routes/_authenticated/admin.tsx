import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/admin")({
  component: Admin,
});

const COLS: Status[] = [
  "recebido", "em_analise", "em_simulacao", "aprovado", "contrato", "pago", "nao_aprovado",
];

function Admin() {
  const { isAdmin, isStaff, loading } = useAuth();
  const nav = useNavigate();
  const { data: referrals } = useReferrals();
  const [col, setCol] = useState(0);

  useEffect(() => {
    if (!loading && !isStaff) {
      toast.error("Acesso restrito");
      nav({ to: "/" });
    }
  }, [isStaff, loading, nav]);

  if (!isStaff) return null;

  const status = COLS[col];
  const items = referrals.filter((r) => r.status === status);

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
      toast("Lead marcado como não aprovado agora");
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
            <h1 className="font-display text-xl font-bold">Kanban de Leads</h1>
          </div>
          <Link to="/admin/usuarios" className="rounded-full bg-mango px-3 py-1.5 text-[11px] font-bold text-mango-foreground shadow-md shadow-mango/30">
            Usuários
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          <Kpi label="Leads" value={String(totalLeads)} />
          <Kpi label="Aprovadas" value={String(aprovadas)} />
          <Kpi label="Pagas" value={String(pagas)} />
          <Kpi label="Reprov." value={String(reprovadas)} />
        </div>
      </header>

      <div className="sticky top-0 z-30 -mt-3 rounded-t-3xl bg-background px-3 pb-2 pt-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => setCol(Math.max(0, col - 1))} disabled={col === 0} className="flex h-9 w-9 items-center justify-center rounded-full border border-border disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Coluna {col + 1} de {COLS.length}</p>
            <p className="font-display text-base font-bold text-forest">{STATUS_LABEL[status]} · {items.length}</p>
          </div>
          <button onClick={() => setCol(Math.min(COLS.length - 1, col + 1))} disabled={col === COLS.length - 1} className="flex h-9 w-9 items-center justify-center rounded-full border border-border disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-1">
          {COLS.map((_, i) => (
            <button key={i} onClick={() => setCol(i)} className={`h-1.5 flex-1 rounded-full ${
              i === col ? COLS[i] === "nao_aprovado" ? "bg-destructive" : "bg-mango" : "bg-border"
            }`} aria-label={`Coluna ${i + 1}`} />
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 pt-3">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum lead nesta coluna.
          </div>
        )}
        <ul className="space-y-3">
          {items.map((r) => {
            const pts = pointsForStatus(r.status);
            const isReprovado = r.status === "nao_aprovado";
            const isPago = r.status === "pago";
            return (
              <li key={r.id} className="rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mango/20 font-display text-sm font-bold text-forest">
                    {r.client_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.client_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.product}</p>
                    {r.indicador_name && (
                      <p className="truncate text-[10px] text-forest/70">por {r.indicador_name}</p>
                    )}
                    <p className={`mt-1 text-xs font-semibold ${pts > 0 ? "text-money" : "text-muted-foreground"}`}>
                      {pts > 0 ? `+${pts} pts` : "—"}
                    </p>
                  </div>
                  <Link to="/indicacao/$id" params={{ id: r.id }} className="text-[11px] font-semibold text-forest underline">
                    Ver
                  </Link>
                </div>

                {isReprovado ? (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => reativar(r.id)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-forest py-2 text-xs font-semibold text-forest-foreground">
                      Reativar lead
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => move(r.id, r.status, -1)} disabled={STATUS_ORDER.indexOf(r.status) === 0} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border py-2 text-xs font-semibold disabled:opacity-40">
                      <ChevronLeft className="h-3.5 w-3.5" /> Voltar
                    </button>
                    {!isPago && (
                      <button onClick={() => reprovar(r.id)} className="flex items-center justify-center gap-1 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive" aria-label="Marcar como não aprovado">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => move(r.id, r.status, 1)} disabled={STATUS_ORDER.indexOf(r.status) === STATUS_ORDER.length - 1} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-forest py-2 text-xs font-semibold text-forest-foreground disabled:opacity-40">
                      Avançar <ChevronRight className="h-3.5 w-3.5" />
                    </button>
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
