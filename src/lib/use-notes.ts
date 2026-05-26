import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ReferralNote = {
  id: string;
  referral_id: string;
  author_id: string;
  author_role: "admin" | "consultor" | "indicador";
  body: string;
  created_at: string;
};

export function useReferralNotes(referralId: string) {
  const [notes, setNotes] = useState<ReferralNote[]>([]);
  const [authors, setAuthors] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("referral_notes")
      .select("*")
      .eq("referral_id", referralId)
      .order("created_at", { ascending: true });
    const list = (data as ReferralNote[] | null) ?? [];
    setNotes(list);
    const ids = Array.from(new Set(list.map((n) => n.author_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id,name")
        .in("user_id", ids);
      setAuthors(new Map((profs ?? []).map((p) => [p.user_id, p.name])));
    }
    setLoading(false);
  }, [referralId]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`notes-${referralId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "referral_notes", filter: `referral_id=eq.${referralId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [referralId, load]);

  return { notes, authors, loading, reload: load };
}

export async function addReferralNote(input: {
  referral_id: string;
  author_id: string;
  author_role: "admin" | "consultor";
  body: string;
  notify_user_id?: string | null;
  notify_title?: string;
}) {
  const { error } = await supabase.from("referral_notes").insert({
    referral_id: input.referral_id,
    author_id: input.author_id,
    author_role: input.author_role,
    body: input.body,
  });
  if (error) throw error;

  if (input.notify_user_id) {
    await supabase.from("notifications").insert({
      user_id: input.notify_user_id,
      title: input.notify_title ?? "Nova observação na sua indicação",
      body: input.body.slice(0, 140),
      url: `/indicacao/${input.referral_id}`,
    });
  }
}
