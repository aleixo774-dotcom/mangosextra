import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CreateInput = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(72),
  role: z.enum(["consultor", "indicador", "admin"]).default("consultor"),
});

export const createStaffUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }) => {
    // Apenas admins podem criar
    const { data: rows, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleErr) throw new Error(roleErr.message);
    const isAdmin = (rows ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("Apenas administradores podem criar usuários.");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name, role: data.role },
    });
    if (error) throw new Error(error.message);
    return { user_id: created.user?.id ?? null };
  });

const UpdateRoleInput = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["consultor", "indicador", "admin"]),
});

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateRoleInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = (rows ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("Apenas administradores.");

    // Substitui roles existentes
    const { error: delErr } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id);
    if (delErr) throw new Error(delErr.message);

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.user_id, role: data.role });
    if (insErr) throw new Error(insErr.message);
    return { ok: true };
  });
