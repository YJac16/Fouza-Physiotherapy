"use client";

import { useTransition } from "react";

import { setSelectedPortalPatientAction } from "@/features/patients/actions/patients";
import type { AccessiblePatient } from "@/features/patients/lib/access";
import { patientDisplayName } from "@/features/patients/lib/access";

export function PortalPatientSwitcher({
  patients,
  selectedPatientId,
}: {
  patients: AccessiblePatient[];
  selectedPatientId: string | null;
}) {
  const [pending, startTransition] = useTransition();
  if (patients.length < 2) return null;

  return (
    <label className="flex min-w-0 max-w-[46vw] items-center gap-2 sm:max-w-xs">
      <span className="hidden text-xs text-muted-foreground sm:inline">Viewing</span>
      <select
        className="h-9 min-w-0 flex-1 rounded-xl border border-border bg-background px-2 text-sm"
        value={selectedPatientId ?? patients[0]?.id}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(async () => {
            await setSelectedPortalPatientAction(next);
          });
        }}
      >
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patientDisplayName(patient)}
            {patient.access === "contact" ? " (family)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
