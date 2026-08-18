"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import {
  createPatientAction,
  updatePatientAction,
  type PatientActionState,
} from "@/features/patients/actions/patients";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";

const initial: PatientActionState = {};

export type PatientFormValues = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  idNumber?: string | null;
  postalAddress?: string | null;
  medicalAidName?: string | null;
  medicalAidNumber?: string | null;
  medicalAidDependantCode?: string | null;
  notes?: string | null;
  billingName?: string | null;
  billingEmail?: string | null;
  billingPhone?: string | null;
  billingAddress?: string | null;
  accountHolderRelationship?: string | null;
};

function PatientFields({ values }: { values?: PatientFormValues }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" name="firstName" required defaultValue={values?.firstName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" name="lastName" required defaultValue={values?.lastName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Patient email</Label>
        <Input id="email" name="email" type="email" defaultValue={values?.email ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Patient phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={values?.phone ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of birth</Label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          defaultValue={values?.dateOfBirth ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="idNumber">ID number</Label>
        <Input id="idNumber" name="idNumber" defaultValue={values?.idNumber ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="postalAddress">Postal address</Label>
        <Textarea
          id="postalAddress"
          name="postalAddress"
          rows={2}
          defaultValue={values?.postalAddress ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="medicalAidName">Medical aid</Label>
        <Input
          id="medicalAidName"
          name="medicalAidName"
          defaultValue={values?.medicalAidName ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="medicalAidNumber">Medical aid number</Label>
        <Input
          id="medicalAidNumber"
          name="medicalAidNumber"
          defaultValue={values?.medicalAidNumber ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="medicalAidDependantCode">Dependant code</Label>
        <Input
          id="medicalAidDependantCode"
          name="medicalAidDependantCode"
          defaultValue={values?.medicalAidDependantCode ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Clinical / admin notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={values?.notes ?? ""} />
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="font-medium">Person responsible for the account</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use this when a family member pays, for example a son booking home treatment for a
          parent. Invoices email this person. Optionally invite them to the portal.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="billingName">Account holder name</Label>
        <Input id="billingName" name="billingName" defaultValue={values?.billingName ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountHolderRelationship">Relationship</Label>
        <Input
          id="accountHolderRelationship"
          name="accountHolderRelationship"
          placeholder="Son, daughter, spouse…"
          defaultValue={values?.accountHolderRelationship ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="billingEmail">Account holder email</Label>
        <Input
          id="billingEmail"
          name="billingEmail"
          type="email"
          defaultValue={values?.billingEmail ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="billingPhone">Account holder phone</Label>
        <Input
          id="billingPhone"
          name="billingPhone"
          type="tel"
          defaultValue={values?.billingPhone ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="billingAddress">Account holder address</Label>
        <Textarea
          id="billingAddress"
          name="billingAddress"
          rows={2}
          defaultValue={values?.billingAddress ?? ""}
        />
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" name="inviteAccountHolder" value="true" className="size-4" />
        Invite account holder to the family portal
      </label>
    </>
  );
}

export interface CreatePatientFormProps {
  redirectOnSuccess?: boolean;
}

export function CreatePatientForm({ redirectOnSuccess = true }: CreatePatientFormProps = {}) {
  const [state, action, pending] = useActionState(createPatientAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (redirectOnSuccess && state.success && state.id) {
      router.push(routes.admin.patient(state.id));
    }
  }, [redirectOnSuccess, state.success, state.id, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">Add patient</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <PatientFields />
          {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
          {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
          <div>
            <Button type="submit" loading={pending}>
              Create patient
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function EditPatientForm({ values }: { values: PatientFormValues & { id: string } }) {
  const [state, action, pending] = useActionState(updatePatientAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">Patient and account details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="id" value={values.id} />
          <PatientFields values={values} />
          {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
          {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
          <div>
            <Button type="submit" loading={pending}>
              Save patient
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
