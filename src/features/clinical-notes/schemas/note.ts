import { z } from "zod";

export const soapNoteSchema = z.object({
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
});

export type SoapNoteInput = z.infer<typeof soapNoteSchema>;
