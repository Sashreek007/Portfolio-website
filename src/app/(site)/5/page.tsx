"use client";

// Design 5 — SYSTEM STATUS
// Server-monitoring / HUD dashboard aesthetic. Four corner-bracket panels arranged
// in a 2×2 grid around a center identity panel. Uptime counter, stack list,
// developer animation in the signals panel. Feels like a real ops dashboard.

import { useState, useEffect } from "react";
import DeveloperAnimation from "@/components/site/DeveloperAnimation";

function elapsed(start: number) {
  const s = Math.floor((Date.now() - start) / 1000);
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

function Panel({
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
      {/* Corner brackets */}
      {(["tl", "tr", "bl", "br"] as const).map(pos => (
        <span
          key={pos}
          className="absolute w-4 h-4 pointer-events-none"
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

      {/* Panel label */}
      <div
        className="font-mono text-[9px] tracking-[0.22em] uppercase mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>

      {children}
    </div>
  );
}

const STACK = [
  { lang: "Python",     pct: 90 },
  { lang: "TypeScript", pct: 82 },
  { lang: "Go",         pct: 72 },
  { lang: "C++",        pct: 65 },
  { lang: "Rust",       pct: 45 },
];

const LINKS = [
  { href: "/#work",  label: "projects" },
  { href: "/#about", label: "about" },
  { href: "https://github.com/Sashreek007", label: "github ↗", ext: true },
  { href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", label: "linkedin ↗", ext: true },
  { href: "/resume", label: "resume" },
];

export default function Design5() {
  const [start] = useState(() => Date.now());
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    const id = setInterval(() => setUptime(elapsed(start)), 1000);
    return () => clearInterval(id);
  }, [start]);

  return (
    <section
      className="relative flex items-center justify-center min-h-[calc(100vh-73px)] px-[5vw] py-14"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ambient violet glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--violet-dim) 7%, transparent), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── ROW 1 ─────────────────────────────────────── */}

        {/* Panel: IDENTITY */}
        <Panel label="sys · identity" className="lg:col-span-2">
          <h1
            className="font-mono font-medium mb-3"
            style={{
              fontSize: "clamp(38px, 5.5vw, 64px)",
              lineHeight: "1.02",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            sashreek addanki
          </h1>
          <p className="font-mono text-[12px] mb-2" style={{ color: "var(--text-muted)" }}>
            computing science @ ualberta&nbsp;&nbsp;·&nbsp;&nbsp;ai + systems
          </p>
          <p
            className="text-[14px] leading-[1.75] max-w-[460px] mt-3"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            I understand the machine before I build on top of it.
          </p>
        </Panel>

        {/* Panel: STATUS */}
        <Panel label="sys · status">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>availability</p>
              <div className="flex items-center gap-2 font-mono text-[13px] font-medium" style={{ color: "var(--green-bright)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--green-mid)", animation: "pulse-dot 2.5s ease-in-out infinite" }} />
                open · internships
              </div>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>location</p>
              <p className="font-mono text-[12px]" style={{ color: "var(--text-secondary)" }}>edmonton, ab</p>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>uptime</p>
              <p className="font-mono text-[12px] tabular-nums" style={{ color: "var(--violet-soft)" }}>{uptime}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>grad</p>
              <p className="font-mono text-[12px]" style={{ color: "var(--text-secondary)" }}>2028 · co-op stream</p>
            </div>
          </div>
        </Panel>

        {/* ── ROW 2 ─────────────────────────────────────── */}

        {/* Panel: STACK */}
        <Panel label="sys · stack">
          <div className="flex flex-col gap-3">
            {STACK.map(({ lang, pct }) => (
              <div key={lang}>
                <div className="flex justify-between font-mono text-[10px] mb-1">
                  <span style={{ color: "var(--text-secondary)" }}>{lang}</span>
                  <span style={{ color: "var(--text-muted)" }}>{pct}%</span>
                </div>
                <div className="h-[3px] w-full rounded-full" style={{ background: "var(--gray-800)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg, var(--violet-mid), var(--violet-soft))",
                      transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Panel: SIGNAL — developer animation */}
        <Panel label="sys · signal" className="flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <DeveloperAnimation
              style={{
                width: "auto",
                height: "min(240px, 28vh)",
                color: "var(--text-primary)",
                opacity: 0.65,
              }}
            />
          </div>
        </Panel>

        {/* Panel: NAV */}
        <Panel label="sys · navigate">
          <div className="flex flex-col gap-2">
            {LINKS.map(({ href, label, ext }) => (
              <a
                key={href}
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noreferrer noopener" : undefined}
                className="group flex items-center justify-between font-mono text-[12px] py-2 px-3 transition-colors duration-150"
                style={{
                  color: "var(--text-muted)",
                  border: "1px solid var(--gray-800)",
                  borderRadius: "3px",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "color-mix(in srgb, var(--violet-soft) 40%, transparent)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gray-800)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                }}
              >
                <span>{label}</span>
                <span style={{ opacity: 0.4 }}>→</span>
              </a>
            ))}
          </div>
        </Panel>

      </div>
    </section>
  );
}
