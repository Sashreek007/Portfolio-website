import { createServerClient } from "@/lib/supabase/server";
import BlogIndex, { type IndexPost } from "./BlogIndex";

export const metadata = {
  title: "Blog | Sashreek Addanki",
};

export default async function BlogPage() {
  let posts: IndexPost[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();
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
            tags: p.tags ?? [],
            year: iso.slice(0, 4),
          };
        });
      }
    } catch {
      // silence — renders empty state
    }
  }

  return (
    <div className="blog-shell">
      {/* Hero */}
      <section className="blog-hero">
        <div className="blog-marker">
          <span>
            <span style={{ color: "var(--violet-soft)" }}>##</span> blog
          </span>
        </div>
        <h1 className="blog-hero-h1">
          sharing<br />my<br />
          <span style={{ color: "var(--amber-bright)" }}>thoughts.</span>
        </h1>
        <div className="blog-byline">— sashreek addanki</div>
      </section>

      <BlogIndex posts={posts} />

      {/* About */}
      <section className="blog-about" id="about">
        <div className="blog-marker">
          <span>
            <span style={{ color: "var(--violet-soft)" }}>##</span> about
          </span>
        </div>
        <div className="blog-about-body">
          <div>
            <h2 className="blog-about-h2">
              i write to understand the{" "}
              <span style={{ color: "var(--amber-bright)" }}>machine</span>{" "}
              before i build on top of it.
            </h2>
            <p className="blog-about-p">
              this is the slow-running companion to my work — essays, build
              logs, and paper notes from the edge of{" "}
              <span style={{ color: "var(--violet-pale)" }}>
                AI systems engineering
              </span>
              .
            </p>
          </div>
          <div>
            <dl className="blog-about-dl">
              <dt>author</dt>
              <dd>sashreek addanki</dd>
              <dt>based</dt>
              <dd>edmonton, ab</dd>
              <dt>at</dt>
              <dd>
                <span style={{ color: "var(--amber-bright)" }}>ualberta</span>{" "}
                — cs,{" "}
                <span style={{ color: "var(--amber-bright)" }}>2nd year</span>
              </dd>
              <dt>topics</dt>
              <dd>
                systems,{" "}
                <span style={{ color: "var(--violet-pale)" }}>ml-infra</span>,{" "}
                <span style={{ color: "var(--green-bright)" }}>papers</span>
              </dd>
              <dt>contact</dt>
              <dd>sashreek.addanki@gmail</dd>
              <dt>elsewhere</dt>
              <dd>
                <a
                  href="https://github.com/Sashreek007"
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: "inherit" }}
                >
                  github
                </a>
                ,{" "}
                <a
                  href="https://www.linkedin.com/in/sashreek-addanki-121471257/"
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: "inherit" }}
                >
                  linkedin
                </a>
              </dd>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
