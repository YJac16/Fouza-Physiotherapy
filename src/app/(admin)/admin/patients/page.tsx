import Link from "next/link";
import { UserPlus } from "lucide-react";

import { PatientTable, type PatientTableRow } from "@/components/admin/cards";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPatients } from "@/features/patients/api/patients";
import { routes } from "@/config/routes";

export default async function PatientsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { data: patients } = await searchPatients(q);

  const rows: PatientTableRow[] = (patients ?? []).map((patient) => ({
    id: patient.id,
    name: (
      <Link
        href={routes.admin.patient(patient.id)}
        className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        {patient.first_name} {patient.last_name}
      </Link>
    ),
    email: patient.email ?? "—",
    phone: patient.phone ?? "—",
    medicalAid: patient.medical_aid_name ?? "—",
    view: (
      <Button asChild variant="outline" size="sm">
        <Link href={routes.admin.patient(patient.id)}>View</Link>
      </Button>
    ),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Search and manage patient records for the practice.
          </p>
        </div>
        <Button asChild>
          <Link href={`${routes.admin.patients}/new`}>
            <UserPlus className="size-4" aria-hidden />
            Add patient
          </Link>
        </Button>
      </div>

      <form action={routes.admin.patients} method="get" className="flex max-w-md gap-2">
        <Input name="q" placeholder="Search by name, email, or phone" defaultValue={q ?? ""} />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {!patients?.length ? (
        <EmptyState
          title="No patients found"
          description={q ? "Try a different search term." : "Add your first patient to get started."}
          action={
            !q ? (
              <Button asChild>
                <Link href={`${routes.admin.patients}/new`}>Add patient</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <PatientTable
          caption="Patients"
          columns={[
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "phone", header: "Phone" },
            { key: "medicalAid", header: "Medical aid" },
            { key: "view", header: "", align: "right" },
          ]}
          rows={rows}
        />
      )}
    </div>
  );
}
