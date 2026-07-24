import { InviteStaffForm } from "@/features/auth/components/invite-staff-form";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Invite staff members to access the admin portal.
        </p>
      </div>

      <InviteStaffForm />
    </div>
  );
}
