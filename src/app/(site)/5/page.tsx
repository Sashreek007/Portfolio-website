import Link from "next/link";
import AboutVariantSwitcher from "@/components/site/AboutVariantSwitcher";

// Variant 5 — Bento Grid
// Modular dashboard of varied-size cards: intro, current, stats, stack, experience, philosophy.

export const metadata = { title: "About v5 — Bento" };

function Card({
  children,
  className = "",
  label,
  accent,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  accent?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative p-6 rounded-lg overflow-hidden ${className}`}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--gray-800)",
        ...style,
      }}
    >
      {/* Accent bar */}
      {accent && (
        <span
          className="absolute top-0 left-0 h-full w-[2px]"
          style={{ background: accent }}
        />
      )}
      {label && (
        <p
          className="font-mono text-[10px] tracking-[0.16em] uppercase mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

const XP = [
  { year: "2025 →", role: "project lead · undergrad ai society", current: true },
  { year: "2025",   role: "teaching assistant · cmput 274" },
  { year: "2025",   role: "nathacks · fluxatlas auction engine" },
];

const STACK: { label: string; items: string[]; accent: string }[] = [
  { label: "langs",  items: ["Python", "Go", "C++", "TypeScript", "Rust", "C"],              accent: "var(--violet-soft)"  },
  { label: "ml/ai",  items: ["PyTorch", "LangChain", "LangGraph", "MCP", "HuggingFace"],     accent: "var(--amber-bright)" },
  { label: "infra",  items: ["Docker", "Redis", "Postgres", "Supabase", "FastAPI", "Linux"], accent: "var(--green-bright)" },
  { label: "systems",items: ["RISC-V", "Neovim", "Go stdlib", "OpenCV", "MediaPipe"],        accent: "var(--violet-pale)"  },
];

export default function AboutVariant5() {
  return (
    <div
      className="min-h-screen w-full py-20 px-[6vw]"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Title row */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p
              className="font-mono text-[11px] tracking-[0.18em] uppercase mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              about · profile
            </p>
            <h1
              className="text-[32px] font-medium tracking-[-0.01em]"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              Sashreek Addanki
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

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
        >
          {/* Intro (wide) */}
          <Card label="intro" className="col-span-12 lg:col-span-7" accent="var(--violet-mid)">
            <p
              className="text-[22px] lg:text-[26px] leading-[1.35] font-medium mb-4"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              Computing science @ UAlberta, building at the intersection of
              <span style={{ color: "var(--violet-pale)" }}> AI </span>
              and
              <span style={{ color: "var(--amber-bright)" }}> systems</span>.
            </p>
            <p
              className="text-[14px] leading-[1.8]"
              style={{ color: "var(--text-secondary)" }}
            >
              My work spans backend systems, low-level programming, and AI-driven
              features that move beyond research demos into usable software.
              I learn bottom-up — the mechanism before the abstraction.
            </p>
          </Card>

          {/* Current status */}
          <Card label="currently" className="col-span-12 sm:col-span-6 lg:col-span-3" accent="var(--green-mid)">
            <div className="flex items-center gap-[10px] mb-3">
              <span
                className="w-[8px] h-[8px] rounded-full inline-block"
                style={{
                  background: "var(--green-mid)",
                  animation: "pulse-dot 2.5s ease-in-out infinite",
                }}
              />
              <span
                className="font-mono text-[11px] tracking-[0.1em] uppercase"
                style={{ color: "var(--green-bright)" }}
              >
                active
              </span>
            </div>
            <p className="text-[14px] leading-[1.55]" style={{ color: "var(--text-primary)" }}>
              Project lead on <span style={{ color: "var(--violet-pale)" }}>ClubMate AI</span> at the Undergraduate AI Society.
            </p>
            <p className="text-[12px] mt-3" style={{ color: "var(--text-muted)" }}>
              LangChain · LangGraph · MCP
            </p>
          </Card>

          {/* Stats */}
          <Card className="col-span-12 sm:col-span-6 lg:col-span-2" accent="var(--amber-mid)">
            <div className="flex flex-col gap-4">
              {[
                ["yr",   "2nd"],
                ["grad", "'28"],
                ["loc",  "YEG"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between">
                  <span
                    className="font-mono text-[10px] tracking-[0.14em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {k}
                  </span>
                  <span
                    className="font-mono text-[20px]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stack (wide) */}
          <Card label="stack" className="col-span-12 lg:col-span-7" accent="var(--violet-soft)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {STACK.map(({ label, items, accent }) => (
                <div key={label}>
                  <p
                    className="font-mono text-[10px] tracking-[0.14em] uppercase mb-2"
                    style={{ color: accent }}
                  >
                    {label}
                  </p>
                  <div className="flex flex-wrap gap-[6px]">
                    {items.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[11px] px-[8px] py-[3px]"
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
          </Card>

          {/* Experience */}
          <Card label="recent" className="col-span-12 lg:col-span-5" accent="var(--amber-bright)">
            <ul className="flex flex-col">
              {XP.map((e, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[80px_1fr] items-baseline py-[10px]"
                  style={{
                    borderBottom: i < XP.length - 1 ? "1px solid var(--gray-800)" : "none",
                  }}
                >
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: e.current ? "var(--green-bright)" : "var(--text-muted)" }}
                  >
                    {e.year}
                  </span>
                  <span className="text-[13px] leading-[1.5]" style={{ color: "var(--text-primary)" }}>
                    {e.role}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Philosophy — pull quote */}
          <Card className="col-span-12" accent="var(--violet-pale)">
            <p
              className="text-[20px] lg:text-[24px] leading-[1.45] italic"
              style={{ color: "var(--violet-pale)", fontFamily: "var(--font-body)" }}
            >
              &ldquo;Kurose &amp; Ross before FastAPI. RISC-V before operating systems.
              Each project is a deliberate rung — not a random one.&rdquo;
            </p>
            <p
              className="font-mono text-[11px] tracking-[0.12em] uppercase mt-4"
              style={{ color: "var(--text-muted)" }}
            >
              — operating principle
            </p>
          </Card>
        </div>
      </div>

      <AboutVariantSwitcher current={5} />
    </div>
  );
}
