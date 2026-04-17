"use client";

// Design 6 — STATUS_MONOLITH
// Layout of /4 (massive top name, ghosted "01" backdrop, hairline divider,
// horizontal content row below) fused with the vibes of /5 (corner-bracket
// panels, sys · labels, live uptime counter, language bars, data readouts).

import { useState, useEffect } from "react";

const STACK = [
  { lang: "python", pct: 90 },
  { lang: "typescript", pct: 82 },
  { lang: "go", pct: 72 },
];

const LINKS = [
  { href: "/#work",   label: "projects" },
  { href: "/#about",  label: "about" },
  { href: "https://github.com/Sashreek007", label: "github ↗", ext: true },
  { href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", label: "linkedin ↗", ext: true },
  { href: "/resume",  label: "resume" },
];

function elapsed(start: number) {
  const s = Math.floor((Date.now() - start) / 1000);
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

function CornerBox({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative p-5 ${className}`}>
      {(["tl", "tr", "bl", "br"] as const).map(pos => (
        <span
          key={pos}
          className="absolute w-3.5 h-3.5 pointer-events-none"
          style={{
            top: pos.startsWith("t") ? 0 : undefined,
            bottom: pos.startsWith("b") ? 0 : undefined,
            left: pos.endsWith("l") ? 0 : undefined,
            right: pos.endsWith("r") ? 0 : undefined,
            borderTop: pos.startsWith("t") ? "1px solid var(--violet-soft)" : undefined,
            borderBottom: pos.startsWith("b") ? "1px solid var(--violet-soft)" : undefined,
            borderLeft: pos.endsWith("l") ? "1px solid var(--violet-soft)" : undefined,
            borderRight: pos.endsWith("r") ? "1px solid var(--violet-soft)" : undefined,
            opacity: 0.55,
          }}
        />
      ))}
      <div
        className="font-mono text-[9px] tracking-[0.22em] uppercase mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export default function Design6() {
  const [start] = useState(() => Date.now());
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    const id = setInterval(() => setUptime(elapsed(start)), 1000);
    return () => clearInterval(id);
  }, [start]);

  return (
    <section
      className="relative flex flex-col justify-center min-h-[calc(100vh-73px)] px-[5vw] py-12 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ghost decoration — outline 01, anchored right */}
      <div
        className="absolute right-[-2vw] top-1/2 -translate-y-1/2 select-none pointer-events-none"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(240px, 40vw, 500px)",
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px color-mix(in srgb, var(--gray-800) 70%, transparent)",
          letterSpacing: "-0.05em",
          opacity: 0.5,
        }}
        aria-hidden
      >
        01
      </div>

      {/* TOP STATUS BAR */}
      <div className="relative z-10 flex items-center justify-between mb-12 flex-wrap gap-4">
        <span
          className="font-mono text-[10px] tracking-[0.22em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          sys · portfolio · v2026.04
        </span>
        <div
          className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{
              background: "var(--green-mid)",
              animation: "pulse-dot 2.5s ease-in-out infinite",
            }}
          />
          live · uptime{" "}
          <span className="tabular-nums" style={{ color: "var(--violet-soft)" }}>
            {uptime}
          </span>
        </div>
      </div>

      {/* MASSIVE NAME */}
      <h1
        className="relative z-10 fade-up font-mono font-medium mb-10"
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
        className="relative z-10 h-px w-full mb-8"
        style={{ background: "var(--gray-800)" }}
      />

      {/* LOWER ROW — 4 corner-bracket panels */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* IDENTITY */}
        <CornerBox label="sys · identity">
          <p
            className="font-mono text-[12px] mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            computing science<br />@ ualberta · ai + systems
          </p>
          <p
            className="text-[13px] leading-[1.7] italic"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            "I understand the machine before I build on top of it."
          </p>
        </CornerBox>

        {/* STATUS */}
        <CornerBox label="sys · status">
          <div className="flex flex-col gap-2.5">
            <div
              className="flex items-center gap-2 font-mono text-[12px] font-medium"
              style={{ color: "var(--green-bright)" }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full"
                style={{
                  background: "var(--green-mid)",
                  animation: "pulse-dot 2.5s ease-in-out infinite",
                }}
              />
              open · internships
            </div>
            <p className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              edmonton, ab
            </p>
            <p className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              grad 2028 · co-op
            </p>
            <p
              className="font-mono text-[11px] tabular-nums"
              style={{ color: "var(--violet-soft)" }}
            >
              uptime {uptime}
            </p>
          </div>
        </CornerBox>

        {/* STACK */}
        <CornerBox label="sys · stack">
          <div className="flex flex-col gap-2.5">
            {STACK.map(({ lang, pct }) => (
              <div key={lang}>
                <div className="flex justify-between font-mono text-[10px] mb-1">
                  <span style={{ color: "var(--text-secondary)" }}>{lang}</span>
                  <span style={{ color: "var(--text-muted)" }}>{pct}%</span>
                </div>
                <div
                  className="h-[2px] w-full rounded-full"
                  style={{ background: "var(--gray-800)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, var(--violet-mid), var(--violet-soft))",
                      transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>
              </div>
            ))}
            <p
              className="font-mono text-[10px] mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              + c++, rust, c
            </p>
          </div>
        </CornerBox>

        {/* NAVIGATE */}
        <CornerBox label="sys · navigate">
          <div className="flex flex-col gap-1">
            {LINKS.map(({ href, label, ext }) => (
              <a
                key={href}
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noreferrer noopener" : undefined}
                className="group flex items-center justify-between font-mono text-[12px] py-1.5 transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-primary)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-muted)";
                }}
              >
                <span>{label}</span>
                <span style={{ opacity: 0.4 }}>→</span>
              </a>
            ))}
          </div>
        </CornerBox>
      </div>
    </section>
  );
}
