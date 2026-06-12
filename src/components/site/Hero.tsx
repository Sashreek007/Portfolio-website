"use client";

// Hero — left/right split.
//   LEFT  : massive monolith name, subtitle, status indicator
//   RIGHT : animated workspace illustration (custom SVG, no character)
//           — laptop with real typing code editor + animated steam from mug.
//
// On mobile (md and below) the animation drops below the text.

import SystemSchematic from "./SystemSchematic";

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
              fontSize: "clamp(56px, 10vw, 150px)",
              lineHeight: "0.95",
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
            }}
          >
            sashreek<br />addanki
          </h1>

          {/* Hairline divider — draws itself in after the name lands */}
          <div
            className="draw-x h-px w-full mt-8 mb-6"
            style={{
              background:
                "linear-gradient(to right, color-mix(in srgb, var(--violet-mid) 80%, transparent), var(--gray-800) 60%, transparent)",
            }}
          />

          {/* Subtitle row */}
          <p
            className="fade-up fade-up-2 font-mono text-[15px] mb-4 flex items-center gap-3 flex-wrap justify-center lg:justify-start"
            style={{ color: "var(--text-secondary)" }}
          >
            <span style={{ color: "var(--violet-pale)" }}>computing science</span>
            <span style={{ color: "var(--gray-600)" }}>@</span>
            <span>ualberta</span>
            <span
              className="inline-block w-[5px] h-[5px] rounded-full"
              style={{ background: "var(--gray-600)" }}
            />
            <span style={{ color: "var(--amber-bright)" }}>ai</span>
            <span style={{ color: "var(--gray-600)" }}>+</span>
            <span style={{ color: "var(--green-bright)" }}>systems</span>
          </p>

          {/* Tagline (Syne for some warmth against the mono name) */}
          <p
            className="fade-up fade-up-3 text-[19px] leading-[1.6] max-w-[540px] mb-8"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            I understand the{" "}
            <span style={{ color: "var(--amber-bright)" }}>machine</span>
            {" "}before I build on top of it.
          </p>

          {/* CTA buttons — one primary action, one secondary. Everything
              else (about, blog, socials) already lives in the nav/contact. */}
          <div className="fade-up fade-up-4 flex flex-wrap gap-3 justify-center lg:justify-start">
            <a
              href="#work"
              className="pill-primary font-mono text-[14px] px-[22px] py-[11px]"
            >
              view projects <span aria-hidden>→</span>
            </a>
            <a
              href="/resume"
              className="glass-pill font-mono text-[14px] px-[22px] py-[11px]"
              style={{ color: "var(--text-primary)" }}
            >
              resume
            </a>
          </div>
        </div>

        {/* ── RIGHT: animated workspace ──────────────────────────────── */}
        <div className="fade-up fade-up-2 relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[560px] mx-auto lg:mx-0 lg:justify-self-end">
          <SystemSchematic className="w-full" />
        </div>
      </div>
    </section>
  );
}
