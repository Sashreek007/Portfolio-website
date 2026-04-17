"use client";

// Hero — monolith name on top, hairline divider, professional Lottie character
// animation in the lower space. No more text panels (sys · identity / thesis /
// stack / navigate) — the animation owns that area now. A small status row
// keeps the "available for internships" pulse + key external links visible.

import DeveloperLottie from "./DeveloperLottie";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col min-h-[100vh] px-[5vw] pt-12 pb-8 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* MASSIVE NAME */}
      <h1
        className="relative z-10 fade-up font-mono font-medium"
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
        className="relative z-10 h-px w-full mt-8 mb-6"
        style={{ background: "var(--gray-800)" }}
      />

      {/* SMALL STATUS ROW (above the animation) */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-y-3 gap-x-6 mb-2">
        <p
          className="font-mono text-[12px]"
          style={{ color: "var(--text-muted)" }}
        >
          computing science @ ualberta&nbsp;&nbsp;·&nbsp;&nbsp;ai + systems
        </p>

        <div
          className="flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.06em]"
          style={{ color: "var(--green-bright)" }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full shrink-0"
            style={{
              background: "var(--green-mid)",
              animation: "pulse-dot 2.5s ease-in-out infinite",
            }}
          />
          available for internships
        </div>
      </div>

      {/* ANIMATION — fills remaining vertical space */}
      <div className="relative z-10 flex-1 flex items-center justify-center min-h-0">
        <DeveloperLottie
          className="w-full max-w-[820px]"
          style={{
            aspectRatio: "1330 / 920",
            maxHeight: "min(60vh, 540px)",
          }}
        />
      </div>
    </section>
  );
}
