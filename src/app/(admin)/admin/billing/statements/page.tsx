import Link from "next/link";

import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { generateStatementSummary } from "@/features/billing/actions/billing";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function StatementsPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; from?: string; to?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: patients } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .order("last_name")
    .limit(200);

  const to = params.to ?? new Date().toISOString().slice(0, 10);
  const from =
    params.from ??
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const summary =
    params.patientId != null
      ? await generateStatementSummary(params.patientId, from, to)
      : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Statements</h1>
          <p className="text-sm text-muted-foreground">
            Period invoiced versus cash collected (last day included). Void invoices are excluded.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/billing">Billing</Link>
        </Button>
      </div>

      <form className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-4">
        <select
          name="patientId"
          defaultValue={params.patientId}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          required
        >
          <option value="">Patient</option>
          {(patients ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
        />
        <Button type="submit">Generate</Button>
      </form>

      {!summary ? (
        <EmptyState title="Select a patient" description="Choose a period to generate a statement summary." />
      ) : (
        <div className="space-y-4 rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">
            {summary.period.from} → {summary.period.to}
          </p>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Invoiced</dt>
              <dd className="font-display text-xl">R {(summary.invoicedCents / 100).toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Paid</dt>
              <dd className="font-display text-xl">R {(summary.paidCents / 100).toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Balance</dt>
              <dd className="font-display text-xl">R {(summary.balanceCents / 100).toFixed(2)}</dd>
            </div>
          </dl>
          <ul className="space-y-2 text-sm">
            {summary.invoices.map((inv) => (
              <li key={inv.id} className="flex justify-between border-b border-border/60 py-2">
                <span>
                  {inv.invoice_number} · {inv.issue_date}
                </span>
                <span>R {(inv.total_cents / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
