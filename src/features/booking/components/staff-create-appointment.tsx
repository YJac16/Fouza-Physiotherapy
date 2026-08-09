"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  adminCreateAppointmentAction,
  fetchSlotsAction,
} from "@/features/booking/actions/booking";
import {
  createPatientAction,
  searchPatientsAction,
} from "@/features/patients/actions/patients";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toDateKey } from "@/features/booking/lib/timezone";
import { cn } from "@/lib/utils";

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

type PatientOption = {
  id: string;
  label: string;
  description?: string;
  verifiedAccount: boolean;
  informedConsentSigned: boolean;
};

type SlotOption = { startsAt: string; endsAt: string; label: string };

export interface StaffCreateAppointmentProps {
  services: CatalogService[];
  practitioners: CatalogPractitioner[];
  initialDate?: string;
  initialPractitionerId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function StaffCreateAppointment({
  services,
  practitioners,
  initialDate,
  initialPractitionerId,
  open: controlledOpen,
  onOpenChange,
  className,
}: StaffCreateAppointmentProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  function setOpen(next: boolean) {
    onOpenChange?.(next);
    if (controlledOpen === undefined) setInternalOpen(next);
  }

  const [step, setStep] = useState(1);
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [practitionerId, setPractitionerId] = useState(
    initialPractitionerId ?? practitioners[0]?.id ?? "",
  );
  const [date, setDate] = useState(initialDate ?? toDateKey(new Date()));
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [source, setSource] = useState<"admin" | "phone">("admin");
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(
    null,
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId) ?? null,
    [patients, patientId],
  );

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const result = await searchPatientsAction(patientQuery);
      if (result.error) return;
      setPatients(result.patients);
    });
  }, [open, patientQuery]);

  useEffect(() => {
    if (!open || !serviceId || !practitionerId || !date) return;
    setSelectedSlot(null);
    setSlots([]);
    startTransition(async () => {
      const result = await fetchSlotsAction({
        practitionerId,
        serviceId,
        date,
      });
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setSlots(result.slots ?? []);
    });
  }, [open, serviceId, practitionerId, date]);

  function reset() {
    setStep(1);
    setPatientId("");
    setCreatingPatient(false);
    setSelectedSlot(null);
    setMessage(null);
  }

  function handleCreatePatient() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("firstName", newFirstName);
      fd.set("lastName", newLastName);
      fd.set("email", newEmail);
      fd.set("phone", newPhone);
      const result = await createPatientAction({}, fd);
      if (result.error || !result.id) {
        setMessage({ tone: "error", text: result.error ?? "Could not create patient" });
        return;
      }
      const refreshed = await searchPatientsAction(newLastName || newFirstName);
      setPatients(refreshed.patients);
      setPatientId(result.id);
      setCreatingPatient(false);
      setMessage({ tone: "success", text: "Patient created — continue to booking." });
      setStep(2);
    });
  }

  function handleCreateAppointment() {
    if (!patientId || !selectedSlot) return;
    startTransition(async () => {
      const result = await adminCreateAppointmentAction({
        patientId,
        practitionerId,
        serviceId,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
        source,
      });
      if (result.error || !result.appointmentId) {
        setMessage({ tone: "error", text: result.error ?? "Create failed" });
        return;
      }
      const warnings: string[] = [];
      if (result.outstanding?.needsConsent) warnings.push("informed consent outstanding");
      if (result.outstanding?.needsVerification) warnings.push("account verification outstanding");
      setMessage({
        tone: "success",
        text: warnings.length
          ? `Appointment created. Note: ${warnings.join("; ")}.`
          : "Appointment created.",
      });
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className={className}>
        New appointment
      </Button>
    );
  }

  const service = services.find((s) => s.id === serviceId);

  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-border bg-background p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Create appointment</h2>
          <p className="text-sm text-muted-foreground">
            Uses the same availability rules as online booking.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          Close
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className={cn(step === 1 && "font-semibold text-foreground")}>1. Patient</span>
        <span>·</span>
        <span className={cn(step === 2 && "font-semibold text-foreground")}>2. Service & time</span>
        <span>·</span>
        <span className={cn(step === 3 && "font-semibold text-foreground")}>3. Review</span>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          {!creatingPatient ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="staff-patient-search">Search patient</Label>
                <Input
                  id="staff-patient-search"
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  placeholder="Name, email, or phone"
                />
              </div>
              <SearchSelect
                options={patients.map((p) => ({
                  value: p.id,
                  label: p.label,
                  description: p.description,
                }))}
                value={patientId || undefined}
                onValueChange={setPatientId}
                placeholder="Select patient"
                searchPlaceholder="Filter…"
                emptyMessage="No patients found"
              />
              {selectedPatient && (!selectedPatient.informedConsentSigned || !selectedPatient.verifiedAccount) ? (
                <FormMessage tone="info">
                  {[
                    !selectedPatient.informedConsentSigned ? "Consent incomplete" : null,
                    !selectedPatient.verifiedAccount ? "Account not verified" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  . You can still book; complete before treatment where required.
                </FormMessage>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={!patientId || pending}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreatingPatient(true)}
                >
                  New patient
                </Button>
              </div>
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="np-first">First name</Label>
                <Input
                  id="np-first"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-last">Last name</Label>
                <Input
                  id="np-last"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-email">Email</Label>
                <Input
                  id="np-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-phone">Phone</Label>
                <Input
                  id="np-phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button
                  type="button"
                  loading={pending}
                  disabled={!newFirstName || !newLastName}
                  onClick={handleCreatePatient}
                >
                  Save patient
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreatingPatient(false)}
                >
                  Back to search
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Service</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.duration_minutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Practitioner</Label>
              <Select value={practitionerId} onValueChange={setPractitionerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Practitioner" />
                </SelectTrigger>
                <SelectContent>
                  {practitioners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-appt-date">Date</Label>
              <Input
                id="staff-appt-date"
                type="date"
                value={date}
                min={toDateKey(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select
                value={source}
                onValueChange={(v) => setSource(v as "admin" | "phone")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Available times</p>
            {slots.length ? (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot.startsAt}
                    type="button"
                    size="sm"
                    variant={selectedSlot?.startsAt === slot.startsAt ? "default" : "outline"}
                    disabled={pending}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {pending ? "Loading slots…" : "No available slots on this date."}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              disabled={!selectedSlot || pending}
              onClick={() => setStep(3)}
            >
              Review
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 && selectedSlot ? (
        <div className="space-y-4">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Patient</dt>
              <dd className="font-medium">{selectedPatient?.label ?? "Selected patient"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Service</dt>
              <dd className="font-medium">{service?.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">{date}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Time</dt>
              <dd className="font-medium">
                {selectedSlot.label} ({service?.duration_minutes ?? "—"} min)
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Source</dt>
              <dd className="font-medium capitalize">{source}</dd>
            </div>
          </dl>
          {selectedPatient &&
          (!selectedPatient.informedConsentSigned || !selectedPatient.verifiedAccount) ? (
            <FormMessage tone="info">
              Outstanding requirements will remain on the patient record after booking.
            </FormMessage>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" loading={pending} onClick={handleCreateAppointment}>
              Create appointment
            </Button>
          </div>
        </div>
      ) : null}

      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
    </div>
  );
}
