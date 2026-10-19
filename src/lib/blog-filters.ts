export type FilterablePost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
};

/** Categories that have at least one article, including the featured post. */
export function populatedCategories<T extends FilterablePost>(
  posts: readonly T[],
  categories: readonly string[],
) {
  return categories.filter((category) => posts.some((post) => post.category === category));
}

/**
 * Grid results for the blog index.
 * The featured article stays out of the unfiltered grid (it is shown above)
 * and is included again when a category or search matches it.
 */
export function postsForBlogGrid<T extends FilterablePost>(
  posts: readonly T[],
  featuredSlug: string | undefined,
  category: string,
  query: string,
) {
  const q = query.trim().toLowerCase();
  const browsingAll = category === "All" && !q;

  return posts.filter((post) => {
    if (browsingAll && featuredSlug && post.slug === featuredSlug) return false;
    const matchesCategory = category === "All" || post.category === category;
    const matchesQuery =
      !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}
