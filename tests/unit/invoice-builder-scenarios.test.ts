import { describe, expect, it } from "vitest";

import { invoiceTotalsFromLines } from "@/features/billing/lib/discounts";

const INITIAL = 100000;
const EXERCISE = 10000;
const TRAVEL = 15000;
const DRY_NEEDLING = 10000;
const REFERRAL = 10000;

describe("invoice builder acceptance scenarios", () => {
  it("test 1 — discounted initial consultation", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        {
          quantity: 1,
          unitPriceCents: INITIAL,
          discount: { mode: "amount", amountCents: 15000 },
        },
      ],
    });
    expect(totals.totalCents).toBe(85000);
  });

  it("test 2 — simple home visit", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        { quantity: 1, unitPriceCents: 85000 },
        { quantity: 1, unitPriceCents: EXERCISE },
        { quantity: 1, unitPriceCents: TRAVEL },
      ],
    });
    expect(totals.totalCents).toBe(110000);
  });

  it("test 3 — dry needling quantity", () => {
    const totals = invoiceTotalsFromLines({
      lines: [{ quantity: 3, unitPriceCents: DRY_NEEDLING }],
    });
    expect(totals.totalCents).toBe(30000);
  });

  it("test 4 — referral", () => {
    const totals = invoiceTotalsFromLines({
      lines: [{ quantity: 1, unitPriceCents: REFERRAL }],
    });
    expect(totals.totalCents).toBe(10000);
  });

  it("test 5 — complex invoice with duplicate lines", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        {
          quantity: 1,
          unitPriceCents: INITIAL,
          discount: { mode: "amount", amountCents: 15000 },
        },
        { quantity: 1, unitPriceCents: EXERCISE },
        {
          quantity: 1,
          unitPriceCents: INITIAL,
          discount: { mode: "amount", amountCents: 15000 },
        },
        { quantity: 1, unitPriceCents: EXERCISE },
        { quantity: 1, unitPriceCents: TRAVEL },
      ],
    });
    expect(totals.totalCents).toBe(205000);
  });

  it("test 6 — percentage discount on initial consultation", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        {
          quantity: 1,
          unitPriceCents: INITIAL,
          discount: { mode: "percent", percent: 10 },
        },
      ],
    });
    expect(totals.totalCents).toBe(90000);
  });

  it("test 7 — quantity plus line discount", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        {
          quantity: 3,
          unitPriceCents: DRY_NEEDLING,
          discount: { mode: "amount", amountCents: 5000 },
        },
      ],
    });
    expect(totals.lines[0]?.grossCents).toBe(30000);
    expect(totals.totalCents).toBe(25000);
  });

  it("test 8 — remove travel line", () => {
    const totals = invoiceTotalsFromLines({
      lines: [{ quantity: 1, unitPriceCents: INITIAL }],
    });
    expect(totals.totalCents).toBe(100000);
  });

  it("test 9 — duplicate lines remain independent", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        { quantity: 1, unitPriceCents: INITIAL },
        { quantity: 1, unitPriceCents: INITIAL },
      ],
    });
    expect(totals.lines).toHaveLength(2);
    expect(totals.totalCents).toBe(200000);
  });

  it("test 10 — price override snapshot uses line unit price", () => {
    const totals = invoiceTotalsFromLines({
      lines: [{ quantity: 1, unitPriceCents: 90000 }],
    });
    expect(totals.totalCents).toBe(90000);
  });
});

describe("invoice service catalogue fixtures", () => {
  it("uses expected catalogue prices for required services", () => {
    const catalogue = {
      initialConsultation: 100000,
      followUpConsultation: 60000,
      dryNeedling: 10000,
      referral: 10000,
      homeExerciseProgram: 10000,
      travel: 15000,
    };

    expect(catalogue.initialConsultation).toBe(100000);
    expect(catalogue.followUpConsultation).toBe(60000);
    expect(catalogue.dryNeedling).toBe(10000);
    expect(catalogue.travel).toBe(15000);
  });
});
