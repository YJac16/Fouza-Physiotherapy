import { greetingFirstName } from "@/features/billing/lib/invoice-recipient";
import { drainEmailOutbox } from "@/features/notifications/lib/outbox";
import { createServiceClient } from "@/lib/supabase/admin";

export async function enqueuePortalInviteEmail(input: {
  email: string;
  fullName: string;
  magicLink: string;
}) {
  const admin = createServiceClient();
  const recipient = input.email.toLowerCase().trim();
  const { error } = await admin.from("notification_outbox").insert({
    channel: "email",
    template_key: "portal.invite",
    recipient,
    payload: {
      firstName: greetingFirstName(input.fullName),
      magicLink: input.magicLink,
    },
  });

  if (error) return { error: error.message };
  await drainEmailOutbox(1);
  return { error: null as string | null };
}
