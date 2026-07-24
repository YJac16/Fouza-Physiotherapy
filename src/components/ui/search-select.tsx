"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SearchSelectProps {
  options: SearchSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

function SearchSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found",
  disabled,
  className,
  id,
  "aria-label": ariaLabel,
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

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
        aria-haspopup="listbox"
        aria-label={ariaLabel ?? placeholder}
        className="h-11 w-full justify-between font-normal"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="size-4 opacity-50" aria-hidden />
      </Button>

      {open ? (
        <div
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-soft-lg animate-slide-up"
          role="listbox"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="mb-2 h-9"
            autoFocus
            aria-label={searchPlaceholder}
          />
          <ul className="max-h-56 space-y-0.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                        isSelected && "bg-primary/5 text-primary",
                      )}
                      onClick={() => {
                        onValueChange?.(option.value);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                      <span>
                        <span className="block font-medium">{option.label}</span>
                        {option.description ? (
                          <span className="block text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export { SearchSelect };
