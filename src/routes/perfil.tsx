import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Wallet } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { brl, useMangoStore } from "@/lib/mango-data";

export const Route = createFileRoute("/perfil")({
  component: Perfil,
});

function Perfil() {
  const all = useMangoStore();
  const total = all.filter((r) => r.status === "pago").reduce((s, r) => s + r.commission, 0);

  return (
    <MobileShell>
      <header className="flex items-center gap-3 bg-forest px-5 pb-8 pt-12 text-forest-foreground">
        <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold">Perfil</h1>
      </header>
      <main className="px-5 pt-6">
        <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mango font-display text-lg font-bold text-mango-foreground">
            PM
          </div>
          <div>
            <p className="font-display text-lg font-bold">Pedro Martins</p>
            <p className="text-sm text-muted-foreground">indicador@mangos.app</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-mango/30 bg-mango/10 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-forest/70">
            <Wallet className="h-4 w-4" /> Comissões pagas
          </div>
          <p className="mt-1 font-display text-3xl font-bold text-forest">{brl(total)}</p>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold text-destructive">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </main>
    </MobileShell>
  );
}
