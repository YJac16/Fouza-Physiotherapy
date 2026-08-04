import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTAKE_ANSWER_LABELS,
  type SignedConsentPackage,
} from "@/features/consent-forms/lib/signed-package";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });
}

function formatAnswerValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(String).join(", ");
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

export function SignedConsentView({
  package: pkg,
  title = "Signed informed consent",
}: {
  package: SignedConsentPackage;
  title?: string;
}) {
  const answerEntries = pkg.intake
    ? Object.entries(pkg.intake.answers).filter(([, v]) => v != null && v !== "")
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          On file for {pkg.patientName}
          {pkg.intake?.submittedAt
            ? ` · submitted ${formatDate(pkg.intake.submittedAt)}`
            : null}
        </p>
      </div>

      {pkg.intake ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-h5">{pkg.intake.formTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Submitted {formatDate(pkg.intake.submittedAt)}
            </p>
          </CardHeader>
          <CardContent>
            {answerEntries.length ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {answerEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      {INTAKE_ANSWER_LABELS[key] ?? key}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium whitespace-pre-wrap">
                      {formatAnswerValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No intake answers recorded.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {pkg.signatures.map((sig) => (
        <Card key={sig.formId}>
          <CardHeader>
            <CardTitle className="text-h5">{sig.formTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Signed {formatDate(sig.signedAt)}
              {sig.typedName ? ` · ${sig.typedName}` : null}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {sig.padDataUrl ? (
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sig.padDataUrl}
                  alt={`Signature for ${sig.formTitle}`}
                  className="mx-auto max-h-40 w-auto"
                />
              </div>
            ) : sig.typedName ? (
              <p className="text-sm italic text-muted-foreground">
                Typed acknowledgement: {sig.typedName}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Signature on file.</p>
            )}
          </CardContent>
        </Card>
      ))}

      {!pkg.intake && !pkg.signatures.length ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No signed consent records found for this patient.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
