"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
  id,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        id={id}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-expanded={open}
        aria-label={ariaLabel ?? placeholder}
        className="h-11 w-full justify-start font-normal"
        onClick={() => setOpen((prev) => !prev)}
      >
        <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
        <span className={cn(!value && "text-muted-foreground")}>
          {value ? format(value, "PPP") : placeholder}
        </span>
      </Button>

      {open ? (
        <div className="absolute z-50 mt-2 animate-slide-up">
          <Calendar
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export { DatePicker };
