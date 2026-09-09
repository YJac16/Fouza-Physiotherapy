import Link from "next/link";

import { EmptyState } from "@/components/shared/states";
import { DocumentCard } from "@/components/patient/cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { listPatientDocuments } from "@/features/documents/actions/documents";
import { listPatientLetters } from "@/features/clinical-letters/api/letters";
import { letterTypeLabel } from "@/features/clinical-letters/types/letter";
import { getPortalView } from "@/features/patients/api/patients";
import { patientDisplayName } from "@/features/patients/lib/access";

export default async function PortalDocumentsPage() {
  const { selected: patient } = await getPortalView();
  const [{ data: documents }, { data: letters }] = await Promise.all([
    listPatientDocuments(patient?.id),
    listPatientLetters(patient?.id),
  ]);

  const hasItems = Boolean(documents?.length || letters?.length);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">
          {patient
            ? `Reports, letters, and documents shared for ${patientDisplayName(patient)}.`
            : "Reports and documents shared by your practitioner."}
        </p>
      </div>

      {!hasItems ? (
        <EmptyState
          title="No documents shared"
          description="Documents and letters made visible to you will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(letters ?? []).map((letter) => (
            <DocumentCard
              key={letter.id}
              title={letter.subject_line || letterTypeLabel(letter.letter_type)}
              type={letterTypeLabel(letter.letter_type)}
              date={new Date(`${letter.letter_date}T12:00:00`).toLocaleDateString("en-ZA")}
              actions={
                <Button asChild size="sm" variant="outline">
                  <Link href={routes.portal.letter(letter.id)}>View / print</Link>
                </Button>
              }
            />
          ))}
          {(documents ?? []).map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              type={doc.doc_type}
              date={new Date(doc.created_at).toLocaleDateString("en-ZA")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
