"use client";

import * as React from "react";

import { FaqAccordion } from "@/components/shared/faq-accordion";
import { SearchBar } from "@/components/ui/search-bar";
import { faqs, faqCategories, type FaqItem } from "@/content/faqs";
import { cn } from "@/lib/utils";

export function FaqSearch({
  initialItems = faqs,
  className,
}: {
  initialItems?: FaqItem[];
  className?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");

  const filtered = initialItems.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className={cn("space-y-6", className)}>
      <SearchBar
        value={query}
        onValueChange={setQuery}
        placeholder="Search questions…"
        aria-label="Search FAQs"
      />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="FAQ categories">
        {["All", ...faqCategories].map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-secondary",
            )}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No questions match your search.
        </p>
      ) : (
        <FaqAccordion
          items={filtered.map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
          }))}
        />
      )}
    </div>
  );
}
