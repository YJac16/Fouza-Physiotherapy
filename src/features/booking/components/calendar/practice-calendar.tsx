"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  getAppointmentDetailAction,
  listCalendarAppointmentsAction,
  listCalendarBlockedDaysAction,
  type CalendarAppointment,
} from "@/features/booking/actions/booking";
import { AppointmentActions } from "@/features/booking/components/appointment-actions";
import { StaffCreateAppointment } from "@/features/booking/components/staff-create-appointment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import {
  addSastDays,
  BOOKING_TIMEZONE,
  formatSastDateTime,
  formatSastTime,
  sastMonthRange,
  sastWeekRange,
  startOfSastDay,
  toDateKey,
} from "@/features/booking/lib/timezone";
import { cn } from "@/lib/utils";

export type CalendarView = "month" | "week" | "day";

type CatalogService = {
  id: string;
  name: string;
  slug: string;
  duration_minutes: number;
};

type CatalogPractitioner = {
  id: string;
  label: string;
};

export interface PracticeCalendarProps {
  services: CatalogService[];
  practitioners: CatalogPractitioner[];
  workingWeekdays?: number[];
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 19;
const PX_PER_MINUTE = 1.2;

function statusTone(status: string) {
  if (status === "cancelled") return "secondary" as const;
  if (status === "completed") return "success" as const;
  if (status === "no_show") return "warning" as const;
  if (status === "confirmed") return "default" as const;
  return "outline" as const;
}

function minutesFromDayStart(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function periodLabel(view: CalendarView, anchor: string) {
  if (view === "day") {
    return new Date(`${anchor}T12:00:00+02:00`).toLocaleDateString("en-ZA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: BOOKING_TIMEZONE,
    });
  }
  if (view === "week") {
    const { weekStartKey } = sastWeekRange(anchor);
    const endKey = addSastDays(weekStartKey, 6);
    return `${weekStartKey} – ${endKey}`;
  }
  const [y, m] = anchor.split("-").map(Number);
  return new Date(`${y}-${String(m).padStart(2, "0")}-01T12:00:00+02:00`).toLocaleDateString(
    "en-ZA",
    { month: "long", year: "numeric", timeZone: BOOKING_TIMEZONE },
  );
}

export function PracticeCalendar({
  services,
  practitioners,
  workingWeekdays = [1, 2, 3, 4, 5],
}: PracticeCalendarProps) {
  const today = toDateKey(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<
    ReturnType<typeof getAppointmentDetailAction>
  > | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const range = useMemo(() => {
    if (view === "day") {
      return {
        fromIso: startOfSastDay(selectedDay).toISOString(),
        toIsoExclusive: startOfSastDay(addSastDays(selectedDay, 1)).toISOString(),
        fromDate: selectedDay,
        toDateExclusive: addSastDays(selectedDay, 1),
      };
    }
    if (view === "week") {
      const week = sastWeekRange(anchor);
      return {
        fromIso: week.weekStartIso,
        toIsoExclusive: week.weekEndExclusiveIso,
        fromDate: week.weekStartKey,
        toDateExclusive: week.weekEndExclusiveKey,
      };
    }
    // Month grid needs leading/trailing days for Mon–Sun cells
    const month = sastMonthRange(anchor);
    const firstDow = new Date(`${month.monthStartKey}T12:00:00+02:00`).getDay();
    const lead = firstDow === 0 ? 6 : firstDow - 1;
    const gridStart = addSastDays(month.monthStartKey, -lead);
    const gridEnd = addSastDays(month.monthEndExclusiveKey, 14);
    return {
      fromIso: startOfSastDay(gridStart).toISOString(),
      toIsoExclusive: startOfSastDay(gridEnd).toISOString(),
      fromDate: gridStart,
      toDateExclusive: gridEnd,
      monthStartKey: month.monthStartKey,
      monthEndExclusiveKey: month.monthEndExclusiveKey,
    };
  }, [view, anchor, selectedDay]);

  const load = useCallback(() => {
    startTransition(async () => {
      const [apptResult, blockedResult] = await Promise.all([
        listCalendarAppointmentsAction({
          fromIso: range.fromIso,
          toIsoExclusive: range.toIsoExclusive,
        }),
        listCalendarBlockedDaysAction({
          fromDate: range.fromDate,
          toDateExclusive: range.toDateExclusive,
        }),
      ]);
      setAppointments(apptResult.appointments);
      setBlockedDates(new Set(blockedResult.blocked.map((b) => b.exceptionDate)));
    });
  }, [range.fromIso, range.toIsoExclusive, range.fromDate, range.toDateExclusive]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    startTransition(async () => {
      const result = await getAppointmentDetailAction(selectedId);
      setDetail(result);
    });
  }, [selectedId]);

  function navigate(delta: number) {
    if (view === "day") {
      const next = addSastDays(selectedDay, delta);
      setSelectedDay(next);
      setAnchor(next);
      return;
    }
    if (view === "week") {
      const next = addSastDays(anchor, delta * 7);
      setAnchor(next);
      setSelectedDay(next);
      return;
    }
    const parts = anchor.split("-").map(Number);
    const y = parts[0] ?? 1970;
    const m = parts[1] ?? 1;
    const nm = m + delta;
    const ny = nm < 1 ? y - 1 : nm > 12 ? y + 1 : y;
    const month = nm < 1 ? 12 : nm > 12 ? 1 : nm;
    const key = `${ny}-${String(month).padStart(2, "0")}-01`;
    setAnchor(key);
  }

  function goToday() {
    setAnchor(today);
    setSelectedDay(today);
  }

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    for (const appt of appointments) {
      const key = toDateKey(new Date(appt.starts_at));
      const list = map.get(key) ?? [];
      list.push(appt);
      map.set(key, list);
    }
    return map;
  }, [appointments]);

  const monthCells = useMemo(() => {
    if (view !== "month") return [];
    const month = sastMonthRange(anchor);
    const firstDow = new Date(`${month.monthStartKey}T12:00:00+02:00`).getDay();
    const lead = firstDow === 0 ? 6 : firstDow - 1;
    const start = addSastDays(month.monthStartKey, -lead);
    return Array.from({ length: 42 }, (_, i) => addSastDays(start, i));
  }, [view, anchor]);

  const weekDays = useMemo(() => {
    const { weekStartKey } = sastWeekRange(view === "week" ? anchor : selectedDay);
    return Array.from({ length: 7 }, (_, i) => addSastDays(weekStartKey, i));
  }, [view, anchor, selectedDay]);

  const dayAppointments = byDay.get(selectedDay) ?? [];
  const activeDayAppointments = dayAppointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed",
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-border p-1">
            {(["month", "week", "day"] as CalendarView[]).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={view === v ? "default" : "ghost"}
                className="capitalize"
                onClick={() => {
                  setView(v);
                  if (v === "day") setAnchor(selectedDay);
                }}
              >
                {v}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" size="icon" variant="outline" onClick={() => navigate(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={goToday}>
              Today
            </Button>
            <Button type="button" size="icon" variant="outline" onClick={() => navigate(1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <p className="text-sm font-medium">{periodLabel(view, view === "day" ? selectedDay : anchor)}</p>
          {pending ? <span className="text-xs text-muted-foreground">Updating…</span> : null}
        </div>
        <StaffCreateAppointment
          services={services}
          practitioners={practitioners}
          initialDate={selectedDay}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary/20 ring-1 ring-primary/40" /> Working day
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-foreground/80" /> Has appointments
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-destructive/70" /> Blocked
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm ring-2 ring-primary" /> Today
        </span>
      </div>

      {view === "month" ? (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <div className="grid min-w-[640px] grid-cols-7 border-b bg-secondary/40 text-center text-xs font-medium">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid min-w-[640px] grid-cols-7">
            {monthCells.map((dayKey) => {
              const inMonth =
                dayKey >= (range as { monthStartKey?: string }).monthStartKey! &&
                dayKey < (range as { monthEndExclusiveKey?: string }).monthEndExclusiveKey!;
              const jsDay = new Date(`${dayKey}T12:00:00+02:00`).getDay();
              const isWorking = workingWeekdays.includes(jsDay);
              const blocked = blockedDates.has(dayKey);
              const dayAppts = (byDay.get(dayKey) ?? []).filter(
                (a) => a.status !== "cancelled",
              );
              const count = dayAppts.length;
              const isToday = dayKey === today;
              const isSelected = dayKey === selectedDay;

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => {
                    setSelectedDay(dayKey);
                    setAnchor(dayKey);
                    setView("day");
                  }}
                  className={cn(
                    "min-h-[88px] border-b border-r p-2 text-left transition-colors last:border-r-0 hover:bg-secondary/40",
                    !inMonth && "bg-muted/30 text-muted-foreground",
                    blocked && "bg-destructive/5",
                    isSelected && "bg-primary/5",
                    isToday && "ring-inset ring-2 ring-primary/50",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isToday && "text-primary",
                      )}
                    >
                      {Number(dayKey.slice(-2))}
                    </span>
                    {blocked ? (
                      <span className="size-1.5 rounded-full bg-destructive" />
                    ) : isWorking ? (
                      <span className="size-1.5 rounded-full bg-primary/40" />
                    ) : null}
                  </div>
                  {count > 0 ? (
                    <p className="mt-2 text-xs font-medium text-foreground">
                      {count} appt{count === 1 ? "" : "s"}
                    </p>
                  ) : blocked ? (
                    <p className="mt-2 text-xs text-destructive">Blocked</p>
                  ) : null}
                  <div className="mt-1 space-y-0.5">
                    {dayAppts.slice(0, 2).map((a) => (
                      <p key={a.id} className="truncate text-[11px] text-muted-foreground">
                        {formatSastTime(a.starts_at)} {a.patientName.split(" ")[0]}
                      </p>
                    ))}
                    {count > 2 ? (
                      <p className="text-[11px] text-muted-foreground">+{count - 2} more</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "week" ? (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <div className="grid min-w-[880px] grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b bg-secondary/40">
            <div />
            {weekDays.map((dayKey) => (
              <button
                key={dayKey}
                type="button"
                className={cn(
                  "border-l px-2 py-2 text-left text-xs font-medium",
                  dayKey === today && "text-primary",
                  dayKey === selectedDay && "bg-primary/10",
                )}
                onClick={() => {
                  setSelectedDay(dayKey);
                  setView("day");
                }}
              >
                {WEEKDAYS[(new Date(`${dayKey}T12:00:00+02:00`).getDay() + 6) % 7]}{" "}
                {dayKey.slice(-2)}
                {blockedDates.has(dayKey) ? (
                  <span className="ml-1 text-destructive">· blocked</span>
                ) : null}
              </button>
            ))}
          </div>
          <div
            className="relative grid min-w-[880px] grid-cols-[52px_repeat(7,minmax(0,1fr))]"
            style={{ height: (DAY_END_HOUR - DAY_START_HOUR) * 60 * PX_PER_MINUTE }}
          >
            <div className="relative">
              {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => {
                const hour = DAY_START_HOUR + i;
                return (
                  <span
                    key={hour}
                    className="absolute left-1 -translate-y-1/2 text-[10px] text-muted-foreground"
                    style={{ top: i * 60 * PX_PER_MINUTE }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </span>
                );
              })}
            </div>
            {weekDays.map((dayKey) => {
              const dayAppts = (byDay.get(dayKey) ?? []).filter(
                (a) => a.status !== "cancelled",
              );
              return (
                <div key={dayKey} className="relative border-l">
                  {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-border/50"
                      style={{ top: i * 60 * PX_PER_MINUTE }}
                    />
                  ))}
                  {blockedDates.has(dayKey) ? (
                    <div className="absolute inset-0 bg-destructive/5" />
                  ) : null}
                  {dayAppts.map((appt) => {
                    const startMin = minutesFromDayStart(appt.starts_at);
                    const endMin = minutesFromDayStart(appt.ends_at);
                    const top = (startMin - DAY_START_HOUR * 60) * PX_PER_MINUTE;
                    const height = Math.max((endMin - startMin) * PX_PER_MINUTE, 18);
                    return (
                      <button
                        key={appt.id}
                        type="button"
                        onClick={() => setSelectedId(appt.id)}
                        className="absolute left-1 right-1 z-10 overflow-hidden rounded-md bg-primary/15 px-1 py-0.5 text-left text-[10px] ring-1 ring-primary/30 hover:bg-primary/25"
                        style={{ top, height }}
                      >
                        <span className="font-medium">{formatSastTime(appt.starts_at)}</span>{" "}
                        {appt.patientName}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "day" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-2xl border border-border">
            {blockedDates.has(selectedDay) ? (
              <p className="border-b bg-destructive/5 px-4 py-2 text-sm text-destructive">
                This day is blocked / unavailable.
              </p>
            ) : null}
            <div
              className="relative"
              style={{ height: (DAY_END_HOUR - DAY_START_HOUR) * 60 * PX_PER_MINUTE }}
            >
              {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => {
                const hour = DAY_START_HOUR + i;
                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-border/60"
                    style={{ top: i * 60 * PX_PER_MINUTE }}
                  >
                    <span className="absolute left-2 -translate-y-1/2 text-xs text-muted-foreground">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                );
              })}
              {activeDayAppointments.length === 0 && !blockedDates.has(selectedDay) ? (
                <p className="absolute left-16 top-4 text-sm text-muted-foreground">
                  No appointments — available gaps through the day.
                </p>
              ) : null}
              {dayAppointments.map((appt) => {
                const startMin = minutesFromDayStart(appt.starts_at);
                const endMin = minutesFromDayStart(appt.ends_at);
                const top = (startMin - DAY_START_HOUR * 60) * PX_PER_MINUTE;
                const height = Math.max((endMin - startMin) * PX_PER_MINUTE, 28);
                return (
                  <button
                    key={appt.id}
                    type="button"
                    onClick={() => setSelectedId(appt.id)}
                    className={cn(
                      "absolute left-14 right-3 overflow-hidden rounded-lg px-3 py-2 text-left ring-1",
                      appt.status === "cancelled"
                        ? "bg-muted text-muted-foreground ring-border"
                        : "bg-primary/10 ring-primary/30 hover:bg-primary/20",
                      selectedId === appt.id && "ring-2 ring-primary",
                    )}
                    style={{ top, height }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{appt.patientName}</span>
                      <Badge variant={statusTone(appt.status)} className="capitalize">
                        {appt.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatSastTime(appt.starts_at)}–{formatSastTime(appt.ends_at)}
                      {appt.serviceName ? ` · ${appt.serviceName}` : ""}
                      {appt.durationMinutes ? ` · ${appt.durationMinutes} min` : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="space-y-3 rounded-2xl border border-border p-4">
            <h3 className="font-display text-base font-semibold">Day details</h3>
            <p className="text-sm text-muted-foreground">
              {dayAppointments.length} appointment{dayAppointments.length === 1 ? "" : "s"}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              Book on this day
            </Button>
            {!selectedId ? (
              <p className="text-sm text-muted-foreground">
                Select an appointment to view details and actions.
              </p>
            ) : null}
          </aside>
        </div>
      ) : null}

      {selectedId && detail?.appointment ? (
        <AppointmentDetailCard
          detail={detail}
          onClose={() => setSelectedId(null)}
          onChanged={() => {
            setSelectedId(null);
            load();
          }}
        />
      ) : null}
    </div>
  );
}

function AppointmentDetailCard({
  detail,
  onClose,
  onChanged,
}: {
  detail: NonNullable<Awaited<ReturnType<typeof getAppointmentDetailAction>>>;
  onClose: () => void;
  onChanged: () => void;
}) {
  const appt = detail.appointment!;
  const patient = (Array.isArray(appt.patients) ? appt.patients[0] : appt.patients) as
    | {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
        verified_account: boolean;
        informed_consent_signed: boolean;
      }
    | null
    | undefined;
  const service = (Array.isArray(appt.services) ? appt.services[0] : appt.services) as
    | { name: string; duration_minutes: number }
    | null
    | undefined;
  const practitioner = (
    Array.isArray(appt.practitioners) ? appt.practitioners[0] : appt.practitioners
  ) as
    | { title: string | null; profiles: { full_name: string | null } | null }
    | null
    | undefined;

  const durationMs =
    new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime();
  const durationMin = Math.round(durationMs / 60_000);

  return (
    <div className="space-y-4 rounded-2xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">
            {patient ? `${patient.first_name} ${patient.last_name}` : "Appointment"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatSastDateTime(appt.starts_at)} · {durationMin} min
          </p>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={statusTone(appt.status)} className="capitalize">
          {appt.status}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {appt.source}
        </Badge>
        {patient && !patient.informed_consent_signed ? (
          <Badge variant="warning">Consent outstanding</Badge>
        ) : null}
        {patient && !patient.verified_account ? (
          <Badge variant="warning">Unverified</Badge>
        ) : null}
        {detail.invoice ? (
          <Badge variant="secondary" className="capitalize">
            Invoice {detail.invoice.status}
          </Badge>
        ) : null}
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Service</dt>
          <dd className="font-medium">{service?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Practitioner</dt>
          <dd className="font-medium">
            {practitioner?.profiles?.full_name ?? practitioner?.title ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Start</dt>
          <dd className="font-medium">{formatSastTime(appt.starts_at)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">End</dt>
          <dd className="font-medium">{formatSastTime(appt.ends_at)}</dd>
        </div>
      </dl>

      {patient ? (
        <Button asChild variant="outline" size="sm">
          <Link href={routes.admin.patient(patient.id)}>Open patient profile</Link>
        </Button>
      ) : null}

      {appt.practitioner_id && appt.service_id && appt.status !== "cancelled" ? (
        <AppointmentActions
          appointmentId={appt.id}
          practitionerId={appt.practitioner_id}
          serviceId={appt.service_id}
        />
      ) : null}

      <Button type="button" size="sm" variant="secondary" onClick={onChanged}>
        Refresh after changes
      </Button>
    </div>
  );
}
