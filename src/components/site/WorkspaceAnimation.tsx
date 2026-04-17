"use client";

// WorkspaceAnimation — animated SVG of a developer workspace.
//
// Replaces the character-based Lottie. Focuses on what reads as "developer
// working" without needing to render a face: a real-looking code editor
// (window chrome, file tabs, line numbers, syntax-highlighted code) where
// lines appear one-by-one with a blinking cursor — actual typing motion —
// next to a coffee mug with continuously rising steam, a plant, and a soft
// ambient violet glow.
//
// Pure SVG + CSS keyframes. No external library, no character to get wrong.

import { useEffect, useState } from "react";

type Props = { className?: string; style?: React.CSSProperties };

// Syntax-highlighted code lines. Each entry = [{ text, kind }] segments.
type Seg = { t: string; k: "kw" | "fn" | "var" | "str" | "num" | "punct" | "cm" | "type" };
type Line = { indent: number; segs: Seg[] };

const CODE: Line[] = [
  { indent: 0, segs: [{ t: "const ", k: "kw" }, { t: "build", k: "fn" }, { t: " = ", k: "punct" }, { t: "async ", k: "kw" }, { t: "() => {", k: "punct" }] },
  { indent: 1, segs: [{ t: "const ", k: "kw" }, { t: "ctx", k: "var" }, { t: " = ", k: "punct" }, { t: "await ", k: "kw" }, { t: "init", k: "fn" }, { t: "()", k: "punct" }] },
  { indent: 1, segs: [{ t: "const ", k: "kw" }, { t: "out", k: "var" }, { t: " = ", k: "punct" }, { t: "compile", k: "fn" }, { t: "(", k: "punct" }, { t: "ctx", k: "var" }, { t: ", ", k: "punct" }, { t: '"src"', k: "str" }, { t: ")", k: "punct" }] },
  { indent: 1, segs: [{ t: "if ", k: "kw" }, { t: "(", k: "punct" }, { t: "out", k: "var" }, { t: ".errors > ", k: "punct" }, { t: "0", k: "num" }, { t: ") ", k: "punct" }, { t: "throw ", k: "kw" }, { t: "out", k: "var" }] },
  { indent: 1, segs: [{ t: "// ship it", k: "cm" }] },
  { indent: 1, segs: [{ t: "return ", k: "kw" }, { t: "deploy", k: "fn" }, { t: "(", k: "punct" }, { t: "out", k: "var" }, { t: ", { ", k: "punct" }, { t: "env", k: "var" }, { t: ": ", k: "punct" }, { t: '"prod"', k: "str" }, { t: " })", k: "punct" }] },
  { indent: 0, segs: [{ t: "}", k: "punct" }] },
];

const CHAR_MS = 28;          // time to type one character
const POST_LINE_MS = 220;    // pause after finishing a line
const RESET_PAUSE_MS = 2200; // pause at end before restarting

// Total characters across all lines
const TOTAL_CHARS = CODE.reduce(
  (n, ln) => n + ln.segs.reduce((m, s) => m + s.t.length, 0),
  0,
);
const LINE_CHARS = CODE.map(ln => ln.segs.reduce((m, s) => m + s.t.length, 0));

function colorFor(kind: Seg["k"]): string {
  switch (kind) {
    case "kw":    return "var(--violet-soft)";
    case "fn":    return "var(--green-bright)";
    case "var":   return "var(--text-primary)";
    case "str":   return "var(--amber-bright)";
    case "num":   return "var(--amber-bright)";
    case "type":  return "var(--green-bright)";
    case "cm":    return "var(--text-muted)";
    case "punct": return "var(--text-secondary)";
  }
}

export default function WorkspaceAnimation({ className, style }: Props) {
  // typedChars increments through the typing phase, then resets.
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const totalTypeMs = TOTAL_CHARS * CHAR_MS + (CODE.length - 1) * POST_LINE_MS;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed > totalTypeMs + RESET_PAUSE_MS) {
        start = now;
        setTyped(0);
      } else if (elapsed > totalTypeMs) {
        setTyped(TOTAL_CHARS);
      } else {
        // map elapsed → char count, accounting for between-line pauses
        let remaining = elapsed;
        let chars = 0;
        for (let i = 0; i < CODE.length; i++) {
          const lineMs = LINE_CHARS[i] * CHAR_MS;
          if (remaining <= lineMs) {
            chars += Math.floor(remaining / CHAR_MS);
            break;
          }
          remaining -= lineMs;
          chars += LINE_CHARS[i];
          if (remaining <= POST_LINE_MS) break;
          remaining -= POST_LINE_MS;
        }
        setTyped(Math.min(chars, TOTAL_CHARS));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Determine which line the cursor is on (the line being typed, or the last)
  let acc = 0;
  let cursorLineIdx = CODE.length - 1;
  for (let i = 0; i < CODE.length; i++) {
    acc += LINE_CHARS[i];
    if (typed < acc) { cursorLineIdx = i; break; }
  }
  const cursorVisible = typed < TOTAL_CHARS || true; // always blink

  // Render code as text inside <foreignObject> so we get real font rendering
  return (
    <svg
      viewBox="0 0 600 700"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <radialGradient id="ws-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--violet-mid)" stopOpacity="0.18" />
          <stop offset="60%" stopColor="var(--violet-mid)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--violet-mid)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ws-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gray-800)" />
          <stop offset="100%" stopColor="var(--bg-base)" />
        </linearGradient>
        <linearGradient id="ws-laptop-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2A28" />
          <stop offset="100%" stopColor="#1E1E1B" />
        </linearGradient>
        <linearGradient id="ws-laptop-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1A1A18" />
          <stop offset="100%" stopColor="#2C2C2A" />
        </linearGradient>
        <linearGradient id="ws-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E0E0C" />
          <stop offset="100%" stopColor="#161614" />
        </linearGradient>
        <linearGradient id="ws-mug" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E8A052" />
          <stop offset="55%" stopColor="#C97A24" />
          <stop offset="100%" stopColor="#8C5210" />
        </linearGradient>
        <style>{`
          @keyframes ws-cursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }
          @keyframes ws-steam-a {
            0%   { opacity: 0;   transform: translate(0,0) scaleX(1) }
            10%  { opacity: 0.6; transform: translate(0,-3px) scaleX(1.05) }
            70%  { opacity: 0.4; transform: translate(-4px,-32px) scaleX(1.4) }
            100% { opacity: 0;   transform: translate(-9px,-58px) scaleX(1.7) }
          }
          @keyframes ws-steam-b {
            0%   { opacity: 0;   transform: translate(0,0) scaleX(1) }
            10%  { opacity: 0.6; transform: translate(0,-3px) scaleX(0.9) }
            70%  { opacity: 0.4; transform: translate(3px,-32px) scaleX(0.7) }
            100% { opacity: 0;   transform: translate(7px,-58px) scaleX(0.5) }
          }
          @keyframes ws-steam-c {
            0%   { opacity: 0;   transform: translate(0,0) scaleX(1) }
            10%  { opacity: 0.6; transform: translate(0,-3px) scaleX(1.1) }
            70%  { opacity: 0.4; transform: translate(-2px,-34px) scaleX(1.3) }
            100% { opacity: 0;   transform: translate(-4px,-62px) scaleX(1.5) }
          }
          @keyframes ws-leaf-sway {
            0%,100% { transform: rotate(0deg) }
            50%     { transform: rotate(2.5deg) }
          }
          @keyframes ws-leaf-sway-r {
            0%,100% { transform: rotate(0deg) }
            50%     { transform: rotate(-2.5deg) }
          }
          @keyframes ws-glow-pulse {
            0%,100% { opacity: 0.85 }
            50%     { opacity: 1 }
          }
        `}</style>
      </defs>

      {/* Ambient glow behind the laptop */}
      <ellipse cx="300" cy="280" rx="290" ry="200" fill="url(#ws-glow)" />

      {/* ── DESK SURFACE ─────────────────────────────────────── */}
      {/* Top of desk (slightly receding into perspective) */}
      <path d="M40,520 L560,520 L590,560 L10,560 Z" fill="url(#ws-desk)" />
      {/* Front face of desk */}
      <rect x="10" y="560" width="580" height="20" fill="var(--bg-base)" />
      <line x1="10" y1="560" x2="590" y2="560" stroke="var(--gray-800)" strokeWidth="0.8" />
      {/* Subtle wood grain hints */}
      <line x1="80"  y1="540" x2="200" y2="540" stroke="var(--gray-600)" strokeWidth="0.4" opacity="0.3" />
      <line x1="240" y1="544" x2="380" y2="544" stroke="var(--gray-600)" strokeWidth="0.4" opacity="0.3" />
      <line x1="420" y1="538" x2="540" y2="538" stroke="var(--gray-600)" strokeWidth="0.4" opacity="0.3" />

      {/* ── PLANT (left side of desk) ────────────────────────── */}
      <g>
        {/* Pot */}
        <path d="M35,510 L125,510 L118,560 Q118,565 113,565 L47,565 Q42,565 42,560 Z"
              fill="var(--amber-mid)" />
        <path d="M35,510 L125,510 L118,560 Q118,565 113,565 L47,565 Q42,565 42,560 Z"
              fill="#000" opacity="0.3" />
        <ellipse cx="80" cy="510" rx="45" ry="5" fill="#7E4F0E" />
        <ellipse cx="80" cy="509" rx="42" ry="3.5" fill="var(--amber-bright)" opacity="0.5" />
        {/* Soil */}
        <ellipse cx="80" cy="509" rx="40" ry="2.5" fill="#3D2817" />
        {/* Leaves — back row */}
        <g style={{ transformOrigin: "80px 510px", animation: "ws-leaf-sway 4.5s ease-in-out infinite" }}>
          <ellipse cx="55"  cy="475" rx="11" ry="36" fill="var(--green-mid)"   transform="rotate(-22 55 475)" />
          <ellipse cx="80"  cy="448" rx="11" ry="42" fill="var(--green-mid)" />
          <ellipse cx="105" cy="470" rx="11" ry="36" fill="var(--green-mid)"   transform="rotate(20 105 470)" />
        </g>
        {/* Leaf highlights */}
        <ellipse cx="52"  cy="470" rx="3" ry="20" fill="var(--green-bright)" opacity="0.7" transform="rotate(-22 52 470)" />
        <ellipse cx="77"  cy="442" rx="3" ry="24" fill="var(--green-bright)" opacity="0.7" />
        <ellipse cx="103" cy="465" rx="3" ry="20" fill="var(--green-bright)" opacity="0.7" transform="rotate(20 103 465)" />
        {/* Front leaf */}
        <g style={{ transformOrigin: "92px 510px", animation: "ws-leaf-sway-r 5s ease-in-out infinite" }}>
          <ellipse cx="92" cy="490" rx="9" ry="28" fill="var(--green-deep)" transform="rotate(35 92 490)" />
        </g>
      </g>

      {/* ── COFFEE MUG (right side of desk) ──────────────────── */}
      <g>
        {/* Steam — three wisps, continuous */}
        <g>
          <path d="M495,440 Q491,420 495,400 Q499,380 495,360" fill="none"
                stroke="#E8E6DF" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "ws-steam-a 2.8s ease-out infinite", transformOrigin: "495px 440px" }} />
          <path d="M515,440 Q511,420 515,400 Q519,380 515,360" fill="none"
                stroke="#E8E6DF" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "ws-steam-b 2.8s ease-out 0.9s infinite", transformOrigin: "515px 440px" }} />
          <path d="M535,440 Q531,420 535,400 Q539,380 535,360" fill="none"
                stroke="#E8E6DF" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "ws-steam-c 2.8s ease-out 1.8s infinite", transformOrigin: "535px 440px" }} />
        </g>

        {/* Mug body */}
        <path d="M470,442 L470,510 Q470,520 482,520 L548,520 Q560,520 560,510 L560,442 Z"
              fill="url(#ws-mug)" />
        {/* Mug rim */}
        <ellipse cx="515" cy="442" rx="45" ry="9" fill="#7E4F0E" />
        <ellipse cx="515" cy="440" rx="44" ry="7" fill="#E8A052" />
        {/* Coffee surface */}
        <ellipse cx="515" cy="444" rx="40" ry="6" fill="#3D2010" />
        <ellipse cx="515" cy="443" rx="34" ry="3" fill="#5C3018" opacity="0.7" />
        {/* Handle */}
        <path d="M560,455 Q585,455 585,475 Q585,498 560,498"
              fill="none" stroke="#C97A24" strokeWidth="11" strokeLinecap="round" />
        <path d="M560,455 Q585,455 585,475 Q585,498 560,498"
              fill="none" stroke="#7E4F0E" strokeWidth="11" strokeLinecap="round" opacity="0.4" />
        {/* Highlight */}
        <path d="M478,452 L478,500" stroke="#E8A052" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* ── LAPTOP (center, dominant) ────────────────────────── */}
      {/* Base (perspective: wider at front) */}
      <path d="M168,512 L432,512 L470,560 L130,560 Z" fill="url(#ws-laptop-side)" />
      <line x1="168" y1="512" x2="432" y2="512" stroke="#3C3C3A" strokeWidth="0.8" />
      {/* Trackpad hint */}
      <rect x="252" y="528" width="96" height="14" rx="2" fill="#0E0E0C" opacity="0.7" />

      {/* Screen lid */}
      <rect x="160" y="120" width="280" height="392" rx="6" fill="url(#ws-laptop-top)" />
      {/* Subtle screen bezel */}
      <rect x="170" y="130" width="260" height="372" rx="4" fill="url(#ws-screen)" />
      <rect x="170" y="130" width="260" height="372" rx="4" fill="url(#ws-glow)" opacity="0.45"
            style={{ animation: "ws-glow-pulse 5s ease-in-out infinite" }} />

      {/* Code editor chrome — title bar */}
      <rect x="170" y="130" width="260" height="22" fill="#1A1A18" />
      <circle cx="180" cy="141" r="3.5" fill="#FF5F57" />
      <circle cx="192" cy="141" r="3.5" fill="#FFBD2E" />
      <circle cx="204" cy="141" r="3.5" fill="#28C840" />
      {/* File tabs */}
      <rect x="220" y="130" width="80" height="22" fill="#0E0E0C" />
      <line x1="220" y1="130" x2="220" y2="152" stroke="#2C2C2A" strokeWidth="0.7" />
      <line x1="300" y1="130" x2="300" y2="152" stroke="#2C2C2A" strokeWidth="0.7" />
      {/* Tab text */}
      <text x="260" y="146" fontSize="9" fontFamily="ui-monospace, monospace"
            fill="var(--text-secondary)" textAnchor="middle">build.ts</text>
      <text x="335" y="146" fontSize="9" fontFamily="ui-monospace, monospace"
            fill="var(--text-muted)">hero.tsx</text>
      <text x="385" y="146" fontSize="9" fontFamily="ui-monospace, monospace"
            fill="var(--text-muted)">.env</text>
      {/* Active tab indicator */}
      <line x1="220" y1="152" x2="300" y2="152" stroke="var(--violet-mid)" strokeWidth="1.4" />

      {/* Sidebar (file tree) — minimal hint */}
      <rect x="170" y="152" width="22" height="350" fill="#0A0A09" />
      <circle cx="181" cy="168" r="2.5" fill="var(--violet-soft)" opacity="0.85" />
      <circle cx="181" cy="184" r="2.5" fill="var(--text-muted)" />
      <circle cx="181" cy="200" r="2.5" fill="var(--text-muted)" />
      <circle cx="181" cy="216" r="2.5" fill="var(--text-muted)" />

      {/* Code area */}
      <foreignObject x="195" y="162" width="232" height="340">
        <div
          {...{ xmlns: "http://www.w3.org/1999/xhtml" }}
          style={{
            fontFamily: "ui-monospace, 'Geist Mono', 'Fira Code', monospace",
            fontSize: "9.5px",
            lineHeight: "16px",
            color: "var(--text-secondary)",
            whiteSpace: "pre",
          }}>
          {(() => {
            let used = 0;
            const out: React.ReactNode[] = [];
            for (let i = 0; i < CODE.length; i++) {
              const ln = CODE[i];
              const lnChars = LINE_CHARS[i];
              const startUsed = used;
              const visibleInLine = Math.max(0, Math.min(lnChars, typed - used));
              used += lnChars;

              // Build segment text up to visibleInLine
              let consumed = 0;
              const segNodes: React.ReactNode[] = [];
              for (let s = 0; s < ln.segs.length; s++) {
                const seg = ln.segs[s];
                if (consumed >= visibleInLine) break;
                const take = Math.min(seg.t.length, visibleInLine - consumed);
                segNodes.push(
                  <span key={s} style={{ color: colorFor(seg.k) }}>{seg.t.slice(0, take)}</span>,
                );
                consumed += take;
              }

              const showCursor = i === cursorLineIdx;

              out.push(
                <div key={i} style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "var(--text-muted)", opacity: 0.55, width: "14px", textAlign: "right" }}>{i + 1}</span>
                  <span>
                    <span>{"  ".repeat(ln.indent)}</span>
                    {segNodes}
                    {showCursor && (
                      <span style={{
                        display: "inline-block",
                        width: "5px",
                        height: "11px",
                        background: "var(--violet-soft)",
                        verticalAlign: "text-bottom",
                        marginLeft: "1px",
                        animation: cursorVisible ? "ws-cursor 1s steps(2) infinite" : "none",
                      }} />
                    )}
                  </span>
                </div>,
              );

              // If we've already passed this line and there's progress to show, leave it visible.
              if (typed <= startUsed && i > 0) break;
            }
            return out;
          })()}
        </div>
      </foreignObject>

      {/* Bottom bar (status line in editor) */}
      <rect x="170" y="486" width="260" height="16" fill="#0A0A09" />
      <text x="178" y="497" fontSize="8" fontFamily="ui-monospace, monospace"
            fill="var(--violet-soft)">● typescript</text>
      <text x="260" y="497" fontSize="8" fontFamily="ui-monospace, monospace"
            fill="var(--text-muted)">UTF-8 · LF</text>
      <text x="350" y="497" fontSize="8" fontFamily="ui-monospace, monospace"
            fill="var(--green-bright)">✓ ready</text>

      {/* Subtle camera/notch hint at top of laptop screen */}
      <rect x="290" y="120" width="20" height="3" rx="1.5" fill="#0E0E0C" />
    </svg>
  );
}
