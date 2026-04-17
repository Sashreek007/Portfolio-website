"use client";

import { useEffect, useRef } from "react";
import DeveloperAnimation from "./DeveloperAnimation";

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
            "radial-gradient(ellipse 60% 50% at var(--glow-x) var(--glow-y), color-mix(in srgb, var(--violet-dim) 8%, transparent), transparent 70%)",
        }}
      />

      {/* Subtle crosshatch texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--gray-600) 0px, transparent 1px, transparent 32px, var(--gray-600) 32px), repeating-linear-gradient(90deg, var(--gray-600) 0px, transparent 1px, transparent 32px, var(--gray-600) 32px)",
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

      {/* ── 3-column grid: illustration | content | code panel ─────────── */}
      <div className="relative z-10 grid w-full max-w-[1280px] items-center gap-10 lg:grid-cols-[1fr_minmax(auto,540px)_1fr] lg:gap-12">

        {/* Left — developer illustration (decorative) */}
        <div className="hidden lg:flex justify-end pointer-events-none">
          <div
            className="fade-up"
            style={{
              color: "var(--text-primary)",
              opacity: 0.62,
              animationDelay: "120ms",
            }}
          >
            <DeveloperAnimation
              style={{
                width: "min(440px, 34vw)",
                height: "auto",
              }}
            />
          </div>
        </div>

        {/* Center — name, role, thesis, badge, CTAs */}
        <div className="flex flex-col items-center text-center gap-4">
          <h1
            className="fade-up font-mono font-medium leading-[1.05] tracking-[-0.03em]"
            style={{
              fontSize: "clamp(48px, 8vw, 72px)",
              color: "var(--text-primary)",
            }}
          >
            sashreek addanki
          </h1>

          <p
            className="fade-up fade-up-1 font-mono text-[14px]"
            style={{ color: "var(--text-muted)" }}
          >
            computing science @ ualberta&nbsp;&nbsp;·&nbsp;&nbsp;ai + systems
          </p>

          <p
            className="fade-up fade-up-2 text-[16px] leading-[1.75] max-w-[520px] mt-2"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            I understand the machine before I build on top of it.
          </p>

          <div
            className="fade-up fade-up-3 flex items-center gap-2 mt-2 font-mono text-[12px] font-medium tracking-[0.06em]"
            style={{ color: "var(--green-bright)" }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full flex-shrink-0"
              style={{
                background: "var(--green-mid)",
                animation: "pulse-dot 2.5s ease-in-out infinite",
              }}
            />
            available for internships
          </div>

          <div className="fade-up fade-up-3 flex flex-wrap justify-center gap-3 mt-6">
            {[
              { href: "#work", label: "projects" },
              { href: "#about", label: "about" },
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
              { href: "/resume", label: "resume" },
            ].map(({ href, label, external }) => (
              <a
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer noopener" : undefined}
                className="font-mono text-[13px] px-4 py-2 transition-all duration-200 hover:-translate-y-[2px]"
                style={{
                  color: "var(--text-muted)",
                  border: "1px solid var(--gray-800)",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "color-mix(in srgb, var(--violet-soft) 50%, transparent)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "var(--gray-800)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-muted)";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Right — terminal/code editor decoration */}
        <div className="hidden lg:flex justify-start pointer-events-none">
          <div
            className="fade-up fade-up-2"
            style={{
              width: "min(300px, 24vw)",
              opacity: 0.55,
            }}
          >
            <CodePanel />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Decorative code panel (right side) ─────────────────────────────────────
function CodePanel() {
  return (
    <div
      className="font-mono"
      style={{
        border: "1px solid var(--gray-800)",
        borderRadius: "6px",
        background: "color-mix(in srgb, var(--bg-elevated) 60%, transparent)",
        overflow: "hidden",
        backdropFilter: "blur(2px)",
      }}
    >
      {/* title bar */}
      <div
        className="flex items-center gap-1.5 px-3 py-2"
        style={{ borderBottom: "1px solid var(--gray-800)" }}
      >
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: "var(--gray-600)" }} />
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: "var(--gray-600)" }} />
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: "var(--gray-600)" }} />
        <span
          className="ml-3 text-[10px] tracking-[0.08em]"
          style={{ color: "var(--text-muted)" }}
        >
          ~/sashreek — main
        </span>
      </div>

      {/* code body */}
      <div
        className="px-3 py-3 text-[10.5px] leading-[1.7]"
        style={{ color: "var(--text-secondary)" }}
      >
        <div>
          <span style={{ color: "var(--violet-soft)" }}>const</span>{" "}
          <span style={{ color: "var(--text-primary)" }}>me</span>{" "}
          <span style={{ color: "var(--text-muted)" }}>=</span> {"{"}
        </div>
        <div className="pl-3">
          <span style={{ color: "var(--text-muted)" }}>role:</span>{" "}
          <span style={{ color: "var(--green-bright)" }}>{"\"swe\""}</span>,
        </div>
        <div className="pl-3">
          <span style={{ color: "var(--text-muted)" }}>focus:</span> [
          <span style={{ color: "var(--green-bright)" }}>{"\"systems\""}</span>,{" "}
          <span style={{ color: "var(--green-bright)" }}>{"\"ai\""}</span>],
        </div>
        <div className="pl-3">
          <span style={{ color: "var(--text-muted)" }}>year:</span>{" "}
          <span style={{ color: "var(--amber-bright)" }}>2028</span>,
        </div>
        <div className="pl-3">
          <span style={{ color: "var(--text-muted)" }}>shipping:</span>{" "}
          <span style={{ color: "var(--green-bright)" }}>true</span>,
        </div>
        <div>{"}"};</div>
        <div className="mt-2 flex items-center gap-1">
          <span style={{ color: "var(--violet-soft)" }}>{">"}</span>
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "12px",
              background: "var(--violet-soft)",
              animation: "blink-cursor 1.1s steps(2) infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}
