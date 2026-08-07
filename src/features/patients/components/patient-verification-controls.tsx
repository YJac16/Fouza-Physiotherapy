"use client";

import { useState, useTransition } from "react";

import { setPatientVerifiedAction } from "@/features/consent-forms/actions/consent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

export function PatientVerificationControls({
  patientId,
  verified,
  consentSigned,
  consentSignedAt,
  consentVersion,
}: {
  patientId: string;
  verified: boolean;
  consentSigned: boolean;
  consentSignedAt?: string | null;
  consentVersion?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(verified);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await setPatientVerifiedAction(patientId, !isVerified);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsVerified(!isVerified);
    });
  }

  const signedLabel = consentSignedAt
    ? new Date(consentSignedAt).toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
      })
    : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isVerified ? "success" : "warning"}>
          {isVerified ? "Verified account" : "Unverified"}
        </Badge>
        <Badge variant={consentSigned ? "success" : "warning"}>
          {consentSigned ? "Consent signed" : "Consent pending"}
        </Badge>
      </div>
      {signedLabel ? (
        <p className="text-sm text-muted-foreground">
          Signed: {signedLabel}
          {consentVersion ? ` · Version ${consentVersion}` : ""}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        loading={pending}
        onClick={toggle}
      >
        {isVerified ? "Remove verification" : "Mark as verified"}
      </Button>
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
    </div>
  );
}
