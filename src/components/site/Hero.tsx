"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle parallax on the ambient glow
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 20;
      const y = ((e.clientY - top) / height - 0.5) * 20;
      el.style.setProperty("--glow-x", `calc(50% + ${x}px)`);
      el.style.setProperty("--glow-y", `calc(50% + ${y}px)`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative flex items-center justify-center min-h-[calc(100vh-73px)] px-[6vw] py-20"
      style={
        {
          "--glow-x": "50%",
          "--glow-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Ambient violet glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 62% 52% at var(--glow-x) var(--glow-y), color-mix(in srgb, var(--violet-dim) 10%, transparent), transparent 70%)",
        }}
      />

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ animation: "bounceCue 2s ease-in-out infinite" }}
      >
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--text-muted)" }}>scroll</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "var(--text-muted)" }}>
          <path d="M1 1L6 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="relative z-10 grid w-full max-w-[1160px] items-end gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p
            className="fade-up font-mono text-[11px] font-medium tracking-[0.14em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            systems-first engineering
          </p>

          <h1
            className="fade-up fade-up-1 mt-5 font-mono font-medium leading-[0.96] tracking-[-0.05em]"
            style={{
              fontSize: "clamp(58px, 9vw, 104px)",
              color: "var(--text-primary)",
            }}
          >
            <span className="block">sashreek</span>
            <span className="block">addanki</span>
          </h1>

          <p
            className="fade-up fade-up-2 mt-5 font-mono text-[13px] tracking-[0.05em]"
            style={{ color: "var(--text-muted)" }}
          >
            computing science @ ualberta&nbsp;&nbsp;·&nbsp;&nbsp;ai + systems
          </p>

          <p
            className="fade-up fade-up-2 mt-6 max-w-[620px] text-[17px] leading-[1.85]"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            I understand the machine before I build on top of it.
          </p>

          <div className="fade-up fade-up-3 mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a
              href="#work"
              className="font-mono text-[13px] px-5 py-2.5 transition-all duration-200 hover:-translate-y-[2px]"
              style={{
                color: "var(--bg-base)",
                background: "var(--text-primary)",
                border: "1px solid var(--text-primary)",
                borderRadius: "4px",
              }}
            >
              view work
            </a>
            <a
              href="/resume"
              className="font-mono text-[13px] px-5 py-2.5 transition-all duration-200 hover:-translate-y-[2px]"
              style={{
                color: "var(--text-primary)",
                border: "1px solid var(--gray-800)",
                borderRadius: "4px",
              }}
            >
              resume
            </a>
          </div>

          <div className="fade-up fade-up-3 mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 font-mono text-[12px] lg:justify-start">
            {[
              { href: "/about", label: "about" },
              {
                href: "https://github.com/Sashreek007",
                label: "github ↗",
                external: true,
              },
              {
                href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
                label: "linkedin ↗",
                external: true,
              },
            ].map(({ href, label, external }) => (
              <a
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer noopener" : undefined}
                className="transition-colors duration-200"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-muted)";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div
          className="fade-up fade-up-3 hidden lg:block"
          style={{
            border: "1px solid color-mix(in srgb, var(--gray-800) 82%, transparent)",
            borderRadius: "8px",
            background: "color-mix(in srgb, var(--bg-elevated) 72%, transparent)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="px-5 py-3 font-mono text-[11px] tracking-[0.12em] uppercase"
            style={{
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--gray-800)",
            }}
          >
            signal
          </div>

          <div className="flex flex-col">
            {[
              { label: "available", value: "internships", tone: "var(--green-bright)" },
              { label: "focus", value: "backend / ai systems / mlops" },
              { label: "track", value: "co-op stream" },
              { label: "grad", value: "2028" },
            ].map(({ label, value, tone }, i, arr) => (
              <div
                key={label}
                className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 px-5 py-4"
                style={{
                  borderBottom:
                    i < arr.length - 1 ? "1px solid var(--gray-800)" : "none",
                }}
              >
                <span
                  className="font-mono text-[11px] tracking-[0.08em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
                <span
                  className="text-[14px] leading-[1.55]"
                  style={{
                    color: tone ?? "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
