import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { createStaffUser } from "@/lib/consultores.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/consultores/novo")({
  component: NovoConsultor,
});

function NovoConsultor() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const createFn = useServerFn(createStaffUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Acesso restrito");
      nav({ to: "/" });
    }
  }, [isAdmin, loading, nav]);

  if (!isAdmin) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createFn({ data: { name, email, password, role: "consultor" } });
      toast.success("Consultor criado!");
      nav({ to: "/admin/usuarios" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-12">
      <header className="flex items-center gap-3 bg-forest px-5 pb-6 pt-12 text-forest-foreground">
        <Link to="/admin/usuarios" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-widest text-mango">Admin · Equipe</p>
          <h1 className="font-display text-xl font-bold">Novo Consultor</h1>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-4 px-5 pt-6">
        <div className="rounded-2xl border border-forest/20 bg-forest/5 p-3 text-xs text-forest">
          <UserPlus className="mr-1 inline h-3.5 w-3.5" />
          Consultores podem ver todas as indicações, mudar status, ligar e mandar WhatsApp pros clientes.
        </div>

        <Field label="Nome completo">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm" />
        </Field>
        <Field label="E-mail">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm" />
        </Field>
        <Field label="Senha provisória (min 6)">
          <input required type="text" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm" placeholder="Compartilhe com o consultor" />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-forest py-3.5 font-display text-base font-semibold text-forest-foreground shadow-lg shadow-forest/30 disabled:opacity-50"
        >
          {submitting ? "Criando…" : "Criar consultor"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
