"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/ui/form-message";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ConsentCheckboxProps {
  id: string;
  label: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function ConsentCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  error,
  required,
  className,
}: ConsentCheckboxProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange?.(value === true)}
          aria-invalid={Boolean(error) || undefined}
          className="mt-0.5"
        />
        <Label htmlFor={id} className="cursor-pointer text-sm font-normal leading-relaxed">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      </div>
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
    </div>
  );
}

export interface SignaturePadPlaceholderProps {
  className?: string;
  label?: string;
}

/** Visual placeholder — replace with a real signature pad in a later phase. */
export function SignaturePadPlaceholder({
  className,
  label = "Patient signature",
}: SignaturePadPlaceholderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40"
        role="img"
        aria-label="Signature pad placeholder"
      >
        <p className="text-sm text-muted-foreground">Sign here</p>
      </div>
    </div>
  );
}
