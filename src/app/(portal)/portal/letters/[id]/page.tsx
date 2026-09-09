import { notFound } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getPatientLetter } from "@/features/clinical-letters/api/letters";
import { ClinicalLetterDocument } from "@/features/clinical-letters/components/letter-document";
import { LetterPrintTitle } from "@/features/clinical-letters/components/letter-print-title";
import { LetterDocumentToolbar } from "@/features/clinical-letters/components/letter-toolbar";
import { letterTypeLabel } from "@/features/clinical-letters/types/letter";

export default async function PortalLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: letter, error } = await getPatientLetter(id);
  if (error || !letter) notFound();

  const patient = (
    Array.isArray(letter.patients) ? letter.patients[0] : letter.patients
  ) as { first_name?: string; last_name?: string } | null;
  const patientName = `${patient?.first_name ?? ""} ${patient?.last_name ?? ""}`.trim() || "Patient";

  return (
    <div className="space-y-6">
      <LetterPrintTitle
        letterType={letter.letter_type}
        patientName={patientName}
        letterDate={letter.letter_date}
      />
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {letterTypeLabel(letter.letter_type)}
          </h1>
          <p className="text-sm text-muted-foreground">Shared by your practitioner.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={routes.portal.documents}>Back to documents</Link>
        </Button>
      </div>
      <LetterDocumentToolbar
        letterId={letter.id}
        letterType={letter.letter_type}
        patientName={patientName}
        letterDate={letter.letter_date}
        canPrint
        canSend={false}
      />
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
