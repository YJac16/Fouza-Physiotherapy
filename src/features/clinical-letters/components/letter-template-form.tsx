"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/ui/form-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateLetterTemplateAction,
  type LetterActionState,
} from "@/features/clinical-letters/actions/letters";
import { LETTER_TYPE_LABELS, type ClinicalLetterType } from "@/features/clinical-letters/types/letter";

const initial: LetterActionState = {};

export function LetterTemplateForm({
  letterType,
  defaults,
}: {
  letterType: ClinicalLetterType;
  defaults: {
    title: string;
    body: string;
    physiotherapistName: string;
    qualifications?: string | null;
    contact?: string | null;
  };
}) {
  const [state, action, pending] = useActionState(updateLetterTemplateAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">{LETTER_TYPE_LABELS[letterType]} template</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="letterType" value={letterType} />
          <div className="space-y-2">
            <Label htmlFor={`${letterType}-title`}>Heading</Label>
            <Input id={`${letterType}-title`} name="title" required defaultValue={defaults.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${letterType}-body`}>Default body</Label>
            <Textarea id={`${letterType}-body`} name="body" rows={12} required defaultValue={defaults.body} />
            <p className="text-xs text-muted-foreground">
              Placeholders: {"{{patientName}}"}, {"{{practiceName}}"}, {"{{letterDate}}"},{" "}
              {"{{attendanceDate}}"}, {"{{patientAge}}"}, {"{{patientSex}}"}, {"{{recipientName}}"},{" "}
              {"{{presentingComplaint}}"}, {"{{findings}}"}, {"{{recommendations}}"},{" "}
              {"{{pronounSubject}}"}, {"{{pronounPossessive}}"}, {"{{pronounSubjectCap}}"}.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${letterType}-physio`}>Physiotherapist</Label>
              <Input
                id={`${letterType}-physio`}
                name="physiotherapistName"
                required
                defaultValue={defaults.physiotherapistName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${letterType}-qual`}>Qualification(s)</Label>
              <Input
                id={`${letterType}-qual`}
                name="qualifications"
                defaultValue={defaults.qualifications ?? ""}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`${letterType}-contact`}>Contact</Label>
              <Input id={`${letterType}-contact`} name="contact" defaultValue={defaults.contact ?? ""} />
            </div>
          </div>
          {state.error ? <FormMessage>{state.error}</FormMessage> : null}
          {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save template"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
