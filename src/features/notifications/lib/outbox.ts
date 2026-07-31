import { Resend } from "resend";

import { createServiceClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { renderEmailTemplate } from "@/features/notifications/lib/email-templates";

export async function drainEmailOutbox(limit = 20) {
  const apiKey = process.env.RESEND_API_KEY;
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

  let processed = 0;
  for (const row of rows ?? []) {
    try {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      const { subject, html } = renderEmailTemplate(row.template_key, payload);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@localhost",
        to: row.recipient.includes("@") ? row.recipient : siteConfig.email,
        subject,
        html,
      });
      await admin
        .from("notification_outbox")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempts: row.attempts + 1,
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
    }
  }
  return { processed, skipped: false as const };
}
