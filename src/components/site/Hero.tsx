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
      <div className="grid w-full gap-12 lg:gap-8 items-center grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">

        {/* ── LEFT: name + subtitle + status ─────────────────────────── */}
        <div className="flex flex-col">
          {/* Massive name */}
          <h1
            className="fade-up font-mono font-medium"
            style={{
              fontSize: "clamp(48px, 9.5vw, 140px)",
              lineHeight: "0.98",
              letterSpacing: "-0.045em",
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

          {/* Availability */}
          <div
            className="inline-flex items-center gap-2 self-start font-mono text-[12px] font-medium tracking-[0.06em]"
            style={{ color: "var(--green-bright)" }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full shrink-0"
              style={{
                background: "var(--green-mid)",
                animation: "pulse-dot 2.5s ease-in-out infinite",
              }}
            />
            available for internships
          </div>
        </div>

        {/* ── RIGHT: animated workspace ──────────────────────────────── */}
        <div className="relative w-full max-w-[560px] mx-auto lg:mx-0 lg:justify-self-end">
          <WorkspaceAnimation
            className="w-full h-auto block"
            style={{ aspectRatio: "600 / 700" }}
          />
        </div>
      </div>
    </section>
  );
}
