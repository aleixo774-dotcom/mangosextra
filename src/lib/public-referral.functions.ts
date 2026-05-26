import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  indicadorId: z.string().uuid(),
  clientName: z.string().min(2).max(120),
  clientPhone: z.string().min(8).max(40),
});

export const getIndicadorPublic = createServerFn({ method: "GET" })
  .inputValidator((data: { indicadorId: string }) =>
    z.object({ indicadorId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("name, user_id")
      .eq("user_id", data.indicadorId)
      .maybeSingle();

    if (error || !profile) return { found: false as const };

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.indicadorId)
      .maybeSingle();

    if (!roleRow) return { found: false as const };

    return {
      found: true as const,
      name: profile.name as string,
      firstName: (profile.name as string).split(" ")[0],
    };
  });

export const submitPublicReferral = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof inputSchema>) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    // Validate indicador exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("user_id", data.indicadorId)
      .maybeSingle();

    if (!profile) {
      throw new Error("Link de indicação inválido");
    }

    const { error } = await supabaseAdmin.from("referrals").insert({
      indicador_id: data.indicadorId,
      client_name: data.clientName,
      client_phone: data.clientPhone,
      product: "A definir",
      amount: 0,
      status: "recebido",
      observation: "Cadastro via link de indicação",
    });

    if (error) throw new Error(error.message);

    return { ok: true };
  });
