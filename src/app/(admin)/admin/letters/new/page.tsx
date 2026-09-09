import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { NewLetterForm } from "@/features/clinical-letters/components/letter-forms";
import { listLetterTemplates } from "@/features/clinical-letters/api/letters";
import { ageFromDateOfBirth } from "@/features/clinical-letters/lib/placeholders";
import { toDateKey } from "@/features/booking/lib/timezone";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { LETTER_AUTHOR_ROLES, type ClinicalLetterType } from "@/features/clinical-letters/types/letter";

export default async function NewClinicalLetterPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; type?: string }>;
}) {
  await requireRole([...LETTER_AUTHOR_ROLES]);
  const params = await searchParams;
  const supabase = await createClient();
  const today = toDateKey();
  const letterType = (
    params.type === "proof_of_attendance" || params.type === "medical_referral" ? params.type : undefined
  ) as ClinicalLetterType | undefined;

  const [{ data: patients }, { data: templates }, patientResult] = await Promise.all([
    supabase.from("patients").select("id, first_name, last_name").order("last_name").limit(200),
    listLetterTemplates(),
    params.patientId
      ? supabase
          .from("patients")
          .select("date_of_birth")
          .eq("id", params.patientId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const proof = templates?.find((row) => row.letter_type === "proof_of_attendance");
  const referral = templates?.find((row) => row.letter_type === "medical_referral");
  const signer = (letterType === "medical_referral" ? referral : proof) ?? proof ?? referral;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">New letter</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details, then sign the draft before download or send.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={routes.admin.letters}>Back</Link>
        </Button>
      </div>
      <NewLetterForm
        defaultPatientId={params.patientId}
        defaultType={letterType}
        letterDate={today}
        attendanceDate={today}
        defaultAge={ageFromDateOfBirth(patientResult.data?.date_of_birth, today)}
        defaultPhysioName={signer?.physiotherapist_name ?? siteConfig.founder.name}
        defaultQualifications={signer?.qualifications ?? "BSc (Hons) Physiotherapy"}
        defaultContact={signer?.contact ?? `${siteConfig.phoneDisplay} · ${siteConfig.email}`}
        patients={(patients ?? []).map((patient) => ({
          id: patient.id,
          label: `${patient.first_name} ${patient.last_name}`,
        }))}
      />
    </div>
  );
}
