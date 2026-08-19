"use client";

import { useMemo, useState } from "react";

import { formatZar } from "@/features/billing/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { InvoiceServiceOption } from "./types";

type Props = {
  services: InvoiceServiceOption[];
  onSelectService: (service: InvoiceServiceOption) => void;
  onAddCustom: () => void;
};

export function ServicePicker({ services, onSelectService, onAddCustom }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(q) || service.slug.toLowerCase().includes(q),
    );
  }, [query, services]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="default" size="sm" onClick={() => setOpen((prev) => !prev)}>
          + Add service
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onAddCustom}>
          + Add custom item
        </Button>
      </div>

      {open ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
            autoFocus
          />
          <ul className="max-h-56 space-y-1 overflow-y-auto">
            {filtered.length ? (
              filtered.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      onSelectService(service);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="font-medium">{service.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatZar(service.priceCents)}/unit
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-muted-foreground">No services found</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
