"use client";

// WorkspaceAnimation — animated SVG of a developer workspace.
//
// Scene (back → front):
//   plant (left)  ·  laptop with Neovim editor (center, on stand)  ·  mug (right)
//                          KINESIS ADVANTAGE split keyboard
//                                                          mouse
//
// Real animations:
//   - Code lines type in character-by-character with a blinking cursor
//   - Editor mode indicator switches between INSERT and NORMAL
//   - Three steam wisps continuously rise from the mug
//   - Plant leaves gently sway
//   - Soft violet glow pulses behind the laptop screen
//
// Pure SVG + CSS keyframes + a small requestAnimationFrame loop for typing.

import { useEffect, useState } from "react";

type Props = { className?: string; style?: React.CSSProperties };

type Seg = { t: string; k: "kw" | "fn" | "var" | "str" | "num" | "punct" | "cm" };
type Line = { indent: number; segs: Seg[] };

// Chunked syntax for typing animation. Reads as a real little build pipeline.
const CODE: Line[] = [
  { indent: 0, segs: [{ t: "const ", k: "kw" }, { t: "build", k: "fn" }, { t: " = ", k: "punct" }, { t: "async ", k: "kw" }, { t: "() => {", k: "punct" }] },
  { indent: 1, segs: [{ t: "const ", k: "kw" }, { t: "ctx", k: "var" }, { t: " = ", k: "punct" }, { t: "await ", k: "kw" }, { t: "init", k: "fn" }, { t: "()", k: "punct" }] },
  { indent: 1, segs: [{ t: "const ", k: "kw" }, { t: "out", k: "var" }, { t: " = ", k: "punct" }, { t: "compile", k: "fn" }, { t: "(", k: "punct" }, { t: "ctx", k: "var" }, { t: ", ", k: "punct" }, { t: '"src"', k: "str" }, { t: ")", k: "punct" }] },
  { indent: 1, segs: [{ t: "if ", k: "kw" }, { t: "(", k: "punct" }, { t: "out", k: "var" }, { t: ".errors > ", k: "punct" }, { t: "0", k: "num" }, { t: ") ", k: "punct" }, { t: "throw ", k: "kw" }, { t: "out", k: "var" }] },
  { indent: 1, segs: [{ t: "// ship it", k: "cm" }] },
  { indent: 1, segs: [{ t: "return ", k: "kw" }, { t: "deploy", k: "fn" }, { t: "(", k: "punct" }, { t: "out", k: "var" }, { t: ", { ", k: "punct" }, { t: "env", k: "var" }, { t: ": ", k: "punct" }, { t: '"prod"', k: "str" }, { t: " })", k: "punct" }] },
  { indent: 0, segs: [{ t: "}", k: "punct" }] },
];

const CHAR_MS = 28;
const POST_LINE_MS = 220;
const RESET_PAUSE_MS = 2200;
const TOTAL_CHARS = CODE.reduce((n, ln) => n + ln.segs.reduce((m, s) => m + s.t.length, 0), 0);
const LINE_CHARS = CODE.map(ln => ln.segs.reduce((m, s) => m + s.t.length, 0));
const TOTAL_TYPE_MS = TOTAL_CHARS * CHAR_MS + (CODE.length - 1) * POST_LINE_MS;

function colorFor(kind: Seg["k"]): string {
  switch (kind) {
    case "kw":    return "var(--violet-soft)";
    case "fn":    return "var(--green-bright)";
    case "var":   return "var(--text-primary)";
    case "str":   return "var(--amber-bright)";
    case "num":   return "var(--amber-bright)";
    case "cm":    return "var(--text-muted)";
    case "punct": return "var(--text-secondary)";
  }
}

// Single Kinesis-style key (subtle drop-shadow look via two stacked rects)
function Key({ x, y, w, h, color = "#3A3A38" }: { x: number; y: number; w: number; h: number; color?: string }) {
  return (
    <g>
      <rect x={x} y={y + 1.5} width={w} height={h} rx={1.5} fill="#0A0A09" />
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill={color} />
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={1} rx={0.5} fill="#5F5E5A" opacity="0.55" />
    </g>
  );
}

// Build a grid of keys for one Kinesis "well"
function KeyWell({ cx, cy, mirror = false }: { cx: number; cy: number; mirror?: boolean }) {
  const cols = 6;
  const rows = 4;
  const kw = 12;
  const kh = 11;
  const gap = 2;
  const totalW = cols * (kw + gap) - gap;
  const totalH = rows * (kh + gap) - gap;
  const x0 = cx - totalW / 2;
  const y0 = cy - totalH / 2;
  const keys: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // give the well a subtle concave look — outer keys slightly higher
      const distFromCenter = Math.abs(c - (cols - 1) / 2);
      const yOffset = -distFromCenter * 0.6;
      const isAccent = r === 0 && (mirror ? c === 0 : c === cols - 1);
      keys.push(
        <Key
          key={`${r}-${c}`}
          x={x0 + c * (kw + gap)}
          y={y0 + r * (kh + gap) + yOffset}
          w={kw}
          h={kh}
          color={isAccent ? "#7E1F1B" : "#3A3A38"}
        />,
      );
    }
  }
  return <g>{keys}</g>;
}

// Thumb cluster (raised, distinctive arc of larger keys)
function ThumbCluster({ cx, cy, mirror = false }: { cx: number; cy: number; mirror?: boolean }) {
  const m = mirror ? -1 : 1;
  return (
    <g transform={`rotate(${m * 12} ${cx} ${cy})`}>
      {/* Two large keys stacked */}
      <Key x={cx - 18} y={cy - 14} w={16} h={14} color="#4A2A28" />
      <Key x={cx - 18} y={cy + 2}  w={16} h={14} color="#3A3A38" />
      <Key x={cx + 2}  y={cy - 14} w={16} h={14} color="#3A3A38" />
      <Key x={cx + 2}  y={cy + 2}  w={16} h={14} color="#3A3A38" />
      {/* Two small thumb-tip keys */}
      <Key x={cx - 14} y={cy + 20} w={12} h={9}  color="#3A3A38" />
      <Key x={cx + 2}  y={cy + 20} w={12} h={9}  color="#3A3A38" />
    </g>
  );
}

export default function WorkspaceAnimation({ className, style }: Props) {
  const [typed, setTyped] = useState(0);
  const [insertMode, setInsertMode] = useState(true);

  useEffect(() => {
    let raf = 0;
    let start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed > TOTAL_TYPE_MS + RESET_PAUSE_MS) {
        start = now;
        setTyped(0);
        setInsertMode(true);
      } else if (elapsed > TOTAL_TYPE_MS) {
        setTyped(TOTAL_CHARS);
        setInsertMode(false);
      } else {
        setInsertMode(true);
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

  // Cursor line
  let acc = 0;
  let cursorLineIdx = CODE.length - 1;
  for (let i = 0; i < CODE.length; i++) {
    acc += LINE_CHARS[i];
    if (typed < acc) { cursorLineIdx = i; break; }
  }
  const currentLineNumber = cursorLineIdx + 1;

  return (
    <svg
      viewBox="0 0 600 800"
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
          <stop offset="100%" stopColor="#15140F" />
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
        <linearGradient id="ws-mouse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3A38" />
          <stop offset="100%" stopColor="#1A1A18" />
        </linearGradient>
        <radialGradient id="ws-mouse-shine" cx="35%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#5F5E5A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3A3A38" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ws-stand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3A38" />
          <stop offset="100%" stopColor="#1A1A18" />
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
          @keyframes ws-mouse-led {
            0%,75%,100% { opacity: 0.6 }
            85%         { opacity: 1 }
          }
        `}</style>
      </defs>

      {/* Ambient glow behind the laptop */}
      <ellipse cx="300" cy="240" rx="290" ry="190" fill="url(#ws-glow)" />

      {/* ── DESK SURFACE (deep, holds laptop+plant+mug behind, keyboard+mouse in front) */}
      <path d="M30,440 L570,440 L595,720 L5,720 Z" fill="url(#ws-desk)" />
      {/* Front face */}
      <rect x="0" y="720" width="600" height="40" fill="var(--bg-base)" />
      <line x1="5" y1="720" x2="595" y2="720" stroke="var(--gray-800)" strokeWidth="0.8" />
      {/* Wood grain hints */}
      <line x1="80"  y1="500" x2="220" y2="500" stroke="var(--gray-600)" strokeWidth="0.4" opacity="0.25" />
      <line x1="380" y1="510" x2="540" y2="510" stroke="var(--gray-600)" strokeWidth="0.4" opacity="0.25" />
      <line x1="120" y1="690" x2="280" y2="690" stroke="var(--gray-600)" strokeWidth="0.4" opacity="0.18" />

      {/* ── PLANT (back-left) ────────────────────────────────── */}
      <g>
        {/* Pot */}
        <path d="M30,420 L120,420 L113,475 Q113,480 108,480 L42,480 Q37,480 37,475 Z" fill="var(--amber-mid)" />
        <path d="M30,420 L120,420 L113,475 Q113,480 108,480 L42,480 Q37,480 37,475 Z" fill="#000" opacity="0.3" />
        <ellipse cx="75" cy="420" rx="45" ry="5" fill="#7E4F0E" />
        <ellipse cx="75" cy="419" rx="42" ry="3.5" fill="var(--amber-bright)" opacity="0.5" />
        <ellipse cx="75" cy="419" rx="40" ry="2.5" fill="#3D2817" />
        {/* Leaves */}
        <g style={{ transformOrigin: "75px 420px", animation: "ws-leaf-sway 4.5s ease-in-out infinite" }}>
          <ellipse cx="50"  cy="385" rx="11" ry="38" fill="var(--green-mid)"   transform="rotate(-22 50 385)" />
          <ellipse cx="75"  cy="358" rx="11" ry="44" fill="var(--green-mid)" />
          <ellipse cx="100" cy="380" rx="11" ry="38" fill="var(--green-mid)"   transform="rotate(20 100 380)" />
        </g>
        <ellipse cx="47"  cy="380" rx="3" ry="22" fill="var(--green-bright)" opacity="0.7" transform="rotate(-22 47 380)" />
        <ellipse cx="72"  cy="352" rx="3" ry="26" fill="var(--green-bright)" opacity="0.7" />
        <ellipse cx="98"  cy="375" rx="3" ry="22" fill="var(--green-bright)" opacity="0.7" transform="rotate(20 98 375)" />
        <g style={{ transformOrigin: "87px 420px", animation: "ws-leaf-sway-r 5s ease-in-out infinite" }}>
          <ellipse cx="87" cy="400" rx="9" ry="28" fill="var(--green-deep)" transform="rotate(35 87 400)" />
        </g>
      </g>

      {/* ── COFFEE MUG (back-right) ──────────────────────────── */}
      <g>
        {/* Steam */}
        <g>
          <path d="M495,355 Q491,335 495,315 Q499,295 495,275" fill="none"
                stroke="#E8E6DF" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "ws-steam-a 2.8s ease-out infinite", transformOrigin: "495px 355px" }} />
          <path d="M515,355 Q511,335 515,315 Q519,295 515,275" fill="none"
                stroke="#E8E6DF" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "ws-steam-b 2.8s ease-out 0.9s infinite", transformOrigin: "515px 355px" }} />
          <path d="M535,355 Q531,335 535,315 Q539,295 535,275" fill="none"
                stroke="#E8E6DF" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "ws-steam-c 2.8s ease-out 1.8s infinite", transformOrigin: "535px 355px" }} />
        </g>
        {/* Mug body */}
        <path d="M470,357 L470,475 Q470,485 482,485 L548,485 Q560,485 560,475 L560,357 Z" fill="url(#ws-mug)" />
        <ellipse cx="515" cy="357" rx="45" ry="9" fill="#7E4F0E" />
        <ellipse cx="515" cy="355" rx="44" ry="7" fill="#E8A052" />
        <ellipse cx="515" cy="359" rx="40" ry="6" fill="#3D2010" />
        <ellipse cx="515" cy="358" rx="34" ry="3" fill="#5C3018" opacity="0.7" />
        <path d="M560,372 Q585,372 585,395 Q585,420 560,420"
              fill="none" stroke="#C97A24" strokeWidth="11" strokeLinecap="round" />
        <path d="M560,372 Q585,372 585,395 Q585,420 560,420"
              fill="none" stroke="#7E4F0E" strokeWidth="11" strokeLinecap="round" opacity="0.4" />
        <path d="M478,370 L478,460" stroke="#E8A052" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* ── LAPTOP STAND (subtle wedge under base) ──────────── */}
      <path d="M195,455 L405,455 L420,478 L180,478 Z" fill="url(#ws-stand)" opacity="0.85" />
      <line x1="195" y1="455" x2="405" y2="455" stroke="#0A0A09" strokeWidth="0.6" />

      {/* ── LAPTOP BASE ──────────────────────────────────────── */}
      <path d="M178,440 L422,440 L450,478 L150,478 Z" fill="url(#ws-laptop-side)" />
      <line x1="178" y1="440" x2="422" y2="440" stroke="#3C3C3A" strokeWidth="0.6" />
      <rect x="270" y="455" width="60" height="6" rx="2" fill="#0E0E0C" opacity="0.7" />

      {/* ── LAPTOP SCREEN LID ────────────────────────────────── */}
      <rect x="170" y="78" width="260" height="362" rx="6" fill="url(#ws-laptop-top)" />
      <rect x="180" y="88" width="240" height="342" rx="4" fill="url(#ws-screen)" />
      <rect x="180" y="88" width="240" height="342" rx="4" fill="url(#ws-glow)" opacity="0.45"
            style={{ animation: "ws-glow-pulse 5s ease-in-out infinite" }} />
      {/* Webcam notch */}
      <rect x="290" y="78" width="20" height="3" rx="1.5" fill="#0E0E0C" />

      {/* ═══ NEOVIM EDITOR ════════════════════════════════════ */}

      {/* Bufferline (top tab bar) */}
      <rect x="180" y="88" width="240" height="18" fill="#0A0A09" />
      {/* Active buffer (build.ts) */}
      <rect x="184" y="88" width="74" height="18" fill="#161614" />
      <line x1="184" y1="88" x2="258" y2="88" stroke="var(--violet-soft)" strokeWidth="1.5" />
      <text x="195" y="100" fontSize="8" fontFamily="ui-monospace, monospace"
            fill="var(--text-primary)">▎1 build.ts</text>
      {/* Inactive buffers */}
      <text x="265" y="100" fontSize="8" fontFamily="ui-monospace, monospace"
            fill="var(--text-muted)">▎2 hero.tsx</text>
      <text x="332" y="100" fontSize="8" fontFamily="ui-monospace, monospace"
            fill="var(--text-muted)">▎3 .env</text>
      {/* Buffer count on right */}
      <text x="412" y="100" fontSize="8" fontFamily="ui-monospace, monospace"
            fill="var(--text-muted)" textAnchor="end">3 ●</text>

      {/* nvim-tree sidebar */}
      <rect x="180" y="106" width="44" height="282" fill="#0A0A09" />
      <text x="184" y="120" fontSize="7" fontFamily="ui-monospace, monospace" fill="var(--violet-soft)" fontWeight="600">NVIM</text>
      <text x="184" y="134" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--amber-bright)">▾ src</text>
      <text x="190" y="146" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--amber-bright)">▾ app</text>
      <text x="196" y="158" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">  page.tsx</text>
      <text x="190" y="170" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--amber-bright)">▾ lib</text>
      <text x="196" y="182" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--text-primary)" fontWeight="600">  build.ts</text>
      <rect x="194" y="176" width="28" height="9" fill="var(--violet-mid)" opacity="0.18" />
      <text x="196" y="194" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">  init.ts</text>
      <text x="184" y="210" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--amber-bright)">▾ public</text>
      <text x="184" y="222" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">README.md</text>
      <text x="184" y="234" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">tsconfig</text>
      <text x="184" y="246" fontSize="6.5" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">package</text>
      {/* Subtle vertical divider */}
      <line x1="224" y1="106" x2="224" y2="388" stroke="#1E1E1B" strokeWidth="0.8" />

      {/* Code area with line numbers — use foreignObject for real text rendering */}
      <foreignObject x="226" y="108" width="194" height="280">
        <div
          {...{ xmlns: "http://www.w3.org/1999/xhtml" }}
          style={{
            fontFamily: "ui-monospace, 'Geist Mono', 'Fira Code', monospace",
            fontSize: "9px",
            lineHeight: "16px",
            color: "var(--text-secondary)",
            whiteSpace: "pre",
          }}
        >
          {(() => {
            let used = 0;
            const out: React.ReactNode[] = [];
            for (let i = 0; i < CODE.length; i++) {
              const ln = CODE[i];
              const lnChars = LINE_CHARS[i];
              const startUsed = used;
              const visibleInLine = Math.max(0, Math.min(lnChars, typed - used));
              used += lnChars;

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

              const isCursorLine = i === cursorLineIdx;
              const lineNum = i + 1;
              // Relative line numbers (current line shows actual number, others show distance)
              const displayed = isCursorLine
                ? String(lineNum).padStart(2)
                : String(Math.abs(lineNum - currentLineNumber)).padStart(2);

              out.push(
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "6px",
                    background: isCursorLine ? "rgba(127, 119, 221, 0.06)" : "transparent",
                  }}
                >
                  <span style={{
                    color: isCursorLine ? "var(--amber-bright)" : "var(--text-muted)",
                    opacity: isCursorLine ? 0.95 : 0.45,
                    width: "16px",
                    textAlign: "right",
                  }}>
                    {displayed}
                  </span>
                  <span>
                    <span>{"  ".repeat(ln.indent)}</span>
                    {segNodes}
                    {isCursorLine && (
                      <span style={{
                        display: "inline-block",
                        width: insertMode ? "2px" : "5px",
                        height: "11px",
                        background: insertMode ? "var(--violet-soft)" : "var(--text-primary)",
                        verticalAlign: "text-bottom",
                        marginLeft: "1px",
                        opacity: insertMode ? 1 : 0.85,
                        animation: "ws-cursor 1s steps(2) infinite",
                      }} />
                    )}
                  </span>
                </div>,
              );
              if (typed <= startUsed && i > 0) break;
            }
            return out;
          })()}
        </div>
      </foreignObject>

      {/* Lualine status line at bottom of editor */}
      <g>
        {/* Mode block */}
        <rect x="180" y="388" width="50" height="14" fill={insertMode ? "var(--green-mid)" : "var(--violet-mid)"} />
        <text x="205" y="398" fontSize="7" fontFamily="ui-monospace, monospace"
              fill="var(--bg-base)" fontWeight="700" textAnchor="middle">
          {insertMode ? "INSERT" : "NORMAL"}
        </text>
        {/* Mode tail */}
        <path d={`M230,388 L237,395 L230,402 Z`} fill={insertMode ? "var(--green-mid)" : "var(--violet-mid)"} />
        {/* File path */}
        <rect x="230" y="388" width="120" height="14" fill="#1A1A18" />
        <text x="240" y="398" fontSize="7" fontFamily="ui-monospace, monospace" fill="var(--text-secondary)">
          ~/portfolio/build.ts
        </text>
        {/* Right side info */}
        <rect x="350" y="388" width="70" height="14" fill="#1A1A18" />
        <text x="356" y="398" fontSize="7" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">
          ts │ utf-8 │ {currentLineNumber}:{Math.min(typed, 80)}
        </text>
        {/* Right end accent */}
        <rect x="412" y="388" width="8" height="14" fill={insertMode ? "var(--green-mid)" : "var(--violet-mid)"} opacity="0.85" />
      </g>

      {/* ═══ KINESIS ADVANTAGE SPLIT KEYBOARD ═══════════════════ */}
      <g transform="translate(0, 0)">
        {/* Drop shadow */}
        <ellipse cx="300" cy="685" rx="190" ry="14" fill="#000" opacity="0.4" />

        {/* Body — split butterfly silhouette (left + right wells joined by center) */}
        {/* Left half body */}
        <path d="M120,580 Q108,560 130,540 L240,535 Q260,540 268,560 L268,635 Q260,656 240,660 L130,656 Q108,650 115,625 Z"
              fill="#1A1A18" />
        {/* Right half body */}
        <path d="M480,580 Q492,560 470,540 L360,535 Q340,540 332,560 L332,635 Q340,656 360,660 L470,656 Q492,650 485,625 Z"
              fill="#1A1A18" />
        {/* Center bridge */}
        <path d="M268,560 L332,560 L332,635 L268,635 Z" fill="#15140F" />
        {/* Body subtle highlight on top edge */}
        <path d="M125,545 Q220,530 268,545" fill="none" stroke="#3A3A38" strokeWidth="0.8" opacity="0.55" />
        <path d="M475,545 Q380,530 332,545" fill="none" stroke="#3A3A38" strokeWidth="0.8" opacity="0.55" />

        {/* Left key well */}
        <KeyWell cx={190} cy={595} />
        {/* Right key well */}
        <KeyWell cx={410} cy={595} mirror />

        {/* Center thumb clusters */}
        <ThumbCluster cx={278} cy={605} mirror />
        <ThumbCluster cx={322} cy={605} />

        {/* Subtle KINESIS branding (tiny dot pattern) */}
        <circle cx="300" cy="555" r="1" fill="var(--violet-soft)" opacity="0.6" />
      </g>

      {/* ═══ MOUSE (right of keyboard) ══════════════════════════ */}
      <g transform="translate(0, 0)">
        {/* Drop shadow */}
        <ellipse cx="525" cy="690" rx="38" ry="6" fill="#000" opacity="0.45" />
        {/* Mouse body — egg-shaped */}
        <path d="M495,602 Q495,575 525,575 Q555,575 555,602 L555,665 Q555,685 525,685 Q495,685 495,665 Z"
              fill="url(#ws-mouse)" />
        {/* Top shine highlight */}
        <path d="M495,602 Q495,575 525,575 Q555,575 555,602 L555,665 Q555,685 525,685 Q495,685 495,665 Z"
              fill="url(#ws-mouse-shine)" />
        {/* Center split line (left/right click separation) */}
        <line x1="525" y1="578" x2="525" y2="625" stroke="#0E0E0C" strokeWidth="0.8" opacity="0.7" />
        {/* Scroll wheel */}
        <rect x="521" y="595" width="8" height="14" rx="1" fill="#0A0A09" />
        <rect x="522" y="597" width="6" height="2" rx="0.5" fill="#3A3A38" />
        <rect x="522" y="601" width="6" height="2" rx="0.5" fill="#3A3A38" />
        <rect x="522" y="605" width="6" height="2" rx="0.5" fill="#3A3A38" />
        {/* Bottom LED hint */}
        <circle cx="525" cy="678" r="1.6" fill="var(--violet-soft)"
                style={{ animation: "ws-mouse-led 4s ease-in-out infinite" }} />
      </g>
    </svg>
  );
}
