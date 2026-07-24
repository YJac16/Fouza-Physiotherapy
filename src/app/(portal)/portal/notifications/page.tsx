import { EmptyState } from "@/components/shared/states";

export default function PortalNotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Appointment reminders and practice updates.
        </p>
      </div>

      <EmptyState
        title="No notifications"
        description="You will see appointment reminders and updates here."
      />
    </div>
  );
}
