import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { getStaffLetter } from "@/features/clinical-letters/api/letters";
import { ClinicalLetterDocument } from "@/features/clinical-letters/components/letter-document";
import { EditLetterForm, SignLetterForm } from "@/features/clinical-letters/components/letter-forms";
import { LetterPrintTitle } from "@/features/clinical-letters/components/letter-print-title";
import { LetterDocumentToolbar } from "@/features/clinical-letters/components/letter-toolbar";
import { canAuthorClinicalLetters } from "@/features/clinical-letters/lib/auth";
import { canEditLetter, canPrintLetter, canSendLetter, canSignLetter } from "@/features/clinical-letters/lib/status";
import { letterStatusLabel, letterTypeLabel } from "@/features/clinical-letters/types/letter";
import { requireStaff } from "@/lib/auth/guards";

export default async function AdminLetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireStaff();
  const { id } = await params;
  const { data: letter, error } = await getStaffLetter(id);
  if (error || !letter) notFound();

  const patient = (
    Array.isArray(letter.patients) ? letter.patients[0] : letter.patients
  ) as { first_name?: string; last_name?: string } | null;
  const patientName = `${patient?.first_name ?? ""} ${patient?.last_name ?? ""}`.trim() || "Patient";
  const canAuthor = canAuthorClinicalLetters(profile.role);
  const editable = canEditLetter(letter.status);
  const signed = canPrintLetter(letter.status);

  return (
    <div className="space-y-6">
      <LetterPrintTitle
        letterType={letter.letter_type}
        patientName={patientName}
        letterDate={letter.letter_date}
      />
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-semibold">{letterTypeLabel(letter.letter_type)}</h1>
          <p className="text-sm text-muted-foreground">
            {patientName} ·{" "}
            <Badge variant={letter.status === "draft" ? "warning" : "success"}>
              {letterStatusLabel(letter.status)}
            </Badge>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={routes.admin.letters}>All letters</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.admin.patient(letter.patient_id)}>Patient</Link>
          </Button>
        </div>
      </div>

      <LetterDocumentToolbar
        letterId={letter.id}
        letterType={letter.letter_type}
        patientName={patientName}
        letterDate={letter.letter_date}
        canPrint={signed}
        canSend={canAuthor && canSendLetter(letter.status)}
      />

      {editable && canAuthor ? (
        <>
          <EditLetterForm
            letterId={letter.id}
            letterType={letter.letter_type}
            defaults={{
              letterDate: letter.letter_date,
              attendanceDate: letter.attendance_date,
              recipientName: letter.recipient_name,
              recipientEmail: letter.recipient_email,
              patientAge: letter.patient_age,
              patientSex: letter.patient_sex,
              subjectLine: letter.subject_line,
              body: letter.body,
              physiotherapistName: letter.physiotherapist_name,
              qualifications: letter.qualifications,
              practiceName: letter.practice_name,
              contact: letter.contact,
            }}
          />
          {canSignLetter(letter.status) ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-h5">Sign letter</CardTitle>
              </CardHeader>
              <CardContent>
                <SignLetterForm letterId={letter.id} />
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}

      <div className="letter-print-root">
        <ClinicalLetterDocument
          letterType={letter.letter_type}
          subjectLine={letter.subject_line}
          letterDate={letter.letter_date}
          attendanceDate={letter.attendance_date}
          patientName={patientName}
          patientAge={letter.patient_age}
          patientSex={letter.patient_sex}
          recipientName={letter.recipient_name}
          body={letter.body}
          physiotherapistName={letter.physiotherapist_name}
          qualifications={letter.qualifications}
          practiceName={letter.practice_name}
          contact={letter.contact}
          signatureDataUrl={letter.signature_data}
        />
      </div>
    </div>
  );
}
