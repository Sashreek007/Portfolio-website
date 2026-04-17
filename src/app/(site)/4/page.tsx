"use client";

// Design 4 — MONOLITH
// Confident negative space. The name spans the full viewport width — nothing else
// competes for attention. A single hairline divides the page. All supporting info
// lives below it in whisper-small type. A giant ghosted "01" anchors the depth.

const LINKS = [
  { href: "/#work",   label: "projects" },
  { href: "/#about",  label: "about" },
  { href: "https://github.com/Sashreek007", label: "github ↗", ext: true },
  { href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", label: "linkedin ↗", ext: true },
  { href: "/resume",  label: "resume" },
];

export default function Design4() {
  return (
    <section
      className="relative flex flex-col justify-center min-h-[calc(100vh-73px)] px-[5vw] overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ghost decoration — massive "01" in background */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(280px, 45vw, 560px)",
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px color-mix(in srgb, var(--gray-800) 60%, transparent)",
          letterSpacing: "-0.05em",
          userSelect: "none",
          opacity: 0.5,
        }}
        aria-hidden
      >
        01
      </div>

      {/* Main name — sized to nearly fill width */}
      <div className="relative z-10 mb-0">
        <h1
          className="fade-up font-mono font-medium"
          style={{
            fontSize: "clamp(52px, 11.5vw, 160px)",
            lineHeight: "0.96",
            letterSpacing: "-0.045em",
            color: "var(--text-primary)",
          }}
        >
          sashreek<br />addanki
        </h1>
      </div>

      {/* Hairline divider */}
      <div
        className="relative z-10 my-10 h-px w-full"
        style={{ background: "var(--gray-800)" }}
      />

      {/* Lower section — all whisper-small */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-y-8 gap-x-12">

        {/* Left column */}
        <div className="flex flex-col gap-4">
          <p
            className="font-mono text-[12px]"
            style={{ color: "var(--text-muted)" }}
          >
            computing science @ ualberta&nbsp;&nbsp;·&nbsp;&nbsp;ai + systems
          </p>
          <p
            className="text-[15px] leading-[1.75] max-w-[440px]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            I understand the machine before I build on top of it.
          </p>

          {/* Availability */}
          <div
            className="inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.08em]"
            style={{ color: "var(--green-bright)" }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full shrink-0"
              style={{ background: "var(--green-mid)", animation: "pulse-dot 2.5s ease-in-out infinite" }}
            />
            available for internships
          </div>
        </div>

        {/* Right — navigation */}
        <nav className="flex flex-wrap gap-3">
          {LINKS.map(({ href, label, ext }) => (
            <a
              key={href}
              href={href}
              target={ext ? "_blank" : undefined}
              rel={ext ? "noreferrer noopener" : undefined}
              className="font-mono text-[12px] px-4 py-2 transition-all duration-200 hover:-translate-y-[2px]"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--gray-800)",
                borderRadius: "4px",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "color-mix(in srgb, var(--violet-soft) 50%, transparent)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gray-800)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
