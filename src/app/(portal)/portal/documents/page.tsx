import { EmptyState } from "@/components/shared/states";
import { DocumentCard } from "@/components/patient/cards";
import { listPatientDocuments } from "@/features/documents/actions/documents";
import { getPortalView } from "@/features/patients/api/patients";
import { patientDisplayName } from "@/features/patients/lib/access";

export default async function PortalDocumentsPage() {
  const { selected: patient } = await getPortalView();
  const { data: documents } = await listPatientDocuments(patient?.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">
          {patient
            ? `Reports and documents shared for ${patientDisplayName(patient)}.`
            : "Reports and documents shared by your practitioner."}
        </p>
      </div>

      {!documents?.length ? (
        <EmptyState
          title="No documents shared"
          description="Documents made visible to you will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
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
