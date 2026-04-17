import Link from "next/link";
import AboutVariantSwitcher from "@/components/site/AboutVariantSwitcher";

// Variant 3 — Editorial Split
// Essay on the left, structured spec-sheet + experience on the right.

export const metadata = { title: "About v3 — Editorial" };

const SPEC_ROWS: [string, React.ReactNode][] = [
  ["identity", <>computing science · ualberta</>],
  ["focus",    <>ai + systems engineering</>],
  ["year",     <>2nd · co-op stream</>],
  ["grad",     <>2028</>],
  [
    "status",
    <span className="flex items-center gap-[6px]">
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
  ["location", <>edmonton, ab</>],
];

const STACK_ROWS: [string, string[]][] = [
  ["languages", ["Python", "Go", "C++", "TypeScript", "Rust", "C"]],
  ["ml / ai",   ["PyTorch", "LangChain", "LangGraph", "MCP", "HuggingFace", "Ollama"]],
  ["infra",     ["Docker", "Redis", "Postgres", "Supabase", "FastAPI", "Linux"]],
  ["systems",   ["RISC-V", "Neovim", "Go stdlib", "OpenCV", "MediaPipe"]],
];

const XP = [
  { year: "2025 →", role: "project lead · undergraduate ai society", current: true },
  { year: "2025",   role: "teaching assistant · cmput 274",        current: false },
  { year: "2025",   role: "nathacks ecotech · fluxatlas engine",    current: false },
];

export default function AboutVariant3() {
  return (
    <div
      className="min-h-screen w-full py-24 px-[6vw]"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Kicker line */}
      <div className="flex items-center gap-4 mb-14 max-w-[1200px] mx-auto">
        <span
          className="font-mono text-[11px] tracking-[0.2em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          ABOUT · ISSUE 02
        </span>
        <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
        <span
          className="font-mono text-[11px] tracking-[0.2em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          a working profile
        </span>
      </div>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] max-w-[1200px] mx-auto">
        {/* LEFT — essay */}
        <article>
          <h1
            className="text-[44px] lg:text-[56px] font-medium leading-[1.02] mb-10 tracking-[-0.02em]"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            Building at the seam <br />
            between{" "}
            <span style={{ color: "var(--violet-pale)" }}>ai</span>{" "}
            and{" "}
            <span style={{ color: "var(--amber-bright)" }}>systems</span>.
          </h1>

          <div
            className="flex flex-col gap-5 text-[15px] leading-[1.85] max-w-[560px]"
            style={{ color: "var(--text-secondary)" }}
          >
            <p className="first-letter:float-left first-letter:text-[44px] first-letter:leading-[0.9] first-letter:pr-2 first-letter:mt-1 first-letter:text-[var(--violet-pale)] first-letter:font-medium">
              My work spans backend systems, low-level programming, and AI-driven
              features that move beyond research demos into usable software. I care
              about the engineering required to bridge AI research ideas with real
              systems.
            </p>

            <p>
              I learn bottom-up — the mechanism before the abstraction.
              Kurose &amp; Ross before FastAPI. RISC-V before operating systems.
              Using something I don&apos;t understand makes me uncomfortable.
            </p>

            <blockquote
              className="pl-5 my-2 text-[16px] italic"
              style={{
                borderLeft: "2px solid var(--violet-mid)",
                color: "var(--violet-pale)",
                fontFamily: "var(--font-body)",
              }}
            >
              &ldquo;Each project is a deliberate rung — not a random one.&rdquo;
            </blockquote>
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

        {/* RIGHT — spec sheet + stack + xp */}
        <aside className="flex flex-col gap-10">
          {/* spec sheet */}
          <section>
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              fact sheet
            </p>
            <div
              className="overflow-hidden"
              style={{
                border: "1px solid var(--gray-800)",
                borderRadius: "6px",
              }}
            >
              {SPEC_ROWS.map(([k, v], i) => (
                <div
                  key={k}
                  className="grid grid-cols-[110px_1fr] items-center font-mono text-[12px]"
                  style={{
                    borderBottom: i < SPEC_ROWS.length - 1 ? "1px solid var(--gray-800)" : "none",
                  }}
                >
                  <span
                    className="px-3 py-[10px] tracking-[0.08em] uppercase"
                    style={{
                      color: "var(--text-muted)",
                      background: "var(--bg-elevated)",
                      borderRight: "1px solid var(--gray-800)",
                    }}
                  >
                    {k}
                  </span>
                  <span className="px-4 py-[10px]" style={{ color: "var(--text-primary)" }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* stack */}
          <section>
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              stack
            </p>
            <div className="flex flex-col gap-4">
              {STACK_ROWS.map(([label, items]) => (
                <div key={label}>
                  <p
                    className="font-mono text-[10px] tracking-[0.14em] uppercase mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </p>
                  <div className="flex flex-wrap gap-[6px]">
                    {items.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[11px] px-[10px] py-[4px]"
                        style={{
                          border: "1px solid var(--gray-800)",
                          color: "var(--text-secondary)",
                          borderRadius: "3px",
                          background: "var(--bg-elevated)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* xp */}
          <section>
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              recent
            </p>
            <ul className="flex flex-col">
              {XP.map((e, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[80px_1fr] items-center py-[10px]"
                  style={{
                    borderTop: i === 0 ? "1px solid var(--gray-800)" : "none",
                    borderBottom: "1px solid var(--gray-800)",
                  }}
                >
                  <span
                    className="font-mono text-[12px]"
                    style={{ color: e.current ? "var(--green-bright)" : "var(--text-muted)" }}
                  >
                    {e.year}
                  </span>
                  <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                    {e.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <AboutVariantSwitcher current={3} />
    </div>
  );
}
