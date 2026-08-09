import { Resend } from "resend";

import { createServiceClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { renderEmailTemplate } from "@/features/notifications/lib/email-templates";

export async function drainEmailOutbox(limit = 20) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey.startsWith("re_xxx")) {
    return { processed: 0, skipped: true as const };
  }

  const resend = new Resend(apiKey);
  const admin = createServiceClient();
  const { data: rows } = await admin
    .from("notification_outbox")
    .select("*")
    .eq("channel", "email")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(limit);

  const from = (process.env.RESEND_FROM_EMAIL ?? "noreply@localhost").trim();
  const replyTo = process.env.RESEND_REPLY_TO?.trim() || undefined;

  let processed = 0;
  let failed = 0;
  for (const row of rows ?? []) {
    try {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      const { subject, html } = renderEmailTemplate(row.template_key, payload);
      const to = row.recipient.includes("@") ? row.recipient : siteConfig.email;

      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
        ...(replyTo ? { replyTo } : {}),
      });

      if (error || !data) {
        await admin
          .from("notification_outbox")
          .update({
            status: "failed",
            last_error: error?.message ?? "Resend returned no message id",
            attempts: row.attempts + 1,
          })
          .eq("id", row.id);
        failed += 1;
        continue;
      }

      await admin
        .from("notification_outbox")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempts: row.attempts + 1,
          last_error: null,
        })
        .eq("id", row.id);
      processed += 1;
    } catch (e) {
      await admin
        .from("notification_outbox")
        .update({
          status: "failed",
          last_error: e instanceof Error ? e.message : "send failed",
          attempts: row.attempts + 1,
        })
        .eq("id", row.id);
      failed += 1;
    }
  }
  return { processed, failed, skipped: false as const };
}
