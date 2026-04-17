"use client";

// Hero — STATUS_MONOLITH layout (from /6) with the CharacterAnimation in the
// space the "01" used to occupy. No top sys label. No ghosted decoration.
// Single-page friendly: nav panel uses in-page anchors.

import CharacterAnimation from "./CharacterAnimation";

const STACK = [
  ["python", "go", "c++"],
  ["typescript", "rust", "c"],
  ["pytorch", "langchain", "mcp"],
  ["docker", "postgres", "supabase"],
];

const LINKS = [
  { href: "#work",    label: "projects" },
  { href: "#about",   label: "about" },
  { href: "#writing", label: "writing" },
  { href: "#contact", label: "contact" },
  { href: "/resume",  label: "resume" },
];

function CornerBox({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative p-5 ${className}`}>
      {(["tl", "tr", "bl", "br"] as const).map(pos => (
        <span
          key={pos}
          className="absolute w-3.5 h-3.5 pointer-events-none"
          style={{
            top: pos.startsWith("t") ? 0 : undefined,
            bottom: pos.startsWith("b") ? 0 : undefined,
            left: pos.endsWith("l") ? 0 : undefined,
            right: pos.endsWith("r") ? 0 : undefined,
            borderTop: pos.startsWith("t") ? "1px solid var(--violet-soft)" : undefined,
            borderBottom: pos.startsWith("b") ? "1px solid var(--violet-soft)" : undefined,
            borderLeft: pos.endsWith("l") ? "1px solid var(--violet-soft)" : undefined,
            borderRight: pos.endsWith("r") ? "1px solid var(--violet-soft)" : undefined,
            opacity: 0.5,
          }}
        />
      ))}
      <div
        className="font-mono text-[9px] tracking-[0.22em] uppercase mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col justify-center min-h-[calc(100vh)] px-[5vw] py-12 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Character animation — anchored right, vertically centered */}
      <div
        className="absolute right-[2vw] top-1/2 -translate-y-1/2 select-none pointer-events-none hidden md:block"
        aria-hidden
      >
        <CharacterAnimation
          style={{
            width: "auto",
            height: "min(78vh, 660px)",
          }}
        />
      </div>

      {/* MASSIVE NAME (matches /4 monolith treatment) */}
      <h1
        className="relative z-10 fade-up font-mono font-medium mb-10"
        style={{
          fontSize: "clamp(52px, 11.5vw, 160px)",
          lineHeight: "0.96",
          letterSpacing: "-0.045em",
          color: "var(--text-primary)",
        }}
      >
        sashreek<br />addanki
      </h1>

      {/* HAIRLINE DIVIDER */}
      <div
        className="relative z-10 h-px w-full mb-8"
        style={{ background: "var(--gray-800)" }}
      />

      {/* LOWER ROW — 4 corner-bracket panels */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[100%]">
        {/* IDENTITY */}
        <CornerBox label="sys · identity">
          <p
            className="font-mono text-[12px] leading-[1.7]"
            style={{ color: "var(--text-secondary)" }}
          >
            computing science<br />@ ualberta<br />
            <span style={{ color: "var(--text-muted)" }}>
              ai + systems · co-op
            </span>
          </p>
        </CornerBox>

        {/* THESIS */}
        <CornerBox label="sys · thesis">
          <p
            className="text-[14px] leading-[1.7]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            I understand the machine before I build on top of it.
          </p>
        </CornerBox>

        {/* STACK */}
        <CornerBox label="sys · stack">
          <div
            className="font-mono text-[11px] leading-[1.85]"
            style={{ color: "var(--text-secondary)" }}
          >
            {STACK.map((row, i) => (
              <div key={i}>{row.join(" · ")}</div>
            ))}
          </div>
        </CornerBox>

        {/* NAVIGATE */}
        <CornerBox label="sys · navigate">
          <div
            className="flex items-center gap-2 font-mono text-[11px] font-medium mb-3"
            style={{ color: "var(--green-bright)" }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full"
              style={{
                background: "var(--green-mid)",
                animation: "pulse-dot 2.5s ease-in-out infinite",
              }}
            />
            open · internships
          </div>
          <div className="flex flex-col gap-1">
            {LINKS.map(({ href, label }) => {
              const ext = href === "/resume";
              return (
                <a
                  key={href}
                  href={href}
                  className="group flex items-center justify-between font-mono text-[12px] py-1 transition-colors duration-150"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                  }}
                >
                  <span>{label}</span>
                  <span style={{ opacity: 0.4 }}>{ext ? "→" : "↓"}</span>
                </a>
              );
            })}
          </div>
        </CornerBox>
      </div>
    </section>
  );
}
