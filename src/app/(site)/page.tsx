import { createServerClient } from "@/lib/supabase/server";
import Hero from "@/components/site/Hero";
import SectionKicker from "@/components/site/SectionKicker";
import CopyHandle from "@/components/site/CopyHandle";
import { type Project } from "@/components/site/ProjectCard";
import ProjectMediaCard from "@/components/site/ProjectMediaCard";
import RevealSections from "@/components/site/RevealSections";
import Link from "next/link";

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

const divider = <div className="gradient-divider" />;

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  let bestProjects: Project[] = SEED_BEST;

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
        <SectionKicker label="ABOUT" meta="readme.md" />

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
        <SectionKicker label="WORK" meta="selected.md" />
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
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

      {/* ── Contact (/4 dossier layout, centered) ────────────────────────── */}
      <section
        id="contact"
        className="section-hidden px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <SectionKicker label="CONTACT" meta="reach.md" />
        <div className="max-w-[860px] mx-auto flex flex-col items-center text-center">
          <h2
            className="text-[38px] lg:text-[46px] leading-[1.1] font-medium tracking-[-0.015em] mb-12"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            How to reach me, in{" "}
            <span style={{ color: "var(--violet-pale)" }}>one page</span>.
          </h2>

          <div className="w-full flex flex-col items-stretch">
            <h3 className="font-mono text-[13px] flex items-baseline justify-center gap-2 mb-8">
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>channels</span>
            </h3>

            <div
              className="flex flex-col"
              style={{ borderTop: "1px solid var(--gray-800)" }}
            >
              {[
                {
                  n: "01",
                  label: "email",
                  value: "sashreek.addanki@gmail.com",
                  blurb:
                    "Fastest route — long or short, I read everything. Mark [urgent] in the subject if it actually is.",
                  href: "mailto:sashreek.addanki@gmail.com",
                },
                {
                  n: "02",
                  label: "github",
                  value: "Sashreek007",
                  blurb:
                    "Projects, half-finished experiments, and the occasional issue reply. Pull requests welcome.",
                  href: "https://github.com/Sashreek007",
                  ext: true,
                },
                {
                  n: "03",
                  label: "linkedin",
                  value: "sashreek-addanki",
                  blurb:
                    "Recruiter-facing. The place for formal intros, referrals, and co-op conversations.",
                  href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
                  ext: true,
                },
              ].map(({ n, label, value, blurb, href, ext }) => (
                <a
                  key={label}
                  href={href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noreferrer noopener" : undefined}
                  className="group grid gap-6 py-8 text-left transition-colors duration-200"
                  style={{
                    gridTemplateColumns: "50px 1fr 40px",
                    borderBottom: "1px solid var(--gray-800)",
                  }}
                >
                  <span
                    className="font-mono text-[11px] tracking-[0.2em] uppercase pt-[6px]"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    {n}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <span
                        className="font-mono text-[10.5px] tracking-[0.2em] uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-[22px] lg:text-[26px] leading-[1.1] tracking-[-0.01em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                    <p
                      className="text-[14px] leading-[1.65] max-w-[560px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {blurb}
                    </p>
                  </div>
                  <span
                    className="font-mono text-[18px] pt-[6px] transition-transform duration-200 group-hover:translate-x-[3px]"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    {ext ? "↗" : "→"}
                  </span>
                </a>
              ))}

              {/* 04 · discord — copy-on-click, matches the editorial row pattern */}
              <CopyHandle
                value="sashreek"
                copiedLabel="copied to clipboard"
                className="group grid gap-6 py-8 w-full text-left"
                style={{
                  gridTemplateColumns: "50px 1fr 40px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--gray-800)",
                }}
              >
                <span
                  className="font-mono text-[11px] tracking-[0.2em] uppercase pt-[6px]"
                  style={{ color: "var(--violet-soft)" }}
                >
                  04
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <span
                      className="font-mono text-[10.5px] tracking-[0.2em] uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      discord
                    </span>
                    <span
                      className="text-[22px] lg:text-[26px] leading-[1.1] tracking-[-0.01em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      sashreek
                    </span>
                  </div>
                  <p
                    className="text-[14px] leading-[1.65] max-w-[560px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Quick DMs. Click the handle to copy — Discord has no
                    canonical profile URL to link out to.
                  </p>
                </div>
                <span
                  className="font-mono text-[18px] pt-[6px]"
                  style={{ color: "var(--violet-soft)" }}
                >
                  ⧉
                </span>
              </CopyHandle>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section reveal observer (client component — re-runs on every mount) ── */}
      <RevealSections />
    </>
  );
}
