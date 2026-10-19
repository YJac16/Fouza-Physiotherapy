"use client";

import * as React from "react";

import { ArticleCard, BlogSearch } from "@/components/blog";
import { populatedCategories, postsForBlogGrid } from "@/lib/blog-filters";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import type { BlogPost } from "@/content/blog";

export function BlogExplorer({
  posts,
  featuredSlug,
  categories,
}: {
  posts: BlogPost[];
  featuredSlug?: string;
  categories: readonly string[];
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");
  const visibleCategories = populatedCategories(posts, categories);

  React.useEffect(() => {
    if (category !== "All" && !visibleCategories.includes(category)) {
      setCategory("All");
    }
  }, [category, visibleCategories]);

  const filtered = postsForBlogGrid(posts, featuredSlug, category, query);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <BlogSearch value={query} onValueChange={setQuery} className="w-full max-w-none md:max-w-md" />
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Blog categories">
          {["All", ...visibleCategories].map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={category === cat}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-3 text-sm font-medium transition-colors",
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
        <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">
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
