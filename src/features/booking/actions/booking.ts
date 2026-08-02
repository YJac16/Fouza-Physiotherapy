"use server";

import { revalidatePath } from "next/cache";

import {
  confirmBookingSchema,
  holdSchema,
  rescheduleSchema,
  slotQuerySchema,
} from "@/features/booking/schemas/booking";
import { listAvailableSlots } from "@/features/booking/api/slots";
import {
  cancelBooking,
  confirmBooking,
  createHold,
  rescheduleBooking,
} from "@/features/booking/api/bookings";
import { requireStaff } from "@/lib/auth/guards";
import { createServiceClient } from "@/lib/supabase/admin";

export type BookingActionState = {
  error?: string;
  success?: string;
  holdToken?: string;
  appointmentId?: string;
  slots?: { startsAt: string; endsAt: string; label: string }[];
};

export async function fetchSlotsAction(input: unknown): Promise<BookingActionState> {
  const parsed = slotQuerySchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid slot query" };
  try {
    const slots = await listAvailableSlots(parsed.data);
    return { slots };
  } catch {
    return { error: "Unable to load slots. Check Supabase configuration." };
  }
}

export async function createHoldAction(input: unknown): Promise<BookingActionState> {
  const parsed = holdSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid hold request" };
  try {
    const result = await createHold(parsed.data);
    if (result.error || !result.holdToken) return { error: result.error ?? "Hold failed" };
    return { holdToken: result.holdToken, success: "Slot held" };
  } catch {
    return { error: "Unable to hold slot" };
  }
}

export async function confirmBookingAction(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsed = confirmBookingSchema.safeParse({
    holdToken: formData.get("holdToken"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: "Please complete all fields" };

  try {
    const result = await confirmBooking(parsed.data);
    if (result.error || !result.appointmentId) {
      return { error: result.error ?? "Booking failed" };
    }
    return { success: "Booked", appointmentId: result.appointmentId };
  } catch {
    return { error: "Booking unavailable. Try Setmore or call the practice." };
  }
}

export async function adminCancelAppointmentAction(appointmentId: string) {
  const profile = await requireStaff();
  const result = await cancelBooking(appointmentId, profile.id);
  if (!result.error) {
    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
  }
  return result;
}

export async function adminRescheduleAppointmentAction(input: unknown) {
  const profile = await requireStaff();
  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid reschedule request" };
  const result = await rescheduleBooking(parsed.data, profile.id);
  if (!result.error) {
    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
  }
  return result;
}

export async function listBookableCatalog() {
  // Service client so practitioner profile names resolve for anonymous bookers
  // (profiles RLS only allows own-profile / staff reads).
  const supabase = createServiceClient();
  const [{ data: services }, { data: practitioners }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, description, duration_minutes, price_cents")
      .eq("is_active", true)
      .eq("is_bookable_online", true),
    supabase
      .from("practitioners")
      .select("id, title, profile_id, profiles(full_name)")
      .eq("is_active", true),
  ]);
  return { services: services ?? [], practitioners: practitioners ?? [] };
}
