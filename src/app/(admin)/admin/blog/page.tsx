import { EmptyState } from "@/components/shared/states";
import { BlogPostForm } from "@/features/blog/components/blog-post-form";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function BlogAdminPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Blog CMS</h1>
        <p className="text-sm text-muted-foreground">
          Draft and publish articles. Public site falls back to static content when empty.
        </p>
      </div>

      <BlogPostForm />

      {!posts?.length ? (
        <EmptyState title="No CMS posts" description="Create a post above to replace static blog content." />
      ) : (
        <ul className="divide-y rounded-xl border border-border">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  /{post.slug} · {post.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
