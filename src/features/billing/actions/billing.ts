"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { drainEmailOutbox } from "@/features/notifications/lib/outbox";
import { resolveBillingAlertRecipients } from "@/features/notifications/lib/appointment-emails";
import { getInvoiceBankingSettings, resolvePatientInvoiceRecipient } from "@/features/billing/lib/invoice-data";
import { listAccessiblePatients } from "@/features/patients/api/patients";
import { EDITABLE_INVOICE_STATUSES } from "@/features/billing/lib/addons";
import { invoiceTotalsFromLines } from "@/features/billing/lib/discounts";
import {
  invoiceOutstandingCents,
  invoicePaidCents,
  invoicedCents,
  statementPeriodBounds,
  storedInvoiceStatusAfterPayments,
  type InvoiceStoredStatus,
} from "@/features/analytics/lib/finance";
import { formatSastDateTime } from "@/features/booking/lib/timezone";

const invoiceSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  serviceId: z.string().uuid().optional().nullable(),
  subtotalCents: z.coerce.number().int().nonnegative(),
  taxCents: z.coerce.number().int().nonnegative().default(0),
  description: z.string().min(2),
});

const paymentSchema = z.object({
  patientId: z.string().uuid(),
  invoiceId: z.string().uuid().optional().nullable(),
  amountCents: z.coerce.number().int().positive(),
  method: z.enum(["cash", "card", "eft", "other"]).default("eft"),
  notes: z.string().optional(),
});

const discountModeSchema = z.enum(["none", "percent", "amount"]);

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPriceCents: z.coerce.number().int().nonnegative(),
  serviceId: z.string().uuid().optional().nullable(),
  treatmentCode: z.string().optional().nullable(),
  icd10Code: z.string().optional().nullable(),
  discountMode: discountModeSchema.optional().default("none"),
  discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  discountAmountCents: z.coerce.number().int().nonnegative().optional().nullable(),
});

const invoiceDiscountSchema = z.object({
  mode: discountModeSchema.optional().default("none"),
  percent: z.coerce.number().min(0).max(100).optional().nullable(),
  amountCents: z.coerce.number().int().nonnegative().optional().nullable(),
  note: z.string().max(200).optional().nullable(),
});

export type BillingActionState = { error?: string; success?: string; id?: string };
export type SendInvoiceState = { error?: string; success?: string };

export type BillableAppointmentOption = {
  id: string;
  patientId: string;
  label: string;
  description: string;
  amountCents: number;
  serviceId: string | null;
};

async function applyInvoicePaymentStatus(invoiceId: string) {
  const admin = createServiceClient();
  const { data: rpcStatus } = await admin.rpc("refresh_invoice_payment_status", {
    p_invoice_id: invoiceId,
  });

  const [{ data: invoice }, { data: payments }] = await Promise.all([
    admin
      .from("invoices")
      .select(
        "id, status, total_cents, invoice_number, notes, appointment_id, patient_id, patients(email, first_name, last_name)",
      )
      .eq("id", invoiceId)
      .maybeSingle(),
    admin.from("payments").select("amount_cents").eq("invoice_id", invoiceId),
  ]);

  const paidCents = invoicePaidCents(payments ?? []);
  const totalCents = invoice?.total_cents ?? 0;
  const stored = (invoice?.status ?? "sent") as InvoiceStoredStatus;
  const fallbackStatus = storedInvoiceStatusAfterPayments({
    status: stored,
    totalCents,
    paidCents,
  });
  const status = (typeof rpcStatus === "string" && rpcStatus ? rpcStatus : fallbackStatus) as InvoiceStoredStatus;

  if (!rpcStatus && invoice && status !== stored) {
    await admin.from("invoices").update({ status }).eq("id", invoiceId);
  }

  return {
    invoice,
    status,
    totalCents,
    paidCents,
    outstandingCents: invoiceOutstandingCents(totalCents, paidCents),
  };
}

export async function listBillableAppointmentsForInvoice(input?: {
  includeAppointmentId?: string | null;
}): Promise<BillableAppointmentOption[]> {
  await requireStaff();
  const supabase = await createClient();
  const [{ data, error }, { data: invoicedRows, error: invoicedError }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, patient_id, starts_at, price_cents, service_id, services(name, price_cents)")
      .neq("status", "cancelled")
      .order("starts_at", { ascending: false })
      .limit(200),
    supabase.from("invoices").select("appointment_id").not("appointment_id", "is", null),
  ]);

  if (error) throw new Error(error.message);
  if (invoicedError) throw new Error(invoicedError.message);

  const invoicedIds = new Set(
    (invoicedRows ?? [])
      .map((row) => row.appointment_id)
      .filter((id): id is string => Boolean(id)),
  );

  return (data ?? []).flatMap((row) => {
    const service = (Array.isArray(row.services) ? row.services[0] : row.services) as
      | { name?: string; price_cents?: number }
      | null
      | undefined;
    const amountCents =
      typeof row.price_cents === "number" ? row.price_cents : (service?.price_cents ?? 0);
    const serviceName = service?.name ?? "Appointment";
    const alreadyInvoiced = invoicedIds.has(row.id);
    return [
      {
        id: row.id,
        patientId: row.patient_id,
        label: `${formatSastDateTime(row.starts_at)} · ${serviceName} · R ${(amountCents / 100).toFixed(2)}${
          alreadyInvoiced ? " · already invoiced" : ""
        }`,
        description: serviceName,
        amountCents,
        serviceId: row.service_id,
      },
    ];
  });
}

export async function createInvoiceAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const profile = await requireStaff();
  const parsed = invoiceSchema.safeParse({
    patientId: formData.get("patientId"),
    appointmentId: formData.get("appointmentId") || null,
    serviceId: formData.get("serviceId") || null,
    subtotalCents: formData.get("subtotalCents"),
    taxCents: formData.get("taxCents") || 0,
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: "Invalid invoice" };

  const admin = createServiceClient();
  let serviceId = parsed.data.serviceId ?? null;
  if (parsed.data.appointmentId) {
    const { data: appointment } = await admin
      .from("appointments")
      .select("id, patient_id, service_id")
      .eq("id", parsed.data.appointmentId)
      .maybeSingle();
    if (!appointment || appointment.patient_id !== parsed.data.patientId) {
      return { error: "Appointment does not belong to this patient" };
    }
    serviceId = serviceId ?? appointment.service_id;
  }

  const { data: numberData, error: numError } = await admin.rpc("next_invoice_number");
  if (numError) return { error: numError.message };

  const total = parsed.data.subtotalCents + parsed.data.taxCents;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      patient_id: parsed.data.patientId,
      appointment_id: parsed.data.appointmentId,
      invoice_number: numberData as string,
      status: "sent",
      issue_date: new Date().toISOString().slice(0, 10),
      subtotal_cents: parsed.data.subtotalCents,
      tax_cents: parsed.data.taxCents,
      total_cents: total,
      currency: "ZAR",
      notes: parsed.data.description,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed" };

  const lineItem = {
    invoice_id: data.id,
    description: parsed.data.description,
    quantity: 1,
    unit_price_cents: parsed.data.subtotalCents,
    amount_cents: parsed.data.subtotalCents,
    treatment_code: formData.get("treatmentCode")?.toString() || null,
    icd10_code: formData.get("icd10Code")?.toString() || null,
    service_id: serviceId,
  };
  const { error: lineError } = await supabase.from("invoice_line_items").insert(lineItem);
  if (lineError && /service_id/i.test(lineError.message)) {
    const { service_id: _serviceId, ...withoutService } = lineItem;
    await supabase.from("invoice_line_items").insert(withoutService);
  } else if (lineError) {
    return { error: lineError.message };
  }

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "invoice.create",
    entity_type: "invoice",
    entity_id: data.id,
  });

  const { data: patientRow } = await admin
    .from("patients")
    .select("email, first_name, last_name")
    .eq("id", parsed.data.patientId)
    .maybeSingle();

  const recipientEmail = patientRow?.email?.trim().toLowerCase();
  const patientName =
    `${patientRow?.first_name ?? ""} ${patientRow?.last_name ?? ""}`.trim() || "a patient";
  const banking = await getInvoiceBankingSettings();
  const sharedPayload = {
    invoiceId: data.id,
    patientId: parsed.data.patientId,
    invoiceNumber: numberData as string,
    firstName: patientRow?.first_name ?? "there",
    patientName,
    description: parsed.data.description,
    totalCents: total,
    currency: "ZAR",
    bankName: banking.bankName,
    accountName: banking.accountName,
    accountNumber: banking.accountNumber,
    branchCode: banking.branchCode,
    proofEmail: banking.proofEmail,
  };

  const practiceRecipients = await resolveBillingAlertRecipients(parsed.data.appointmentId);
  const outboxRows = [
    ...(recipientEmail
      ? [
          {
            channel: "email" as const,
            template_key: "invoice.sent",
            recipient: recipientEmail,
            payload: sharedPayload,
          },
        ]
      : []),
    ...practiceRecipients.map((recipient) => ({
      channel: "email" as const,
      template_key: "invoice.practitioner_alert",
      recipient,
      payload: sharedPayload,
    })),
  ];

  if (outboxRows.length) {
    await admin.from("notification_outbox").insert(outboxRows);
    await drainEmailOutbox(Math.max(5, outboxRows.length));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/billing");
  revalidatePath(`/admin/billing/${data.id}`);
  redirect(`/admin/billing/${data.id}`);
}

export async function updateInvoiceLineItemsAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const profile = await requireStaff();
  const invoiceId = formData.get("invoiceId")?.toString();
  if (!invoiceId) return { error: "Missing invoice" };

  let linesRaw: unknown;
  let discountRaw: unknown;
  try {
    linesRaw = JSON.parse(formData.get("linesJson")?.toString() ?? "[]");
    discountRaw = JSON.parse(formData.get("invoiceDiscountJson")?.toString() || "{}");
  } catch {
    return { error: "Invalid line items" };
  }

  const linesParsed = z.array(lineItemSchema).min(1).safeParse(linesRaw);
  if (!linesParsed.success) return { error: "Add at least one valid line item" };
  const discountParsed = invoiceDiscountSchema.safeParse(discountRaw);
  if (!discountParsed.success) return { error: "Invalid invoice discount" };

  const supabase = await createClient();
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, status, tax_cents, patient_id")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError || !invoice) return { error: invoiceError?.message ?? "Invoice not found" };
  if (!EDITABLE_INVOICE_STATUSES.has(invoice.status)) {
    return { error: "Paid or void invoices cannot be edited. Create a new invoice for extras." };
  }

  const invoiceDiscount = discountParsed.data;
  const totals = invoiceTotalsFromLines({
    lines: linesParsed.data.map((line) => ({
      quantity: line.quantity,
      unitPriceCents: line.unitPriceCents,
      discount: {
        mode: line.discountMode ?? "none",
        percent: line.discountPercent,
        amountCents: line.discountAmountCents,
      },
    })),
    invoiceDiscount: {
      mode: invoiceDiscount.mode,
      percent: invoiceDiscount.percent,
      amountCents: invoiceDiscount.amountCents,
    },
    taxCents: invoice.tax_cents ?? 0,
  });

  const lines = linesParsed.data.map((line, index) => ({
    invoice_id: invoiceId,
    description: line.description.trim(),
    quantity: line.quantity,
    unit_price_cents: line.unitPriceCents,
    amount_cents: totals.lines[index]?.amountCents ?? 0,
    discount_percent: totals.lines[index]?.discountPercent ?? null,
    discount_cents: totals.lines[index]?.discountCents ?? 0,
    service_id: line.serviceId ?? null,
    treatment_code: line.treatmentCode || null,
    icd10_code: line.icd10Code || null,
  }));

  const { error: deleteError } = await supabase
    .from("invoice_line_items")
    .delete()
    .eq("invoice_id", invoiceId);
  if (deleteError) return { error: deleteError.message };

  const { error: insertError } = await supabase.from("invoice_line_items").insert(lines);
  if (insertError) return { error: insertError.message };

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      subtotal_cents: totals.subtotalCents,
      discount_cents: totals.invoiceDiscountCents,
      discount_percent: totals.invoiceDiscountPercent,
      discount_note: invoiceDiscount.note?.trim() || null,
      total_cents: totals.totalCents,
      notes: lines[0]?.description ?? null,
    })
    .eq("id", invoiceId);
  if (updateError) return { error: updateError.message };

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "invoice.update_lines",
    entity_type: "invoice",
    entity_id: invoiceId,
  });

  await applyInvoicePaymentStatus(invoiceId);

  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/billing");
  revalidatePath(`/admin/billing/${invoiceId}`);
  revalidatePath("/portal/invoices");
  revalidatePath(`/portal/invoices/${invoiceId}`);
  return { success: "Invoice updated", id: invoiceId };
}

export async function sendInvoiceEmailAction(invoiceId: string): Promise<SendInvoiceState> {
  await requireStaff();
  const admin = createServiceClient();

  const { data: invoice, error } = await admin
    .from("invoices")
    .select(
      "id, invoice_number, status, total_cents, notes, appointment_id, patient_id, patients(email, first_name, last_name, billing_email, billing_name)",
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (error || !invoice) return { error: error?.message ?? "Invoice not found" };

  const patient = (Array.isArray(invoice.patients) ? invoice.patients[0] : invoice.patients) as
    | {
        email?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        billing_email?: string | null;
        billing_name?: string | null;
      }
    | null
    | undefined;

  const recipient = await resolvePatientInvoiceRecipient(invoice.patient_id);
  const recipientEmail = recipient.email;
  if (!recipientEmail) return { error: "No billing or patient email address on file" };

  const banking = await getInvoiceBankingSettings();
  const isReceipt = invoice.status === "paid";
  const templateKey = isReceipt ? "invoice.receipt" : "invoice.sent";
  const practiceTemplateKey = isReceipt ? "invoice.payment_alert" : "invoice.practitioner_alert";
  const patientName =
    `${patient?.first_name ?? ""} ${patient?.last_name ?? ""}`.trim() || "a patient";
  const sharedPayload = {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    firstName: recipient.firstName,
    patientName,
    description: invoice.notes ?? "Physiotherapy services",
    totalCents: invoice.total_cents,
    currency: "ZAR",
    bankName: banking.bankName,
    accountName: banking.accountName,
    accountNumber: banking.accountNumber,
    branchCode: banking.branchCode,
    proofEmail: banking.proofEmail,
  };

  const practiceRecipients = await resolveBillingAlertRecipients(invoice.appointment_id);
  const { error: outboxError } = await admin.from("notification_outbox").insert([
    {
      channel: "email",
      template_key: templateKey,
      recipient: recipientEmail,
      payload: sharedPayload,
    },
    ...practiceRecipients.map((recipient) => ({
      channel: "email" as const,
      template_key: practiceTemplateKey,
      recipient,
      payload: sharedPayload,
    })),
  ]);

  if (outboxError) return { error: outboxError.message };

  await drainEmailOutbox(Math.max(5, 1 + practiceRecipients.length));
  revalidatePath(`/admin/billing/${invoiceId}`);
  return {
    success: isReceipt
      ? `Receipt emailed to ${recipientEmail}`
      : `Invoice emailed to ${recipientEmail}`,
  };
}

export async function recordPaymentAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const profile = await requireStaff();
  const parsed = paymentSchema.safeParse({
    patientId: formData.get("patientId"),
    invoiceId: formData.get("invoiceId") || null,
    amountCents: formData.get("amountCents"),
    method: formData.get("method") || "eft",
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid payment" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      patient_id: parsed.data.patientId,
      invoice_id: parsed.data.invoiceId,
      amount_cents: parsed.data.amountCents,
      method: parsed.data.method,
      notes: parsed.data.notes,
      recorded_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  let success = "Payment recorded";

  if (parsed.data.invoiceId) {
    const refreshed = await applyInvoicePaymentStatus(parsed.data.invoiceId);
    const invoice = refreshed.invoice;
    const fullyPaid = refreshed.status === "paid";
    success = fullyPaid
      ? "Payment recorded — invoice paid in full"
      : `Partial payment recorded. Outstanding R ${(refreshed.outstandingCents / 100).toFixed(2)}`;

    const patient = (Array.isArray(invoice?.patients) ? invoice?.patients[0] : invoice?.patients) as
      | { email?: string | null; first_name?: string | null; last_name?: string | null }
      | null
      | undefined;
    const recipient = invoice?.patient_id
      ? await resolvePatientInvoiceRecipient(invoice.patient_id)
      : { email: patient?.email?.trim().toLowerCase() ?? null, firstName: patient?.first_name ?? "there" };
    const recipientEmail = recipient.email;

    if (fullyPaid && invoice) {
      const admin = createServiceClient();
      const banking = await getInvoiceBankingSettings();
      const patientName =
        `${patient?.first_name ?? ""} ${patient?.last_name ?? ""}`.trim() || "a patient";
      const sharedPayload = {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        firstName: recipient.firstName,
        patientName,
        description: invoice.notes ?? "Physiotherapy services",
        totalCents: invoice.total_cents,
        currency: "ZAR",
        bankName: banking.bankName,
        accountName: banking.accountName,
        accountNumber: banking.accountNumber,
        branchCode: banking.branchCode,
        proofEmail: banking.proofEmail,
      };
      const practiceRecipients = await resolveBillingAlertRecipients(invoice.appointment_id);
      await admin.from("notification_outbox").insert([
        ...(recipientEmail
          ? [
              {
                channel: "email" as const,
                template_key: "invoice.receipt",
                recipient: recipientEmail,
                payload: sharedPayload,
              },
            ]
          : []),
        ...practiceRecipients.map((recipient) => ({
          channel: "email" as const,
          template_key: "invoice.payment_alert",
          recipient,
          payload: sharedPayload,
        })),
      ]);
      await drainEmailOutbox(Math.max(5, (recipientEmail ? 1 : 0) + practiceRecipients.length));
    }

    revalidatePath(`/admin/billing/${parsed.data.invoiceId}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/billing");
  return { success, id: data?.id };
}

export async function listPatientInvoices(patientId?: string | null) {
  const { data: accessible } = await listAccessiblePatients();
  const ids = accessible
    .filter((patient) => (patientId ? patient.id === patientId : true))
    .map((patient) => patient.id);
  if (!ids.length) return { data: [], error: null };
  const supabase = await createClient();
  return supabase
    .from("invoices")
    .select("*, payments(amount_cents), patients(first_name, last_name)")
    .in("patient_id", ids)
    .order("issue_date", { ascending: false });
}

export async function generateStatementSummary(patientId: string, from: string, to: string) {
  await requireStaff();
  const supabase = await createClient();
  const bounds = statementPeriodBounds(from, to);
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .gte("issue_date", bounds.issueFrom)
    .lte("issue_date", bounds.issueTo);
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("patient_id", patientId)
    .gte("paid_at", bounds.paidFromIso)
    .lt("paid_at", bounds.paidToExclusiveIso);

  const visibleInvoices = (invoices ?? []).filter((invoice) => invoice.status !== "void");
  const invoiced = invoicedCents(visibleInvoices);
  const paid = (payments ?? []).reduce((s, p) => s + p.amount_cents, 0);
  return {
    period: { from, to },
    invoicedCents: invoiced,
    paidCents: paid,
    balanceCents: invoiced - paid,
    invoices: visibleInvoices,
    payments: payments ?? [],
  };
}
