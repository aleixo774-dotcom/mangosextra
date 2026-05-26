import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MangosLogo } from "@/components/mangos-logo";
import {
  getIndicadorPublic,
  submitPublicReferral,
} from "@/lib/public-referral.functions";

export const Route = createFileRoute("/r/$indicadorId")({
  head: () => ({
    meta: [
      { title: "Cadastre-se — Mangos" },
      { name: "description", content: "Cadastre seu interesse em poucos segundos." },
      { property: "og:title", content: "Você foi indicado — Mangos" },
      { property: "og:description", content: "Deixe seu contato e a gente fala com você." },
    ],
  }),
  component: PublicReferralPage,
});

function PublicReferralPage() {
  const { indicadorId } = Route.useParams();
  const fetchIndicador = useServerFn(getIndicadorPublic);
  const submit = useServerFn(submitPublicReferral);

  const { data: indicador, isLoading } = useQuery({
    queryKey: ["public-indicador", indicadorId],
    queryFn: () => fetchIndicador({ data: { identifier: indicadorId } }),
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit = name.trim().length > 2 && phone.trim().length >= 8 && !busy;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      await submit({
        data: { identifier: indicadorId, clientName: name.trim(), clientPhone: phone.trim() },
      });
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      toast.error("Não foi possível enviar", { description: msg });
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest text-forest-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!indicador?.found) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Link inválido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este link de indicação não foi encontrado ou expirou.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-forest via-forest/95 to-charcoal sm:py-6 lg:py-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden sm:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, color-mix(in oklab, var(--mango) 18%, transparent) 0%, transparent 45%), radial-gradient(circle at 80% 70%, color-mix(in oklab, var(--coral) 15%, transparent) 0%, transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-background shadow-2xl shadow-black/40 sm:min-h-[min(900px,calc(100vh-3rem))] sm:rounded-[2rem] sm:ring-1 sm:ring-white/10">
      <header className="bg-forest px-6 pb-10 pt-12 text-forest-foreground">
        <MangosLogo />
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-mango/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mango">
          <Sparkles className="h-3 w-3" /> Você foi indicado
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight">
          {indicador.firstName} indicou você pra Mangos 🥭
        </h1>
        <p className="mt-2 text-sm opacity-80">
          Deixe seu contato — nosso time entra em contato pra te apresentar as opções.
        </p>
      </header>

      <main className="-mt-6 flex-1 rounded-t-3xl bg-background px-6 pt-8">
        {done ? (
          <div className="rounded-3xl border border-money/30 bg-money/10 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-money text-money-foreground">
              <Check className="h-7 w-7" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Cadastro recebido!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Em breve nosso time entra em contato pelo WhatsApp informado.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Seu nome
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como prefere ser chamado"
                className="input"
                autoComplete="name"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                WhatsApp
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 9 9999-9999"
                className="input"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-money py-4 font-display font-semibold text-money-foreground shadow-lg shadow-money/30 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {busy ? "Enviando…" : "Quero saber mais"}
            </button>

            <p className="pt-2 text-center text-[11px] text-muted-foreground">
              Ao enviar, você concorda em receber contato da Mangos.
            </p>
          </form>
        )}
      </main>

      <style>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          outline: none;
        }
        .input:focus { border-color: var(--mango); box-shadow: 0 0 0 3px color-mix(in oklab, var(--mango) 25%, transparent); }
      `}</style>
      </div>
    </div>
  );
}
