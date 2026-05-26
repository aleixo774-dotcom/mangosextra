import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, HeartHandshake, MessageCircle, Pencil, Phone, Send, UserRound, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MobileShell } from "@/components/mobile-shell";
import { StatusPill } from "@/components/status-pill";
import {
  brl,
  pointsForStatus,
  PRODUCTS,
  STATUS_DESCRIPTION,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/mango-data";
import { updateReferralProduct, useReferral } from "@/lib/use-referrals";
import { addReferralNote, useReferralNotes } from "@/lib/use-notes";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/indicacao/$id")({
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { referral: r, events, indicadorName, indicadorWhatsapp, loading, reload } = useReferral(id);
  const { isStaff, isAdmin, isConsultor, user } = useAuth();
  const { notes, authors } = useReferralNotes(id);

  const [editingProduct, setEditingProduct] = useState(false);
  const [productDraft, setProductDraft] = useState("");
  const [amountDraft, setAmountDraft] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  const [noteDraft, setNoteDraft] = useState("");
  const [sendingNote, setSendingNote] = useState(false);

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
  const indicadorWaDigits = (indicadorWhatsapp ?? "").replace(/\D/g, "");

  function openEditProduct() {
    setProductDraft(r!.product);
    setAmountDraft(String(r!.amount ?? 0));
    setEditingProduct(true);
  }

  async function saveProduct() {
    setSavingProduct(true);
    try {
      const amt = Number(amountDraft.replace(",", "."));
      await updateReferralProduct(id, productDraft, Number.isFinite(amt) ? amt : undefined);
      toast.success("Produto atualizado");
      setEditingProduct(false);
      reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSavingProduct(false);
    }
  }

  async function sendNote() {
    if (!noteDraft.trim() || !user) return;
    setSendingNote(true);
    try {
      await addReferralNote({
        referral_id: id,
        author_id: user.id,
        author_role: isAdmin ? "admin" : "consultor",
        body: noteDraft.trim(),
        notify_user_id: r!.indicador_id,
        notify_title: `Mangos: nova mensagem sobre ${r!.client_name.split(" ")[0]}`,
      });
      setNoteDraft("");
      toast.success("Mensagem enviada ao indicador");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSendingNote(false);
    }
  }

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
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm text-muted-foreground">{r.product}</p>
                {isStaff && !editingProduct && (
                  <button onClick={openEditProduct} aria-label="Editar produto" className="text-forest">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {isStaff && indicadorName && (
                <p className="mt-0.5 truncate text-[11px] font-semibold text-forest">
                  Indicado por {indicadorName}
                </p>
              )}
            </div>
            <StatusPill status={r.status} />
          </div>

          {isStaff && editingProduct && (
            <div className="mt-4 space-y-2 rounded-2xl border border-forest/20 bg-forest/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-forest">Editar produto</p>
              <select
                value={productDraft}
                onChange={(e) => setProductDraft(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
              >
                {PRODUCTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
                {!PRODUCTS.includes(productDraft) && productDraft && (
                  <option value={productDraft}>{productDraft}</option>
                )}
              </select>
              <input
                value={amountDraft}
                onChange={(e) => setAmountDraft(e.target.value)}
                placeholder="Valor aprovado (R$)"
                inputMode="decimal"
                className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditingProduct(false)} className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold">
                  Cancelar
                </button>
                <button onClick={saveProduct} disabled={savingProduct} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-forest py-1.5 text-xs font-semibold text-forest-foreground disabled:opacity-40">
                  <Check className="h-3 w-3" /> {savingProduct ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </div>
          )}

          {isStaff ? (
            <>
              <div className="mt-4 flex gap-2">
                <a href={`tel:${r.client_phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold">
                  <Phone className="h-4 w-4" /> Ligar
                </a>
                <a
                  href={`https://wa.me/55${r.client_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Olá ${r.client_name.split(" ")[0]}, recebi sua indicação do ${indicadorName ?? "nosso parceiro"} sobre o ${r.product} e vou prosseguir com seu atendimento.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-money py-2.5 text-sm font-semibold text-money-foreground"
                >
                  <MessageCircle className="h-4 w-4" /> Cliente
                </a>
              </div>
              {indicadorWaDigits && (
                <a
                  href={`https://wa.me/55${indicadorWaDigits}?text=${encodeURIComponent(
                    `Olá ${indicadorName?.split(" ")[0] ?? ""}, sobre sua indicação de ${r.client_name} (${r.product}): `,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-forest/40 bg-forest/5 py-2 text-xs font-semibold text-forest"
                >
                  <UserRound className="h-3.5 w-3.5" /> Falar com indicador no WhatsApp
                </a>
              )}
            </>
          ) : (
            <div className="mt-4 rounded-2xl bg-forest/5 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-forest">
                <HeartHandshake className="h-4 w-4" /> Em boas mãos
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                Seu indicado já está com a <strong>equipe Mangos</strong>. Vamos
                fazer de tudo para fechar o melhor contrato possível 🥭. Acompanhe
                aqui o status — você será avisado em cada etapa.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Info label="Valor estimado" value={brl(r.amount)} />
          <Info label="Pontos" value={pts > 0 ? `+${pts} pts` : "—"} accent={pts > 0} />
        </div>

        {/* Observações / Bate-papo */}
        <section className="mt-6">
          <h2 className="font-display text-base font-bold">Observações da equipe</h2>
          <p className="text-xs text-muted-foreground">Mensagens da consultoria sobre esta indicação.</p>

          <ul className="mt-3 space-y-2">
            {notes.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Sem observações ainda.
              </li>
            )}
            {notes.map((n) => (
              <li key={n.id} className="rounded-2xl bg-card p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-widest">
                  <span className="font-bold text-forest">
                    {authors.get(n.author_id) ?? "Equipe"} · {n.author_role}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{n.body}</p>
              </li>
            ))}
          </ul>

          {(isAdmin || isConsultor) && (
            <div className="mt-3 rounded-2xl border border-border bg-card p-3">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Escreva uma observação para o indicador acompanhar..."
                className="w-full resize-none rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none"
              />
              <button
                onClick={sendNote}
                disabled={sendingNote || !noteDraft.trim()}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-forest py-2 text-xs font-bold text-forest-foreground disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" /> {sendingNote ? "Enviando…" : "Enviar e notificar indicador"}
              </button>
            </div>
          )}
        </section>

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
