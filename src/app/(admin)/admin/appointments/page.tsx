import { PracticeCalendar } from "@/features/booking/components/calendar/practice-calendar";
import {
  listStaffBookingCatalog,
} from "@/features/booking/actions/booking";
import { requireStaff } from "@/lib/auth/guards";

export default async function AppointmentsAdminPage() {
  await requireStaff();
  const { services, practitioners } = await listStaffBookingCatalog();

  const practitionerOptions = practitioners.map((p) => {
    const profile = (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles) as
      | { full_name: string | null }
      | null
      | undefined;
    const name = profile?.full_name ?? "Practitioner";
    return {
      id: p.id,
      label: p.title ? `${name} (${p.title})` : name,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Practice calendar — month, week, and day views with staff booking.
        </p>
      </div>

      <PracticeCalendar
        services={services}
        practitioners={practitionerOptions}
      />
    </div>
  );
}
