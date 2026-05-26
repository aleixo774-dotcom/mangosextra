import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function NotificationBell({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const load = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (active) setUnread(count ?? 0);
    };
    load();

    const channel = supabase
      .channel(`notif-bell-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const base =
    tone === "dark"
      ? "bg-white/10 text-forest-foreground hover:bg-white/20"
      : "bg-muted text-foreground hover:bg-muted/70";

  return (
    <Link
      to="/notificacoes"
      aria-label="Notificações"
      className={`relative flex h-11 w-11 items-center justify-center rounded-full transition ${base}`}
    >
      <Bell className="h-5 w-5" strokeWidth={2.2} />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white ring-2 ring-forest">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
