import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { brl, mangoStore } from "@/lib/mango-data";
import { toast } from "sonner";

export const Route = createFileRoute("/nova")({
  component: Nova,
});

function Nova() {
  const navigate = useNavigate();
  const products = mangoStore.products();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState(products[0]);
  const [amount, setAmount] = useState(50000);
  const [observation, setObservation] = useState("");

  const commission = useMemo(() => Math.round(amount * 0.0075), [amount]);
  const canNext = step === 1 ? name.trim().length > 2 && phone.trim().length >= 8 : true;

  function submit() {
    const r = mangoStore.add({ name, phone, product, amount, observation });
    toast.success("Indicação enviada!", { description: `${r.name} • ${brl(commission)} previstos` });
    navigate({ to: "/indicacao/$id", params: { id: r.id } });
  }

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
        <div>
          <p className="text-xs uppercase tracking-widest opacity-70">Passo {step} de 3</p>
          <h1 className="font-display text-xl font-bold">Nova Indicação</h1>
        </div>
      </header>

      <div className="px-5 pt-4">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-mango" : "bg-border"}`}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 px-5 pt-6">
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Nome do indicado">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Marina Silva"
                className="input"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 9 9999-9999"
                className="input"
                inputMode="tel"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Field label="Produto de interesse">
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="input"
              >
                {products.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label={`Valor estimado: ${brl(amount)}`}>
              <input
                type="range"
                min={5000}
                max={500000}
                step={5000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[color:var(--mango)]"
              />
            </Field>
            <Field label="Observações (opcional)">
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Conte algo sobre o cliente..."
                className="input min-h-24"
              />
            </Field>

            <div className="rounded-2xl border border-mango/30 bg-mango/10 p-4">
              <p className="text-xs uppercase tracking-widest text-forest/70">Comissão prevista</p>
              <p className="mt-1 font-display text-2xl font-bold text-forest">{brl(commission)}</p>
              <p className="text-xs text-muted-foreground">0,75% sobre o valor estimado</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold">Confirme os dados</h2>
            <Review k="Nome" v={name} />
            <Review k="WhatsApp" v={phone} />
            <Review k="Produto" v={product} />
            <Review k="Valor estimado" v={brl(amount)} />
            <Review k="Comissão prevista" v={brl(commission)} highlight />
          </div>
        )}
      </main>

      <div className="sticky bottom-24 mt-6 px-5">
        {step < 3 ? (
          <button
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
            className="w-full rounded-2xl bg-forest py-4 font-display font-semibold text-forest-foreground shadow-lg shadow-forest/30 disabled:opacity-50"
          >
            Continuar
          </button>
        ) : (
          <button
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-money py-4 font-display font-semibold text-money-foreground shadow-lg shadow-money/30"
          >
            <Check className="h-5 w-5" /> Enviar Indicação
          </button>
        )}
      </div>

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
    </MobileShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Review({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-money" : ""}`}>{v}</span>
    </div>
  );
}
