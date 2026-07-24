import { EmptyState } from "@/components/shared/states";
import { DocumentCard } from "@/components/patient/cards";
import { RegisterDocumentForm } from "@/features/documents/components/register-document-form";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDocumentsPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, doc_type, created_at, patient_id, is_patient_visible")
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Register patient documents after uploading to storage.
        </p>
      </div>

      {!documents?.length ? (
        <EmptyState
          title="No documents registered"
          description="Register a document metadata record below."
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

      <RegisterDocumentForm />
    </div>
  );
}
