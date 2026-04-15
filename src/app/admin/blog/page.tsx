import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminBlogPage() {
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
  }> = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, is_published, published_at, created_at")
      .order("created_at", { ascending: false });
    if (data) posts = data;
  }

  return (
    <div className="max-w-[900px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
            Admin / Blog
          </p>
          <h1 className="text-[22px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
            Posts
          </h1>
        </div>
        <Link
          href="/admin/blog/new"
          className="font-mono text-[12px] px-4 py-2 transition-all duration-200 hover:-translate-y-[1px]"
          style={{ color: "var(--violet-pale)", background: "var(--violet-mid)", borderRadius: "4px" }}
        >
          + new post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>
          no posts yet
        </p>
      ) : (
        <div className="flex flex-col gap-0">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="flex items-center justify-between gap-4 py-4"
              style={{ borderBottom: i < posts.length - 1 ? "1px solid var(--gray-800)" : "none" }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                    {post.title}
                  </span>
                  <span
                    className="font-mono text-[10px] tracking-[0.08em] uppercase"
                    style={{ color: post.is_published ? "var(--green-bright)" : "var(--text-muted)" }}
                  >
                    {post.is_published ? "published" : "draft"}
                  </span>
                </div>
                <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-CA")}
                  &nbsp;·&nbsp;/{post.slug}
                </span>
              </div>
              <div className="flex gap-2">
                {post.is_published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="font-mono text-[11px] px-3 py-1 transition-colors duration-150"
                    style={{ color: "var(--text-muted)", border: "1px solid var(--gray-800)", borderRadius: "4px" }}
                  >
                    view ↗
                  </Link>
                )}
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="font-mono text-[12px] px-3 py-1 transition-colors duration-150"
                  style={{ color: "var(--text-muted)", border: "1px solid var(--gray-800)", borderRadius: "4px" }}
                >
                  edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
