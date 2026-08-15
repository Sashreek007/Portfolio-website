"use client";

// Hero — left/right split.
//   LEFT  : massive monolith name, subtitle, status indicator
//   RIGHT : animated workspace illustration (custom SVG, no character)
//           — laptop with real typing code editor + animated steam from mug.
//
// On mobile (md and below) the animation drops below the text.

import SystemSchematic from "./SystemSchematic";
import { Magnetic } from "@/components/motion-primitives/magnetic";
import { SiGithub, SiLeetcode, SiMonkeytype } from "react-icons/si";
// Simple Icons dropped LinkedIn, so its glyph comes from Font Awesome.
// "LinkedinIn" is the bare wordmark, matching the other three; "Linkedin"
// bakes in a rounded-square background that would fight the circle.
import { FaLinkedinIn } from "react-icons/fa6";

// `brand` is each service's own colour, revealed on hover via --brand.
// GitHub's mark is officially near-black, which is invisible here, so it
// takes the standard on-dark treatment of white.
const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/Sashreek007",
    Icon: SiGithub,
    brand: "#FFFFFF",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    Icon: FaLinkedinIn,
    brand: "#0A66C2",
  },
  {
    label: "LeetCode",
    href: "https://leetcode.com/u/Sashreek_18/",
    Icon: SiLeetcode,
    brand: "#FFA116",
  },
  {
    label: "monkeytype",
    href: "https://monkeytype.com/profile/Shrek6791",
    Icon: SiMonkeytype,
    brand: "#E2B714",
  },
];

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
          {/* Greeting — reads straight into the name below it ("Hi all, I'm
              sashreek addanki"), so the gap under it is tight. Amber because
              this sits over the nebula's brightest corner, where
              --text-secondary disappeared; amber is the kicker colour
              site-wide. The name stays the h1 — this is not part of it. */}
          <p
            className="fade-up font-mono mb-2 tracking-[0.01em]"
            style={{
              color: "var(--amber-bright)",
              fontSize: "clamp(20px, 2vw, 30px)",
              lineHeight: 1.2,
            }}
          >
            Hi all, I&rsquo;m
          </p>

          {/* Massive name */}
          <h1
            className="fade-up fade-up-1 font-mono font-medium"
            style={{
              fontSize: "clamp(48px, min(8.5vw, 19cqw), 140px)",
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
              <span>3rd year</span>
              <span
                className="inline-block w-[5px] h-[5px] rounded-full"
                style={{ background: "var(--gray-600)" }}
              />
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

            {/* Intro (Syne for some warmth against the mono name). The mono
                row above carries the credential, so this stays on what the
                work actually is rather than restating it. */}
            <p
              className="fade-up fade-up-3 text-[19px] leading-[1.6] max-w-[540px] mb-8"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              I love designing scalable{" "}
              <span style={{ color: "var(--green-bright)" }}>
                backend and distributed systems
              </span>
              , and integrating{" "}
              <span style={{ color: "var(--amber-bright)" }}>AI</span>
              {" "}into them. In my free time I&rsquo;m usually grinding LeetCode
              or chasing a faster monkeytype score.
            </p>

            {/* CTA row — one primary action, then the profiles as icon-only
                circles. Icon buttons carry no text, so each needs an
                aria-label; title gives sighted users the same name on hover. */}
            <div className="fade-up fade-up-4 flex flex-wrap items-center gap-x-4 gap-y-3 justify-center lg:justify-start">
              <Magnetic intensity={0.35} range={110}>
                <a
                  href="#work"
                  className="pill-primary font-mono text-[14px] px-[22px] py-[11px]"
                >
                  view projects <span aria-hidden>→</span>
                </a>
              </Magnetic>

              <div className="flex items-center gap-[10px]">
                {SOCIALS.map(({ label, href, Icon, brand }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    title={label}
                    className="social-circle"
                    style={{ "--brand": brand } as React.CSSProperties}
                  >
                    <Icon size={17} aria-hidden />
                  </a>
                ))}
              </div>
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
