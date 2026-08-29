"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  confirmLabel: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
  variant?: "outline" | "ghost" | "danger";
  size?: "sm" | "default";
  className?: string;
};

export function ConfirmAction({
  label,
  confirmLabel,
  description,
  onConfirm,
  pending = false,
  variant = "outline",
  size = "sm",
  className,
}: Props) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setArmed(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex max-w-md flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3",
        className,
      )}
    >
      <p className="text-sm text-foreground">{description}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="danger"
          size={size}
          loading={pending}
          onClick={() => void onConfirm()}
        >
          {confirmLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size={size}
          disabled={pending}
          onClick={() => setArmed(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
