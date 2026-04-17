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
  project_id: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PostRow({ post, last }: { post: Post; last: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-2 py-6 transition-colors duration-150"
      style={{
        borderBottom: last ? "none" : "1px solid var(--gray-800)",
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
  );
}

export default async function BlogPage() {
  let writingPosts: Post[] = [];
  let projectPosts: Post[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, published_at, created_at, project_id, show_on_writing")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (data) {
        const all = data as (Post & { show_on_writing: boolean })[];
        writingPosts = all.filter((p) => !p.project_id && p.show_on_writing);
        projectPosts = all.filter((p) => !!p.project_id);
      }
    } catch {
      // silence
    }
  }

  const hasAny = writingPosts.length + projectPosts.length > 0;

  return (
    <div className="px-[6vw] py-16 w-full max-w-[960px] mx-auto">
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

      {!hasAny ? (
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
        <>
          {/* Writing (non-project) */}
          {writingPosts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <span
                  className="font-mono text-[11px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  · essays ·
                </span>
                <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
              </div>
              <div className="flex flex-col">
                {writingPosts.map((post, i) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    last={i === writingPosts.length - 1}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Project blogs */}
          {projectPosts.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-4">
                <span
                  className="font-mono text-[11px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  · project blogs ·
                </span>
                <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
                <span
                  className="font-mono text-[11px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  {String(projectPosts.length).padStart(2, "0")} entries
                </span>
              </div>
              <p
                className="text-[13.5px] leading-[1.7] mb-6 max-w-[560px]"
                style={{ color: "var(--text-muted)" }}
              >
                Write-ups for each project — decisions, tradeoffs, and what broke.
              </p>
              <div className="flex flex-col">
                {projectPosts.map((post, i) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    last={i === projectPosts.length - 1}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
