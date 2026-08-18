import { z } from "zod";

const optionalEmail = z
  .string()
  .email("Invalid email")
  .optional()
  .or(z.literal(""));

const optionalString = z.string().optional().or(z.literal(""));

const accountHolderFields = {
  idNumber: optionalString,
  postalAddress: optionalString,
  medicalAidDependantCode: optionalString,
  billingName: optionalString,
  billingEmail: optionalEmail,
  billingPhone: optionalString,
  billingAddress: optionalString,
  accountHolderRelationship: optionalString,
  inviteAccountHolder: z.coerce.boolean().optional().default(false),
};

export const createPatientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: optionalEmail,
  phone: optionalString,
  dateOfBirth: optionalString,
  medicalAidName: optionalString,
  medicalAidNumber: optionalString,
  notes: optionalString,
  ...accountHolderFields,
});

export const updatePatientSchema = createPatientSchema.extend({
  id: z.string().uuid(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
