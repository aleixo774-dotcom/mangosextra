import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Referral, Status, TimelineEvent } from "@/lib/mango-data";

/** Lista indicações do usuário logado (admin vê todas — RLS controla). */
export function useReferrals() {
  const [data, setData] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setData(data as Referral[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("referrals-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "referrals" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { data, loading, reload: load };
}

export function useReferral(id: string) {
  const [referral, setReferral] = useState<Referral | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [indicadorName, setIndicadorName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [r, e] = await Promise.all([
      supabase.from("referrals").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("referral_events")
        .select("*")
        .eq("referral_id", id)
        .order("created_at", { ascending: true }),
    ]);
    const ref = (r.data as Referral | null) ?? null;
    setReferral(ref);
    setEvents((e.data as TimelineEvent[] | null) ?? []);
    if (ref) {
      const { data: p } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", ref.indicador_id)
        .maybeSingle();
      setIndicadorName((p as { name: string } | null)?.name ?? null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`referral-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "referrals", filter: `id=eq.${id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [id, load]);

  return { referral, events, indicadorName, loading, reload: load };
}

export async function createReferral(input: {
  indicador_id: string;
  client_name: string;
  client_phone: string;
  product: string;
  amount: number;
  observation?: string;
}) {
  const { data, error } = await supabase
    .from("referrals")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Referral;
}

export async function updateReferralStatus(id: string, status: Status) {
  const { error } = await supabase
    .from("referrals")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
