"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SignaturePad } from "@/components/forms/signature-pad";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { signConsentAction, type ConsentActionState } from "@/features/consent-forms/actions/consent";

type AccountConsent = {
  id: string;
  title: string;
  body_md: string;
};

const initial: ConsentActionState = {};

export function FamilyAccountResponsibilitySign({
  patientId,
  accountConsent,
  defaultTypedName,
}: {
  patientId: string;
  accountConsent: AccountConsent;
  defaultTypedName?: string | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(signConsentAction, initial);

  const [signatureData, setSignatureData] = useState("");
  const [typedName, setTypedName] = useState(defaultTypedName ?? "");

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [state.success, router]);

  const canSubmit = Boolean(signatureData);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="formId" value={accountConsent.id} />
      <input type="hidden" name="patientId" value={patientId} />

      {/* typedName is optional, but the server schema requires min-length when present */}
      {typedName.trim().length >= 2 ? (
        <input type="hidden" name="typedName" value={typedName.trim()} />
      ) : null}

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-h5 leading-snug">{accountConsent.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Signed by the account payer for this patient.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {/* accountConsent.body_md is markdown in the admin tablet UI; for portal signing we just show raw text */}
            {accountConsent.body_md}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="typedName">
              Account payer full name (optional)
            </label>
            <Input
              id="typedName"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type full name"
            />
          </div>

          <SignaturePad
            name="signatureData"
            label="Account holder signature"
            onChange={(dataUrl) => setSignatureData(dataUrl)}
          />
        </CardContent>
      </Card>

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto" loading={pending} disabled={!canSubmit}>
        Sign account responsibility
      </Button>
    </form>
  );
}

