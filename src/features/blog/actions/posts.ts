"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  bodyMd: z.string().min(10),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type BlogActionState = { error?: string; success?: string };

export async function upsertBlogPostAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const profile = await requireStaff();
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || undefined,
    bodyMd: formData.get("bodyMd"),
    status: formData.get("status") || "draft",
  });
  if (!parsed.success) return { error: "Invalid post" };

  const id = formData.get("id")?.toString();
  const supabase = await createClient();
  const payload = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    excerpt: parsed.data.excerpt ?? null,
    body_md: parsed.data.bodyMd,
    status: parsed.data.status,
    author_id: profile.id,
    published_at:
      parsed.data.status === "published" ? new Date().toISOString() : null,
  };

  if (id) {
    const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("blog_posts").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: "Post saved" };
}

export async function listPublishedPosts() {
  const supabase = await createClient();
  return supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
}

export async function getPublishedPost(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
}
