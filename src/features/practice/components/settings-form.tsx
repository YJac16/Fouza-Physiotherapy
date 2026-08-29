"use client";

import { useActionState, useState } from "react";

import {
  savePracticeSettingsAction,
  type SettingsActionState,
} from "@/features/practice/actions/settings";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_BANKING } from "@/features/billing/components/invoice-document";

const initial: SettingsActionState = {};

export interface PracticeSettingsFormProps {
  defaults: {
    practiceName: string;
    contactEmail: string;
    contactPhone: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    accountType: string;
    proofEmail: string;
  };
}

function maskSecret(value: string, visible = 4) {
  const trimmed = value.trim();
  if (!trimmed) return "Not set";
  if (trimmed.length <= visible) return "•".repeat(Math.max(4, trimmed.length));
  return `${"•".repeat(Math.max(4, trimmed.length - visible))}${trimmed.slice(-visible)}`;
}

function SecretField({
  id,
  name,
  label,
  value,
  revealed,
  onReveal,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  revealed: boolean;
  onReveal: () => void;
}) {
  if (!revealed) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input id={id} value={maskSecret(value)} readOnly className="font-mono tracking-wide" />
          <input type="hidden" name={name} value={value} />
          <Button type="button" variant="outline" size="sm" onClick={onReveal}>
            Reveal to edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} defaultValue={value} autoComplete="off" />
    </div>
  );
}

export function PracticeSettingsForm({ defaults }: PracticeSettingsFormProps) {
  const [practiceState, practiceAction, practicePending] = useActionState(
    savePracticeSettingsAction,
    initial,
  );
  const [bankingState, bankingAction, bankingPending] = useActionState(
    savePracticeSettingsAction,
    initial,
  );
  const [revealAccount, setRevealAccount] = useState(false);
  const [revealBranch, setRevealBranch] = useState(false);
  const [confirmBanking, setConfirmBanking] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-h5">Practice details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={practiceAction} className="grid max-w-lg gap-4">
            <input type="hidden" name="section" value="practice" />
            <div className="space-y-2">
              <Label htmlFor="practiceName">Practice name</Label>
              <Input
                id="practiceName"
                name="practiceName"
                defaultValue={defaults.practiceName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={defaults.contactEmail}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={defaults.contactPhone}
              />
            </div>
            {practiceState.error ? <FormMessage tone="error">{practiceState.error}</FormMessage> : null}
            {practiceState.success ? (
              <FormMessage tone="success">{practiceState.success}</FormMessage>
            ) : null}
            <Button type="submit" loading={practicePending}>
              Save practice details
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-h5">Banking details (invoices)</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={bankingAction} className="grid max-w-lg gap-4">
            <input type="hidden" name="section" value="banking" />
            <p className="text-sm text-muted-foreground">
              Account number and branch code are masked until you choose to edit them.
            </p>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank</Label>
              <Input
                id="bankName"
                name="bankName"
                defaultValue={defaults.bankName || DEFAULT_BANKING.bankName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                name="accountName"
                defaultValue={defaults.accountName || DEFAULT_BANKING.accountName}
              />
            </div>
            <SecretField
              id="accountNumber"
              name="accountNumber"
              label="Account number"
              value={defaults.accountNumber || DEFAULT_BANKING.accountNumber}
              revealed={revealAccount}
              onReveal={() => setRevealAccount(true)}
            />
            <SecretField
              id="branchCode"
              name="branchCode"
              label="Branch code"
              value={defaults.branchCode || DEFAULT_BANKING.branchCode}
              revealed={revealBranch}
              onReveal={() => setRevealBranch(true)}
            />
            <div className="space-y-2">
              <Label htmlFor="accountType">Account type</Label>
              <Input
                id="accountType"
                name="accountType"
                defaultValue={defaults.accountType || DEFAULT_BANKING.accountType}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proofEmail">Proof of payment email</Label>
              <Input
                id="proofEmail"
                name="proofEmail"
                type="email"
                defaultValue={defaults.proofEmail || DEFAULT_BANKING.proofEmail}
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="confirmBanking"
                value="true"
                checked={confirmBanking}
                onChange={(event) => setConfirmBanking(event.target.checked)}
                className="mt-1 size-4 rounded border-input"
              />
              <span>
                I confirm these banking details are correct and should appear on invoices.
              </span>
            </label>
            {bankingState.error ? <FormMessage tone="error">{bankingState.error}</FormMessage> : null}
            {bankingState.success ? (
              <FormMessage tone="success">{bankingState.success}</FormMessage>
            ) : null}
            <Button type="submit" loading={bankingPending} disabled={!confirmBanking}>
              Save banking details
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
