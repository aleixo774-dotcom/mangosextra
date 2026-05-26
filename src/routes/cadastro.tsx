import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Shield, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastro")({
  component: Cadastro,
});

function Cadastro() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    cpf: "",
    aceite: false,
  });
  const valid =
    form.nome.trim().length > 2 &&
    form.email.includes("@") &&
    form.telefone.length >= 10 &&
    form.aceite;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    // TODO: integrar com Lovable Cloud (auth + tabela indicadores)
    toast.success("Cadastro enviado! Em breve liberamos seu acesso 🥭");
    setTimeout(() => nav({ to: "/" }), 800);
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-forest text-forest-foreground">
      <header className="px-5 pb-4 pt-12">
        <Link
          to="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="mt-6">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-mango">
            <span aria-hidden>🥭</span> mangos · extra
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight">
            Vire um indicador <span className="text-mango">Mangos</span>
          </h1>
          <p className="mt-2 text-sm text-forest-foreground/70">
            Indique, acumule pontos e troque por dinheiro. 100% gratuito.
          </p>
        </div>

        <ul className="mt-5 space-y-2 text-sm">
          {[
            { icon: Sparkles, t: "10 pontos por indicação aprovada" },
            { icon: Wallet, t: "100 pts = R$ 100 no seu Pix" },
            { icon: Shield, t: "Sem mensalidade, sem pegadinha" },
          ].map(({ icon: Icon, t }) => (
            <li key={t} className="flex items-center gap-2 text-forest-foreground/85">
              <Icon className="h-4 w-4 text-mango" /> {t}
            </li>
          ))}
        </ul>
      </header>

      <form
        onSubmit={submit}
        className="mt-4 space-y-3 rounded-t-3xl bg-background px-5 pb-10 pt-6 text-foreground"
      >
        <Field
          label="Nome completo"
          value={form.nome}
          onChange={(v) => setForm({ ...form, nome: v })}
          placeholder="Como aparece no documento"
        />
        <Field
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="voce@email.com"
        />
        <Field
          label="WhatsApp"
          type="tel"
          value={form.telefone}
          onChange={(v) => setForm({ ...form, telefone: v })}
          placeholder="(00) 90000-0000"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Cidade"
            value={form.cidade}
            onChange={(v) => setForm({ ...form, cidade: v })}
            placeholder="Batatais"
          />
          <Field
            label="CPF (opcional)"
            value={form.cpf}
            onChange={(v) => setForm({ ...form, cpf: v })}
            placeholder="000.000.000-00"
          />
        </div>

        <label className="mt-2 flex items-start gap-2 rounded-2xl bg-muted p-3 text-xs">
          <input
            type="checkbox"
            checked={form.aceite}
            onChange={(e) => setForm({ ...form, aceite: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-[color:var(--coral)]"
          />
          <span className="text-muted-foreground">
            Li e aceito os <strong className="text-forest">Termos de Uso</strong> e a{" "}
            <strong className="text-forest">Política de Privacidade</strong> da Mangos.
          </span>
        </label>

        <button
          type="submit"
          disabled={!valid}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-mango py-4 font-display text-base font-bold text-mango-foreground shadow-lg shadow-mango/40 transition active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
        >
          <Check className="h-5 w-5" /> Quero ser indicador
        </button>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Já tem cadastro?{" "}
          <Link to="/" className="font-semibold text-coral underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none ring-mango/40 transition focus:border-mango focus:ring-2"
      />
    </label>
  );
}
