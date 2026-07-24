import { z } from "zod";

export const slotQuerySchema = z.object({
  practitionerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const holdSchema = z.object({
  practitionerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  email: z.string().email().optional(),
});

export const confirmBookingSchema = z.object({
  holdToken: z.string().min(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
});

export type SlotQuery = z.infer<typeof slotQuerySchema>;
export type HoldInput = z.infer<typeof holdSchema>;
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
