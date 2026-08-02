import { EmptyState } from "@/components/shared/states";
import { DocumentCard } from "@/components/patient/cards";
import { Button } from "@/components/ui/button";
import { RegisterDocumentForm } from "@/features/documents/components/register-document-form";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl } from "@/lib/supabase/storage";

export default async function AdminDocumentsPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, doc_type, created_at, patient_id, is_patient_visible, storage_path")
    .order("created_at", { ascending: false })
    .limit(40);

  const withUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      let downloadUrl: string | null = null;
      if (doc.storage_path) {
        const path = doc.storage_path.replace(/^patient-documents\//, "");
        const { data } = await createSignedDownloadUrl("patient-documents", path, 60 * 30);
        downloadUrl = data?.signedUrl ?? null;
      }
      return { ...doc, downloadUrl };
    }),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Register patient documents after uploading to storage.
        </p>
      </div>

      {!withUrls.length ? (
        <EmptyState
          title="No documents registered"
          description="Register a document metadata record below."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {withUrls.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              type={doc.doc_type}
              date={new Date(doc.created_at).toLocaleDateString("en-ZA")}
              actions={
                doc.downloadUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={doc.downloadUrl} target="_blank" rel="noreferrer">
                      Open / download
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">No file linked yet</p>
                )
              }
            />
          ))}
        </div>
      )}

      <RegisterDocumentForm />
    </div>
  );
}
