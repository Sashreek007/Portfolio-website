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

// ── About content — edit freely, the layout adapts ────────────────────────
// Spec panel facts: label + value, any number of rows.
const PROFILE_FACTS: [string, React.ReactNode][] = [
  ["identity",   "Computing science · UAlberta"],
  ["focus",      "AI + systems engineering"],
  ["year",       "2nd · co-op stream"],
  ["graduating", "2028"],
  [
    "status",
    <span
      key="status"
      className="inline-flex items-center gap-[8px]"
      style={{ color: "var(--green-bright)" }}
    >
      <span
        className="w-[7px] h-[7px] rounded-full inline-block"
        style={{
          background: "var(--green-mid)",
          animation: "pulse-dot 2.5s ease-in-out infinite",
        }}
      />
      open to internships
    </span>,
  ],
  ["location",   "Edmonton, AB"],
];

// Timeline entries: any number; `current` adds the green tag.
const TIMELINE_ENTRIES: { year: string; role: string; current?: boolean }[] = [
  { year: "2025 →", role: "project lead · undergraduate ai society", current: true },
  { year: "2025",   role: "teaching assistant · cmput 274" },
];

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

      {/* ── About (editorial spread · poster headline / two-column copy /
              datasheet band) ─────────────────────────────────────────── */}
      <section
        id="about"
        className="section-hidden relative overflow-hidden px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <SectionKicker label="ABOUT" meta="readme.md" />

        <div className="relative max-w-[1320px] mx-auto">
          {/* Poster headline — spans the container instead of a column */}
          <article>
            <h2
              className="reveal-child font-medium max-w-[1100px]"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "clamp(40px, 5.5vw, 76px)",
                lineHeight: 1.08,
                letterSpacing: "-0.022em",
              }}
            >
              Computing science @ UAlberta, building at the intersection of{" "}
              <span
                style={{
                  color: "var(--violet-pale)",
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--violet-mid) 30%, transparent) 35%, transparent 35%)",
                  padding: "0 4px",
                }}
              >
                AI
              </span>{" "}
              and{" "}
              <span
                style={{
                  color: "var(--amber-bright)",
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--amber-mid) 22%, transparent) 35%, transparent 35%)",
                  padding: "0 4px",
                }}
              >
                systems
              </span>
              .
            </h2>

            {/* Magazine body — copy flows across two columns at desktop;
                works with any number of paragraphs */}
            <div
              className="about-essay reveal-child mt-14 text-[17px] leading-[1.8] lg:columns-2 [&>p:not(:last-child)]:mb-6 max-w-[1100px]"
              style={{
                color: "var(--text-secondary)",
                columnGap: "64px",
                "--ri": 1,
              } as React.CSSProperties}
            >
              <p>
                My work spans backend systems, low-level programming, and AI-driven
                features that move beyond research demos into usable software. I&apos;m
                especially interested in the engineering required to bridge AI research
                ideas with real systems.
              </p>
              <p>
                I learn bottom-up — the mechanism before the abstraction.{" "}
                <span style={{ color: "var(--violet-pale)" }}>Kurose &amp; Ross</span>{" "}
                before FastAPI.{" "}
                <span style={{ color: "var(--violet-pale)" }}>Induction proofs</span>{" "}
                before statistical packages.{" "}
                <span style={{ color: "var(--violet-pale)" }}>RISC-V</span>{" "}
                before operating systems. Using something I don&apos;t understand
                makes me uncomfortable.
              </p>
              <p style={{ color: "var(--text-muted)" }}>
                Currently in my second year, co-op stream, graduating{" "}
                <span style={{ color: "var(--amber-bright)" }}>2028</span>. Each project
                is a deliberate rung — not a random one.
              </p>
            </div>

            <div
              className="reveal-child mt-10 flex items-center gap-5 flex-wrap"
              style={{ "--ri": 2 } as React.CSSProperties}
            >
                <Link
                  href="/about"
                  className="pill-primary font-mono text-[14px] px-[22px] py-[11px]"
                >
                  read full bio <span aria-hidden>→</span>
                </Link>
                <span
                  className="font-mono text-[12px] flex items-center gap-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="inline-block w-[4px] h-[4px] rounded-full"
                    style={{ background: "var(--gray-600)" }}
                  />
                  approx. 4 min read
                </span>
              </div>
            </article>

          {/* Datasheet band — full-width spec strip closing the section.
              Cells adapt to any number of entries; all styling is
              inline/utility so the CSS build cannot drop it. */}
          <div
            className="reveal-child mt-16 grid grid-cols-2 lg:grid-cols-4"
            style={{ borderBottom: "1px solid var(--gray-800)", "--ri": 3 } as React.CSSProperties}
          >
            {[
              ...PROFILE_FACTS.map(([k, v]) => ({ label: k as string, value: v })),
              ...TIMELINE_ENTRIES.map((e) => ({
                label: e.year,
                value: (
                  <>
                    {e.role}
                    {e.current && (
                      <span className="ml-2 font-medium" style={{ color: "var(--green-bright)" }}>
                        [current]
                      </span>
                    )}
                  </>
                ),
              })),
            ].map((entry, i) => (
              <div
                key={i}
                className="py-6 pr-5"
                style={{
                  borderTop: "1px solid var(--gray-800)",
                  borderLeft: "1px solid var(--gray-800)",
                  paddingLeft: "20px",
                }}
              >
                <div
                  className="font-mono text-[10.5px] tracking-[0.22em] uppercase mb-[8px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {entry.label}
                </div>
                <div className="font-mono text-[14px]" style={{ color: "var(--text-primary)" }}>
                  {entry.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Selected Work ─────────────────────────────────────────────────── */}
      <section
        id="work"
        className="section-hidden px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <SectionKicker label="WORK" meta="selected.md" />
        <div className="max-w-[1320px] mx-auto">
          <div className="reveal-child flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <h2
                className="text-[36px] lg:text-[42px] font-medium leading-[1.15] tracking-[-0.018em] mt-1"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
              >
                Selected{" "}
                <span style={{ color: "var(--violet-pale)" }}>projects</span>
              </h2>
              <p
                className="mt-4 text-[16px] max-w-[520px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Four picks I&apos;d bring up in an interview — shipping, research, and
                things I built end-to-end.
              </p>
            </div>
            <Link
              href="/work"
              className="font-mono text-[13px] transition-colors duration-150 inline-flex items-center gap-2 hover:text-[var(--violet-pale)]"
              style={{ color: "var(--violet-soft)" }}
            >
              view all <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Magazine hierarchy — one full-width feature, then a 3-up row */}
          <div className="flex flex-col gap-7">
            {bestProjects[0] && (
              <div
                className="reveal-child flex"
                style={{ "--ri": 1 } as React.CSSProperties}
              >
                <ProjectMediaCard project={bestProjects[0]} index={0} featured />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {bestProjects.slice(1, 4).map((project, i) => (
                <div
                  key={project.id}
                  className="reveal-child flex"
                  style={{ "--ri": i + 2 } as React.CSSProperties}
                >
                  <ProjectMediaCard project={project} index={i + 1} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-14">
            <Link
              href="/work"
              className="pill-primary font-mono text-[14px] px-[24px] py-[12px]"
            >
              view all projects <span aria-hidden>→</span>
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
        <div className="max-w-[960px] mx-auto flex flex-col">
          <h2
            className="reveal-child text-[42px] lg:text-[54px] leading-[1.08] font-medium tracking-[-0.02em] mb-14"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            How to reach me, in{" "}
            <span style={{ color: "var(--violet-pale)" }}>one page</span>.
          </h2>

          <div className="w-full flex flex-col items-stretch">
            <h3
              className="reveal-child font-mono text-[15px] flex items-baseline gap-2 mb-10"
              style={{ "--ri": 1 } as React.CSSProperties}
            >
              <span style={{ color: "var(--violet-soft)" }}>##</span>
              <span style={{ color: "var(--text-primary)" }}>channels</span>
            </h3>

            <div
              className="reveal-child flex flex-col"
              style={{ borderTop: "1px solid var(--gray-800)", "--ri": 2 } as React.CSSProperties}
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
                  className="contact-row group grid gap-6 py-9 text-left"
                  style={{
                    gridTemplateColumns: "60px 1fr 50px",
                    borderBottom: "1px solid var(--gray-800)",
                  }}
                >
                  <span
                    className="font-mono text-[13px] tracking-[0.2em] uppercase pt-[8px] font-medium"
                    style={{ color: "var(--amber-bright)" }}
                  >
                    {n}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <span
                        className="font-mono text-[12px] tracking-[0.22em] uppercase font-medium"
                        style={{ color: "var(--violet-soft)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-[26px] lg:text-[32px] leading-[1.1] tracking-[-0.012em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                    <p
                      className="text-[16px] leading-[1.65] max-w-[620px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {blurb}
                    </p>
                  </div>
                  <span
                    className="font-mono text-[22px] pt-[8px] transition-transform duration-200 group-hover:translate-x-[4px]"
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
                className="contact-row group grid gap-6 py-9 w-full text-left"
                style={{
                  gridTemplateColumns: "60px 1fr 50px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--gray-800)",
                }}
              >
                <span
                  className="font-mono text-[13px] tracking-[0.2em] uppercase pt-[8px] font-medium"
                  style={{ color: "var(--amber-bright)" }}
                >
                  04
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <span
                      className="font-mono text-[12px] tracking-[0.22em] uppercase font-medium"
                      style={{ color: "var(--violet-soft)" }}
                    >
                      discord
                    </span>
                    <span
                      className="text-[26px] lg:text-[32px] leading-[1.1] tracking-[-0.012em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      sashreek
                    </span>
                  </div>
                  <p
                    className="text-[16px] leading-[1.65] max-w-[620px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Quick DMs. Click the handle to copy — Discord has no
                    canonical profile URL to link out to.
                  </p>
                </div>
                <span
                  className="font-mono text-[22px] pt-[8px]"
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
