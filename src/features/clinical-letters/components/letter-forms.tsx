"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SignaturePad } from "@/components/forms/signature-pad";
import { FormMessage } from "@/components/ui/form-message";
import {
  createLetterAction,
  signLetterAction,
  updateLetterAction,
  type LetterActionState,
} from "@/features/clinical-letters/actions/letters";
import type { ClinicalLetterType } from "@/features/clinical-letters/types/letter";

const initial: LetterActionState = {};

type PatientOption = { id: string; label: string };

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function NewLetterForm({
  patients,
  defaultPatientId,
  defaultType,
  letterDate,
  attendanceDate,
  defaultAge,
  defaultPhysioName,
  defaultQualifications,
  defaultContact,
}: {
  patients: PatientOption[];
  defaultPatientId?: string;
  defaultType?: ClinicalLetterType;
  letterDate: string;
  attendanceDate: string;
  defaultAge?: string;
  defaultPhysioName: string;
  defaultQualifications: string;
  defaultContact: string;
}) {
  const [state, action, pending] = useActionState(createLetterAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="patientId" label="Patient">
          <select
            id="patientId"
            name="patientId"
            required
            defaultValue={defaultPatientId ?? ""}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="letterType" label="Letter type">
          <select
            id="letterType"
            name="letterType"
            required
            defaultValue={defaultType ?? "proof_of_attendance"}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="proof_of_attendance">Proof of attendance</option>
            <option value="medical_referral">Referral for medical assessment</option>
          </select>
        </Field>
        <Field id="letterDate" label="Letter date">
          <Input id="letterDate" name="letterDate" type="date" required defaultValue={letterDate} />
        </Field>
        <Field id="attendanceDate" label="Attendance date">
          <Input id="attendanceDate" name="attendanceDate" type="date" defaultValue={attendanceDate} />
        </Field>
        <Field id="patientAge" label="Patient age">
          <Input id="patientAge" name="patientAge" defaultValue={defaultAge ?? ""} placeholder="e.g. 55" />
        </Field>
        <Field id="patientSex" label="Patient sex">
          <select
            id="patientSex"
            name="patientSex"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            defaultValue=""
          >
            <option value="">Unspecified (they/their)</option>
            <option value="female">Female (she/her)</option>
            <option value="male">Male (he/his)</option>
            <option value="other">Other (they/their)</option>
          </select>
        </Field>
        <Field id="recipientName" label="Doctor name (referral)">
          <Input id="recipientName" name="recipientName" placeholder="e.g. Naidoo" />
        </Field>
        <Field id="recipientEmail" label="Doctor email (optional copy)">
          <Input id="recipientEmail" name="recipientEmail" type="email" />
        </Field>
      </div>

      <Field id="presentingComplaint" label="Presenting complaint">
        <Input
          id="presentingComplaint"
          name="presentingComplaint"
          placeholder="e.g. an acute exacerbation of right-sided sciatica"
        />
      </Field>
      <Field id="findings" label="Assessment findings">
        <Textarea
          id="findings"
          name="findings"
          rows={3}
          placeholder="e.g. an antalgic gait and symptoms consistent with a flare-up of sciatic pain"
        />
      </Field>
      <Field id="recommendations" label="Recommendations / request (referral)">
        <Textarea
          id="recommendations"
          name="recommendations"
          rows={3}
          placeholder="What you are asking the doctor to assess or investigate"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="physiotherapistName" label="Physiotherapist">
          <Input id="physiotherapistName" name="physiotherapistName" required defaultValue={defaultPhysioName} />
        </Field>
        <Field id="qualifications" label="Qualification(s)">
          <Input id="qualifications" name="qualifications" defaultValue={defaultQualifications} />
        </Field>
        <Field id="contact" label="Contact">
          <Input id="contact" name="contact" defaultValue={defaultContact} className="md:col-span-2" />
        </Field>
      </div>

      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create draft"}
      </Button>
    </form>
  );
}

export function EditLetterForm({
  letterId,
  letterType,
  defaults,
}: {
  letterId: string;
  letterType: ClinicalLetterType;
  defaults: {
    letterDate: string;
    attendanceDate?: string | null;
    recipientName?: string | null;
    recipientEmail?: string | null;
    patientAge?: string | null;
    patientSex?: string | null;
    subjectLine?: string | null;
    body: string;
    physiotherapistName: string;
    qualifications?: string | null;
    practiceName?: string | null;
    contact?: string | null;
  };
}) {
  const [state, action, pending] = useActionState(updateLetterAction, initial);
  const isReferral = letterType === "medical_referral";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={letterId} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="letterDate" label="Letter date">
          <Input id="letterDate" name="letterDate" type="date" required defaultValue={defaults.letterDate} />
        </Field>
        <Field id="attendanceDate" label="Attendance date">
          <Input
            id="attendanceDate"
            name="attendanceDate"
            type="date"
            defaultValue={defaults.attendanceDate ?? defaults.letterDate}
          />
        </Field>
        <Field id="patientAge" label="Patient age">
          <Input id="patientAge" name="patientAge" defaultValue={defaults.patientAge ?? ""} />
        </Field>
        <Field id="patientSex" label="Patient sex">
          <select
            id="patientSex"
            name="patientSex"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            defaultValue={defaults.patientSex ?? ""}
          >
            <option value="">Unspecified (they/their)</option>
            <option value="female">Female (she/her)</option>
            <option value="male">Male (he/his)</option>
            <option value="other">Other (they/their)</option>
          </select>
        </Field>
        {isReferral ? (
          <>
            <Field id="recipientName" label="Doctor name">
              <Input id="recipientName" name="recipientName" defaultValue={defaults.recipientName ?? ""} />
            </Field>
            <Field id="recipientEmail" label="Doctor email (optional copy)">
              <Input
                id="recipientEmail"
                name="recipientEmail"
                type="email"
                defaultValue={defaults.recipientEmail ?? ""}
              />
            </Field>
          </>
        ) : null}
      </div>
      <Field id="subjectLine" label="Heading">
        <Input id="subjectLine" name="subjectLine" defaultValue={defaults.subjectLine ?? ""} />
      </Field>
      <Field id="body" label="Letter body">
        <Textarea id="body" name="body" rows={14} required defaultValue={defaults.body} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="physiotherapistName" label="Physiotherapist">
          <Input
            id="physiotherapistName"
            name="physiotherapistName"
            required
            defaultValue={defaults.physiotherapistName}
          />
        </Field>
        <Field id="qualifications" label="Qualification(s)">
          <Input id="qualifications" name="qualifications" defaultValue={defaults.qualifications ?? ""} />
        </Field>
        <Field id="practiceName" label="Practice name">
          <Input id="practiceName" name="practiceName" defaultValue={defaults.practiceName ?? ""} />
        </Field>
        <Field id="contact" label="Contact">
          <Input id="contact" name="contact" defaultValue={defaults.contact ?? ""} />
        </Field>
      </div>
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save draft"}
      </Button>
    </form>
  );
}

export function SignLetterForm({ letterId }: { letterId: string }) {
  const [state, action, pending] = useActionState(signLetterAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={letterId} />
      <SignaturePad name="signatureData" label="Physiotherapist signature" />
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing…" : "Sign letter"}
      </Button>
    </form>
  );
}
