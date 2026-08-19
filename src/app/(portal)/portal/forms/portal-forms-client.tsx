"use client";

import { useActionState, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SignaturePad } from "@/components/forms/signature-pad";
import {
  submitFouzaConsentPackageAction,
  type ConsentActionState,
} from "@/features/consent-forms/actions/consent";
import { SignedConsentView } from "@/features/consent-forms/components/signed-consent-view";
import type { SignedConsentPackage } from "@/features/consent-forms/lib/signed-package-types";
import { pricingPlans } from "@/content/pricing";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const initial: ConsentActionState = {};

const RELEASE_OPTIONS = ["Medical Team", "Guardian", "Partner", "Other"] as const;
const SOURCE_OPTIONS = ["Instagram", "Facebook", "Google", "Other"] as const;

export interface PortalFormsClientProps {
  patientId?: string;
  appointmentId?: string | null;
  alreadyComplete?: boolean;
  signedPackage?: SignedConsentPackage | null;
  intakeForm: { id: string; title: string };
  treatmentConsent: { id: string; title: string; body_md: string };
  accountConsent: { id: string; title: string; body_md: string };
  returnTo?: string | null;
  mode?: "portal" | "staff";
  submitAction?: (
    prev: ConsentActionState,
    formData: FormData,
  ) => Promise<ConsentActionState>;
  defaults?: {
    fullName?: string;
    email?: string;
    phone?: string;
    idNumber?: string;
    street?: string;
    suburb?: string;
    areaCode?: string;
    medicalAid?: string;
    medicalAidNumber?: string;
    dependantCode?: string;
    accountHolderName?: string;
    accountHolderEmail?: string;
    accountHolderPhone?: string;
    accountHolderAddress?: string;
  };
}

function Section({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-h5 leading-snug [overflow-wrap:anywhere]">{title}</CardTitle>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">{children}</CardContent>
    </Card>
  );
}

function markdownToParagraphs(md: string) {
  return md
    .replace(/^# .+\n+/, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function ConsentBody({ markdown }: { markdown: string }) {
  const lines = markdownToParagraphs(markdown);
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ol
        key={`list-${blocks.length}`}
        className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground"
      >
        {listItems.map((item) => (
          <li key={item} className="marker:font-semibold">
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
          key={`h-${line}`}
          className="pt-2 text-sm font-semibold text-foreground"
        >
          {line.replace(/^##\s+/, "")}
        </p>,
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }
    flushList();
    blocks.push(
      <p
        key={`p-${line.slice(0, 48)}-${blocks.length}`}
        className={cn(
          "text-sm leading-relaxed text-muted-foreground",
          line.startsWith("**") && "font-semibold text-foreground",
          line.startsWith("By signing below") && "font-medium text-foreground",
          line.startsWith("I hereby willingly") && "font-medium text-foreground",
        )}
      >
        {line.replaceAll("**", "")}
      </p>,
    );
  }
  flushList();
  return <div className="space-y-3">{blocks}</div>;
}

export function PortalFormsClient({
  patientId,
  appointmentId,
  alreadyComplete,
  signedPackage,
  intakeForm,
  treatmentConsent,
  accountConsent,
  defaults,
  returnTo,
  mode = "portal",
  submitAction = submitFouzaConsentPackageAction,
}: PortalFormsClientProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitAction, initial);

  useEffect(() => {
    if (!state.success) return;
    if (state.id) {
      router.push(routes.admin.patient(state.id));
      return;
    }
    if (returnTo?.startsWith("/")) {
      router.push(returnTo);
    }
    router.refresh();
  }, [state.success, state.id, returnTo, router]);

  const [sameAsPatient, setSameAsPatient] = useState(!defaults?.accountHolderName);
  const [fullName, setFullName] = useState(defaults?.fullName ?? "");
  const [idNumber, setIdNumber] = useState(defaults?.idNumber ?? "");
  const [contactNumber, setContactNumber] = useState(defaults?.phone ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [street, setStreet] = useState(defaults?.street ?? "");
  const [suburb, setSuburb] = useState(defaults?.suburb ?? "");
  const [areaCode, setAreaCode] = useState(defaults?.areaCode ?? "");

  const [respName, setRespName] = useState(defaults?.accountHolderName ?? "");
  const [respId, setRespId] = useState("");
  const [respContact, setRespContact] = useState(defaults?.accountHolderPhone ?? "");
  const [respEmail, setRespEmail] = useState(defaults?.accountHolderEmail ?? "");
  const [respPostal, setRespPostal] = useState(defaults?.accountHolderAddress ?? "");

  const [medicalAid, setMedicalAid] = useState(defaults?.medicalAid ?? "");
  const [medicalAidNumber, setMedicalAidNumber] = useState(defaults?.medicalAidNumber ?? "");
  const [dependantCode, setDependantCode] = useState(defaults?.dependantCode ?? "");

  const [release, setRelease] = useState<string[]>([]);
  const [releaseOther, setReleaseOther] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [sourceOther, setSourceOther] = useState("");

  const [undertaking, setUndertaking] = useState<"yes" | "no" | "">("");
  const [pleaseNote, setPleaseNote] = useState<"agree" | "disagree" | "">("");
  const [typedFullName, setTypedFullName] = useState("");
  const [accountTypedName, setAccountTypedName] = useState(defaults?.accountHolderName ?? "");
  const [treatmentSignerRole, setTreatmentSignerRole] = useState<"patient" | "proxy">("patient");
  const [treatmentSignature, setTreatmentSignature] = useState("");
  const [accountSignature, setAccountSignature] = useState("");
  const isStaff = mode === "staff";

  const answersJson = useMemo(
    () =>
      JSON.stringify({
        fullName,
        idNumber,
        contactNumber,
        email,
        street,
        suburb,
        areaCode,
        accountResponsible: sameAsPatient
          ? {
              sameAsPatient: true,
              name: fullName,
              idNumber,
              contactNumber,
              email,
              postalAddress: [street, suburb, areaCode].filter(Boolean).join(", "),
            }
          : {
              sameAsPatient: false,
              name: respName,
              idNumber: respId,
              contactNumber: respContact,
              email: respEmail,
              postalAddress: respPostal,
            },
        medicalAid,
        medicalAidNumber,
        dependantCode,
        releaseInformation: release,
        releaseOther,
        referralSources: sources,
        sourceOther,
        undertaking,
        pleaseNote,
        typedFullName,
      }),
    [
      fullName,
      idNumber,
      contactNumber,
      email,
      street,
      suburb,
      areaCode,
      sameAsPatient,
      respName,
      respId,
      respContact,
      respEmail,
      respPostal,
      medicalAid,
      medicalAidNumber,
      dependantCode,
      release,
      releaseOther,
      sources,
      sourceOther,
      undertaking,
      pleaseNote,
      typedFullName,
    ],
  );

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  if (alreadyComplete) {
    const continueCta =
      returnTo && returnTo.startsWith("/") ? (
        <div className="mt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={returnTo}>Continue to booking</Link>
          </Button>
        </div>
      ) : null;

    if (signedPackage) {
      return (
        <div className="space-y-4">
          <SignedConsentView package={signedPackage} showTitle={false} />
          {continueCta}
        </div>
      );
    }
    return (
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-h5 leading-snug">Forms complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 text-sm leading-relaxed text-muted-foreground sm:p-6 sm:pt-0">
          <p>
            Your informed consent and intake forms are on file. Thank you — the practice can
            prepare for your visit.
          </p>
          {continueCta}
        </CardContent>
      </Card>
    );
  }

  const accountLines = markdownToParagraphs(accountConsent.body_md);

  return (
    <form action={action} className="min-w-0 space-y-6 overflow-x-hidden">
      <input type="hidden" name="intakeFormId" value={intakeForm.id} />
      {patientId ? <input type="hidden" name="patientId" value={patientId} /> : null}
      {appointmentId ? (
        <input type="hidden" name="appointmentId" value={appointmentId} />
      ) : null}
      <input type="hidden" name="treatmentFormId" value={treatmentConsent.id} />
      <input type="hidden" name="accountFormId" value={accountConsent.id} />
      <input type="hidden" name="answersJson" value={answersJson} />
      <input type="hidden" name="treatmentSignature" value={treatmentSignature} />
      <input type="hidden" name="accountSignature" value={accountSignature} />
      {isStaff ? (
        <>
          <input type="hidden" name="treatmentSignerRole" value={treatmentSignerRole} />
          <input type="hidden" name="accountSignerRole" value="account_holder" />
          <input type="hidden" name="accountTypedName" value={accountTypedName || respName} />
        </>
      ) : null}

      <Card className="border-primary/20 bg-accent-soft/40">
        <CardHeader>
          <CardTitle className="text-h5">{intakeForm.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{siteConfig.address}</p>
          <p>Pr. No: 0932469 · PT 0137855</p>
          <p>
            WhatsApp: Message us directly · Email: {siteConfig.email}
          </p>
          <p className="font-medium text-foreground">
            PLEASE NOTE: ALL INFORMATION PROVIDED IS FOR INVOICING/MEDICAL NOTES PURPOSES,
            AND PERSONAL INFORMATION IS KEPT CONFIDENTIAL.
          </p>
        </CardContent>
      </Card>

      <Section title="Patient details">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Name and Surname *</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idNumber">ID number *</Label>
            <Input
              id="idNumber"
              required
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address *</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Postal Address *</Label>
            <div className="grid gap-3">
              <Input
                placeholder="Street name and number"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              <Input
                placeholder="Suburb"
                required
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
              />
              <Input
                placeholder="Area code"
                required
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Person Responsible for Account / Main Member of Medical Aid"
        description='If the patient is responsible for the account, tick “Same as above”.'
      >
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-4 shrink-0"
            checked={sameAsPatient}
            onChange={(e) => setSameAsPatient(e.target.checked)}
          />
          Same as above
        </label>
        {!sameAsPatient ? (
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Name and Surname *</Label>
              <Input required={!isStaff} value={respName} onChange={(e) => setRespName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ID number *</Label>
              <Input required={!isStaff} value={respId} onChange={(e) => setRespId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contact Number *</Label>
              <Input
                required={!isStaff}
                value={respContact}
                onChange={(e) => setRespContact(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email address *</Label>
              <Input
                type="email"
                required={!isStaff}
                value={respEmail}
                onChange={(e) => setRespEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Postal Address *</Label>
              <Textarea
                required={!isStaff}
                rows={3}
                value={respPostal}
                onChange={(e) => setRespPostal(e.target.value)}
              />
            </div>
          </div>
        ) : null}
      </Section>

      <Section
        title="Medical Aid Details"
        description="If no Medical Aid, fill N/A."
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Medical Aid *</Label>
            <Input
              required
              value={medicalAid}
              onChange={(e) => setMedicalAid(e.target.value)}
              placeholder="N/A"
            />
          </div>
          <div className="space-y-2">
            <Label>Medical Aid Number *</Label>
            <Input
              required
              value={medicalAidNumber}
              onChange={(e) => setMedicalAidNumber(e.target.value)}
              placeholder="N/A"
            />
          </div>
          <div className="space-y-2">
            <Label>Dependant Code for Patient *</Label>
            <Input
              required
              value={dependantCode}
              onChange={(e) => setDependantCode(e.target.value)}
              placeholder="N/A"
            />
          </div>
        </div>
      </Section>

      <Section title="Consent to release information *">
        <div className="grid gap-2">
          {RELEASE_OPTIONS.map((opt) => (
            <label key={opt} className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="size-4 shrink-0"
                checked={release.includes(opt)}
                onChange={() => toggle(release, opt, setRelease)}
              />
              {opt}
            </label>
          ))}
        </div>
        {release.includes("Other") ? (
          <Input
            placeholder="Please specify"
            value={releaseOther}
            onChange={(e) => setReleaseOther(e.target.value)}
          />
        ) : null}
      </Section>

      <Section title="How did you find out about this practice? *">
        <div className="grid gap-2">
          {SOURCE_OPTIONS.map((opt) => (
            <label key={opt} className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="size-4 shrink-0"
                checked={sources.includes(opt)}
                onChange={() => toggle(sources, opt, setSources)}
              />
              {opt}
            </label>
          ))}
        </div>
        {sources.includes("Other") ? (
          <Input
            placeholder="Please specify"
            value={sourceOther}
            onChange={(e) => setSourceOther(e.target.value)}
          />
        ) : null}
      </Section>

      <Section title={treatmentConsent.title}>
        <ConsentBody markdown={treatmentConsent.body_md} />
        {isStaff ? (
          <div className="space-y-2">
            <Label>Who is signing treatment consent?</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="radio"
                  className="size-4 shrink-0"
                  checked={treatmentSignerRole === "patient"}
                  onChange={() => setTreatmentSignerRole("patient")}
                />
                Patient
              </label>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="radio"
                  className="size-4 shrink-0"
                  checked={treatmentSignerRole === "proxy"}
                  onChange={() => setTreatmentSignerRole("proxy")}
                />
                Proxy / next of kin
              </label>
            </div>
          </div>
        ) : null}
        <SignaturePad
          name="treatmentSignaturePad"
          label={
            isStaff
              ? treatmentSignerRole === "proxy"
                ? "Patient / proxy signature"
                : "Patient signature"
              : "Sign treatment consent"
          }
          onChange={setTreatmentSignature}
        />
      </Section>

      <Section title={accountConsent.title}>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          {accountLines.map((line) => (
            <p
              key={line}
              className={cn(line.startsWith("**") && "font-semibold text-foreground")}
            >
              {line.replaceAll("**", "")}
            </p>
          ))}
        </div>
        {isStaff ? (
          <div className="space-y-2">
            <Label>Account holder full name (if different)</Label>
            <Input
              value={accountTypedName}
              onChange={(e) => setAccountTypedName(e.target.value)}
              placeholder="Name of the person paying the account"
            />
          </div>
        ) : null}
        <SignaturePad
          name="accountSignaturePad"
          label={isStaff ? "Account holder signature" : "Sign account responsibility"}
          onChange={setAccountSignature}
        />
      </Section>

      <Section title="Undertaking *">
        <p className="text-sm text-muted-foreground">I Accept the following…</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>Responsibility for payment of this physiotherapy account in full.</li>
          <li>That fees charged will not necessarily be covered by the patient&apos;s Medical Aid.</li>
          <li>
            Responsibility for outstanding amounts, including all legal expenses arising from
            non-payment.
          </li>
          <li className="font-semibold underline">
            That appointments not kept will be charged 50% of consultation fee if not cancelled
            at least 6 hours beforehand.
          </li>
        </ol>
        <p className="text-sm">I confirm that all the above information is true and correct.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="radio"
              name="undertaking"
              className="size-4 shrink-0"
              checked={undertaking === "yes"}
              onChange={() => setUndertaking("yes")}
              required
            />
            Yes
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="radio"
              name="undertaking"
              className="size-4 shrink-0"
              checked={undertaking === "no"}
              onChange={() => setUndertaking("no")}
            />
            No
          </label>
        </div>
      </Section>

      <Section title="Please Note *">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The practice is contracted out of medical aid. You will be provided with a statement
          for your <span className="font-semibold underline text-foreground">Own Submission</span>.
        </p>
        <ul className="space-y-1 text-sm">
          {pricingPlans.map((plan) => (
              <li key={plan.id}>
                <strong>{plan.title}:</strong> {plan.price} ({plan.period})
              </li>
            ))}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="radio"
              name="pleaseNote"
              className="size-4 shrink-0"
              checked={pleaseNote === "agree"}
              onChange={() => setPleaseNote("agree")}
              required
            />
            Agree and consent given
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="radio"
              name="pleaseNote"
              className="size-4 shrink-0"
              checked={pleaseNote === "disagree"}
              onChange={() => setPleaseNote("disagree")}
            />
            Disagree
          </label>
        </div>
      </Section>

      <Section title="Full name (respond with full name) *">
        <Input
          required
          value={typedFullName}
          onChange={(e) => setTypedFullName(e.target.value)}
          placeholder={isStaff ? "Patient or proxy full legal name" : "Your full legal name"}
        />
      </Section>

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        loading={pending}
        disabled={isStaff ? !treatmentSignature : !treatmentSignature || !accountSignature}
      >
        {isStaff
          ? patientId
            ? "Save consent on file"
            : "Create patient"
          : "Submit informed consent"}
      </Button>
    </form>
  );
}
