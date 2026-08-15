"use client";

// Hero — left/right split.
//   LEFT  : massive monolith name, subtitle, status indicator
//   RIGHT : animated workspace illustration (custom SVG, no character)
//           — laptop with real typing code editor + animated steam from mug.
//
// On mobile (md and below) the animation drops below the text.

import SystemSchematic from "./SystemSchematic";
import { Magnetic } from "@/components/motion-primitives/magnetic";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] px-[5vw] pt-24 pb-12 overflow-hidden flex items-center"
    >
      {/* Desktop: columns top-align — the name's cap line locks to the
          editor's top border and the left content flows naturally below.
          (Bottom-locking the CTA row was tried and reverted: the gap it
          opens between name and meta block grows with viewport size.) */}
      <div className="grid w-full max-w-[1440px] mx-auto gap-10 lg:gap-8 items-center lg:items-start grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">

        {/* ── LEFT: name + subtitle + status ─────────────────────────── */}
        {/* container-type lets the h1 size against THIS column, so the
            name can never outgrow it and slide under the editor on
            tablet widths (the 22cqw cap ≈ "sashreek" at 4.45em mono) */}
        <div
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
          style={{ containerType: "inline-size" }}
        >
          {/* Massive name */}
          <h1
            className="fade-up font-mono font-medium"
            style={{
              fontSize: "clamp(56px, min(10vw, 22cqw), 168px)",
              lineHeight: "0.95",
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
            }}
          >
            sashreek<br />addanki
          </h1>

          {/* Meta block — divider, subtitle, tagline, CTAs in natural flow
              below the name. */}
          <div className="w-full flex flex-col items-center lg:items-start">
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
              <Magnetic intensity={0.35} range={110}>
                <a
                  href="#work"
                  className="pill-primary font-mono text-[14px] px-[22px] py-[11px]"
                >
                  view projects <span aria-hidden>→</span>
                </a>
              </Magnetic>
              <Magnetic intensity={0.35} range={110}>
                <a
                  href="/resume"
                  className="glass-pill font-mono text-[14px] px-[22px] py-[11px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  resume
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* ── RIGHT: animated workspace ──────────────────────────────── */}
        {/* lg:mt-3 nudges the editor's border down to the name's cap height
            (the h1 box carries ~12px of ascender space above the glyphs at
            desktop sizes). */}
        <div className="fade-up fade-up-2 relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[560px] mx-auto lg:mx-0 lg:mt-3 lg:justify-self-end">
          <SystemSchematic className="w-full" />
        </div>
      </div>
    </section>
  );
}
