"use client";

// Design 6 — STATUS_MONOLITH (rev 2, no gimmicks)
// Layout of /4 (massive top name, ghosted "01" backdrop, hairline divider).
// Aesthetic of /5 (corner-bracket panels, sys · labels, monospace data) —
// but stripped of live counters, animated bars, and any fake metrics.

const STACK = [
  ["python", "go", "c++"],
  ["typescript", "rust", "c"],
  ["pytorch", "langchain", "mcp"],
  ["docker", "postgres", "supabase"],
];

const LINKS = [
  { href: "/#work",   label: "projects" },
  { href: "/#about",  label: "about" },
  { href: "https://github.com/Sashreek007", label: "github ↗", ext: true },
  { href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", label: "linkedin ↗", ext: true },
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

export default function Design6() {
  return (
    <section
      className="relative flex flex-col justify-center min-h-[calc(100vh-73px)] px-[5vw] py-12 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ghost decoration — outline "01", anchored right */}
      <div
        className="absolute right-[-2vw] top-1/2 -translate-y-1/2 select-none pointer-events-none"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(240px, 40vw, 500px)",
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px color-mix(in srgb, var(--gray-800) 70%, transparent)",
          letterSpacing: "-0.05em",
          opacity: 0.5,
        }}
        aria-hidden
      >
        01
      </div>

      {/* TOP STATUS BAR — static, no live counter */}
      <div className="relative z-10 flex items-center justify-between mb-12 flex-wrap gap-4">
        <span
          className="font-mono text-[10px] tracking-[0.22em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          sys · portfolio · 2026
        </span>
        <span
          className="font-mono text-[10px] tracking-[0.22em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          edmonton, ab
        </span>
      </div>

      {/* MASSIVE NAME — unchanged from /4 */}
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

      {/* LOWER ROW — 4 corner-bracket panels, all static content */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* IDENTITY */}
        <CornerBox label="sys · identity">
          <p
            className="font-mono text-[12px] leading-[1.7]"
            style={{ color: "var(--text-secondary)" }}
          >
            computing science<br />@ ualberta<br />
            <span style={{ color: "var(--text-muted)" }}>ai + systems · co-op</span>
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

        {/* STACK — clean text list, no fake percentage bars */}
        <CornerBox label="sys · stack">
          <div className="font-mono text-[11px] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
            {STACK.map((row, i) => (
              <div key={i}>{row.join(" · ")}</div>
            ))}
          </div>
        </CornerBox>

        {/* NAVIGATE — with availability dot at top, then links */}
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
            {LINKS.map(({ href, label, ext }) => (
              <a
                key={href}
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noreferrer noopener" : undefined}
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
                <span style={{ opacity: 0.4 }}>→</span>
              </a>
            ))}
          </div>
        </CornerBox>
      </div>
    </section>
  );
}
