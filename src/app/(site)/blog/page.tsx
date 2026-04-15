import { createServerClient } from "@/lib/supabase/server";
import SectionLabel from "@/components/site/SectionLabel";
import Link from "next/link";

export const metadata = {
  title: "Writing | Sashreek Addanki",
};

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogPage() {
  let posts: Post[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, published_at, created_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (data) posts = data as Post[];
    } catch {
      // silence
    }
  }

  return (
    <div className="px-[6vw] py-16 max-w-[760px] mx-auto w-full">
      <SectionLabel>Writing</SectionLabel>
      <h1
        className="text-[28px] font-medium leading-[1.3] mb-4"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
      >
        Writing
      </h1>
      <p
        className="text-[15px] leading-[1.7] mb-12"
        style={{ color: "var(--text-secondary)" }}
      >
        Notes on systems, AI, and the things I&apos;m building.
      </p>

      {posts.length === 0 ? (
        <div
          className="font-mono text-[13px] py-16 text-center"
          style={{
            color: "var(--text-muted)",
            border: "1px solid var(--gray-800)",
            borderRadius: "6px",
          }}
        >
          <p>nothing published yet</p>
          <p className="mt-1 text-[11px]">check back soon</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 py-6 transition-colors duration-150"
              style={{
                borderBottom:
                  i < posts.length - 1
                    ? "1px solid var(--gray-800)"
                    : "none",
              }}
            >
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2
                  className="text-[18px] font-medium group-hover:text-[var(--violet-pale)] transition-colors duration-150"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {post.title}
                </h2>
                <span
                  className="font-mono text-[11px] shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDate(post.published_at ?? post.created_at)}
                </span>
              </div>
              {post.excerpt && (
                <p
                  className="text-[14px] leading-[1.65]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {post.excerpt}
                </p>
              )}
              <span
                className="font-mono text-[12px] mt-1 group-hover:translate-x-1 transition-transform duration-150 inline-block"
                style={{ color: "var(--violet-soft)" }}
              >
                read →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
