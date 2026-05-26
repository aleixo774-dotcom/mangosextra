import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendBulkNotifications, sendNotification } from "@/lib/notifications";
import type { Profile } from "@/lib/mango-data";

export const Route = createFileRoute("/_authenticated/admin/notificacoes")({
  component: AdminNotificacoes,
});

type Role = "admin" | "consultor" | "indicador";
type Audience = "all" | "indicador" | "consultor" | "one";

function AdminNotificacoes() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Map<string, Role>>(new Map());
  const [audience, setAudience] = useState<Audience>("all");
  const [oneUserId, setOneUserId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Acesso restrito");
      nav({ to: "/" });
    }
  }, [isAdmin, loading, nav]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [profRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").order("name"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      setProfiles((profRes.data as Profile[] | null) ?? []);
      const map = new Map<string, Role>();
      ((roleRes.data ?? []) as Array<{ user_id: string; role: Role }>).forEach((r) => {
        const cur = map.get(r.user_id);
        if (!cur || r.role === "admin" || (r.role === "consultor" && cur === "indicador")) {
          map.set(r.user_id, r.role);
        }
      });
      setRoles(map);
    })();
  }, [isAdmin]);

  const targets = useMemo(() => {
    if (audience === "one") return oneUserId ? [oneUserId] : [];
    return profiles
      .map((p) => p.user_id)
      .filter((uid) => {
        const role = roles.get(uid) ?? "indicador";
        if (audience === "all") return role !== "admin";
        return role === audience;
      });
  }, [profiles, roles, audience, oneUserId]);

  async function send() {
    if (!title.trim() || !body.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    if (targets.length === 0) {
      toast.error("Nenhum destinatário");
      return;
    }
    setSending(true);
    try {
      if (audience === "one") {
        await sendNotification({ user_id: targets[0], title: title.trim(), body: body.trim() });
      } else {
        await sendBulkNotifications(targets, title.trim(), body.trim());
      }
      toast.success(`Enviado para ${targets.length} ${targets.length === 1 ? "usuário" : "usuários"}`);
      setTitle("");
      setBody("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-12">
      <header className="bg-forest px-5 pb-6 pt-12 text-forest-foreground">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-widest text-mango">Admin · Comunicação</p>
            <h1 className="font-display text-xl font-bold">Enviar notificação</h1>
          </div>
        </div>
      </header>

      <main className="px-5 pt-5 space-y-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Destinatário</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { k: "all", l: "Todos" },
                { k: "indicador", l: "Indicadores" },
                { k: "consultor", l: "Consultores" },
                { k: "one", l: "1 usuário" },
              ] as Array<{ k: Audience; l: string }>
            ).map((opt) => (
              <button
                key={opt.k}
                onClick={() => setAudience(opt.k)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  audience === opt.k ? "border-forest bg-forest text-forest-foreground" : "border-border bg-card"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
          {audience === "one" && (
            <select
              value={oneUserId}
              onChange={(e) => setOneUserId(e.target.value)}
              className="mt-3 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {profiles.map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.name} · {roles.get(p.user_id) ?? "indicador"}
                </option>
              ))}
            </select>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{targets.length} destinatário(s)</p>
        </div>

        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Título</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="Ex: Campanha de bônus em dobro"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Mensagem</p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            rows={5}
            placeholder="Escreva sua mensagem para os indicadores..."
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">{body.length}/500</p>
        </div>

        <button
          onClick={send}
          disabled={sending || !title.trim() || !body.trim() || targets.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mango py-3 font-display font-bold text-mango-foreground shadow-lg shadow-mango/30 transition active:scale-95 disabled:opacity-40"
        >
          <Send className="h-4 w-4" /> {sending ? "Enviando…" : "Enviar"}
        </button>
      </main>
    </div>
  );
}
