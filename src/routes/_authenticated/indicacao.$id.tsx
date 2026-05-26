import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Phone, XCircle } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { StatusPill } from "@/components/status-pill";
import {
  brl,
  pointsForStatus,
  STATUS_DESCRIPTION,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/mango-data";
import { useReferral } from "@/lib/use-referrals";

export const Route = createFileRoute("/_authenticated/indicacao/$id")({
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { referral: r, events, loading } = useReferral(id);

  if (loading) {
    return (
      <MobileShell>
        <div className="p-10 text-center text-muted-foreground">Carregando…</div>
      </MobileShell>
    );
  }

  if (!r) {
    return (
      <MobileShell>
        <div className="p-10 text-center text-muted-foreground">Indicação não encontrada.</div>
      </MobileShell>
    );
  }

  const isReprovado = r.status === "nao_aprovado";
  const currentIdx = STATUS_ORDER.indexOf(r.status);
  const pts = pointsForStatus(r.status);

  return (
    <MobileShell>
      <header className="flex items-center gap-3 bg-forest px-5 pb-6 pt-12 text-forest-foreground">
        <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10" aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold">Detalhe da Indicação</h1>
      </header>

      <main className="px-5 pt-5">
        <div className="rounded-3xl bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mango/20 font-display text-lg font-bold text-forest">
              {r.client_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold">{r.client_name}</p>
              <p className="truncate text-sm text-muted-foreground">{r.product}</p>
            </div>
            <StatusPill status={r.status} />
          </div>

          <div className="mt-4 flex gap-2">
            <a href={`tel:${r.client_phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold">
              <Phone className="h-4 w-4" /> Ligar
            </a>
            <a href={`https://wa.me/55${r.client_phone.replace(/\D/g, "")}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-money py-2.5 text-sm font-semibold text-money-foreground">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Info label="Valor estimado" value={brl(r.amount)} />
          <Info label="Pontos" value={pts > 0 ? `+${pts} pts` : "—"} accent={pts > 0} />
        </div>

        {isReprovado ? (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-center gap-2 font-display text-base font-bold text-destructive">
              <XCircle className="h-5 w-5" /> Não foi dessa vez
            </div>
            <p className="mt-2 text-sm text-foreground/80">
              {STATUS_DESCRIPTION.nao_aprovado} Vamos manter o contato salvo e,
              assim que houver uma nova oportunidade, tentaremos novamente — sem
              precisar de uma nova indicação sua.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mt-6 font-display text-base font-bold">Linha do tempo</h2>
            <ol className="mt-3 space-y-0">
              {STATUS_ORDER.map((s, i) => {
                const done = i <= currentIdx;
                const event = events.find((t) => t.status === s);
                const isLast = i === STATUS_ORDER.length - 1;
                return (
                  <li key={s} className="relative flex gap-3 pb-5">
                    {!isLast && (
                      <span className={`absolute left-[11px] top-6 h-full w-0.5 ${done ? "bg-money" : "bg-border"}`} />
                    )}
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      done ? "bg-money text-money-foreground" : "border-2 border-border bg-background text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 pt-0.5">
                      <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {STATUS_LABEL[s]}
                      </p>
                      {event && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>
    </MobileShell>
  );
}

function Info({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${accent ? "text-money" : ""}`}>{value}</p>
    </div>
  );
}
