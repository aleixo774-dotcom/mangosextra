import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Plus, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-forest via-forest/95 to-charcoal sm:py-6 lg:py-10">
      {/* Decorative background dots — only visible on larger screens */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden sm:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, color-mix(in oklab, var(--mango) 18%, transparent) 0%, transparent 45%), radial-gradient(circle at 80% 70%, color-mix(in oklab, var(--coral) 15%, transparent) 0%, transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background pb-24 shadow-2xl shadow-black/40 sm:min-h-[min(900px,calc(100vh-3rem))] sm:rounded-[2rem] sm:ring-1 sm:ring-white/10">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}

function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { isStaff } = useAuth();
  const items: Array<{ to: string; icon: typeof Home; label: string; primary?: boolean }> = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/nova", icon: Plus, label: "Indicar", primary: true },
    ...(isStaff ? [{ to: "/admin", icon: BarChart3, label: "Admin" }] : []),
    { to: "/perfil", icon: User, label: "Perfil" },
  ];
  const cols = items.length === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur sm:rounded-b-[2rem]">
      <ul className={cn("grid items-end px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2", cols)}>
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const Icon = it.icon;
          const to = it.to as "/";
          if (it.primary) {
            return (
              <li key={it.to} className="flex justify-center">
                <Link
                  to={to}
                  className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-mango text-mango-foreground shadow-lg shadow-mango/40 ring-4 ring-background transition active:scale-95"
                  aria-label={it.label}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.5} />
                </Link>
              </li>
            );
          }
          return (
            <li key={it.to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors",
                  active ? "text-forest" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
