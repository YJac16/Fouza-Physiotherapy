import { z } from "zod";

export const letterTypeSchema = z.enum(["proof_of_attendance", "medical_referral"]);

const optionalEmail = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    const trimmed = value?.trim() ?? "";
    return trimmed || null;
  })
  .refine((value) => value == null || z.string().email().safeParse(value).success, {
    message: "Enter a valid email address",
  });

export const createLetterSchema = z.object({
  patientId: z.string().uuid(),
  letterType: letterTypeSchema,
  letterDate: z.string().min(8),
  attendanceDate: z.string().optional().nullable(),
  appointmentId: z.string().uuid().optional().nullable(),
  recipientName: z.string().optional().nullable(),
  recipientEmail: optionalEmail,
  patientAge: z.string().optional().nullable(),
  patientSex: z.string().optional().nullable(),
  presentingComplaint: z.string().optional().nullable(),
  findings: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  physiotherapistName: z.string().min(2),
  qualifications: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
});

export const updateLetterSchema = z.object({
  id: z.string().uuid(),
  letterDate: z.string().min(8),
  attendanceDate: z.string().optional().nullable(),
  appointmentId: z.string().uuid().optional().nullable(),
  recipientName: z.string().optional().nullable(),
  recipientEmail: optionalEmail,
  patientAge: z.string().optional().nullable(),
  patientSex: z.string().optional().nullable(),
  subjectLine: z.string().optional().nullable(),
  body: z.string().min(20, "Letter body is too short"),
  physiotherapistName: z.string().min(2),
  qualifications: z.string().optional().nullable(),
  practiceName: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
});

export const signLetterSchema = z.object({
  id: z.string().uuid(),
  signatureData: z
    .string()
    .min(80, "Please sign the letter")
    .refine((value) => value.startsWith("data:image/"), "Invalid signature"),
});

export const letterTemplateSchema = z.object({
  letterType: letterTypeSchema,
  title: z.string().min(4),
  body: z.string().min(20),
  physiotherapistName: z.string().min(2),
  qualifications: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
});

export type CreateLetterInput = z.infer<typeof createLetterSchema>;
export type UpdateLetterInput = z.infer<typeof updateLetterSchema>;
