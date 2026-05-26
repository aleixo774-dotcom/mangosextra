import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Circle, Search, UserCheck, UserX, Users } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuarios,
});

type Presence = "online" | "ativo" | "inativo" | "pendente";

type Indicator = {
  id: string;
  name: string;
  city: string;
  joinedAt: string;
  lastSeen: string;
  presence: Presence;
  referrals: number;
  points: number;
};

// Mock — depois substituir por dados do Lovable Cloud (auth + tabela indicadores)
const SEED: Indicator[] = [
  { id: "u1", name: "Pedro Almeida", city: "Batatais/SP", joinedAt: "2026-04-12", lastSeen: "agora", presence: "online", referrals: 12, points: 80 },
  { id: "u2", name: "Marina Silva", city: "Ribeirão Preto/SP", joinedAt: "2026-04-22", lastSeen: "5 min", presence: "online", referrals: 7, points: 50 },
  { id: "u3", name: "Carlos Mendes", city: "Franca/SP", joinedAt: "2026-03-30", lastSeen: "2 h", presence: "ativo", referrals: 18, points: 110 },
  { id: "u4", name: "Juliana Rocha", city: "Batatais/SP", joinedAt: "2026-02-14", lastSeen: "1 d", presence: "ativo", referrals: 25, points: 220 },
  { id: "u5", name: "Roberto Lima", city: "Ituverava/SP", joinedAt: "2026-05-02", lastSeen: "12 d", presence: "inativo", referrals: 2, points: 10 },
  { id: "u6", name: "Ana Beatriz", city: "Batatais/SP", joinedAt: "2026-05-25", lastSeen: "—", presence: "pendente", referrals: 0, points: 0 },
];

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

function AdminUsuarios() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("todos");
  const [q, setQ] = useState("");

  const counts = useMemo(
    () => ({
      total: SEED.length,
      online: SEED.filter((u) => u.presence === "online").length,
      ativo: SEED.filter((u) => u.presence === "ativo").length,
      inativo: SEED.filter((u) => u.presence === "inativo").length,
      pendente: SEED.filter((u) => u.presence === "pendente").length,
    }),
    [],
  );

  const list = SEED.filter(
    (u) =>
      (filter === "todos" || u.presence === filter) &&
      (q === "" || u.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-12">
      <header className="bg-forest px-5 pb-6 pt-12 text-forest-foreground">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
            aria-label="Voltar"
          >
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
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar indicador..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-forest-foreground/50"
          />
        </div>
      </header>

      <div className="sticky top-0 z-30 -mt-3 rounded-t-3xl bg-background px-3 pb-2 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-forest text-forest-foreground"
                    : "border border-border bg-card text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="px-4 pt-2">
        {list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum usuário neste filtro.
          </p>
        )}
        <ul className="space-y-2">
          {list.map((u) => {
            const p = PRESENCE_STYLE[u.presence];
            return (
              <li key={u.id} className="rounded-2xl bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mango/20 font-display text-sm font-bold text-forest">
                      {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${p.dot}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.city} · visto {u.lastSeen}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.pill}`}>
                    {p.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-[11px]">
                  <span className="text-muted-foreground">
                    Desde {new Date(u.joinedAt).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-semibold text-forest">
                    {u.referrals} ind · <span className="text-coral">{u.points} pts</span>
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

function Kpi({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-2 backdrop-blur">
      <div
        className={`flex items-center gap-1 text-[9px] uppercase tracking-wider ${accent ? "text-money" : "opacity-70"}`}
      >
        {icon} {label}
      </div>
      <p className="font-display text-base font-bold">{value}</p>
    </div>
  );
}
