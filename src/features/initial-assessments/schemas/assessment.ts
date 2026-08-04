import { z } from "zod";

export const regionAnnotationSchema = z.object({
  regionId: z.string().min(1),
  view: z.enum(["anterior", "posterior"]),
  note: z.string().min(1).max(2000),
  pain: z.number().int().min(0).max(10).optional().nullable(),
});

export const initialAssessmentSchema = z.object({
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  chiefComplaint: z.string().optional(),
  history: z.string().optional(),
  painScale: z.number().int().min(0).max(10).optional().nullable(),
  observations: z.string().optional(),
  plan: z.string().optional(),
  regionNotes: z.array(regionAnnotationSchema).default([]),
});

export type RegionAnnotation = z.infer<typeof regionAnnotationSchema>;
export type InitialAssessmentInput = z.infer<typeof initialAssessmentSchema>;
