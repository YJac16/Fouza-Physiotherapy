"use client";

import { useActionState } from "react";

import { inviteStaffAction, type AuthActionState } from "@/features/auth/actions/auth";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initial: AuthActionState = {};

export function InviteStaffForm() {
  const [state, action, pending] = useActionState(inviteStaffAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">Invite staff member</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid max-w-md gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="practitioner">Practitioner</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
          {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
          <Button type="submit" loading={pending}>
            Send invite
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
