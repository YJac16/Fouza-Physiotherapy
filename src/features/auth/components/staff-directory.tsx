"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  cancelStaffInviteAction,
  deactivateStaffAccessAction,
} from "@/features/auth/actions/auth";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { FormMessage } from "@/components/ui/form-message";
import { Badge } from "@/components/ui/badge";

export type StaffMemberRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  isCurrentUser: boolean;
};

export type StaffInviteRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  expires_at: string;
  expired: boolean;
};

export function StaffDirectory({
  staff,
  invites,
}: {
  staff: StaffMemberRow[];
  invites: StaffInviteRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  function run(action: () => Promise<{ error?: string; success?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: result.success ?? "Done" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Current staff</h2>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-secondary/40">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Access</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{member.full_name || "—"}</td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3 capitalize">{member.role}</td>
                  <td className="px-4 py-3">
                    {member.isCurrentUser ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <ConfirmAction
                        label="Revoke access"
                        confirmLabel="Yes, revoke access"
                        description={`Revoke admin access for ${member.full_name || member.email}? They will no longer be able to open /admin.`}
                        pending={pending}
                        onConfirm={() => run(() => deactivateStaffAccessAction(member.id))}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Pending invites</h2>
        {!invites.length ? (
          <p className="text-sm text-muted-foreground">No unused invites.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-secondary/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{invite.full_name}</td>
                    <td className="px-4 py-3">{invite.email}</td>
                    <td className="px-4 py-3 capitalize">{invite.role}</td>
                    <td className="px-4 py-3">
                      {invite.expired ? (
                        <Badge variant="warning">Expired</Badge>
                      ) : (
                        <Badge variant="secondary">Unused</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ConfirmAction
                        label="Cancel invite"
                        confirmLabel="Yes, cancel invite"
                        description={`Cancel the unused invite for ${invite.email}?`}
                        pending={pending}
                        onConfirm={() => run(() => cancelStaffInviteAction(invite.id))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
