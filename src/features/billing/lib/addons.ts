/** Preset invoice add-ons (amounts in cents). */
export const INVOICE_ADDONS = {
  dryNeedling: {
    description: "Dry needling",
    unitPriceCents: 8000, // R80
    defaultQuantity: 1,
  },
  needles: {
    description: "Needles",
    unitPriceCents: 0, // staff sets unit price; quantity adjustable
    defaultQuantity: 1,
  },
  referralLetter: {
    description: "Referral letter",
    unitPriceCents: 10000, // R100
    defaultQuantity: 1,
  },
  homeVisitConsultation: {
    description: "Home visit consultation",
    unitPriceCents: 100000, // R1000 (clinic + R200 travel)
    defaultQuantity: 1,
  },
  homeFollowUp: {
    description: "Home follow-up",
    unitPriceCents: 90000, // R900 (clinic + R200 travel)
    defaultQuantity: 1,
  },
} as const;

export const EDITABLE_INVOICE_STATUSES = new Set(["draft", "sent", "overdue"]);
