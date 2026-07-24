import { EmptyState } from "@/components/shared/states";
import {
  AddAvailabilityForm,
  formatDay,
} from "@/features/booking/components/add-availability-form";
import {
  listAvailabilityRules,
  listPractitioners,
} from "@/features/booking/actions/availability";

export default async function AdminAvailabilityPage() {
  const [{ data: rules }, { data: practitioners }] = await Promise.all([
    listAvailabilityRules(),
    listPractitioners(),
  ]);

  const practitionerOptions =
    practitioners?.map((p) => {
      const profile = (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles) as
        | { full_name: string | null }
        | null
        | undefined;
      const name = profile?.full_name ?? "Practitioner";
      return { id: p.id, label: p.title ? `${name} (${p.title})` : name };
    }) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Availability</h1>
        <p className="text-sm text-muted-foreground">
          Weekly availability rules for practitioners.
        </p>
      </div>

      {!rules?.length ? (
        <EmptyState
          title="No availability rules"
          description="Add weekly hours for each practitioner."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-secondary/40">
              <tr>
                <th className="px-4 py-3 font-medium">Practitioner</th>
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Slot</th>
                <th className="px-4 py-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const practitioner = rule.practitioners as
                  | {
                      title: string | null;
                      profiles: { full_name: string | null } | null;
                    }
                  | null
                  | undefined;
                const profileName =
                  practitioner?.profiles?.full_name ?? "Practitioner";

                return (
                  <tr key={rule.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      {profileName}
                      {practitioner?.title ? ` · ${practitioner.title}` : ""}
                    </td>
                    <td className="px-4 py-3">{formatDay(rule.day_of_week)}</td>
                    <td className="px-4 py-3">
                      {rule.start_time.slice(0, 5)} – {rule.end_time.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3">{rule.slot_minutes} min</td>
                    <td className="px-4 py-3">{rule.is_active ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddAvailabilityForm practitioners={practitionerOptions} />
    </div>
  );
}
