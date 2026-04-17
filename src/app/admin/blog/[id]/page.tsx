import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/admin/BlogEditor";
import type { Database } from "@/lib/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Edit Post | Admin" };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    notFound();
  }

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const post = data as Post;

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
          Admin / Blog / Edit
        </p>
        <h1 className="text-[22px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          {post.title}
        </h1>
      </div>
      <BlogEditor
        mode="edit"
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: post.content as any,
          excerpt: post.excerpt,
          cover_image_url: post.cover_image_url,
          is_published: post.is_published,
          published_at: post.published_at,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          project_id: (post as any).project_id ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          show_on_writing: (post as any).show_on_writing ?? true,
        }}
      />
    </div>
  );
}
