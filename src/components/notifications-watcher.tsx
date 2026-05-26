import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/** Mostra um toast sempre que uma nova notificação chega ao usuário logado. */
export function NotificationsWatcher() {
  const { user } = useAuth();
  const mounted = useRef(false);

  useEffect(() => {
    if (!user) return;
    // Evita disparar para itens antigos no primeiro mount
    mounted.current = false;
    const t = setTimeout(() => (mounted.current = true), 1500);

    const channel = supabase
      .channel(`notif-watch-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!mounted.current) return;
          const row = payload.new as { title: string; body: string; url?: string | null };
          toast(row.title, {
            description: row.body,
            action: row.url
              ? { label: "Abrir", onClick: () => (window.location.href = row.url!) }
              : undefined,
          });
        },
      )
      .subscribe();

    return () => {
      clearTimeout(t);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
}
