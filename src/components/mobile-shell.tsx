import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Plus, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background pb-24">
      {children}
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/nova", icon: Plus, label: "Indicar", primary: true },
    { to: "/admin", icon: BarChart3, label: "Admin" },
    { to: "/perfil", icon: User, label: "Perfil" },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
      <ul className="grid grid-cols-4 items-end px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const Icon = it.icon;
          if (it.primary) {
            return (
              <li key={it.to} className="flex justify-center">
                <Link
                  to={it.to}
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
                to={it.to}
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
