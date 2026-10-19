import { AlertTriangle } from "lucide-react";

import { siteConfig } from "@/config/site";
import { formatMonthYear } from "@/lib/format-month-year";
import { cn } from "@/lib/utils";

export function WrittenBy({
  reviewedOn,
  className,
}: {
  /** Existing publish or update date. Omitted when the page has no stored date. */
  reviewedOn?: string | null;
  className?: string;
}) {
  const reviewed = formatMonthYear(reviewedOn);

  return (
    <p className={cn("text-sm font-medium text-foreground", className)}>
      Written by {siteConfig.founder.name}, physiotherapist
      {reviewed ? <span className="font-normal text-muted-foreground"> · Last reviewed {reviewed}</span> : null}
    </p>
  );
}

const GENERAL_URGENT = [
  "chest pain or trouble breathing",
  "sudden weakness, numbness, or trouble walking",
  "new loss of bladder or bowel control",
  "pain after a serious accident",
  "symptoms that are getting worse quickly",
];

const PREGNANCY_URGENT = [
  "bleeding",
  "a severe headache or changes in vision",
  "fainting",
  "a sudden reduction in your baby's movement",
];

export function UrgentHelpNotice({
  variant = "general",
  className,
}: {
  variant?: "general" | "pregnancy";
  className?: string;
}) {
  const items = variant === "pregnancy" ? [...GENERAL_URGENT, ...PREGNANCY_URGENT] : GENERAL_URGENT;

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border bg-secondary/70 p-5 text-foreground shadow-sm",
        className,
      )}
      aria-labelledby="urgent-help-heading"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden />
        <div className="min-w-0 space-y-2">
          <h2 id="urgent-help-heading" className="font-display text-lg font-semibold tracking-tight">
            When to seek urgent medical help
          </h2>
          <p className="text-sm leading-relaxed">
            Get urgent care — call emergency services or go to an emergency unit — if you have:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {variant === "pregnancy" ? (
            <p className="text-sm leading-relaxed">
              If you are pregnant, also contact your maternity care provider for the pregnancy symptoms above.
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground">
            This page is general information from the practice. It is not a diagnosis or personal medical advice.
          </p>
        </div>
      </div>
    </aside>
  );
}

const URGENT_PAGES: Record<string, "general" | "pregnancy"> = {
  "back-pain": "general",
  sciatica: "general",
  "post-operative-rehabilitation": "general",
  "pregnancy-pain": "pregnancy",
  "pregnancy-and-pelvic-discomfort": "pregnancy",
};

export function urgentHelpVariant(slug: string) {
  return URGENT_PAGES[slug] ?? null;
}
