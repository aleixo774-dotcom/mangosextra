import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

export async function sendNotification(input: {
  user_id: string;
  title: string;
  body: string;
  url?: string | null;
}) {
  const { error } = await supabase.from("notifications").insert({
    user_id: input.user_id,
    title: input.title,
    body: input.body,
    url: input.url ?? null,
  });
  if (error) throw error;
}

export async function sendBulkNotifications(
  user_ids: string[],
  title: string,
  body: string,
  url?: string | null,
) {
  if (!user_ids.length) return;
  const rows = user_ids.map((user_id) => ({
    user_id,
    title,
    body,
    url: url ?? null,
  }));
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) throw error;
}

export function useMyNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data as Notification[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
}
