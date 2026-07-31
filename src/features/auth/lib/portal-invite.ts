import { createServiceClient } from "@/lib/supabase/admin";

export type PortalInviteResult = {
  profileId: string | null;
  magicLink: string | null;
  created: boolean;
  error?: string;
};

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
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/portal/forms")}`;

  let profileId: string | null = null;
  let created = false;

  // Prefer exact email lookup when available on the Admin API.
  const adminApi = admin.auth.admin as typeof admin.auth.admin & {
    getUserByEmail?: (email: string) => Promise<{ data: { user: { id: string } | null }; error: Error | null }>;
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
    profileId = existingId;
  } else {
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
        magicLink: null,
        created: false,
        error: createError?.message ?? "Unable to create portal account",
      };
    }
    profileId = createdUser.user.id;
    created = true;
  }

  await admin
    .from("patients")
    .update({ profile_id: profileId })
    .eq("id", input.patientId);

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkError) {
    return {
      profileId,
      magicLink: null,
      created,
      error: linkError.message,
    };
  }

  const magicLink =
    linkData.properties?.action_link ??
    (linkData as { action_link?: string }).action_link ??
    null;

  return { profileId, magicLink, created };
}
