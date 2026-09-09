import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InvoiceBuilderForm } from "@/features/billing/components/invoice-builder-form";
import {
  listActiveInvoiceServices,
  listBillableAppointmentsForInvoice,
} from "@/features/billing/actions/billing";
import { getPatient, searchPatients } from "@/features/patients/api/patients";
import { requireStaff } from "@/lib/auth/guards";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; appointmentId?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;
  const [{ data: patients }, appointments, services, defaultPatient] = await Promise.all([
    searchPatients(),
    listBillableAppointmentsForInvoice({ includeAppointmentId: params.appointmentId }),
    listActiveInvoiceServices(),
    params.patientId ? getPatient(params.patientId) : Promise.resolve({ data: null }),
  ]);

  const patientOptions = (patients ?? []).map((patient) => ({
    id: patient.id,
    label: `${patient.first_name} ${patient.last_name}`,
  }));
  if (
    defaultPatient.data &&
    !patientOptions.some((patient) => patient.id === defaultPatient.data?.id)
  ) {
    patientOptions.unshift({
      id: defaultPatient.data.id,
      label: `${defaultPatient.data.first_name} ${defaultPatient.data.last_name}`,
    });
  }

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
        patients={patientOptions}
        appointments={appointments}
        services={services}
        defaultPatientId={params.patientId}
        defaultAppointmentId={params.appointmentId}
      />
    </div>
  );
}
