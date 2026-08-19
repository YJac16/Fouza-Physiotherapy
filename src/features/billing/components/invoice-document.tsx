import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export type InvoiceDocumentLine = {
  description: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
  treatmentCode?: string | null;
  discountPercent?: number | null;
  discountCents?: number;
  vatPercent?: number;
};

export type InvoiceDocumentBanking = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  proofEmail: string;
};

export type InvoiceDocumentProps = {
  variant?: "invoice" | "receipt";
  invoiceNumber: string;
  reference?: string | null;
  issueDate: string;
  dueDate?: string | null;
  salesRep?: string;
  practiceName?: string;
  practiceAddress?: string;
  patientName: string;
  patientAddress?: string | null;
  accountHolderName?: string | null;
  accountHolderEmail?: string | null;
  lines: InvoiceDocumentLine[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  discountCents?: number;
  discountNote?: string | null;
  balanceDueCents?: number;
  amountPaidCents?: number;
  paymentMethod?: string | null;
  paidAt?: string | null;
  banking: InvoiceDocumentBanking;
  className?: string;
};

function money(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

function formatDate(value: string) {
  const d = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-ZA");
}

export const DEFAULT_BANKING: InvoiceDocumentBanking = {
  bankName: "FNB",
  accountName: "Fouza Abrahams",
  accountNumber: "62879578270",
  branchCode: "250655",
  accountType: "Cheque Account",
  proofEmail: siteConfig.email,
};

export function InvoiceReceiptDocument({
  variant = "invoice",
  invoiceNumber,
  reference,
  issueDate,
  dueDate,
  salesRep = siteConfig.founder.name.toUpperCase(),
  practiceName = siteConfig.practiceName,
  practiceAddress = `${siteConfig.address}, ${siteConfig.region}`,
  patientName,
  patientAddress,
  accountHolderName,
  accountHolderEmail,
  lines,
  subtotalCents,
  taxCents,
  totalCents,
  discountCents = 0,
  discountNote,
  balanceDueCents,
  amountPaidCents,
  paymentMethod,
  paidAt,
  banking,
  className,
}: InvoiceDocumentProps) {
  const isReceipt = variant === "receipt";
  const exclusive = subtotalCents;
  const grandTotal = totalCents;
  const balance =
    balanceDueCents ?? (isReceipt ? 0 : Math.max(grandTotal - (amountPaidCents ?? 0), 0));
  const showLineDiscounts = lines.some((line) => (line.discountCents ?? 0) > 0);

  return (
    <article
      className={cn(
        "invoice-document mx-auto max-w-[210mm] bg-white text-[#1a1a1a] shadow-sm print:shadow-none",
        className,
      )}
    >
      <div className="space-y-6 p-6 sm:p-8 print:p-0">
        <header className="flex flex-col gap-6 border-b border-[#d8d8d8] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="shrink-0">
            <Image
              src="/fouza-physiotherapy-logo-no-background.png"
              alt={practiceName}
              width={220}
              height={64}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
          <div className="min-w-0 text-left sm:text-right">
            <h1 className="text-3xl font-bold tracking-wide text-[#111]">
              {isReceipt ? "RECEIPT" : "INVOICE"}
            </h1>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-[#666]">Number:</dt>
                <dd className="font-medium">{invoiceNumber}</dd>
              </div>
              {reference ? (
                <div className="flex gap-2 sm:justify-end">
                  <dt className="text-[#666]">Reference:</dt>
                  <dd className="font-medium">{reference}</dd>
                </div>
              ) : null}
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-[#666]">Date:</dt>
                <dd className="font-medium">{formatDate(issueDate)}</dd>
              </div>
              {dueDate ? (
                <div className="flex gap-2 sm:justify-end">
                  <dt className="text-[#666]">Due Date:</dt>
                  <dd className="font-medium">{formatDate(dueDate)}</dd>
                </div>
              ) : null}
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-[#666]">Sales Rep:</dt>
                <dd className="font-medium">{salesRep}</dd>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-[#666]">Page:</dt>
                <dd className="font-medium">1/1</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#666]">From</h2>
            <p className="mt-1 text-base font-semibold uppercase">{practiceName}</p>
            <p className="mt-2 text-sm text-[#444]">
              <span className="font-medium text-[#666]">Postal Address:</span>
              <br />
              {practiceAddress}
            </p>
            <p className="mt-2 text-sm text-[#444]">
              <span className="font-medium text-[#666]">Physical Address:</span>
              <br />
              {practiceAddress}
            </p>
            <p className="mt-2 text-sm text-[#444]">
              <span className="font-medium text-[#666]">VAT NO:</span>
            </p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#666]">To</h2>
            <p className="mt-1 text-base font-semibold uppercase">{patientName}</p>
            {accountHolderName || accountHolderEmail ? (
              <p className="mt-2 text-sm text-[#444]">
                <span className="font-medium text-[#666]">Account:</span>
                <br />
                {[accountHolderName, accountHolderEmail].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <p className="mt-2 text-sm text-[#444]">
              <span className="font-medium text-[#666]">Customer VAT NO:</span>
            </p>
            <p className="mt-2 text-sm text-[#444]">
              <span className="font-medium text-[#666]">Postal Address:</span>
              <br />
              {patientAddress || "—"}
            </p>
            <p className="mt-2 text-sm text-[#444]">
              <span className="font-medium text-[#666]">Physical Address:</span>
              <br />
              {patientAddress || "—"}
            </p>
          </section>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#ececec] text-left italic text-[#444]">
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Quantity</th>
                <th className="px-3 py-2 font-medium">Unit Price</th>
                {showLineDiscounts ? <th className="px-3 py-2 font-medium">Discount</th> : null}
                {taxCents > 0 ? <th className="px-3 py-2 font-medium">VAT %</th> : null}
                <th className="px-3 py-2 font-medium">{taxCents > 0 ? "Excl. Total" : "Amount"}</th>
                {taxCents > 0 ? <th className="px-3 py-2 font-medium">Incl. Total</th> : null}
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => {
                const label = line.treatmentCode
                  ? `${line.treatmentCode} - ${line.description}`
                  : line.description;
                const excl = line.amountCents;
                const vatPct = line.vatPercent ?? 0;
                const lineDiscount = line.discountCents ?? 0;
                return (
                  <tr key={`${label}-${index}`} className="border-b border-[#eee]">
                    <td className="px-3 py-2.5">{label}</td>
                    <td className="px-3 py-2.5">{line.quantity.toFixed(1)}</td>
                    <td className="px-3 py-2.5">{money(line.unitPriceCents)}</td>
                    {showLineDiscounts ? (
                      <td className="px-3 py-2.5">
                        {lineDiscount > 0
                          ? `${money(lineDiscount)}${
                              line.discountPercent ? ` (${line.discountPercent}%)` : ""
                            }`
                          : "—"}
                      </td>
                    ) : null}
                    {taxCents > 0 ? <td className="px-3 py-2.5">{vatPct.toFixed(2)}%</td> : null}
                    <td className="px-3 py-2.5">{money(excl)}</td>
                    {taxCents > 0 ? (
                      <td className="px-3 py-2.5 font-medium">{money(excl)}</td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <section className="space-y-1 text-sm">
            <h2 className="mb-2 text-sm font-semibold">Banking Details:</h2>
            <p>
              <span className="text-[#666]">Bank:</span> {banking.bankName}
            </p>
            <p>
              <span className="text-[#666]">Account Name:</span> {banking.accountName}
            </p>
            <p>
              <span className="text-[#666]">Account Number:</span> {banking.accountNumber}
            </p>
            <p>
              <span className="text-[#666]">Branch Code:</span> {banking.branchCode}
            </p>
            <p>
              <span className="text-[#666]">Account Type:</span> {banking.accountType}
            </p>
            <p className="pt-3 text-[#444]">
              Kindly send proof of payment to {banking.proofEmail}
            </p>
            {isReceipt && (paymentMethod || paidAt) ? (
              <p className="pt-3 text-[#444]">
                {paymentMethod ? `Paid via ${paymentMethod}` : "Paid"}
                {paidAt ? ` on ${formatDate(paidAt)}` : ""}
              </p>
            ) : null}
          </section>

          <section className="space-y-1.5 text-sm sm:text-right">
            <div className="flex justify-between gap-6 sm:justify-end">
              <span className="text-[#666]">Total Discount</span>
              <span>{money(discountCents)}</span>
            </div>
            {discountNote ? (
              <p className="text-xs text-[#666] sm:text-right">{discountNote}</p>
            ) : null}
            {taxCents > 0 ? (
              <>
                <div className="flex justify-between gap-6 sm:justify-end">
                  <span className="text-[#666]">Total Exclusive</span>
                  <span>{money(exclusive)}</span>
                </div>
                <div className="flex justify-between gap-6 sm:justify-end">
                  <span className="text-[#666]">Total VAT</span>
                  <span>{money(taxCents)}</span>
                </div>
                <div className="flex justify-between gap-6 sm:justify-end">
                  <span className="text-[#666]">Sub Total</span>
                  <span>{money(exclusive + taxCents)}</span>
                </div>
              </>
            ) : null}
            <div className="flex justify-between gap-6 border-t border-[#ddd] pt-2 text-base font-semibold sm:justify-end">
              <span>Grand Total</span>
              <span>{money(grandTotal)}</span>
            </div>
            <div className="flex justify-between gap-6 pt-2 text-lg font-bold sm:justify-end">
              <span>{isReceipt ? "AMOUNT PAID" : "BALANCE DUE"}</span>
              <span>{money(isReceipt ? (amountPaidCents ?? grandTotal) : balance)}</span>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
