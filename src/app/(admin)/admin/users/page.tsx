import { InviteStaffForm } from "@/features/auth/components/invite-staff-form";
import { StaffDirectory } from "@/features/auth/components/staff-directory";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ data: staff }, { data: invites }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", ["admin", "practitioner", "receptionist"])
      .order("full_name"),
    supabase
      .from("staff_invites")
      .select("id, full_name, email, role, expires_at, accepted_at")
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Review who can access admin, invite new staff, and revoke unused invites. Invites are not
          emailed from this screen.
        </p>
      </div>

      <StaffDirectory
        staff={(staff ?? []).map((member) => ({
          id: member.id,
          full_name: member.full_name,
          email: member.email,
          role: member.role,
          isCurrentUser: member.id === profile.id,
        }))}
        invites={(invites ?? []).map((invite) => ({
          id: invite.id,
          full_name: invite.full_name,
          email: invite.email,
          role: invite.role,
          expires_at: invite.expires_at,
          expired: invite.expires_at < now,
        }))}
      />

      <InviteStaffForm />
    </div>
  );
}
