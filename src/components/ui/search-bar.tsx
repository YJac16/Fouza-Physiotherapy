"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value?: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  onSearch?: (value: string) => void;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      onClear,
      onSearch,
      placeholder = "Search…",
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState(String(defaultValue ?? ""));
    const current = value ?? internal;

    function handleChange(next: string) {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    }

    return (
      <div className={cn("relative w-full", className)}>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={ref}
          type="search"
          value={current}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch?.(current);
          }}
          {...props}
        />
        {current ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
            onClick={() => {
              handleChange("");
              onClear?.();
            }}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    );
  },
);
SearchBar.displayName = "SearchBar";

export { SearchBar };
