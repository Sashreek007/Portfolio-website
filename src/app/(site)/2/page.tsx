"use client";

// Design 2 — BLUEPRINT
// Engineering / technical-drawing aesthetic.
// Fine violet grid covers the background. Name at large scale with spec table,
// horizontal dividers, and corner annotation marks — like a technical spec sheet.

const LINKS = [
  { href: "/#work",   label: "projects" },
  { href: "/#about",  label: "about" },
  { href: "https://github.com/Sashreek007", label: "github ↗", ext: true },
  { href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", label: "linkedin ↗", ext: true },
  { href: "/resume",  label: "resume" },
];

function CornerMark({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const t = pos.startsWith("t") ? 0 : undefined;
  const b = pos.startsWith("b") ? 0 : undefined;
  const l = pos.endsWith("l") ? 0 : undefined;
  const r = pos.endsWith("r") ? 0 : undefined;
  return (
    <span
      className="absolute w-5 h-5"
      style={{
        top: t, bottom: b, left: l, right: r,
        borderTop: pos.startsWith("t") ? "1px solid var(--violet-soft)" : undefined,
        borderBottom: pos.startsWith("b") ? "1px solid var(--violet-soft)" : undefined,
        borderLeft: pos.endsWith("l") ? "1px solid var(--violet-soft)" : undefined,
        borderRight: pos.endsWith("r") ? "1px solid var(--violet-soft)" : undefined,
        opacity: 0.6,
      }}
    />
  );
}

export default function Design2() {
  return (
    <section
      className="relative flex items-center justify-center min-h-[calc(100vh-73px)] px-[6vw] py-20"
      style={{
        backgroundImage: [
          "linear-gradient(color-mix(in srgb,var(--violet-dim) 15%,transparent) 1px, transparent 1px)",
          "linear-gradient(90deg, color-mix(in srgb,var(--violet-dim) 15%,transparent) 1px, transparent 1px)",
        ].join(","),
        backgroundSize: "44px 44px",
      }}
    >
      {/* Corner watermark */}
      <div
        className="absolute bottom-10 right-[6vw] font-mono text-[9px] tracking-[0.18em] uppercase text-right"
        style={{ color: "var(--text-muted)", opacity: 0.5 }}
      >
        rev. 2026.04<br />edmonton, ab
      </div>

      {/* Central spec block */}
      <div className="relative w-full max-w-[820px]">

        {/* Corner marks on outer frame */}
        <CornerMark pos="tl" />
        <CornerMark pos="tr" />
        <CornerMark pos="bl" />
        <CornerMark pos="br" />

        <div className="px-10 py-14">

          {/* Top spec line */}
          <div className="flex items-center gap-4 mb-10">
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase shrink-0" style={{ color: "var(--violet-soft)" }}>
              spec no. 001
            </span>
            <span className="flex-1 h-px" style={{ background: "var(--gray-800)" }} />
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase shrink-0" style={{ color: "var(--text-muted)" }}>
              computing science
            </span>
          </div>

          {/* Giant name */}
          <h1
            style={{
              fontSize: "clamp(56px, 9.5vw, 118px)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.04em",
              lineHeight: "0.92",
            }}
          >
            sashreek<br />addanki
          </h1>

          {/* Horizontal rule */}
          <div className="my-10 h-px w-full" style={{ background: "var(--gray-800)" }} />

          {/* Spec table — 4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6 mb-10">
            {[
              { label: "designation", value: "swe intern" },
              { label: "focus area",  value: "ai + systems" },
              { label: "institution", value: "ualberta" },
              { label: "grad year",   value: "2028" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--violet-soft)" }}>
                  {label}
                </p>
                <p className="font-mono text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Thesis */}
          <p
            className="text-[15px] leading-[1.8] mb-10 max-w-[560px]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            I understand the machine before I build on top of it.
          </p>

          {/* Horizontal rule */}
          <div className="mb-8 h-px w-full" style={{ background: "var(--gray-800)" }} />

          {/* Bottom row: status + links */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Status */}
            <div className="flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.06em]" style={{ color: "var(--green-bright)" }}>
              <span
                className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{ background: "var(--green-mid)", animation: "pulse-dot 2.5s ease-in-out infinite" }}
              />
              available for internships
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {LINKS.map(({ href, label, ext }) => (
                <a
                  key={href}
                  href={href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noreferrer noopener" : undefined}
                  className="font-mono text-[12px] px-3 py-1.5 transition-all duration-200 hover:-translate-y-[2px]"
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
      </div>
    </section>
  );
}
