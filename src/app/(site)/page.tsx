import { createServerClient } from "@/lib/supabase/server";
import Hero from "@/components/site/Hero";
import SectionLabel from "@/components/site/SectionLabel";
import SkillsTable from "@/components/site/SkillsTable";
import ProjectCard, { type Project } from "@/components/site/ProjectCard";
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

      {/* ── Selected Work ─────────────────────────────────────────────────── */}
      <section
        id="work"
        className="section-hidden px-[6vw] py-24"
        style={{ borderTop: "1px solid var(--gray-800)" }}
      >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bestProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </section>

      {divider}

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="section-hidden px-[6vw] py-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-[1200px]">
          {/* Left — text */}
          <div>
            <SectionLabel>About</SectionLabel>
            <h2
              className="text-[26px] font-medium leading-[1.3] mb-6 mt-1"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              Computing science @ UAlberta, building at the intersection of AI and systems.
            </h2>
            <div
              className="flex flex-col gap-4 text-[15px] leading-[1.8]"
              style={{ color: "var(--text-secondary)" }}
            >
              <p>
                My work spans backend systems, low-level programming, and AI-driven features
                that move beyond research demos into usable software.
              </p>
              <p>
                I learn bottom-up — the mechanism before the abstraction.
                Kurose &amp; Ross before FastAPI. RISC-V before operating systems.
                Using something I don&apos;t understand makes me uncomfortable.
              </p>
              <p style={{ color: "var(--text-muted)" }}>
                Second year, co-op stream, graduating 2028.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/about"
                className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-muted)" }}
              >
                full bio →
              </Link>
            </div>
          </div>

          {/* Right — skills */}
          <div>
            <p
              className="font-mono text-[11px] tracking-[0.12em] uppercase mb-5"
              style={{ color: "var(--text-muted)" }}
            >
              Stack
            </p>
            <SkillsTable />
          </div>
        </div>
      </section>

      {divider}

      {/* ── Writing ───────────────────────────────────────────────────────── */}
      <section
        id="writing"
        className="section-hidden px-[6vw] py-24"
      >
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
      </section>

      {divider}

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <section
        id="contact"
        className="section-hidden px-[6vw] py-24"
      >
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
      </section>

      {/* ── Section reveal observer (client component — re-runs on every mount) ── */}
      <RevealSections />
    </>
  );
}
