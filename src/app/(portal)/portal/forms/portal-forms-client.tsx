"use client";

import { useActionState, useState } from "react";

import { SignaturePad } from "@/components/forms/signature-pad";
import {
  signConsentAction,
  submitIntakeAction,
  type ConsentActionState,
} from "@/features/consent-forms/actions/consent";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initial: ConsentActionState = {};

export interface PortalFormsClientProps {
  patientId: string;
  consentForms: { id: string; title: string; body_md: string }[];
  intakeForms: { id: string; title: string }[];
}

export function PortalFormsClient({
  patientId,
  consentForms,
  intakeForms,
}: PortalFormsClientProps) {
  const [consentState, consentAction, consentPending] = useActionState(
    signConsentAction,
    initial,
  );
  const [intakeState, intakeAction, intakePending] = useActionState(
    submitIntakeAction,
    initial,
  );

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");

  const primaryConsent = consentForms[0];
  const primaryIntake = intakeForms[0];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {primaryIntake ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-h5">{primaryIntake.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={intakeAction} className="space-y-4">
              <input type="hidden" name="formId" value={primaryIntake.id} />
              <input type="hidden" name="patientId" value={patientId} />
              <input
                type="hidden"
                name="answersJson"
                value={JSON.stringify({ chiefComplaint, medications, allergies })}
              />
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint">Chief complaint</Label>
                <Textarea
                  id="chiefComplaint"
                  rows={3}
                  placeholder="Describe your main concern"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Current medications</Label>
                <Input
                  id="medications"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
              {intakeState.error ? (
                <FormMessage tone="error">{intakeState.error}</FormMessage>
              ) : null}
              {intakeState.success ? (
                <FormMessage tone="success">{intakeState.success}</FormMessage>
              ) : null}
              <Button type="submit" loading={intakePending}>
                Submit intake
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {primaryConsent ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-h5">{primaryConsent.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {primaryConsent.body_md.slice(0, 500)}
            </p>
            <form action={consentAction} className="space-y-4">
              <input type="hidden" name="formId" value={primaryConsent.id} />
              <input type="hidden" name="patientId" value={patientId} />
              <SignaturePad />
              {consentState.error ? (
                <FormMessage tone="error">{consentState.error}</FormMessage>
              ) : null}
              {consentState.success ? (
                <FormMessage tone="success">{consentState.success}</FormMessage>
              ) : null}
              <Button type="submit" loading={consentPending}>
                Sign consent
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
