import { EmptyState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const statusVariant: Record<string, "secondary" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  sent: "success",
  failed: "destructive",
  cancelled: "secondary",
};

export default async function AdminNotificationsPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("notification_outbox")
    .select("id, channel, template_key, recipient, status, scheduled_for, sent_at, last_error")
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Recent practice emails and reminders. This is a log — nothing is sent from this page.
        </p>
      </div>

      {!rows?.length ? (
        <EmptyState
          title="No notifications yet"
          description="Appointment reminders and invoice emails will appear here after they are queued."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-secondary/40">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Template</th>
                <th className="px-4 py-3 font-medium">Recipient</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(row.sent_at ?? row.scheduled_for).toLocaleString("en-ZA", {
                      timeZone: "Africa/Johannesburg",
                    })}
                  </td>
                  <td className="px-4 py-3">{row.template_key}</td>
                  <td className="px-4 py-3">{row.recipient}</td>
                  <td className="px-4 py-3 capitalize">{row.channel}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[row.status] ?? "secondary"}>{row.status}</Badge>
                    {row.last_error ? (
                      <p className="mt-1 max-w-xs text-xs text-destructive">{row.last_error}</p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
