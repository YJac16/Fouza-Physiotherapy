import { EmptyState } from "@/components/shared/states";
import { InvoiceCard } from "@/components/patient/cards";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BillingAdminPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .order("issue_date", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Cash practice invoices and payments. Patients claim from medical aids using statements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/billing/statements">Statements</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/billing/payments">Record payment</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/billing/new">New invoice</Link>
          </Button>
        </div>
      </div>

      {!invoices?.length ? (
        <EmptyState title="No invoices yet" description="Create an invoice after a consultation." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoiceNumber={invoice.invoice_number}
              date={invoice.issue_date}
              amount={`R ${(invoice.total_cents / 100).toFixed(2)}`}
              status={
                invoice.status === "paid"
                  ? "paid"
                  : invoice.status === "overdue"
                    ? "overdue"
                    : "pending"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
