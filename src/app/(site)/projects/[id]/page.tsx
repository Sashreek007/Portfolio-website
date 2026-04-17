import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjects } from "@/lib/projects.server";
import { projectSlug } from "@/lib/projects";
import { createServerClient } from "@/lib/supabase/server";
import type { Project } from "@/components/site/ProjectCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projects = await getAllProjects();
  const p = projects.find((x) => x.id === id);
  return {
    title: p ? `${p.name} · Sashreek Addanki` : "Project · Sashreek Addanki",
    description: p?.description ?? undefined,
  };
}

function DemoFrame({ project: p }: { project: Project }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 9",
        background:
          "radial-gradient(1400px circle at 20% 0%, color-mix(in srgb, var(--violet-dim) 14%, transparent), transparent 55%), var(--bg-surface)",
        border: "1px solid var(--gray-800)",
        borderRadius: "8px",
      }}
    >
      {p.video_url ? (
        <video
          src={p.video_url}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : p.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image_url}
          alt={p.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          {[
            { top: 14, left: 14 },
            { top: 14, right: 14 },
            { bottom: 14, left: 14 },
            { bottom: 14, right: 14 },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute w-4 h-4"
              style={{
                ...pos,
                borderTop: pos.top !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderBottom: pos.bottom !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderLeft: pos.left !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderRight: pos.right !== undefined ? "1px solid var(--gray-600)" : undefined,
              }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="font-mono text-[11px] tracking-[0.22em] uppercase px-4 py-[7px]"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--gray-800)",
                borderRadius: "999px",
                background: "color-mix(in srgb, var(--bg-base) 70%, transparent)",
              }}
            >
              demo reel · coming soon
            </div>
            <div
              className="font-mono text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              ▶ video walkthrough pending
            </div>
          </div>
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--gray-800) 1px, transparent 1px), linear-gradient(90deg, var(--gray-800) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              mixBlendMode: "screen",
            }}
          />
        </>
      )}
    </div>
  );
}

// Only show the blog hook if a matching published post with real
// content actually exists. Matches by project_id first (explicit link),
// then falls back to slug convention.
async function findLinkedPost(project: Project) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  try {
    const supabase = await createServerClient();
    const slug = projectSlug(project);

    const { data } = await supabase
      .from("posts")
      .select("slug, title, excerpt, content, is_published, project_id")
      .or(`project_id.eq.${project.id},slug.eq.${slug}`)
      .eq("is_published", true)
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    // Treat empty/missing content as "no blog yet".
    if (!data.content) return null;
    return data as {
      slug: string;
      title: string;
      excerpt: string | null;
    };
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projects = await getAllProjects();
  const index = projects.findIndex((x) => x.id === id);
  const p = index >= 0 ? projects[index] : null;
  if (!p) notFound();

  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;
  const linkedPost = await findLinkedPost(p);

  return (
    <div
      className="min-h-screen w-full px-[6vw] py-16"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-[960px] mx-auto">
        <nav
          className="flex items-center gap-[6px] font-mono text-[12px] mb-10"
          style={{ color: "var(--text-muted)" }}
        >
          <Link
            href="/"
            className="transition-colors duration-150 hover:text-[var(--text-primary)]"
          >
            ← home
          </Link>
          <span style={{ color: "var(--gray-800)" }}>/</span>
          <Link
            href="/work"
            className="transition-colors duration-150 hover:text-[var(--text-primary)]"
          >
            projects
          </Link>
        </nav>

        <div className="flex items-center gap-4 mb-10">
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            PROJECT · {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            case file
          </span>
        </div>

        {p.year && (
          <div
            className="mb-5 font-mono text-[11px] tracking-[0.08em] uppercase"
            style={{ color: "var(--green-bright)" }}
          >
            {p.year}
          </div>
        )}

        <h1
          className="font-medium leading-[1.08] tracking-[-0.02em] mb-6"
          style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {p.name}
        </h1>

        <div className="h-px w-12 mb-10" style={{ background: "var(--violet-mid)" }} />

        <div className="mb-12">
          <DemoFrame project={p} />
        </div>

        <section className="mb-16">
          <h2 className="font-mono text-[14px] mb-5 flex items-baseline gap-2">
            <span style={{ color: "var(--violet-soft)" }}>##</span>
            <span style={{ color: "var(--text-primary)" }}>overview</span>
          </h2>
          <p
            className="text-[16px] leading-[1.8] max-w-[720px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {p.description}
          </p>
        </section>

        {p.stack.length > 0 && (
          <section className="mb-16">
            <h2 className="font-mono text-[14px] mb-5 flex items-baseline gap-2">
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>stack</span>
            </h2>
            <div className="flex flex-wrap gap-x-5 gap-y-2 max-w-[720px]">
              {p.stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[12px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {(p.github_url || p.demo_url) && (
          <section className="mb-16">
            <h2 className="font-mono text-[14px] mb-5 flex items-baseline gap-2">
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>links</span>
            </h2>
            <div
              className="flex flex-col max-w-[560px]"
              style={{ border: "1px solid var(--gray-800)", borderRadius: "6px" }}
            >
              {p.demo_url && (
                <a
                  href={p.demo_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center justify-between px-5 py-4 transition-colors duration-150"
                  style={{
                    borderBottom: p.github_url ? "1px solid var(--gray-800)" : "none",
                  }}
                >
                  <span
                    className="font-mono text-[11px] tracking-[0.1em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    live demo
                  </span>
                  <span
                    className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                  >
                    open ↗
                  </span>
                </a>
              )}
              {p.github_url && (
                <a
                  href={p.github_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center justify-between px-5 py-4 transition-colors duration-150"
                >
                  <span
                    className="font-mono text-[11px] tracking-[0.1em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    source
                  </span>
                  <span
                    className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                  >
                    github ↗
                  </span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Blog hook — only rendered if a matching published post exists. */}
        {linkedPost && (
          <section
            className="mb-16 p-6 flex flex-col gap-3"
            style={{
              border: "1px solid var(--gray-800)",
              borderRadius: "8px",
              background: "var(--bg-surface)",
            }}
          >
            <span
              className="font-mono text-[11px] tracking-[0.15em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              read more
            </span>
            <h3
              className="text-[18px] font-medium leading-[1.3]"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              {linkedPost.title}
            </h3>
            {linkedPost.excerpt && (
              <p
                className="text-[14px] leading-[1.7]"
                style={{ color: "var(--text-secondary)" }}
              >
                {linkedPost.excerpt}
              </p>
            )}
            <Link
              href={`/blog/${linkedPost.slug}`}
              className="font-mono text-[12px] mt-2 inline-flex items-center gap-2 transition-all duration-200 hover:translate-x-[3px]"
              style={{ color: "var(--violet-soft)" }}
            >
              read on the blog →
            </Link>
          </section>
        )}

        <nav
          className="flex items-center justify-between pt-8 mt-8 gap-4"
          style={{ borderTop: "1px solid var(--gray-800)" }}
        >
          <div className="flex-1">
            {prev && (
              <Link
                href={`/projects/${prev.id}`}
                className="group flex flex-col gap-1"
              >
                <span
                  className="font-mono text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  ← previous
                </span>
                <span
                  className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                >
                  {prev.name}
                </span>
              </Link>
            )}
          </div>
          <div className="flex-1 text-right">
            {next && (
              <Link
                href={`/projects/${next.id}`}
                className="group flex flex-col gap-1 items-end"
              >
                <span
                  className="font-mono text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  next →
                </span>
                <span
                  className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                >
                  {next.name}
                </span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
