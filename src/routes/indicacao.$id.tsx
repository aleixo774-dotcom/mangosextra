import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { StatusPill } from "@/components/status-pill";
import {
  brl,
  STATUS_LABEL,
  STATUS_ORDER,
  useMangoStore,
} from "@/lib/mango-data";

export const Route = createFileRoute("/indicacao/$id")({
  component: Detail,
  notFoundComponent: () => (
    <MobileShell>
      <div className="p-10 text-center text-muted-foreground">Indicação não encontrada.</div>
    </MobileShell>
  ),
});

function Detail() {
  const { id } = Route.useParams();
  const all = useMangoStore();
  const r = all.find((x) => x.id === id);
  if (!r) throw notFound();

  const currentIdx = STATUS_ORDER.indexOf(r.status);

  return (
    <MobileShell>
      <header className="flex items-center gap-3 bg-forest px-5 pb-6 pt-12 text-forest-foreground">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold">Detalhe da Indicação</h1>
      </header>

      <main className="px-5 pt-5">
        <div className="rounded-3xl bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mango/20 font-display text-lg font-bold text-forest">
              {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold">{r.name}</p>
              <p className="truncate text-sm text-muted-foreground">{r.product}</p>
            </div>
            <StatusPill status={r.status} />
          </div>

          <div className="mt-4 flex gap-2">
            <a
              href={`tel:${r.phone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold"
            >
              <Phone className="h-4 w-4" /> Ligar
            </a>
            <a
              href={`https://wa.me/55${r.phone.replace(/\D/g, "")}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-money py-2.5 text-sm font-semibold text-money-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Info label="Valor estimado" value={brl(r.amount)} />
          <Info label="Comissão" value={brl(r.commission)} accent />
        </div>

        <h2 className="mt-6 font-display text-base font-bold">Linha do tempo</h2>
        <ol className="mt-3 space-y-0">
          {STATUS_ORDER.map((s, i) => {
            const done = i <= currentIdx;
            const event = r.timeline.find((t) => t.status === s);
            const isLast = i === STATUS_ORDER.length - 1;
            return (
              <li key={s} className="relative flex gap-3 pb-5">
                {!isLast && (
                  <span
                    className={`absolute left-[11px] top-6 h-full w-0.5 ${done ? "bg-money" : "bg-border"}`}
                  />
                )}
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    done
                      ? "bg-money text-money-foreground"
                      : "border-2 border-border bg-background text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 pt-0.5">
                  <p
                    className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {STATUS_LABEL[s]}
                  </p>
                  {event && <p className="text-xs text-muted-foreground">{event.date}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </main>
    </MobileShell>
  );
}

function Info({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-display text-xl font-bold ${accent ? "text-money" : ""}`}>{value}</p>
    </div>
  );
}
