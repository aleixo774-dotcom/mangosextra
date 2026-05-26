import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/", replace: true });
  }, [user, loading, nav]);

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    nav({ to: "/", replace: true });
  }

  async function signInGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Falha ao entrar com Google");
      return;
    }
    if (!result.redirected) {
      setBusy(false);
      nav({ to: "/", replace: true });
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-forest px-5 pt-16 text-forest-foreground">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-mango">🥭 mangos · extra</p>
        <h1 className="mt-4 font-display text-3xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm opacity-70">
          Acesse sua conta de indicador.
        </p>
      </div>

      <button
        onClick={signInGoogle}
        disabled={busy}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-charcoal shadow-md disabled:opacity-50"
      >
        <GoogleIcon /> Continuar com Google
      </button>

      <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest opacity-60">
        <span className="h-px flex-1 bg-white/20" /> ou <span className="h-px flex-1 bg-white/20" />
      </div>

      <form onSubmit={signInEmail} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          className="h-12 w-full rounded-2xl bg-white/10 px-4 text-sm outline-none placeholder:text-forest-foreground/40 focus:bg-white/15"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
          minLength={6}
          className="h-12 w-full rounded-2xl bg-white/10 px-4 text-sm outline-none placeholder:text-forest-foreground/40 focus:bg-white/15"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-2xl bg-mango font-display font-bold text-mango-foreground shadow-lg shadow-mango/30 disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm opacity-80">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-bold text-mango underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
