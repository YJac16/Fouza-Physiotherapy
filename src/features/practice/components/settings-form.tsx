"use client";

import { useActionState } from "react";

import {
  savePracticeSettingsAction,
  type SettingsActionState,
} from "@/features/practice/actions/settings";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initial: SettingsActionState = {};

export interface PracticeSettingsFormProps {
  defaults: {
    practiceName: string;
    contactEmail: string;
    contactPhone: string;
  };
}

export function PracticeSettingsForm({ defaults }: PracticeSettingsFormProps) {
  const [state, action, pending] = useActionState(savePracticeSettingsAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">Practice details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid max-w-lg gap-4">
          <div className="space-y-2">
            <Label htmlFor="practiceName">Practice name</Label>
            <Input
              id="practiceName"
              name="practiceName"
              defaultValue={defaults.practiceName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={defaults.contactEmail}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              defaultValue={defaults.contactPhone}
            />
          </div>
          {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
          {state.success ? (
            <FormMessage tone="success">{state.success}</FormMessage>
          ) : null}
          <Button type="submit" loading={pending}>
            Save settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
