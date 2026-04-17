import { createServerClient } from "@/lib/supabase/server";
import Hero from "@/components/site/Hero";
import SectionLabel from "@/components/site/SectionLabel";
import { type Project } from "@/components/site/ProjectCard";
import ProjectMediaCard from "@/components/site/ProjectMediaCard";
import RevealSections from "@/components/site/RevealSections";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
};

// ── Fallback projects (shown before Supabase is configured) ───────────────────
const SEED_BEST: Project[] = [
  {
    id: "1",
    name: "Career Co-Pilot",
    description:
      "AI-assisted job workflow platform that matches roles to your profile, generates tailored resumes, and supports browser-assisted applications while keeping the user in control.",
    github_url: "https://github.com/Sashreek007/career-savers_CareerCo-Pilot",
    demo_url: null,
    image_url: null,
    video_url: null,
    stack: ["React", "TypeScript", "FastAPI", "Python", "Playwright", "Gemini API"],
    status: "shipped",
    year: 2025,
    is_best: true,
    is_current: false,
    sort_order: 0,
  },
  {
    id: "2",
    name: "DoomScroller",
    description:
      "Chrome extension that converts doomscrolling into measurable distance, coins, and multiplayer battles with local-first tracking, Supabase sync, and personalized AI feedback.",
    github_url: "https://github.com/Sashreek007/Doom-Scroller-by-Commit-and-Pray",
    demo_url: null,
    image_url: null,
    video_url: null,
    stack: ["TypeScript", "React", "Supabase", "PostgreSQL", "Chrome Extension"],
    status: "shipped",
    year: 2025,
    is_best: true,
    is_current: false,
    sort_order: 1,
  },
  {
    id: "4",
    name: "FluxAtlas — Economic Trading Engine",
    description:
      "Full-stack auction simulation platform modeling international resource trading with Vickrey auction mechanisms across 50+ simulated countries.",
    github_url: "https://github.com/Aarushb/NH25_flux_Atlas",
    demo_url: null,
    image_url: null,
    video_url: null,
    stack: ["FastAPI", "React", "PostgreSQL", "Python", "TypeScript"],
    status: "shipped",
    year: 2025,
    is_best: true,
    is_current: false,
    sort_order: 2,
  },
  {
    id: "5",
    name: "Spam Detection Discord Bot",
    description:
      "Deployed scam detection bot that identifies and removes malicious messages in real time with low-latency inference.",
    github_url: "https://github.com/UndergraduateArtificialIntelligenceClub/Spam-Detection-Discord-Bot",
    demo_url: null,
    image_url: null,
    video_url: null,
    stack: ["Python", "Discord.py", "Hugging Face"],
    status: "active",
    year: 2025,
    is_best: true,
    is_current: false,
    sort_order: 3,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const divider = <div className="gradient-divider" />;

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  let bestProjects: Project[] = SEED_BEST;
  let recentPosts: Post[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerClient();

      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("is_best", true)
        .order("sort_order")
        .limit(4);
      if (projects?.length) bestProjects = projects as Project[];

      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, published_at, created_at")
        .eq("is_published", true)
        .eq("show_on_writing", true)
        .is("project_id", null)
        .order("published_at", { ascending: false })
        .limit(3);
      if (posts) recentPosts = posts as Post[];
    } catch {
      // silence — fallback data used
    }
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── About (editorial split · README) ─────────────────────────────── */}
      <section
        id="about"
        className="section-hidden px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        {/* Kicker */}
        <div className="flex items-center gap-4 mb-14 max-w-[1200px] mx-auto">
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            ABOUT
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            readme.md
          </span>
        </div>

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] max-w-[1200px] mx-auto">
          {/* LEFT — essay */}
          <article>
            <h2
              className="text-[32px] lg:text-[40px] font-medium leading-[1.18] mb-10 tracking-[-0.015em]"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              Computing science @ UAlberta, building at the intersection of{" "}
              <span style={{ color: "var(--violet-pale)" }}>AI</span>{" "}
              and{" "}
              <span style={{ color: "var(--amber-bright)" }}>systems</span>.
            </h2>

            <div
              className="flex flex-col gap-5 text-[15px] leading-[1.85] max-w-[560px]"
              style={{ color: "var(--text-secondary)" }}
            >
              <p>
                My work spans backend systems, low-level programming, and AI-driven
                features that move beyond research demos into usable software. I&apos;m
                especially interested in the engineering required to bridge AI research
                ideas with real systems.
              </p>
              <p>
                I learn bottom-up — the mechanism before the abstraction. Kurose &amp;
                Ross before FastAPI. Induction proofs before statistical packages. RISC-V
                before operating systems. Using something I don&apos;t understand makes me
                uncomfortable.
              </p>
              <p style={{ color: "var(--text-muted)" }}>
                Currently in my second year, co-op stream, graduating 2028. Each project
                is a deliberate rung — not a random one.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/about"
                className="font-mono text-[13px] px-4 py-[10px] transition-all hover:-translate-y-[1px]"
                style={{
                  border: "1px solid var(--violet-mid)",
                  color: "var(--violet-pale)",
                  background: "color-mix(in srgb, var(--violet-dim) 30%, transparent)",
                  borderRadius: "4px",
                }}
              >
                read full bio →
              </Link>
              <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                approx. 4 min read
              </span>
            </div>
          </article>

          {/* RIGHT — rendered README */}
          <aside
            className="flex flex-col gap-10 pl-6"
            style={{ borderLeft: "1px solid var(--gray-800)" }}
          >
            {/* profile */}
            <section>
              <h3 className="font-mono text-[14px] mb-3 flex items-baseline gap-2">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>profile</span>
              </h3>
              <dl className="flex flex-col gap-[6px] font-mono text-[12px]">
                {[
                  ["identity",    <>Computing science · UAlberta</>],
                  ["focus",       <>AI + systems engineering</>],
                  ["year",        <>2nd · co-op stream</>],
                  ["graduating",  <>2028</>],
                  [
                    "status",
                    <span className="inline-flex items-center gap-[6px]">
                      <span
                        className="w-[6px] h-[6px] rounded-full inline-block"
                        style={{
                          background: "var(--green-mid)",
                          animation: "pulse-dot 2.5s ease-in-out infinite",
                        }}
                      />
                      open to internships
                    </span>,
                  ],
                  ["location",    <>Edmonton, AB</>],
                ].map(([k, v], i) => (
                  <div key={i} className="grid grid-cols-[110px_1fr] items-baseline gap-2">
                    <dt
                      className="tracking-[0.08em] uppercase text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {k}
                    </dt>
                    <dd style={{ color: "var(--text-primary)" }}>
                      <span style={{ color: "var(--text-muted)" }}>→ </span>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* stack */}
            <section>
              <h3 className="font-mono text-[14px] mb-3 flex items-baseline gap-2">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>stack</span>
              </h3>
              <ul className="flex flex-col gap-[6px] font-mono text-[12px]">
                {[
                  ["languages", ["python", "go", "c++", "typescript", "rust", "c"]],
                  ["ml / ai",   ["pytorch", "langchain", "langgraph", "mcp", "huggingface", "ollama"]],
                  ["infra",     ["docker", "redis", "postgres", "supabase", "fastapi", "linux"]],
                  ["systems",   ["risc-v", "neovim", "go-stdlib", "opencv", "mediapipe"]],
                ].map(([label, items]) => (
                  <li
                    key={label as string}
                    className="grid grid-cols-[110px_1fr] items-baseline gap-2"
                  >
                    <span style={{ color: "var(--amber-bright)" }}>- {label}</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {(items as string[]).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* timeline */}
            <section>
              <h3 className="font-mono text-[14px] mb-3 flex items-baseline gap-2">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>timeline</span>
              </h3>
              <ul className="flex flex-col gap-[8px] font-mono text-[12px]">
                {[
                  { year: "2025 →", role: "project lead · undergraduate ai society", current: true },
                  { year: "2025",   role: "teaching assistant · cmput 274" },
                ].map((e, i) => (
                  <li key={i} className="grid grid-cols-[80px_1fr] items-baseline gap-2">
                    <span style={{ color: e.current ? "var(--green-bright)" : "var(--text-muted)" }}>
                      {e.year}
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {e.role}
                      {e.current && (
                        <span className="ml-2" style={{ color: "var(--green-bright)" }}>
                          [current]
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </section>

      {divider}

      {/* ── Selected Work ─────────────────────────────────────────────────── */}
      <section
        id="work"
        className="section-hidden px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <SectionLabel>Work</SectionLabel>
              <h2
                className="text-[26px] font-medium leading-[1.25] mt-1"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
              >
                Selected projects
              </h2>
            </div>
            <Link
              href="/work"
              className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-muted)" }}
            >
              view all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestProjects.slice(0, 4).map((project, i) => (
              <ProjectMediaCard key={project.id} project={project} index={i} />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link
              href="/work"
              className="font-mono text-[13px] px-5 py-[10px] transition-all duration-200 hover:-translate-y-[1px]"
              style={{
                border: "1px solid var(--violet-mid)",
                color: "var(--violet-pale)",
                background: "color-mix(in srgb, var(--violet-dim) 30%, transparent)",
                borderRadius: "4px",
              }}
            >
              view all projects →
            </Link>
          </div>
        </div>
      </section>

      {divider}

      {/* ── Writing ───────────────────────────────────────────────────────── */}
      <section
        id="writing"
        className="section-hidden px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <SectionLabel>Writing</SectionLabel>
            <h2
              className="text-[26px] font-medium leading-[1.25] mt-1"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              Recent posts
            </h2>
          </div>
          <Link
            href="/blog"
            className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            view all →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <p className="font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>
            nothing published yet — check back soon
          </p>
        ) : (
          <div className="flex flex-col gap-0 max-w-[760px]">
            {recentPosts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="post-item group flex items-start justify-between gap-6 py-6"
                style={{
                  borderBottom: i < recentPosts.length - 1 ? "1px solid var(--gray-800)" : "none",
                }}
              >
                <div className="flex flex-col gap-1">
                  <span
                    className="text-[16px] font-medium group-hover:text-[var(--violet-pale)] transition-colors duration-200"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                  >
                    {post.title}
                  </span>
                  {post.excerpt && (
                    <span
                      className="text-[13px] leading-[1.6] mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {post.excerpt}
                    </span>
                  )}
                </div>
                <span
                  className="font-mono text-[11px] shrink-0 mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDate(post.published_at ?? post.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
        </div>
      </section>

      {divider}

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <section
        id="contact"
        className="section-hidden px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-[1200px] mx-auto">
        <SectionLabel>Contact</SectionLabel>
        <h2
          className="text-[26px] font-medium leading-[1.25] mt-1 mb-4"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Get in touch
        </h2>
        <p
          className="text-[15px] leading-[1.7] mb-10 max-w-[480px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Open to internship opportunities in backend, MLOps, and AI systems.
          If you&apos;re working on something interesting, reach out.
        </p>

        <div
          className="flex flex-col gap-0 max-w-[480px]"
          style={{ border: "1px solid var(--gray-800)", borderRadius: "6px" }}
        >
          {[
            { label: "email", value: "sashreek.addanki@gmail.com", href: "mailto:sashreek.addanki@gmail.com", external: false },
            { label: "github", value: "Sashreek007", href: "https://github.com/Sashreek007", external: true },
            { label: "linkedin", value: "sashreek-addanki", href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", external: true },
          ].map(({ label, value, href, external }, i, arr) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer noopener" : undefined}
              className="group flex items-center justify-between px-5 py-4 transition-colors duration-150"
              style={{
                borderBottom: i < arr.length - 1 ? "1px solid var(--gray-800)" : "none",
              }}
            >
              <span
                className="font-mono text-[11px] tracking-[0.10em] uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </span>
              <span
                className="text-[14px] font-medium group-hover:text-[var(--violet-pale)] transition-colors duration-150"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
              >
                {value}
                {external && (
                  <span
                    className="ml-2 font-mono text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    ↗
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>
        </div>
      </section>

      {/* ── Section reveal observer (client component — re-runs on every mount) ── */}
      <RevealSections />
    </>
  );
}
