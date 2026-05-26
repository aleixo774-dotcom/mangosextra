import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Circle, Search, UserCheck, UserX, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Profile } from "@/lib/mango-data";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  component: AdminUsuarios,
});

type Presence = "online" | "ativo" | "inativo" | "pendente";

function presenceOf(profile: Profile, refCount: number): Presence {
  if (refCount === 0) return "pendente";
  if (!profile.last_seen_at) return "inativo";
  const diffMin = (Date.now() - new Date(profile.last_seen_at).getTime()) / 60000;
  if (diffMin < 10) return "online";
  if (diffMin < 60 * 24 * 3) return "ativo";
  return "inativo";
}

function relTime(iso: string | null): string {
  if (!iso) return "—";
  const diffMin = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${Math.floor(diffMin)} min`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)} h`;
  return `${Math.floor(diffMin / (60 * 24))} d`;
}

const PRESENCE_STYLE: Record<Presence, { dot: string; label: string; pill: string }> = {
  online: { dot: "bg-money", label: "Online", pill: "bg-money/15 text-[color:oklch(0.35_0.12_145)]" },
  ativo: { dot: "bg-mango", label: "Ativo", pill: "bg-mango/20 text-[color:oklch(0.35_0.1_125)]" },
  inativo: { dot: "bg-muted-foreground", label: "Inativo", pill: "bg-muted text-muted-foreground" },
  pendente: { dot: "bg-coral", label: "Pendente", pill: "bg-coral/15 text-coral" },
};

const FILTERS: Array<{ key: "todos" | Presence; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "online", label: "Online" },
  { key: "ativo", label: "Ativos" },
  { key: "inativo", label: "Inativos" },
  { key: "pendente", label: "Pendentes" },
];

type Row = {
  profile: Profile;
  refCount: number;
  presence: Presence;
};

function AdminUsuarios() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("todos");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Acesso restrito");
      nav({ to: "/" });
    }
  }, [isAdmin, loading, nav]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [profilesRes, countsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("referrals").select("indicador_id"),
      ]);
      const counts = new Map<string, number>();
      ((countsRes.data ?? []) as Array<{ indicador_id: string }>).forEach((r) => {
        counts.set(r.indicador_id, (counts.get(r.indicador_id) ?? 0) + 1);
      });
      const built: Row[] = ((profilesRes.data ?? []) as Profile[]).map((p) => {
        const c = counts.get(p.user_id) ?? 0;
        return { profile: p, refCount: c, presence: presenceOf(p, c) };
      });
      setRows(built);
      setLoadingData(false);
    })();
  }, [isAdmin]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      online: rows.filter((r) => r.presence === "online").length,
      ativo: rows.filter((r) => r.presence === "ativo").length,
      inativo: rows.filter((r) => r.presence === "inativo").length,
      pendente: rows.filter((r) => r.presence === "pendente").length,
    }),
    [rows],
  );

  const list = rows.filter(
    (u) =>
      (filter === "todos" || u.presence === filter) &&
      (q === "" || u.profile.name.toLowerCase().includes(q.toLowerCase())),
  );

  if (!isAdmin) return null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-12">
      <header className="bg-forest px-5 pb-6 pt-12 text-forest-foreground">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-widest text-mango">Admin · Indicadores</p>
            <h1 className="font-display text-xl font-bold">Usuários</h1>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          <Kpi icon={<Users className="h-3 w-3" />} label="Total" value={counts.total} />
          <Kpi icon={<Circle className="h-3 w-3 fill-current" />} label="Online" value={counts.online} accent />
          <Kpi icon={<UserCheck className="h-3 w-3" />} label="Ativos" value={counts.ativo} />
          <Kpi icon={<UserX className="h-3 w-3" />} label="Inativ." value={counts.inativo} />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
          <Search className="h-4 w-4 opacity-70" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar indicador..." className="w-full bg-transparent text-sm outline-none placeholder:text-forest-foreground/50" />
        </div>
      </header>

      <div className="sticky top-0 z-30 -mt-3 rounded-t-3xl bg-background px-3 pb-2 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active ? "bg-forest text-forest-foreground" : "border border-border bg-card text-muted-foreground"
              }`}>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="px-4 pt-2">
        {loadingData && <p className="p-8 text-center text-sm text-muted-foreground">Carregando…</p>}
        {!loadingData && list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum usuário neste filtro.
          </p>
        )}
        <ul className="space-y-2">
          {list.map((u) => {
            const p = PRESENCE_STYLE[u.presence];
            return (
              <li key={u.profile.id} className="rounded-2xl bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mango/20 font-display text-sm font-bold text-forest">
                      {u.profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${p.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.profile.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.profile.city ?? "—"} · visto {relTime(u.profile.last_seen_at)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.pill}`}>
                    {p.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-[11px]">
                  <span className="text-muted-foreground">
                    Desde {new Date(u.profile.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-semibold text-forest">
                    {u.refCount} ind · <span className="text-coral">{u.profile.points} pts</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-white/10 p-2 backdrop-blur">
      <div className={`flex items-center gap-1 text-[9px] uppercase tracking-wider ${accent ? "text-money" : "opacity-70"}`}>
        {icon} {label}
      </div>
      <p className="font-display text-base font-bold">{value}</p>
    </div>
  );
}
