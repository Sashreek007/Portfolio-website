import Link from "next/link";
import AboutVariantSwitcher from "@/components/site/AboutVariantSwitcher";

// Variant 4 — Timeline-First
// Horizontal chapter rail across the top, supporting prose + stack below.

export const metadata = { title: "About v4 — Timeline" };

const CHAPTERS = [
  {
    tag: "2024",
    title: "foundation",
    copy: "first year, cmput 174/175. discovering systems below the language.",
    accent: "var(--gray-600)",
  },
  {
    tag: "2025 · jan",
    title: "fluxatlas",
    copy: "nathacks ecotech — built a vickrey auction engine across 50 countries in 36 hours.",
    accent: "var(--amber-bright)",
  },
  {
    tag: "2025 · fall",
    title: "teaching + ship",
    copy: "TA for cmput 274. shipped a spam-detection bot on hugging face.",
    accent: "var(--violet-soft)",
  },
  {
    tag: "2025 →",
    title: "project lead",
    copy: "undergrad ai society. clubmate ai: langchain + langgraph + mcp.",
    accent: "var(--green-bright)",
    current: true,
  },
  {
    tag: "2028",
    title: "graduation",
    copy: "co-op stream. target: backend / ml-ops / ai systems roles.",
    accent: "var(--text-muted)",
    future: true,
  },
];

const STACK_GROUPS: [string, string[]][] = [
  ["languages", ["Python", "Go", "C++", "TypeScript", "Rust", "C"]],
  ["ml / ai",   ["PyTorch", "LangChain", "LangGraph", "MCP", "HuggingFace"]],
  ["infra",     ["Docker", "Redis", "Postgres", "Supabase", "FastAPI", "Linux"]],
  ["systems",   ["RISC-V", "Neovim", "Go stdlib", "OpenCV"]],
];

export default function AboutVariant4() {
  return (
    <div
      className="min-h-screen w-full py-20 px-[6vw]"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-4 flex-wrap">
          <div>
            <p
              className="font-mono text-[11px] tracking-[0.2em] uppercase mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              /about · a timeline
            </p>
            <h1
              className="font-mono font-medium"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: "1.02",
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              deliberate rungs, <br />not random ones.
            </h1>
          </div>
          <Link
            href="/about"
            className="font-mono text-[12px] px-4 py-[8px] transition-all hover:-translate-y-[1px]"
            style={{
              border: "1px solid var(--gray-800)",
              color: "var(--text-muted)",
              borderRadius: "4px",
            }}
          >
            full bio →
          </Link>
        </div>

        {/* Horizontal timeline rail */}
        <section className="relative mt-16 mb-16">
          {/* Rail */}
          <div
            className="absolute left-0 right-0 top-[10px] h-px"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, var(--gray-800) 8%, var(--gray-800) 92%, transparent 100%)",
            }}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
            {CHAPTERS.map((c, i) => (
              <div key={i} className="relative">
                {/* Dot */}
                <span
                  className="absolute left-0 top-[4px] w-[13px] h-[13px] rounded-full"
                  style={{
                    background: c.future ? "var(--bg-base)" : c.accent,
                    border: `2px solid ${c.accent}`,
                    animation: c.current ? "pulse-dot 2.5s ease-in-out infinite" : undefined,
                  }}
                />
                <div className="pt-10 pl-0 pr-3">
                  <p
                    className="font-mono text-[11px] tracking-[0.12em] uppercase mb-2"
                    style={{ color: c.accent }}
                  >
                    {c.tag}
                  </p>
                  <p
                    className="text-[16px] font-medium mb-2"
                    style={{
                      color: c.future ? "var(--text-muted)" : "var(--text-primary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {c.title}
                  </p>
                  <p
                    className="text-[13px] leading-[1.65]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {c.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prose + stack */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-16 pt-16" style={{ borderTop: "1px solid var(--gray-800)" }}>
          <section className="max-w-[560px]">
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              how i work
            </p>
            <div
              className="flex flex-col gap-5 text-[15px] leading-[1.85]"
              style={{ color: "var(--text-secondary)" }}
            >
              <p>
                My work spans backend systems, low-level programming, and AI-driven
                features that move beyond research demos into usable software.
              </p>
              <p>
                I learn bottom-up — the mechanism before the abstraction.
                Kurose &amp; Ross before FastAPI. RISC-V before operating systems.
                Using something I don&apos;t understand makes me uncomfortable.
              </p>
            </div>
          </section>

          <section>
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              stack
            </p>
            <div className="flex flex-col gap-5">
              {STACK_GROUPS.map(([label, items]) => (
                <div
                  key={label}
                  className="grid grid-cols-[90px_1fr] gap-4 items-start pb-4"
                  style={{ borderBottom: "1px solid var(--gray-800)" }}
                >
                  <span
                    className="font-mono text-[11px] tracking-[0.1em] uppercase pt-[2px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {items.map((t) => (
                      <span key={t}>{t.toLowerCase()}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <AboutVariantSwitcher current={4} />
    </div>
  );
}
