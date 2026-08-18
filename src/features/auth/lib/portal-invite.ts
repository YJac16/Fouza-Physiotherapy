import { createServiceClient } from "@/lib/supabase/admin";

export type PortalInviteResult = {
  profileId: string | null;
  magicLink: string | null;
  created: boolean;
  error?: string;
};

async function findOrCreateAuthUser(input: {
  email: string;
  fullName: string;
}): Promise<{ profileId: string | null; created: boolean; error?: string }> {
  const admin = createServiceClient();
  const email = input.email.toLowerCase().trim();

  const adminApi = admin.auth.admin as typeof admin.auth.admin & {
    getUserByEmail?: (email: string) => Promise<{
      data: { user: { id: string } | null };
      error: Error | null;
    }>;
  };
  let existingId: string | null = null;
  if (typeof adminApi.getUserByEmail === "function") {
    const { data } = await adminApi.getUserByEmail(email);
    existingId = data.user?.id ?? null;
  } else {
    const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    existingId = listed?.users?.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
  }

  if (existingId) {
    return { profileId: existingId, created: false };
  }

  const tempPassword = `Fp-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}!`;
  const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });
  if (createError || !createdUser.user) {
    return {
      profileId: null,
      created: false,
      error: createError?.message ?? "Unable to create portal account",
    };
  }
  return { profileId: createdUser.user.id, created: true };
}

async function generateMagicLink(email: string, nextPath: string): Promise<string | null> {
  const admin = createServiceClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });
  if (linkError) return null;
  return (
    linkData.properties?.action_link ??
    (linkData as { action_link?: string }).action_link ??
    null
  );
}

/**
 * Ensure a patient auth user exists for the booking email, link patients.profile_id,
 * and generate a magic link that lands on /portal/forms.
 */
export async function ensurePatientPortalInvite(input: {
  email: string;
  fullName: string;
  patientId: string;
}): Promise<PortalInviteResult> {
  const admin = createServiceClient();
  const email = input.email.toLowerCase().trim();
  const user = await findOrCreateAuthUser({ email, fullName: input.fullName });
  if (!user.profileId) {
    return { profileId: null, magicLink: null, created: false, error: user.error };
  }

  await admin.from("patients").update({ profile_id: user.profileId }).eq("id", input.patientId);

  const magicLink = await generateMagicLink(email, "/portal/forms");
  return {
    profileId: user.profileId,
    magicLink,
    created: user.created,
    error: magicLink ? undefined : "Unable to generate portal link",
  };
}

/**
 * Invite an account holder / family contact. Links patient_contacts.profile_id only —
 * never writes patients.profile_id.
 */
export async function ensureAccountHolderPortalInvite(input: {
  email: string;
  fullName: string;
  patientId: string;
  contactId?: string | null;
}): Promise<PortalInviteResult> {
  const admin = createServiceClient();
  const email = input.email.toLowerCase().trim();
  const user = await findOrCreateAuthUser({ email, fullName: input.fullName });
  if (!user.profileId) {
    return { profileId: null, magicLink: null, created: false, error: user.error };
  }

  if (input.contactId) {
    await admin
      .from("patient_contacts")
      .update({ profile_id: user.profileId, email, full_name: input.fullName })
      .eq("id", input.contactId);
  } else {
    const { data: existing } = await admin
      .from("patient_contacts")
      .select("id")
      .eq("patient_id", input.patientId)
      .eq("email", email)
      .maybeSingle();
    if (existing) {
      await admin
        .from("patient_contacts")
        .update({ profile_id: user.profileId, full_name: input.fullName })
        .eq("id", existing.id);
    }
  }

  const magicLink = await generateMagicLink(email, "/portal");
  return {
    profileId: user.profileId,
    magicLink,
    created: user.created,
    error: magicLink ? undefined : "Unable to generate portal link",
  };
}
