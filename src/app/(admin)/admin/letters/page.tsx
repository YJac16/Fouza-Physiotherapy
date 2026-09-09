import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/states";
import { routes } from "@/config/routes";
import { listStaffLetters } from "@/features/clinical-letters/api/letters";
import { canAuthorClinicalLetters } from "@/features/clinical-letters/lib/auth";
import {
  letterStatusLabel,
  letterTypeLabel,
  type ClinicalLetterStatus,
  type ClinicalLetterType,
} from "@/features/clinical-letters/types/letter";
import { requireStaff } from "@/lib/auth/guards";

function patientName(row: {
  patients?:
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
}) {
  const patient = Array.isArray(row.patients) ? row.patients[0] : row.patients;
  if (!patient) return "Patient";
  return `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim() || "Patient";
}

export default async function AdminLettersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; patientId?: string }>;
}) {
  const profile = await requireStaff();
  const params = await searchParams;
  const letterType = (
    params.type === "proof_of_attendance" || params.type === "medical_referral" ? params.type : undefined
  ) as ClinicalLetterType | undefined;
  const status = (
    params.status === "draft" || params.status === "signed" || params.status === "sent"
      ? params.status
      : undefined
  ) as ClinicalLetterStatus | undefined;

  const { data: letters } = await listStaffLetters({
    patientId: params.patientId,
    letterType,
    status,
  });
  const canAuthor = canAuthorClinicalLetters(profile.role);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Letters</h1>
          <p className="text-sm text-muted-foreground">
            Proof of attendance and medical referral letters. Sign before download or send.
          </p>
        </div>
        {canAuthor ? (
          <Button asChild>
            <Link href={routes.admin.newLetter}>New letter</Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button asChild size="sm" variant={!letterType ? "default" : "outline"}>
          <Link href={routes.admin.letters}>All types</Link>
        </Button>
        <Button asChild size="sm" variant={letterType === "proof_of_attendance" ? "default" : "outline"}>
          <Link href={`${routes.admin.letters}?type=proof_of_attendance`}>Proof of attendance</Link>
        </Button>
        <Button asChild size="sm" variant={letterType === "medical_referral" ? "default" : "outline"}>
          <Link href={`${routes.admin.letters}?type=medical_referral`}>Referrals</Link>
        </Button>
      </div>

      {!letters?.length ? (
        <EmptyState
          title="No letters yet"
          description="Create a proof of attendance or referral from a patient record."
        />
      ) : (
        <div className="grid gap-4">
          {letters.map((letter) => (
            <Card key={letter.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  {letterTypeLabel(letter.letter_type)} · {patientName(letter)}
                  <Badge variant={letter.status === "draft" ? "warning" : "success"}>
                    {letterStatusLabel(letter.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {new Date(`${letter.letter_date}T12:00:00`).toLocaleDateString("en-ZA")}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href={routes.admin.letter(letter.id)}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
