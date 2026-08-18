"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  adminCancelAppointmentAction,
  adminRescheduleAppointmentAction,
  adminUpdateAttendanceAction,
  fetchSlotsAction,
} from "@/features/booking/actions/booking";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDateKey } from "@/features/booking/lib/timezone";
import {
  canCancelAppointmentStatus,
  canCompleteAppointmentStatus,
  canCorrectAttendanceStatus,
  canMarkNoShowAppointmentStatus,
  canRescheduleAppointmentStatus,
  type AppointmentStatus,
} from "@/features/booking/lib/status";
import { cn } from "@/lib/utils";

export interface AppointmentActionsProps {
  appointmentId: string;
  practitionerId?: string | null;
  serviceId?: string | null;
  currentStatus: AppointmentStatus | string;
  className?: string;
}

type SlotOption = { startsAt: string; endsAt: string; label: string };

export function AppointmentActions({
  appointmentId,
  practitionerId,
  serviceId,
  currentStatus,
  className,
}: AppointmentActionsProps) {
  const router = useRouter();
  const status = currentStatus as AppointmentStatus;
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"idle" | "reschedule" | "confirm-cancel">("idle");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(
    null,
  );

  const canReschedule =
    Boolean(practitionerId && serviceId) && canRescheduleAppointmentStatus(status);
  const canCancel = canCancelAppointmentStatus(status);
  const canComplete = canCompleteAppointmentStatus(status);
  const canNoShow = canMarkNoShowAppointmentStatus(status);
  const canCorrect = canCorrectAttendanceStatus(status);

  function loadSlots(nextDate: string) {
    setDate(nextDate);
    setSlots([]);
    setMessage(null);
    if (!nextDate || !practitionerId || !serviceId) return;
    startTransition(async () => {
      const result = await fetchSlotsAction({
        practitionerId,
        serviceId,
        date: nextDate,
        excludeAppointmentId: appointmentId,
      });
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setSlots(result.slots ?? []);
      if (!result.slots?.length) {
        setMessage({ tone: "error", text: "No available slots on that date." });
      }
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await adminCancelAppointmentAction(appointmentId);
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        setMode("idle");
        return;
      }
      setMessage({ tone: "success", text: "Appointment cancelled." });
      setMode("idle");
      router.refresh();
    });
  }

  function handleAttendance(nextStatus: "completed" | "no_show" | "confirmed") {
    startTransition(async () => {
      const result = await adminUpdateAttendanceAction(appointmentId, nextStatus);
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      const label =
        nextStatus === "completed"
          ? "Appointment marked completed."
          : nextStatus === "no_show"
            ? "Appointment marked as no-show."
            : "Appointment returned to booked.";
      setMessage({ tone: "success", text: label });
      router.refresh();
    });
  }

  function handleReschedule(slot: SlotOption) {
    startTransition(async () => {
      const result = await adminRescheduleAppointmentAction({
        appointmentId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      });
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: "Appointment rescheduled." });
      setMode("idle");
      setSlots([]);
      router.refresh();
    });
  }

  if (!canReschedule && !canCancel && !canComplete && !canNoShow && !canCorrect) {
    return null;
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      {mode === "idle" ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
          {canComplete ? (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              className="w-full sm:w-auto"
              onClick={() => handleAttendance("completed")}
            >
              Complete
            </Button>
          ) : null}
          {canNoShow ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              className="w-full sm:w-auto"
              onClick={() => handleAttendance("no_show")}
            >
              No-show
            </Button>
          ) : null}
          {canCorrect ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              className="w-full sm:w-auto"
              onClick={() => handleAttendance("confirmed")}
            >
              Mark as booked
            </Button>
          ) : null}
          {canReschedule ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              className="w-full sm:w-auto"
              onClick={() => {
                setMessage(null);
                setMode("reschedule");
              }}
            >
              Reschedule
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="w-full text-destructive hover:text-destructive sm:w-auto"
              disabled={pending}
              onClick={() => {
                setMessage(null);
                setMode("confirm-cancel");
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      ) : null}

      {mode === "confirm-cancel" ? (
        <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-foreground">Cancel this appointment?</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="danger"
              loading={pending}
              className="w-full sm:w-auto"
              onClick={handleCancel}
            >
              Yes, cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              className="w-full sm:w-auto"
              onClick={() => setMode("idle")}
            >
              Keep
            </Button>
          </div>
        </div>
      ) : null}

      {mode === "reschedule" ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-secondary/30 p-3">
          <div className="space-y-1.5">
            <Label htmlFor={`reschedule-date-${appointmentId}`}>New date</Label>
            <Input
              id={`reschedule-date-${appointmentId}`}
              type="date"
              value={date}
              min={toDateKey(new Date())}
              onChange={(e) => loadSlots(e.target.value)}
            />
          </div>
          {slots.length ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {slots.map((slot) => (
                <Button
                  key={slot.startsAt}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  className="w-full justify-start sm:w-auto"
                  onClick={() => handleReschedule(slot)}
                >
                  {slot.label}
                </Button>
              ))}
            </div>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setMode("idle");
              setSlots([]);
            }}
          >
            Close
          </Button>
        </div>
      ) : null}

      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
    </div>
  );
}
