"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

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
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";

const initial: BillingActionState = {};

type Props = {
  patients: { id: string; label: string }[];
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
  const defaultAppointment = appointments.find((item) => item.id === defaultAppointmentId);
  const [patientId, setPatientId] = useState(
    defaultPatientId ?? defaultAppointment?.patientId ?? "",
  );
  const [appointmentId, setAppointmentId] = useState(defaultAppointmentId ?? "");
  const [taxCents, setTaxCents] = useState(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState(() =>
    discountInputFromStored(null),
  );
  const [discountNote, setDiscountNote] = useState("");
  const lastPrefilledAppointment = useRef<string | null>(null);

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

  function handlePatientChange(nextPatientId: string) {
    setPatientId(nextPatientId);
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
        <Label>Patient</Label>
        <SearchSelect
          options={patients.map((patient) => ({ value: patient.id, label: patient.label }))}
          value={patientId}
          onValueChange={handlePatientChange}
          placeholder="Search patient…"
          searchPlaceholder="Search by name…"
          aria-label="Patient"
        />
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
