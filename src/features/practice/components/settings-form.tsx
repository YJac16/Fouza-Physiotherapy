"use client";

import { useActionState } from "react";

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

export function PracticeSettingsForm({ defaults }: PracticeSettingsFormProps) {
  const [state, action, pending] = useActionState(savePracticeSettingsAction, initial);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-h5">Practice details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid max-w-lg gap-4">
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

            <div className="border-t border-border/70 pt-4">
              <h3 className="mb-3 text-sm font-semibold">Banking details (invoices)</h3>
              <div className="grid gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    defaultValue={defaults.accountNumber || DEFAULT_BANKING.accountNumber}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch code</Label>
                  <Input
                    id="branchCode"
                    name="branchCode"
                    defaultValue={defaults.branchCode || DEFAULT_BANKING.branchCode}
                  />
                </div>
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
              </div>
            </div>

            {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
            {state.success ? (
              <FormMessage tone="success">{state.success}</FormMessage>
            ) : null}
            <Button type="submit" loading={pending}>
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
