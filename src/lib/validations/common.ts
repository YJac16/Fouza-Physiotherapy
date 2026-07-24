import { z } from "zod";

/** Shared primitives used across feature schemas. */
export const emailSchema = z.string().email("Enter a valid email address");
export const phoneSchema = z.string().min(7, "Enter a valid phone number");
export const uuidSchema = z.string().uuid();
export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");
