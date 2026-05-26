import { useEffect, useState, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, CheckCheck, Inbox } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type Notif = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/notificacoes")({
  component: NotificacoesPage,
});

function formatWhen(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function NotificacoesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data as Notif[] | null) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Marca como lidas ao abrir a tela
  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null)
      .then(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`notif-page-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, load]);

  const handleOpen = (n: Notif) => {
    if (n.url) navigate({ to: n.url as "/" });
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    toast.success("Tudo marcado como lido");
    load();
  };

  return (
    <MobileShell>
      <header className="bg-forest px-5 pb-6 pt-12 text-forest-foreground">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg font-bold">Notificações</h1>
          <button
            onClick={markAllRead}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
            aria-label="Marcar tudo como lido"
          >
            <CheckCheck className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="-mt-4 flex-1 rounded-t-3xl bg-background px-5 pt-6">
        {loading && (
          <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>
        )}

        {!loading && items.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nada por aqui ainda. Avisos da equipe Mangos e atualizações das suas
              indicações vão aparecer nesta tela.
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {items.map((n) => {
            const unread = !n.read_at;
            return (
              <li key={n.id}>
                <button
                  onClick={() => handleOpen(n)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition active:scale-[0.99] ${
                    unread
                      ? "border-mango/40 bg-mango/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      unread ? "bg-mango text-mango-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold">{n.title}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatWhen(n.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    {n.url && (
                      <span className="mt-1 inline-block text-xs font-semibold text-forest">
                        Abrir →
                      </span>
                    )}
                  </div>
                  {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" />}
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </MobileShell>
  );
}
