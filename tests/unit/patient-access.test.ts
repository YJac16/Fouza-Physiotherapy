import { describe, expect, it } from "vitest";

import {
  canAccessPatient,
  resolveAccessiblePatients,
} from "@/features/patients/lib/access";

const son = "son-profile";
const stranger = "stranger-profile";
const mum = {
  id: "mum-id",
  profileId: null as string | null,
  firstName: "Amina",
  lastName: "Khan",
  email: "amina@example.com",
  phone: "0210000001",
  verifiedAccount: true,
  informedConsentSigned: true,
};
const self = {
  id: "self-id",
  profileId: son,
  firstName: "Yusuf",
  lastName: "Khan",
  email: "yusuf@example.com",
  phone: "0210000002",
  verifiedAccount: true,
  informedConsentSigned: true,
};

describe("patient access helper", () => {
  it("returns the viewer's own patient record", () => {
    const result = resolveAccessiblePatients(son, [self], []);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("self-id");
    expect(result[0]?.access).toBe("self");
    expect(result[0]?.canBook).toBe(true);
  });

  it("returns linked family contacts", () => {
    const result = resolveAccessiblePatients(son, [], [
      {
        ...mum,
        profileId: son,
        patientId: mum.id,
        canViewPortal: true,
        canBook: true,
        isAccountHolder: true,
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("mum-id");
    expect(result[0]?.access).toBe("contact");
    expect(result[0]?.isAccountHolder).toBe(true);
  });

  it("merges own record with managed parents", () => {
    const result = resolveAccessiblePatients(son, [self], [
      {
        ...mum,
        profileId: son,
        patientId: mum.id,
        canViewPortal: true,
        canBook: true,
        isAccountHolder: true,
      },
    ]);
    expect(result.map((row) => row.id).sort()).toEqual(["mum-id", "self-id"]);
  });

  it("excludes strangers and contacts without portal access", () => {
    const hidden = resolveAccessiblePatients(stranger, [self], [
      {
        ...mum,
        profileId: son,
        patientId: mum.id,
        canViewPortal: true,
        canBook: true,
        isAccountHolder: true,
      },
    ]);
    expect(hidden).toEqual([]);

    const noPortal = resolveAccessiblePatients(son, [], [
      {
        ...mum,
        profileId: son,
        patientId: mum.id,
        canViewPortal: false,
        canBook: false,
        isAccountHolder: true,
      },
    ]);
    expect(noPortal).toEqual([]);
  });

  it("looks up an accessible patient by id", () => {
    const patients = resolveAccessiblePatients(son, [self], [
      {
        ...mum,
        profileId: son,
        patientId: mum.id,
        canViewPortal: true,
        canBook: true,
        isAccountHolder: true,
      },
    ]);
    expect(canAccessPatient(patients, "mum-id")?.firstName).toBe("Amina");
    expect(canAccessPatient(patients, "missing")).toBeNull();
  });
});
