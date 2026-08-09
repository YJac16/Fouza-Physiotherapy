"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  activateAvailabilityRuleAction,
  createAvailabilityExceptionAction,
  createAvailabilityRuleAction,
  deactivateAvailabilityRuleAction,
  deleteAvailabilityExceptionAction,
  deleteAvailabilityRuleAction,
  type AvailabilityActionState,
} from "@/features/booking/actions/availability";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toDateKey } from "@/features/booking/lib/timezone";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const initial: AvailabilityActionState = {};

export interface AddAvailabilityFormProps {
  practitioners: { id: string; label: string }[];
}

export function AddAvailabilityForm({ practitioners }: AddAvailabilityFormProps) {
  const [state, action, pending] = useActionState(createAvailabilityRuleAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">Add availability rule</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid max-w-lg gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="practitionerId">Practitioner</Label>
            <select
              id="practitionerId"
              name="practitionerId"
              required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select practitioner</option>
              {practitioners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Day</Label>
            <select
              id="dayOfWeek"
              name="dayOfWeek"
              required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              {DAYS.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slotMinutes">Slot (minutes)</Label>
            <Input id="slotMinutes" name="slotMinutes" type="number" defaultValue={60} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Start time</Label>
            <Input id="startTime" name="startTime" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End time</Label>
            <Input id="endTime" name="endTime" type="time" required />
          </div>
          {state.error ? (
            <FormMessage tone="error" className="sm:col-span-2">
              {state.error}
            </FormMessage>
          ) : null}
          {state.success ? (
            <FormMessage tone="success" className="sm:col-span-2">
              {state.success}
            </FormMessage>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" loading={pending}>
              Add rule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function BlockDateForm({ practitioners }: AddAvailabilityFormProps) {
  const [state, action, pending] = useActionState(
    createAvailabilityExceptionAction,
    initial,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">Block or open a date</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid max-w-lg gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ex-practitionerId">Practitioner</Label>
            <select
              id="ex-practitionerId"
              name="practitionerId"
              required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select practitioner</option>
              {practitioners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exceptionDate">Date</Label>
            <Input
              id="exceptionDate"
              name="exceptionDate"
              type="date"
              required
              min={toDateKey(new Date())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isAvailable">Type</Label>
            <select
              id="isAvailable"
              name="isAvailable"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              defaultValue="false"
            >
              <option value="false">Block entire day</option>
              <option value="true">Custom open hours</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ex-startTime">Custom start (optional)</Label>
            <Input id="ex-startTime" name="startTime" type="time" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ex-endTime">Custom end (optional)</Label>
            <Input id="ex-endTime" name="endTime" type="time" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" name="reason" placeholder="Leave / holiday / training…" />
          </div>
          {state.error ? (
            <FormMessage tone="error" className="sm:col-span-2">
              {state.error}
            </FormMessage>
          ) : null}
          {state.success ? (
            <FormMessage tone="success" className="sm:col-span-2">
              {state.success}
            </FormMessage>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" loading={pending}>
              Save exception
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function AvailabilityRuleActions({
  ruleId,
  isActive,
}: {
  ruleId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {isActive ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deactivateAvailabilityRuleAction(ruleId);
              router.refresh();
            })
          }
        >
          Deactivate
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await activateAvailabilityRuleAction(ruleId);
              router.refresh();
            })
          }
        >
          Activate
        </Button>
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-destructive"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteAvailabilityRuleAction(ruleId);
            router.refresh();
          })
        }
      >
        Delete
      </Button>
    </div>
  );
}

export function AvailabilityExceptionActions({ exceptionId }: { exceptionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteAvailabilityExceptionAction(exceptionId);
          router.refresh();
        })
      }
    >
      Remove
    </Button>
  );
}

export function formatDay(day: number) {
  return DAYS[day] ?? `Day ${day}`;
}
