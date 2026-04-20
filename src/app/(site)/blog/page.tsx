import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import BlogIndex, { type IndexPost } from "./BlogIndex";
import { BLOG_PROFILE_DEFAULT, renderParagraphs } from "@/lib/blog-profile";
import { getBlogViewStats } from "@/lib/blog-views";

export const metadata: Metadata = {
  title: "Blog | Sashreek Addanki",
};

export default async function BlogPage() {
  let posts: IndexPost[] = [];
  let profile = { ...BLOG_PROFILE_DEFAULT };

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();

      const { data: profileRow } = await supabase
        .from("blog_profile")
        .select("heading, body")
        .eq("id", 1)
        .maybeSingle();
      if (profileRow)
        profile = {
          heading: profileRow.heading ?? profile.heading,
          body: profileRow.body ?? profile.body,
        };

      const { data } = await supabase
        .from("posts")
        .select(
          "id, title, slug, excerpt, published_at, created_at, tags, project_id, show_on_writing"
        )
        .eq("is_published", true)
        .eq("show_on_writing", true)
        .is("project_id", null)
        .order("published_at", { ascending: false });
      if (data) {
        const stats = await getBlogViewStats();
        posts = (data as Array<{
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          published_at: string | null;
          created_at: string;
          tags: string[] | null;
        }>).map((p) => {
          const iso = p.published_at ?? p.created_at;
          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            published_at: p.published_at,
            created_at: p.created_at,
            // Drop reserved `series:` / `part:` tags from the index view —
            // those are rendered inline on the post detail, not as filters.
            tags: (p.tags ?? []).filter(
              (t) => !t.startsWith("series:") && !t.startsWith("part:"),
            ),
            year: iso.slice(0, 4),
            views: stats.get(p.slug)?.views ?? 0,
          };
        });
      }
    } catch {
      // silence — renders empty state
    }
  }

  return (
    <div className="blog-shell">
      {/* Masthead — a single compact strip so the archive shows up
          above the fold. The larger "about" block moves below the
          post list, newspaper-style. */}
      <section className="blog-masthead">
        <div className="blog-marker">
          <span>
            <span style={{ color: "var(--violet-soft)" }}>##</span> blog
          </span>
          <span className="blog-marker-r">— sashreek addanki</span>
        </div>
        <h1 className="blog-masthead-h1">
          sharing my{" "}
          <span style={{ color: "var(--amber-bright)" }}>thoughts.</span>
        </h1>
        <div
          className="blog-masthead-tag"
          dangerouslySetInnerHTML={{ __html: renderParagraphs(profile.body) }}
        />
      </section>

      <BlogIndex posts={posts} />
    </div>
  );
}
