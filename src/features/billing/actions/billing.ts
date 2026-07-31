"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff, requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

const invoiceSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
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

export type BillingActionState = { error?: string; success?: string; id?: string };

export async function createInvoiceAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const profile = await requireStaff();
  const parsed = invoiceSchema.safeParse({
    patientId: formData.get("patientId"),
    appointmentId: formData.get("appointmentId") || null,
    subtotalCents: formData.get("subtotalCents"),
    taxCents: formData.get("taxCents") || 0,
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: "Invalid invoice" };

  const admin = createServiceClient();
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

  await supabase.from("invoice_line_items").insert({
    invoice_id: data.id,
    description: parsed.data.description,
    quantity: 1,
    unit_price_cents: parsed.data.subtotalCents,
    amount_cents: parsed.data.subtotalCents,
    treatment_code: formData.get("treatmentCode")?.toString() || null,
    icd10_code: formData.get("icd10Code")?.toString() || null,
  });

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
  if (recipientEmail) {
    await admin.from("notification_outbox").insert({
      channel: "email",
      template_key: "invoice.sent",
      recipient: recipientEmail,
      payload: {
        invoiceId: data.id,
        patientId: parsed.data.patientId,
        invoiceNumber: numberData as string,
        firstName: patientRow?.first_name ?? "there",
        description: parsed.data.description,
        totalCents: total,
        currency: "ZAR",
      },
    });
  }

  revalidatePath("/admin/billing");
  return { success: "Invoice created", id: data.id };
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

  if (parsed.data.invoiceId) {
    await supabase
      .from("invoices")
      .update({ status: "paid" })
      .eq("id", parsed.data.invoiceId);
  }

  revalidatePath("/admin/billing");
  return { success: "Payment recorded", id: data?.id };
}

export async function listPatientInvoices() {
  const profile = await requireUser();
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!patient) return { data: [], error: null };
  return supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patient.id)
    .order("issue_date", { ascending: false });
}

export async function generateStatementSummary(patientId: string, from: string, to: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .gte("issue_date", from)
    .lte("issue_date", to);
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("patient_id", patientId)
    .gte("paid_at", from)
    .lte("paid_at", to);

  const invoiced = (invoices ?? []).reduce((s, i) => s + i.total_cents, 0);
  const paid = (payments ?? []).reduce((s, p) => s + p.amount_cents, 0);
  return {
    period: { from, to },
    invoicedCents: invoiced,
    paidCents: paid,
    balanceCents: invoiced - paid,
    invoices: invoices ?? [],
    payments: payments ?? [],
  };
}
