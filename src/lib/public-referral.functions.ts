import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const inputSchema = z.object({
  identifier: z.string().min(3).max(64),
  clientName: z.string().trim().min(2).max(120),
  clientPhone: z.string().trim().min(8).max(40),
});

async function findIndicadorIdByIdentifier(identifier: string): Promise<string | null> {
  if (UUID_RE.test(identifier)) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("user_id", identifier)
      .maybeSingle();
    return (data?.user_id as string | undefined) ?? null;
  }
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .ilike("slug", identifier)
    .maybeSingle();
  return (data?.user_id as string | undefined) ?? null;
}

export const getIndicadorPublic = createServerFn({ method: "GET" })
  .inputValidator((data: { identifier: string }) =>
    z.object({ identifier: z.string().min(3).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const userId = await findIndicadorIdByIdentifier(data.identifier);
    if (!userId) return { found: false as const };

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) return { found: false as const };

    return {
      found: true as const,
      name: profile.name as string,
      firstName: (profile.name as string).split(" ")[0],
    };
  });

export const submitPublicReferral = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof inputSchema>) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await findIndicadorIdByIdentifier(data.identifier);
    if (!userId) throw new Error("Link de indicação inválido");

    const { error } = await supabaseAdmin.from("referrals").insert({
      indicador_id: userId,
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

// --- Slug management (used by /perfil) ---

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Mínimo 3 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[a-z0-9_-]+$/, "Use só letras, números, hífen ou underline");

export const checkSlugAvailable = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: slugSchema.parse(data.slug) }))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .ilike("slug", data.slug)
      .maybeSingle();
    return { available: !row };
  });
