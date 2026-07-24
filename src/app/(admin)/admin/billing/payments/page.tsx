import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/features/billing/components/payment-form";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function RecordPaymentPage() {
  await requireStaff();
  const supabase = await createClient();
  const [{ data: patients }, { data: invoices }] = await Promise.all([
    supabase.from("patients").select("id, first_name, last_name").order("last_name").limit(200),
    supabase
      .from("invoices")
      .select("id, invoice_number, total_cents, status")
      .neq("status", "paid")
      .order("issue_date", { ascending: false })
      .limit(100),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Record payment</h1>
          <p className="text-sm text-muted-foreground">Cash, card, or EFT — no card gateway required.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/billing">Back</Link>
        </Button>
      </div>
      <PaymentForm
        patients={(patients ?? []).map((p) => ({
          id: p.id,
          label: `${p.first_name} ${p.last_name}`,
        }))}
        invoices={(invoices ?? []).map((i) => ({
          id: i.id,
          label: `${i.invoice_number} · R ${(i.total_cents / 100).toFixed(2)} · ${i.status}`,
        }))}
      />
    </div>
  );
}
