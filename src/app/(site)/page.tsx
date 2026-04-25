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

        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] max-w-[1320px] mx-auto">
          {/* LEFT — essay */}
          <article>
            <h2
              className="text-[36px] lg:text-[46px] font-medium leading-[1.16] mb-10 tracking-[-0.018em]"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
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

            <div
              className="flex flex-col gap-6 text-[17px] leading-[1.8] max-w-[600px]"
              style={{ color: "var(--text-secondary)" }}
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
                <span style={{ color: "var(--amber-bright)" }}>RISC-V</span>{" "}
                before operating systems. Using something I don&apos;t understand
                makes me uncomfortable.
              </p>
              <p style={{ color: "var(--text-muted)" }}>
                Currently in my second year, co-op stream, graduating{" "}
                <span style={{ color: "var(--green-bright)" }}>2028</span>. Each project
                is a deliberate rung — not a random one.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-5 flex-wrap">
              <Link
                href="/about"
                className="font-mono text-[14px] px-5 py-[12px] transition-all hover:-translate-y-[1px]"
                style={{
                  border: "1px solid var(--violet-soft)",
                  color: "var(--violet-pale)",
                  background:
                    "color-mix(in srgb, var(--violet-dim) 45%, transparent)",
                  borderRadius: "4px",
                  boxShadow:
                    "0 0 28px color-mix(in srgb, var(--violet-soft) 18%, transparent)",
                }}
              >
                read full bio →
              </Link>
              <span
                className="font-mono text-[12px] flex items-center gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="inline-block w-[4px] h-[4px] rounded-full"
                  style={{ background: "var(--amber-bright)" }}
                />
                approx. 4 min read
              </span>
            </div>
          </article>

          {/* RIGHT — rendered README */}
          <aside
            className="flex flex-col gap-10 pl-7"
            style={{
              borderLeft: "2px solid color-mix(in srgb, var(--violet-mid) 50%, var(--gray-800))",
            }}
          >
            {/* profile */}
            <section>
              <h3 className="font-mono text-[16px] mb-4 flex items-baseline gap-2">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>profile</span>
              </h3>
              <dl className="flex flex-col gap-[10px] font-mono text-[14px]">
                {[
                  ["identity",    <>Computing science · UAlberta</>],
                  ["focus",       <><span style={{ color: "var(--amber-bright)" }}>AI</span> + <span style={{ color: "var(--green-bright)" }}>systems</span> engineering</>],
                  ["year",        <>2nd · co-op stream</>],
                  ["graduating",  <span style={{ color: "var(--green-bright)" }}>2028</span>],
                  [
                    "status",
                    <span className="inline-flex items-center gap-[8px]" style={{ color: "var(--green-bright)" }}>
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
                  ["location",    <>Edmonton, AB</>],
                ].map(([k, v], i) => (
                  <div key={i} className="grid grid-cols-[120px_1fr] items-baseline gap-2">
                    <dt
                      className="tracking-[0.1em] uppercase text-[12px]"
                      style={{ color: "var(--violet-soft)" }}
                    >
                      {k}
                    </dt>
                    <dd style={{ color: "var(--text-primary)" }}>
                      <span style={{ color: "var(--violet-soft)" }}>→ </span>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* stack */}
            <section>
              <h3 className="font-mono text-[16px] mb-4 flex items-baseline gap-2">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>stack</span>
              </h3>
              <ul className="flex flex-col gap-[10px] font-mono text-[14px]">
                {[
                  ["languages", ["python", "go", "c++", "typescript", "rust", "c"]],
                  ["ml / ai",   ["pytorch", "langchain", "langgraph", "mcp", "huggingface", "ollama"]],
                  ["infra",     ["docker", "redis", "postgres", "supabase", "fastapi", "linux"]],
                  ["systems",   ["risc-v", "neovim", "go-stdlib", "opencv", "mediapipe"]],
                ].map(([label, items]) => (
                  <li
                    key={label as string}
                    className="grid grid-cols-[120px_1fr] items-baseline gap-2"
                  >
                    <span style={{ color: "var(--amber-bright)" }} className="font-medium">- {label}</span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {(items as string[]).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* timeline */}
            <section>
              <h3 className="font-mono text-[16px] mb-4 flex items-baseline gap-2">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>timeline</span>
              </h3>
              <ul className="flex flex-col gap-[10px] font-mono text-[14px]">
                {[
                  { year: "2025 →", role: "project lead · undergraduate ai society", current: true },
                  { year: "2025",   role: "teaching assistant · cmput 274" },
                ].map((e, i) => (
                  <li key={i} className="grid grid-cols-[90px_1fr] items-baseline gap-2">
                    <span style={{ color: e.current ? "var(--green-bright)" : "var(--amber-bright)" }} className="font-medium">
                      {e.year}
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {e.role}
                      {e.current && (
                        <span className="ml-2 font-medium" style={{ color: "var(--green-bright)" }}>
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
        <div className="max-w-[1320px] mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
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
              className="font-mono text-[13px] transition-colors duration-150 inline-flex items-center gap-2"
              style={{ color: "var(--violet-soft)" }}
            >
              view all
              <span style={{ color: "var(--amber-bright)" }}>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {bestProjects.slice(0, 4).map((project, i) => (
              <ProjectMediaCard key={project.id} project={project} index={i} />
            ))}
          </div>

          <div className="flex justify-center mt-14">
            <Link
              href="/work"
              className="font-mono text-[14px] px-6 py-[12px] transition-all duration-200 hover:-translate-y-[1px]"
              style={{
                border: "1px solid var(--violet-soft)",
                color: "var(--violet-pale)",
                background:
                  "color-mix(in srgb, var(--violet-dim) 45%, transparent)",
                borderRadius: "4px",
                boxShadow:
                  "0 0 28px color-mix(in srgb, var(--violet-soft) 18%, transparent)",
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
        <div className="max-w-[960px] mx-auto flex flex-col items-center text-center">
          <h2
            className="text-[42px] lg:text-[54px] leading-[1.08] font-medium tracking-[-0.02em] mb-14"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            How to reach me, in{" "}
            <span
              style={{
                color: "var(--violet-pale)",
                background:
                  "linear-gradient(to top, color-mix(in srgb, var(--violet-mid) 30%, transparent) 35%, transparent 35%)",
                padding: "0 6px",
              }}
            >
              one page
            </span>
            .
          </h2>

          <div className="w-full flex flex-col items-stretch">
            <h3 className="font-mono text-[15px] flex items-baseline justify-center gap-2 mb-10">
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
                  className="group grid gap-6 py-9 text-left transition-colors duration-200"
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
                className="group grid gap-6 py-9 w-full text-left"
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
