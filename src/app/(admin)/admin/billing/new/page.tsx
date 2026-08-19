import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InvoiceBuilderForm } from "@/features/billing/components/invoice-builder-form";
import {
  listActiveInvoiceServices,
  listBillableAppointmentsForInvoice,
} from "@/features/billing/actions/billing";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; appointmentId?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: patients }, appointments, services] = await Promise.all([
    supabase.from("patients").select("id, first_name, last_name").order("last_name").limit(200),
    listBillableAppointmentsForInvoice({ includeAppointmentId: params.appointmentId }),
    listActiveInvoiceServices(),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">New invoice</h1>
          <p className="text-sm text-muted-foreground">
            Build the complete invoice before saving as a draft.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/billing">Back</Link>
        </Button>
      </div>
      <InvoiceBuilderForm
        patients={(patients ?? []).map((patient) => ({
          id: patient.id,
          label: `${patient.first_name} ${patient.last_name}`,
        }))}
        appointments={appointments}
        services={services}
        defaultPatientId={params.patientId}
        defaultAppointmentId={params.appointmentId}
      />
    </div>
  );
}
