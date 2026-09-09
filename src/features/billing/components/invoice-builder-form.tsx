"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  createInvoiceAction,
  type BillableAppointmentOption,
  type BillingActionState,
  type InvoiceServiceOption,
} from "@/features/billing/actions/billing";
import { discountInputFromStored, invoiceTotalsFromLines } from "@/features/billing/lib/discounts";
import { randKey } from "@/features/billing/components/invoice-lines/types";
import {
  InvoiceDiscountSection,
  InvoiceLineCard,
  InvoiceTotalsSummary,
  ServicePicker,
  StickyCreateBar,
  serializeInvoiceDiscount,
  serializeLines,
  useInvoiceLines,
} from "@/features/billing/components/invoice-lines";
import { createPatientAction, searchPatientsAction } from "@/features/patients/actions/patients";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";

const initial: BillingActionState = {};

type PatientOption = { id: string; label: string };

type Props = {
  patients: PatientOption[];
  appointments: BillableAppointmentOption[];
  services: InvoiceServiceOption[];
  defaultPatientId?: string;
  defaultAppointmentId?: string;
};

export function InvoiceBuilderForm({
  patients,
  appointments,
  services,
  defaultPatientId,
  defaultAppointmentId,
}: Props) {
  const [state, action, pending] = useActionState(createInvoiceAction, initial);
  const [patientPending, startPatientTransition] = useTransition();
  const defaultAppointment = appointments.find((item) => item.id === defaultAppointmentId);
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>(patients);
  const [patientId, setPatientId] = useState(
    defaultPatientId ?? defaultAppointment?.patientId ?? "",
  );
  const [appointmentId, setAppointmentId] = useState(defaultAppointmentId ?? "");
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [patientMessage, setPatientMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const [taxCents, setTaxCents] = useState(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState(() =>
    discountInputFromStored(null),
  );
  const [discountNote, setDiscountNote] = useState("");
  const lastPrefilledAppointment = useRef<string | null>(null);
  const patientSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const patientIdRef = useRef(patientId);
  patientIdRef.current = patientId;

  const {
    lines,
    updateLine,
    removeLine,
    duplicateLine,
    addService,
    addCustomLine,
  } = useInvoiceLines([]);

  const selectedAppointment = useMemo(
    () => appointments.find((item) => item.id === appointmentId) ?? null,
    [appointmentId, appointments],
  );

  const patientAppointments = useMemo(
    () =>
      appointments.filter(
        (item) => item.patientId === patientId && !item.alreadyInvoiced,
      ),
    [appointments, patientId],
  );

  const totals = useMemo(
    () =>
      invoiceTotalsFromLines({
        lines: lines.map((line) => ({
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
          discount: line.discount,
        })),
        invoiceDiscount,
        taxCents,
      }),
    [invoiceDiscount, lines, taxCents],
  );

  useEffect(() => {
    return () => {
      if (patientSearchTimer.current) clearTimeout(patientSearchTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!appointmentId || !selectedAppointment) return;
    if (lastPrefilledAppointment.current === appointmentId) return;
    lastPrefilledAppointment.current = appointmentId;

    const catalogueService = services.find((service) => service.id === selectedAppointment.serviceId);
    addService({
      id: selectedAppointment.serviceId ?? randKey(),
      name: selectedAppointment.description,
      slug: catalogueService?.slug ?? "appointment",
      priceCents: selectedAppointment.amountCents,
      description: catalogueService?.description,
    });
  }, [addService, appointmentId, selectedAppointment, services]);

  function searchPatients(query: string) {
    startPatientTransition(async () => {
      const result = await searchPatientsAction(query);
      if (result.error) {
        setPatientMessage({ tone: "error", text: result.error });
        return;
      }
      const next = result.patients.map((patient) => ({ id: patient.id, label: patient.label }));
      setPatientOptions((current) => {
        const selectedId = patientIdRef.current;
        const selected =
          next.find((patient) => patient.id === selectedId) ??
          current.find((patient) => patient.id === selectedId) ??
          patients.find((patient) => patient.id === selectedId);
        if (!selected || next.some((patient) => patient.id === selected.id)) return next;
        return [selected, ...next];
      });
    });
  }

  function handlePatientQueryChange(query: string) {
    if (patientSearchTimer.current) clearTimeout(patientSearchTimer.current);
    patientSearchTimer.current = setTimeout(() => searchPatients(query), 250);
  }

  function handlePatientChange(nextPatientId: string) {
    setPatientId(nextPatientId);
    setPatientMessage(null);
    if (selectedAppointment && selectedAppointment.patientId !== nextPatientId) {
      setAppointmentId("");
      lastPrefilledAppointment.current = null;
    }
  }

  function handleAppointmentChange(nextAppointmentId: string) {
    setAppointmentId(nextAppointmentId);
    lastPrefilledAppointment.current = null;
    const next = appointments.find((item) => item.id === nextAppointmentId);
    if (!next) return;
    setPatientId(next.patientId);
  }

  function resetNewPatientForm() {
    setNewFirstName("");
    setNewLastName("");
    setNewEmail("");
    setNewPhone("");
    setCreatingPatient(false);
  }

  function handleCreatePatient() {
    startPatientTransition(async () => {
      const fd = new FormData();
      fd.set("firstName", newFirstName);
      fd.set("lastName", newLastName);
      fd.set("email", newEmail);
      fd.set("phone", newPhone);
      const result = await createPatientAction({}, fd);
      if (result.error || !result.id) {
        setPatientMessage({ tone: "error", text: result.error ?? "Could not create patient" });
        return;
      }
      const refreshed = await searchPatientsAction(newLastName || newFirstName);
      const created = {
        id: result.id,
        label: `${newFirstName.trim()} ${newLastName.trim()}`.trim(),
      };
      const next = refreshed.patients.map((patient) => ({ id: patient.id, label: patient.label }));
      const withCreated = next.some((patient) => patient.id === created.id)
        ? next
        : [created, ...next];
      setPatientOptions(withCreated);
      setPatientId(result.id);
      resetNewPatientForm();
      setPatientMessage({ tone: "success", text: "Patient created — continue building the invoice." });
    });
  }

  const canSubmit =
    Boolean(patientId) &&
    lines.length > 0 &&
    lines.every(
      (line) =>
        line.description.trim().length > 0 &&
        line.quantity > 0 &&
        line.unitPriceCents >= 0,
    );

  if (state.success && state.id) {
    return (
      <div className="space-y-4 rounded-2xl border border-border p-4">
        <FormMessage tone="success">Invoice created as draft.</FormMessage>
        {state.invoiceNumber ? (
          <p className="text-sm">
            <span className="font-medium">{state.invoiceNumber}</span>
            <span className="text-muted-foreground">
              {" "}
              · payment reference: {state.invoiceNumber}
            </span>
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Review the invoice before sending it to the patient.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/admin/billing/${state.id}`}>View invoice</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/billing/${state.id}#preview`}>Preview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/billing/${state.id}#edit-lines`}>Continue editing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6 pb-28 md:pb-0">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="taxCents" value={taxCents} />
      <input type="hidden" name="linesJson" value={serializeLines(lines)} />
      <input
        type="hidden"
        name="invoiceDiscountJson"
        value={serializeInvoiceDiscount(invoiceDiscount, discountNote)}
      />

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>Patient</Label>
          {!creatingPatient ? (
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-2 py-1 text-sm"
              onClick={() => {
                setCreatingPatient(true);
                setPatientMessage(null);
              }}
            >
              New patient
            </Button>
          ) : null}
        </div>
        {!creatingPatient ? (
          <SearchSelect
            options={patientOptions.map((patient) => ({
              value: patient.id,
              label: patient.label,
            }))}
            value={patientId}
            onValueChange={handlePatientChange}
            onQueryChange={handlePatientQueryChange}
            placeholder="Search patient…"
            searchPlaceholder="Search by name…"
            emptyMessage="No patients found"
            aria-label="Patient"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-border p-3">
            <div className="space-y-1.5">
              <Label htmlFor="invoice-np-first">First name</Label>
              <Input
                id="invoice-np-first"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-np-last">Last name</Label>
              <Input
                id="invoice-np-last"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-np-email">Email</Label>
              <Input
                id="invoice-np-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-np-phone">Phone</Label>
              <Input
                id="invoice-np-phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button
                type="button"
                loading={patientPending}
                disabled={!newFirstName.trim() || !newLastName.trim()}
                onClick={handleCreatePatient}
              >
                Save patient
              </Button>
              <Button type="button" variant="ghost" onClick={resetNewPatientForm}>
                Back to search
              </Button>
            </div>
          </div>
        )}
        {patientMessage ? (
          <FormMessage tone={patientMessage.tone}>{patientMessage.text}</FormMessage>
        ) : null}
      </section>

      <section className="space-y-2">
        <Label>Appointment</Label>
        <SearchSelect
          options={[
            { value: "", label: "No linked visit" },
            ...patientAppointments.map((appointment) => ({
              value: appointment.id,
              label: appointment.label,
            })),
          ]}
          value={appointmentId}
          onValueChange={handleAppointmentChange}
          placeholder="Select appointment…"
          searchPlaceholder="Search appointments…"
          disabled={!patientId}
          aria-label="Appointment"
        />
        <p className="text-xs text-muted-foreground">
          Link a visit to attribute cash collected. Already-invoiced appointments are hidden.
        </p>
      </section>

      <section className="space-y-3">
        <Label>Services</Label>
        <ServicePicker
          services={services}
          onSelectService={addService}
          onAddCustom={addCustomLine}
        />
        {!lines.length ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            Add at least one service or custom item to create the invoice.
          </p>
        ) : null}
        <div className="space-y-3">
          {lines.map((line, index) => (
            <InvoiceLineCard
              key={line.key}
              line={line}
              lineTotal={totals.lines[index]}
              index={index}
              canRemove={lines.length > 1}
              onUpdate={(patch) => updateLine(line.key, patch)}
              onRemove={() => removeLine(line.key)}
              onDuplicate={() => duplicateLine(line.key)}
            />
          ))}
        </div>
      </section>

      <InvoiceDiscountSection
        invoiceDiscount={invoiceDiscount}
        discountNote={discountNote}
        onDiscountChange={setInvoiceDiscount}
        onNoteChange={setDiscountNote}
        taxCents={taxCents}
        onTaxChange={setTaxCents}
        showTax
      />

      <section className="rounded-xl border border-border p-4">
        <InvoiceTotalsSummary totals={totals} />
      </section>

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}

      <div className="hidden md:block">
        <Button type="submit" loading={pending} disabled={!canSubmit}>
          Create invoice
        </Button>
      </div>

      <StickyCreateBar
        totalCents={totals.totalCents}
        submitLabel="Create invoice"
        pending={pending}
        disabled={!canSubmit}
      />
    </form>
  );
}
