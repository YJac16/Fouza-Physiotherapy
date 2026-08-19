"use client";

import type { ReactNode } from "react";

import { formatZar } from "@/features/billing/lib/money";
import { Button } from "@/components/ui/button";

type Props = {
  totalCents: number;
  submitLabel: string;
  pending?: boolean;
  disabled?: boolean;
  children?: ReactNode;
};

export function StickyCreateBar({
  totalCents,
  submitLabel,
  pending,
  disabled,
  children,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">{formatZar(totalCents)}</p>
        </div>
        {children ?? (
          <Button type="submit" loading={pending} disabled={disabled} className="min-w-[9rem]">
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
