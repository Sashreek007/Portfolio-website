"use client";

// Design 1 — TERMINAL
// Two-column: animated boot-log panel left, hero content right.
// Authentic terminal chrome, staggered line reveal, scanline overlay.

import { useState, useEffect } from "react";

const BOOT: { text: string; type: "muted" | "ok" | "hi" | "prompt" }[] = [
  { text: "SASHREEK_OS v2.0 — boot sequence", type: "muted" },
  { text: "─────────────────────────────────", type: "muted" },
  { text: "cpu:  curiosity_engine × 8 cores  OK", type: "ok" },
  { text: "mem:  16 GB learning buffer        OK", type: "ok" },
  { text: "net:  eth0 → github.com            UP", type: "ok" },
  { text: "disk: /projects mounted read-write OK", type: "ok" },
  { text: "", type: "muted" },
  { text: "loading: python .............. DONE", type: "muted" },
  { text: "loading: go .................. DONE", type: "muted" },
  { text: "loading: c++ ................. DONE", type: "muted" },
  { text: "loading: systems_theory ...... DONE", type: "muted" },
  { text: "loading: ml_frameworks ....... DONE", type: "muted" },
  { text: "", type: "muted" },
  { text: "ENV  UNIVERSITY=ualberta", type: "muted" },
  { text: "ENV  FOCUS=systems+ai", type: "muted" },
  { text: "ENV  GRAD_YEAR=2028", type: "muted" },
  { text: "ENV  LOCATION=edmonton,ab", type: "muted" },
  { text: "", type: "muted" },
  { text: "identity authenticated         ✓", type: "ok" },
  { text: "STATUS: OPEN TO INTERNSHIPS    ✓", type: "hi" },
  { text: "", type: "muted" },
  { text: "$ _", type: "prompt" },
];

const LINKS = [
  { href: "/#work",   label: "projects" },
  { href: "/#about",  label: "about" },
  { href: "https://github.com/Sashreek007", label: "github ↗", ext: true },
  { href: "https://www.linkedin.com/in/sashreek-addanki-121471257/", label: "linkedin ↗", ext: true },
  { href: "/resume",  label: "resume" },
];

export default function Design1() {
  const [visible, setVisible] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisible(i);
      if (i >= BOOT.length) clearInterval(id);
    }, 95);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative flex min-h-[calc(100vh-73px)]"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Subtle scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)",
        }}
      />

      {/* ── LEFT — terminal window ──────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col shrink-0 relative z-10"
        style={{
          width: "min(380px, 32vw)",
          borderRight: "1px solid var(--gray-800)",
        }}
      >
        {/* Chrome bar */}
        <div
          className="flex items-center gap-2 px-4 py-[10px] shrink-0"
          style={{ borderBottom: "1px solid var(--gray-800)", background: "var(--bg-surface)" }}
        >
          <span className="w-[11px] h-[11px] rounded-full" style={{ background: "#FF5F57" }} />
          <span className="w-[11px] h-[11px] rounded-full" style={{ background: "#FFBD2E" }} />
          <span className="w-[11px] h-[11px] rounded-full" style={{ background: "#28C840" }} />
          <span
            className="ml-4 font-mono text-[10px] tracking-[0.06em]"
            style={{ color: "var(--text-muted)" }}
          >
            sashreek — bash — 80×24
          </span>
        </div>

        {/* Log */}
        <div
          className="flex-1 overflow-hidden px-5 py-4 font-mono text-[10.5px] leading-[1.9]"
          style={{ color: "var(--text-muted)" }}
        >
          {BOOT.slice(0, visible).map((line, i) => {
            const isLast = i === visible - 1;
            const color =
              line.type === "ok" ? "var(--green-bright)" :
              line.type === "hi" ? "var(--green-bright)" :
              line.type === "prompt" ? "var(--violet-soft)" :
              "var(--text-muted)";

            if (line.type === "prompt" && isLast) {
              return (
                <div key={i} style={{ color }}>
                  {"$ "}
                  <span
                    style={{
                      display: "inline-block",
                      width: "7px",
                      height: "13px",
                      background: "var(--violet-soft)",
                      opacity: cursor ? 1 : 0,
                      verticalAlign: "text-bottom",
                    }}
                  />
                </div>
              );
            }

            return (
              <div
                key={i}
                style={{
                  color,
                  fontWeight: line.type === "hi" ? 600 : 400,
                }}
              >
                {line.text || "\u00A0"}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT — hero content ───────────────────────────────── */}
      <div className="flex-1 flex items-center px-[6vw] lg:px-16 py-20 relative z-10">
        <div className="max-w-[580px]">

          {/* Eyebrow */}
          <p
            className="font-mono text-[10px] tracking-[0.22em] uppercase mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            portfolio / 2026
          </p>

          {/* Name */}
          <h1
            className="font-mono font-medium mb-5"
            style={{
              fontSize: "clamp(46px, 6.5vw, 76px)",
              lineHeight: "1.03",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            sashreek<br />addanki
          </h1>

          {/* Role */}
          <p
            className="font-mono text-[13px] mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            computing science @ ualberta&nbsp;&nbsp;·&nbsp;&nbsp;ai + systems
          </p>

          {/* Thesis */}
          <p
            className="text-[16px] leading-[1.8] mb-8 max-w-[460px]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            I understand the machine before I build on top of it.
          </p>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.06em] mb-10"
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

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            {LINKS.map(({ href, label, ext }) => (
              <a
                key={href}
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noreferrer noopener" : undefined}
                className="font-mono text-[13px] px-4 py-2 transition-all duration-200 hover:-translate-y-[2px]"
                style={{
                  color: "var(--text-muted)",
                  border: "1px solid var(--gray-800)",
                  borderRadius: "4px",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "color-mix(in srgb, var(--violet-soft) 50%, transparent)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gray-800)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
