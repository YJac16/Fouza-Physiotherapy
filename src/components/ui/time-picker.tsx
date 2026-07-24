"use client";

import { Clock } from "lucide-react";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function buildSlots(stepMinutes = 30) {
  const slots: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

export interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  stepMinutes?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

function TimePicker({
  value,
  onChange,
  stepMinutes = 30,
  placeholder = "Select time",
  disabled,
  className,
  id,
  "aria-label": ariaLabel,
}: TimePickerProps) {
  const slots = React.useMemo(() => buildSlots(stepMinutes), [stepMinutes]);

  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} aria-label={ariaLabel ?? placeholder} className="h-11">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" aria-hidden />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {slots.map((slot) => (
            <SelectItem key={slot} value={slot}>
              {slot}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { TimePicker };
