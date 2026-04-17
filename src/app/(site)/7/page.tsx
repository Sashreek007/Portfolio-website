import Link from "next/link";
import AboutVariantSwitcher from "@/components/site/AboutVariantSwitcher";

// Variant 7 — Editorial Split · "README"
// Same skeleton as /3 but the right column reads like a rendered README.md —
// markdown-style ## headings, a bullet list for stack, and a plain timeline.

export const metadata = { title: "About v7 — README" };

const PROFILE: [string, React.ReactNode][] = [
  ["identity",  <>Computing science · UAlberta</>],
  ["focus",     <>AI + systems engineering</>],
  ["year",      <>2nd · co-op stream</>],
  ["graduating",<>2028</>],
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
  ["location",  <>Edmonton, AB</>],
];

const STACK_ROWS: [string, string[]][] = [
  ["languages", ["python", "go", "c++", "typescript", "rust", "c"]],
  ["ml / ai",   ["pytorch", "langchain", "langgraph", "mcp", "huggingface", "ollama"]],
  ["infra",     ["docker", "redis", "postgres", "supabase", "fastapi", "linux"]],
  ["systems",   ["risc-v", "neovim", "go-stdlib", "opencv", "mediapipe"]],
];

const XP = [
  { year: "2025 →", role: "project lead · undergraduate ai society", current: true },
  { year: "2025",   role: "teaching assistant · cmput 274" },
];

function MdHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[14px] mb-3 flex items-baseline gap-2">
      <span style={{ color: "var(--violet-soft)" }}>##</span>
      <span style={{ color: "var(--text-primary)" }}>{children}</span>
    </h2>
  );
}

export default function AboutVariant7() {
  return (
    <div
      className="min-h-screen w-full py-24 px-[6vw]"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Kicker */}
      <div className="flex items-center gap-4 mb-14 max-w-[1200px] mx-auto">
        <span
          className="font-mono text-[11px] tracking-[0.2em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          ABOUT · ISSUE 04
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
          <h1
            className="text-[36px] lg:text-[44px] font-medium leading-[1.15] mb-10 tracking-[-0.015em]"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            Computing science @ UAlberta, building at the intersection of{" "}
            <span style={{ color: "var(--violet-pale)" }}>AI</span>{" "}
            and{" "}
            <span style={{ color: "var(--amber-bright)" }}>systems</span>.
          </h1>

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
            <MdHeading>profile</MdHeading>
            <dl className="flex flex-col gap-[6px] font-mono text-[12px]">
              {PROFILE.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] items-baseline gap-2">
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
            <MdHeading>stack</MdHeading>
            <ul className="flex flex-col gap-[6px] font-mono text-[12px]">
              {STACK_ROWS.map(([label, items]) => (
                <li key={label} className="grid grid-cols-[110px_1fr] items-baseline gap-2">
                  <span style={{ color: "var(--amber-bright)" }}>
                    - {label}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {items.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* timeline */}
          <section>
            <MdHeading>timeline</MdHeading>
            <ul className="flex flex-col gap-[8px] font-mono text-[12px]">
              {XP.map((e, i) => (
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

      <AboutVariantSwitcher current={7} />
    </div>
  );
}
