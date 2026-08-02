import Link from "next/link";

import { EmptyState } from "@/components/shared/states";
import { InvoiceCard } from "@/components/patient/cards";
import { listPatientInvoices } from "@/features/billing/actions/billing";
import { routes } from "@/config/routes";

export default async function PortalInvoicesPage() {
  const { data: invoices } = await listPatientInvoices();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          View invoices for your consultations. Submit to your medical aid for reimbursement.
        </p>
      </div>

      {!invoices?.length ? (
        <EmptyState
          title="No invoices yet"
          description="Invoices will appear here after your consultations."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={routes.portal.invoice(invoice.id)} className="block">
              <InvoiceCard
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
