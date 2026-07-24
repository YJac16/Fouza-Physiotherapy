"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import {
  createPatientAction,
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

export interface CreatePatientFormProps {
  /** Redirect to the new patient's detail page after successful creation. */
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
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalAidName">Medical aid</Label>
            <Input id="medicalAidName" name="medicalAidName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalAidNumber">Medical aid number</Label>
            <Input id="medicalAidNumber" name="medicalAidNumber" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>
          {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
          {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
          <div className="sm:col-span-2">
            <Button type="submit" loading={pending}>
              Create patient
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
