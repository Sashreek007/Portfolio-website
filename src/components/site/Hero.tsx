"use client";

// Hero — left/right split.
//   LEFT  : massive monolith name, subtitle, status indicator
//   RIGHT : animated workspace illustration (custom SVG, no character)
//           — laptop with real typing code editor + animated steam from mug.
//
// On mobile (md and below) the animation drops below the text.

import WorkspaceAnimation from "./WorkspaceAnimation";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100vh] px-[5vw] pt-12 pb-12 overflow-hidden flex items-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="grid w-full max-w-[1440px] mx-auto gap-10 lg:gap-8 items-center grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">

        {/* ── LEFT: name + subtitle + status ─────────────────────────── */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Massive name */}
          <h1
            className="fade-up font-mono font-medium"
            style={{
              fontSize: "clamp(56px, 11vw, 172px)",
              lineHeight: "0.95",
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
            }}
          >
            sashreek<br />addanki
          </h1>

          {/* Hairline divider */}
          <div className="h-px w-full mt-8 mb-6" style={{ background: "var(--gray-800)" }} />

          {/* Subtitle row */}
          <p
            className="font-mono text-[13px] mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            computing science @ ualberta&nbsp;&nbsp;·&nbsp;&nbsp;ai + systems
          </p>

          {/* Tagline (Syne for some warmth against the mono name) */}
          <p
            className="text-[15px] leading-[1.7] max-w-[480px] mb-7"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            I understand the machine before I build on top of it.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {[
              { href: "#about",  label: "about" },
              { href: "#work",   label: "projects" },
              { href: "/resume", label: "resume" },
              { href: "https://github.com/Sashreek007", label: "github ↗", ext: true },
              { href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", label: "linkedin ↗", ext: true },
            ].map(({ href, label, ext }) => (
              <a
                key={href}
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noreferrer noopener" : undefined}
                className="glass-pill font-mono text-[13px] px-[18px] py-[9px]"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-secondary)";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── RIGHT: animated workspace ──────────────────────────────── */}
        <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[560px] mx-auto lg:mx-0 lg:justify-self-end">
          <WorkspaceAnimation
            className="w-full h-auto block"
            style={{ aspectRatio: "600 / 800" }}
          />
        </div>
      </div>
    </section>
  );
}
