"use server";

import { Resend } from "resend";

import { requireStaff } from "@/lib/auth/guards";
import { createServiceClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_xxx")) return null;
  return new Resend(key);
}

export async function enqueueNotification(input: {
  channel?: "email" | "sms" | "whatsapp" | "in_app";
  templateKey: string;
  recipient: string;
  payload?: Record<string, unknown>;
  scheduledFor?: string;
}) {
  const admin = createServiceClient();
  return admin.from("notification_outbox").insert({
    channel: input.channel ?? "email",
    template_key: input.templateKey,
    recipient: input.recipient,
    payload: (input.payload ?? {}) as import("@/types/database").Json,
    scheduled_for: input.scheduledFor ?? new Date().toISOString(),
  });
}

export async function processEmailOutbox(limit = 20) {
  await requireStaff();
  const resend = getResend();
  if (!resend) return { processed: 0, error: "Resend not configured" };

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
      const subject = `Fouza Physiotherapy — ${row.template_key}`;
      const html = `<p>Notification: <strong>${row.template_key}</strong></p><pre>${JSON.stringify(row.payload, null, 2)}</pre><p>${siteConfig.practiceName}</p>`;
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@localhost",
        to: row.recipient.includes("@") ? row.recipient : siteConfig.email,
        subject,
        html,
      });
      await admin
        .from("notification_outbox")
        .update({ status: "sent", sent_at: new Date().toISOString(), attempts: row.attempts + 1 })
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
  return { processed };
}
