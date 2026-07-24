import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreatePatientForm } from "@/features/patients/components/create-patient-form";
import { requireStaff } from "@/lib/auth/guards";
import { routes } from "@/config/routes";

export default async function NewPatientPage() {
  await requireStaff();

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={routes.admin.patients}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to patients
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold">Add patient</h1>
        <p className="text-sm text-muted-foreground">
          Create a new patient record for the practice.
        </p>
      </div>

      <CreatePatientForm />
    </div>
  );
}
