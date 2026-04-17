"use client";

// Design 3 — BROADSHEET
// Magazine / editorial layout. Giant stacked name at ~14 vw dominates the page.
// Left vertical strip carries a rotated label. Columns divide the content below
// the name. Horizontal rules + pull-quote. Pure typographic composition.

const LINKS = [
  { href: "/#work",   label: "projects" },
  { href: "/#about",  label: "about" },
  { href: "https://github.com/Sashreek007", label: "github ↗", ext: true },
  { href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", label: "linkedin ↗", ext: true },
  { href: "/resume",  label: "resume" },
];

export default function Design3() {
  return (
    <section
      className="relative min-h-[calc(100vh-73px)] flex"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Thin left strip with rotated label */}
      <div
        className="hidden lg:flex flex-col items-center justify-center shrink-0"
        style={{
          width: "48px",
          borderRight: "1px solid var(--gray-800)",
        }}
      >
        <span
          className="font-mono text-[9px] tracking-[0.25em] uppercase whitespace-nowrap"
          style={{
            color: "var(--text-muted)",
            transform: "rotate(-90deg)",
          }}
        >
          portfolio · spring 2026
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-8 md:px-14 py-16 justify-center">

        {/* Issue marker */}
        <div className="flex items-center gap-4 mb-10">
          <span className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: "var(--text-muted)" }}>
            vol. 01
          </span>
          <span className="flex-1 h-px" style={{ background: "var(--gray-800)" }} />
          <span className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: "var(--text-muted)" }}>
            sashreek addanki
          </span>
        </div>

        {/* Massive stacked name — the whole hero */}
        <h1
          className="fade-up"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "clamp(72px, 14vw, 180px)",
            lineHeight: "0.88",
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            marginBottom: "0.45em",
          }}
        >
          sashreek<br />
          <span style={{ color: "color-mix(in srgb, var(--text-primary) 55%, transparent)" }}>
            addanki
          </span>
        </h1>

        {/* Thick rule */}
        <div className="h-[2px] w-full mb-8" style={{ background: "var(--gray-800)" }} />

        {/* Three-column lower section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

          {/* Col 1 — role + location */}
          <div>
            <p
              className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3"
              style={{ color: "var(--violet-soft)" }}
            >
              background
            </p>
            <p className="font-mono text-[13px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
              computing science<br />
              @ ualberta<br />
              edmonton, ab<br />
              class of 2028
            </p>
          </div>

          {/* Col 2 — thesis / pull-quote */}
          <div style={{ borderLeft: "2px solid var(--violet-dim)", paddingLeft: "1.5rem" }}>
            <p
              className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3"
              style={{ color: "var(--violet-soft)" }}
            >
              thesis
            </p>
            <p
              className="text-[15px] leading-[1.75] italic"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              "I understand the machine before I build on top of it."
            </p>
          </div>

          {/* Col 3 — status + links */}
          <div>
            <p
              className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3"
              style={{ color: "var(--violet-soft)" }}
            >
              contact
            </p>
            <div
              className="flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.06em] mb-5"
              style={{ color: "var(--green-bright)" }}
            >
              <span
                className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{ background: "var(--green-mid)", animation: "pulse-dot 2.5s ease-in-out infinite" }}
              />
              available for internships
            </div>
            <div className="flex flex-wrap gap-2">
              {LINKS.map(({ href, label, ext }) => (
                <a
                  key={href}
                  href={href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noreferrer noopener" : undefined}
                  className="font-mono text-[11px] px-3 py-1.5 transition-all duration-200 hover:-translate-y-[1px]"
                  style={{
                    color: "var(--text-muted)",
                    border: "1px solid var(--gray-800)",
                    borderRadius: "3px",
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
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="h-px w-full" style={{ background: "var(--gray-800)" }} />
      </div>
    </section>
  );
}
