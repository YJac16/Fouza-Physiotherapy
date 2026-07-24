"use client";

import * as React from "react";

import { ArticleCard, BlogSearch } from "@/components/blog";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import type { BlogPost } from "@/content/blog";

export function BlogExplorer({
  posts,
  categories,
}: {
  posts: BlogPost[];
  categories: readonly string[];
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");

  const filtered = posts.filter((post) => {
    const matchesCategory = category === "All" || post.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BlogSearch value={query} onValueChange={setQuery} className="max-w-md" />
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Blog categories">
          {["All", ...categories].map((cat) => (
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
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No articles match your search.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <ArticleCard
              key={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              category={post.category}
              readTime={post.readTime}
              date={post.date}
              imageSrc={post.image}
              href={routes.marketing.blogPost(post.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
