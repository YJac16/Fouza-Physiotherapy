"use client";

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  disabledDates?: (date: Date) => boolean;
  className?: string;
}

function Calendar({
  selected,
  onSelect,
  month: controlledMonth,
  onMonthChange,
  disabledDates,
  className,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(selected ?? new Date());
  const month = controlledMonth ?? internalMonth;

  function setMonth(next: Date) {
    if (!controlledMonth) setInternalMonth(next);
    onMonthChange?.(next);
  }

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={cn("w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="mb-4 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Previous month"
          onClick={() => setMonth(addDays(startOfMonth(month), -1))}
        >
          <ChevronLeft />
        </Button>
        <p className="font-display text-sm font-semibold tracking-tight">
          {format(month, "MMMM yyyy")}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Next month"
          onClick={() => setMonth(addDays(endOfMonth(month), 1))}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1" role="row">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-caption uppercase text-muted-foreground"
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
        {days.map((day) => {
          const disabled = disabledDates?.(day) ?? false;
          const selectedDay = selected ? isSameDay(day, selected) : false;
          const outside = !isSameMonth(day, month);

          return (
            <button
              key={day.toISOString()}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-selected={selectedDay}
              aria-label={format(day, "PPP")}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl text-sm transition-colors duration-220 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                outside && "text-muted-foreground/50",
                !outside && !selectedDay && "hover:bg-secondary",
                isToday(day) && !selectedDay && "font-semibold text-primary",
                selectedDay && "bg-primary text-primary-foreground shadow-sm",
                disabled && "cursor-not-allowed opacity-40",
              )}
              onClick={() => onSelect?.(day)}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
