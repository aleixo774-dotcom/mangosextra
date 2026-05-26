import { createServerFn } from "@tanstack/react-start";
import webpush from "web-push";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function configureWebPush() {
  const pub =
    "BJGspknD-H-cqx4i-SBJGLPmF1zPaB6C7IhUYKIKFnK_RCSp6L4nuQWHl1CDHlSwLBTZ3ZC_Qi-lHoEYIfnlPdw";
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contato@mangosextra.com.br";
  if (!priv) throw new Error("VAPID_PRIVATE_KEY missing");
  webpush.setVapidDetails(subject, pub, priv);
}

export const sendPushToUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { user_id: string; title: string; body: string; url?: string | null }) => data,
  )
  .handler(async ({ data, context }) => {
    // Apenas admin/consultor pode enviar push para outros (ou o próprio usuário)
    const { userId, supabase } = context;
    if (data.user_id !== userId) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const isStaff = roles?.some((r) => r.role === "admin" || r.role === "consultor");
      if (!isStaff) throw new Error("Forbidden");
    }

    configureWebPush();

    const { data: subs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", data.user_id);

    if (!subs?.length) return { sent: 0, removed: 0 };

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url ?? "/notificacoes",
    });

    let sent = 0;
    const deadIds: string[] = [];

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
          );
          sent++;
        } catch (err) {
          const e = err as { statusCode?: number };
          if (e?.statusCode === 404 || e?.statusCode === 410) deadIds.push(s.id);
          else console.error("push error", err);
        }
      }),
    );

    if (deadIds.length) {
      await supabaseAdmin.from("push_subscriptions").delete().in("id", deadIds);
    }

    return { sent, removed: deadIds.length };
  });
