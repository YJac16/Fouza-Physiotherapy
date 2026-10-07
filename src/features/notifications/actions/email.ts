"use server";

import { Resend } from "resend";

import { requireStaff } from "@/lib/auth/guards";
import { createServiceClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { renderEmailTemplate } from "@/features/notifications/lib/email-templates";
import type { Json } from "@/types/database";

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
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
    payload: (input.payload ?? {}) as Json,
    scheduled_for: input.scheduledFor ?? new Date().toISOString(),
  });
}

export async function processEmailOutbox(limit = 20) {
  await requireStaff();
  const resend = getResend();
  if (!resend) return { processed: 0, failed: 0, error: "Resend not configured" };

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
  return { processed, failed };
}
