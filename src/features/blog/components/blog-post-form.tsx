"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertBlogPostAction,
  type BlogActionState,
} from "@/features/blog/actions/posts";

const initial: BlogActionState = {};

export function BlogPostForm() {
  const [state, action, pending] = useActionState(upsertBlogPostAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border p-4">
      <h3 className="font-display text-lg font-semibold">New / update post</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required placeholder="lower-back-tips" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input id="excerpt" name="excerpt" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="bodyMd">Body (Markdown)</Label>
        <Textarea id="bodyMd" name="bodyMd" required rows={10} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue="draft"
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save post"}
      </Button>
    </form>
  );
}
