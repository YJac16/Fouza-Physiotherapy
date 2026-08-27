import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTAKE_ANSWER_LABELS,
  formatIntakeAnswerValue,
  type SignedConsentPackage,
} from "@/features/consent-forms/lib/signed-package-types";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });
}

function ConsentText({ markdown }: { markdown: string }) {
  const lines = markdown
    .replace(/^# .+\n+/, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  const blocks: ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (!listItems.length) return;
    blocks.push(
      <ol
        key={`list-${blocks.length}`}
        className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground"
      >
        {listItems.map((item) => (
          <li key={item} className="marker:font-semibold [overflow-wrap:anywhere]">
            {item}
          </li>
        ))}
      </ol>,
    );
    listItems = [];
  }

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      flushList();
      blocks.push(
        <p
          key={`h-${blocks.length}`}
          className="pt-1 text-sm font-semibold leading-snug text-foreground [overflow-wrap:anywhere]"
        >
          {line.replace(/^##\s+/, "")}
        </p>,
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s+/, "").replaceAll("**", ""));
      continue;
    }
    flushList();
    blocks.push(
      <p
        key={`p-${blocks.length}`}
        className="text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]"
      >
        {line.replaceAll("**", "")}
      </p>,
    );
  }
  flushList();

  return (
    <div className="space-y-3 overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-3 sm:p-4">
      {blocks}
    </div>
  );
}

export function SignedConsentView({
  package: pkg,
  title = "Signed informed consent",
  showTitle = true,
}: {
  package: SignedConsentPackage;
  title?: string;
  showTitle?: boolean;
}) {
  const answerEntries = pkg.intake
    ? Object.entries(pkg.intake.answers).filter(([, v]) => v != null && v !== "")
    : [];

  return (
    <div className="min-w-0 space-y-6">
      {showTitle ? (
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold leading-snug [overflow-wrap:anywhere]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
            On file for {pkg.patientName}
            {pkg.intake?.submittedAt ? (
              <>
                <span className="hidden sm:inline"> · </span>
                <span className="mt-0.5 block sm:mt-0 sm:inline">
                  submitted {formatDate(pkg.intake.submittedAt)}
                </span>
              </>
            ) : null}
          </p>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
          On file for {pkg.patientName}
          {pkg.intake?.submittedAt ? (
            <>
              <span className="hidden sm:inline"> · </span>
              <span className="mt-0.5 block sm:mt-0 sm:inline">
                submitted {formatDate(pkg.intake.submittedAt)}
              </span>
            </>
          ) : null}
        </p>
      )}

      {pkg.intake ? (
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-2 p-4 sm:p-6">
            <CardTitle className="text-h5 leading-snug [overflow-wrap:anywhere]">
              {pkg.intake.formTitle}
            </CardTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Submitted {formatDate(pkg.intake.submittedAt)}
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {answerEntries.length ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {answerEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className={cn(
                      "min-w-0",
                      key === "accountResponsible" && "sm:col-span-2",
                    )}
                  >
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      {INTAKE_ANSWER_LABELS[key] ?? key}
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm font-medium leading-relaxed [overflow-wrap:anywhere]">
                      {formatIntakeAnswerValue(value)}
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
        <Card key={sig.formId} className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-2 p-4 sm:p-6">
            <CardTitle className="text-h5 leading-snug [overflow-wrap:anywhere]">
              {sig.formTitle}
            </CardTitle>
            <div className="space-y-0.5 text-sm leading-relaxed text-muted-foreground">
              <p>Signed {formatDate(sig.signedAt)}</p>
              {sig.formVersion ? <p>Form version: {sig.formVersion}</p> : null}
              {sig.typedName ? (
                <p className="[overflow-wrap:anywhere]">Signed by {sig.typedName}</p>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            {sig.formBody ? <ConsentText markdown={sig.formBody} /> : null}
            {sig.padDataUrl ? (
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-2 sm:p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sig.padDataUrl}
                  alt={`Signature for ${sig.formTitle}`}
                  className="mx-auto block h-auto max-h-40 w-full max-w-full object-contain"
                />
              </div>
            ) : sig.typedName ? (
              <p className="text-sm italic leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                Typed acknowledgement: {sig.typedName}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Signature on file.</p>
            )}
          </CardContent>
        </Card>
      ))}

      {!pkg.intake && !pkg.signatures.length ? (
        <Card className="min-w-0">
          <CardContent className="py-6 text-sm text-muted-foreground">
            No signed consent records found for this patient.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
