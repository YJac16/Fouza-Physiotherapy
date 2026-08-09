import { EmptyState } from "@/components/shared/states";
import {
  AddAvailabilityForm,
  AvailabilityExceptionActions,
  AvailabilityRuleActions,
  BlockDateForm,
  formatDay,
} from "@/features/booking/components/add-availability-form";
import {
  listAvailabilityExceptions,
  listAvailabilityRules,
  listPractitioners,
} from "@/features/booking/actions/availability";

export default async function AdminAvailabilityPage() {
  const [{ data: rules }, { data: practitioners }, { data: exceptions }] =
    await Promise.all([
      listAvailabilityRules(),
      listPractitioners(),
      listAvailabilityExceptions(),
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
          Weekly hours and date exceptions. These drive online and staff booking slots.
        </p>
      </div>

      {!rules?.length ? (
        <EmptyState
          title="No availability rules"
          description="Add weekly hours for each practitioner."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-secondary/40">
              <tr>
                <th className="px-4 py-3 font-medium">Practitioner</th>
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Slot</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Actions</th>
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
                    <td className="px-4 py-3">
                      <AvailabilityRuleActions
                        ruleId={rule.id}
                        isActive={Boolean(rule.is_active)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <AddAvailabilityForm practitioners={practitionerOptions} />
        <BlockDateForm practitioners={practitionerOptions} />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Date exceptions</h2>
        {!exceptions?.length ? (
          <EmptyState
            title="No exceptions"
            description="Blocked dates and custom open hours will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-secondary/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Practitioner</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((ex) => {
                  const practitioner = ex.practitioners as
                    | {
                        title: string | null;
                        profiles: { full_name: string | null } | null;
                      }
                    | null
                    | undefined;
                  const profileName =
                    practitioner?.profiles?.full_name ?? "Practitioner";
                  return (
                    <tr key={ex.id} className="border-b last:border-0">
                      <td className="px-4 py-3">{ex.exception_date}</td>
                      <td className="px-4 py-3">{profileName}</td>
                      <td className="px-4 py-3">
                        {ex.is_available
                          ? `Open ${ex.start_time?.slice(0, 5) ?? "?"}–${ex.end_time?.slice(0, 5) ?? "?"}`
                          : "Blocked"}
                      </td>
                      <td className="px-4 py-3">{ex.reason ?? "—"}</td>
                      <td className="px-4 py-3">
                        <AvailabilityExceptionActions exceptionId={ex.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
