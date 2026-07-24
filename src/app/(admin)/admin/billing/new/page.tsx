import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/features/billing/components/invoice-form";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function NewInvoicePage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: patients } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .order("last_name")
    .limit(200);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">New invoice</h1>
          <p className="text-sm text-muted-foreground">
            Cash practice — patients may submit statements to medical aids themselves.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/billing">Back</Link>
        </Button>
      </div>
      <InvoiceForm
        patients={(patients ?? []).map((p) => ({
          id: p.id,
          label: `${p.first_name} ${p.last_name}`,
        }))}
      />
    </div>
  );
}
