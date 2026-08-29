import { EmptyState, ErrorState } from "@/components/shared/states";
import {
  AddAvailabilityForm,
  AvailabilityExceptionActions,
  AvailabilityRuleActions,
  BlockDateForm,
  formatDay,
} from "@/features/booking/components/add-availability-form";
import { loadAvailabilityAdminData } from "@/features/booking/api/availability";
import { formatClockTime } from "@/features/booking/lib/practitioner-label";

export default async function AdminAvailabilityPage() {
  const { rules, practitioners, exceptions, error } = await loadAvailabilityAdminData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Availability</h1>
        <p className="text-sm text-muted-foreground">
          Weekly hours and date exceptions. These drive online and staff booking slots.
        </p>
      </div>

      {error ? (
        <ErrorState
          title="Could not load availability"
          description={error}
        />
      ) : null}

      {!rules.length ? (
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
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{rule.practitionerLabel}</td>
                  <td className="px-4 py-3">{formatDay(rule.day_of_week)}</td>
                  <td className="px-4 py-3">
                    {formatClockTime(rule.start_time)} – {formatClockTime(rule.end_time)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <AddAvailabilityForm practitioners={practitioners} />
        <BlockDateForm practitioners={practitioners} />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Date exceptions</h2>
        {!exceptions.length ? (
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
                {exceptions.map((ex) => (
                  <tr key={ex.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{ex.exception_date}</td>
                    <td className="px-4 py-3">{ex.practitionerLabel}</td>
                    <td className="px-4 py-3">
                      {ex.is_available
                        ? `Open ${formatClockTime(ex.start_time)}–${formatClockTime(ex.end_time)}`
                        : "Blocked"}
                    </td>
                    <td className="px-4 py-3">{ex.reason ?? "—"}</td>
                    <td className="px-4 py-3">
                      <AvailabilityExceptionActions exceptionId={ex.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
