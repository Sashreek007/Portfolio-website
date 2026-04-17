"use client";

// WorkspaceAnimation — animated SVG of a developer workspace.
//
// Composition (back → front):
//   plant (left)  ·  laptop on stand with detailed Neovim editor (center)  ·  mug (right)
//                       realistic mechanical keyboard (front)
//                                                       gaming mouse (front-right)
//
// All animations are real:
//   - Code lines type in character-by-character via requestAnimationFrame
//   - Editor mode block flips between INSERT (green) and NORMAL (violet)
//   - Cursor switches between thin line (insert) and block (normal)
//   - Three steam wisps rise continuously from the mug
//   - Plant leaves gently sway
//   - Soft violet glow pulses behind the laptop screen
//   - Mouse RGB and keyboard underglow subtly pulse

import { useEffect, useState } from "react";

type Props = { className?: string; style?: React.CSSProperties };

type Seg = { t: string; k: "kw" | "fn" | "var" | "str" | "num" | "punct" | "cm" | "type" };
type Line = { indent: number; segs: Seg[] };

// Realistic small build script for the typing animation.
const CODE: Line[] = [
  { indent: 0, segs: [{ t: "import ", k: "kw" }, { t: "{ compile, deploy }", k: "punct" }, { t: " from ", k: "kw" }, { t: '"./pipeline"', k: "str" }] },
  { indent: 0, segs: [] }, // blank
  { indent: 0, segs: [{ t: "export ", k: "kw" }, { t: "const ", k: "kw" }, { t: "build", k: "fn" }, { t: " = ", k: "punct" }, { t: "async ", k: "kw" }, { t: "() => {", k: "punct" }] },
  { indent: 1, segs: [{ t: "const ", k: "kw" }, { t: "ctx", k: "var" }, { t: " = ", k: "punct" }, { t: "await ", k: "kw" }, { t: "init", k: "fn" }, { t: "()", k: "punct" }] },
  { indent: 1, segs: [{ t: "const ", k: "kw" }, { t: "out", k: "var" }, { t: " = ", k: "punct" }, { t: "compile", k: "fn" }, { t: "(", k: "punct" }, { t: "ctx", k: "var" }, { t: ", ", k: "punct" }, { t: '"./src"', k: "str" }, { t: ")", k: "punct" }] },
  { indent: 1, segs: [{ t: "if ", k: "kw" }, { t: "(", k: "punct" }, { t: "out", k: "var" }, { t: ".errors > ", k: "punct" }, { t: "0", k: "num" }, { t: ") ", k: "punct" }, { t: "throw ", k: "kw" }, { t: "out", k: "var" }] },
  { indent: 1, segs: [{ t: "// ship to prod", k: "cm" }] },
  { indent: 1, segs: [{ t: "return ", k: "kw" }, { t: "deploy", k: "fn" }, { t: "(", k: "punct" }, { t: "out", k: "var" }, { t: ", { ", k: "punct" }, { t: "env", k: "var" }, { t: ": ", k: "punct" }, { t: '"prod"', k: "str" }, { t: " })", k: "punct" }] },
  { indent: 0, segs: [{ t: "}", k: "punct" }] },
];

const CHAR_MS = 26;
const POST_LINE_MS = 200;
const RESET_PAUSE_MS = 4500;

const TOTAL_CHARS = CODE.reduce((n, ln) => n + ln.segs.reduce((m, s) => m + s.t.length, 0), 0);
const LINE_CHARS = CODE.map(ln => ln.segs.reduce((m, s) => m + s.t.length, 0));
const TOTAL_TYPE_MS = TOTAL_CHARS * CHAR_MS + (CODE.length - 1) * POST_LINE_MS;

function colorFor(kind: Seg["k"]): string {
  switch (kind) {
    case "kw":    return "#C18FFF";
    case "fn":    return "#7AE2C5";
    case "var":   return "#E8E6DF";
    case "str":   return "#FFC079";
    case "num":   return "#FFC079";
    case "type":  return "#7AE2C5";
    case "cm":    return "#5F5E5A";
    case "punct": return "#A8A69E";
  }
}

// File tree shown in nvim-tree sidebar
type FT = { type: "folder" | "file"; name: string; depth: number; open?: boolean; active?: boolean; ext?: string; modified?: boolean; gitNew?: boolean };
const FILE_TREE: FT[] = [
  { type: "folder", name: "src",         depth: 0, open: true },
  { type: "folder", name: "app",         depth: 1, open: true },
  { type: "folder", name: "components",  depth: 2, open: true },
  { type: "file",   name: "Hero.tsx",    depth: 3, ext: "tsx", modified: true },
  { type: "file",   name: "Workspace.tsx", depth: 3, ext: "tsx" },
  { type: "file",   name: "page.tsx",    depth: 2, ext: "tsx" },
  { type: "folder", name: "lib",         depth: 1, open: true },
  { type: "file",   name: "build.ts",    depth: 2, ext: "ts", active: true },
  { type: "file",   name: "pipeline.ts", depth: 2, ext: "ts", gitNew: true },
  { type: "folder", name: "public",      depth: 0, open: false },
  { type: "file",   name: "tsconfig.json", depth: 0, ext: "json" },
  { type: "file",   name: "package.json",  depth: 0, ext: "json" },
  { type: "file",   name: "README.md",     depth: 0, ext: "md" },
];

const EXT_COLOR: Record<string, string> = {
  ts:   "#3178C6",
  tsx:  "#5DCAA5",
  json: "#FFC079",
  md:   "#A8A69E",
};

// Buffer tabs at top of editor
type Buf = { num: number; name: string; active?: boolean; modified?: boolean; errors?: number };
const BUFFERS: Buf[] = [
  { num: 1, name: "build.ts",  active: true, modified: true },
  { num: 2, name: "hero.tsx",  errors: 1 },
  { num: 3, name: "page.tsx" },
  { num: 4, name: "pipeline.ts" },
  { num: 5, name: ".env" },
];

// ── KEYBOARD LAYOUT ──────────────────────────────────────────────────────
// Each row is a list of key descriptors. `w` is in "U" units (1U = standard).
// `g` is gap in U units (no key drawn). `l` is optional label text.
// `accent` flags WASD/Esc highlights for theme color.
type K = { w: number; g?: boolean; l?: string; accent?: "esc" | "highlight" | "mod" };
const KB_ROWS: K[][] = [
  // Function row
  [
    { w: 1, l: "esc", accent: "esc" },
    { w: 1, g: true },
    { w: 1, l: "F1" }, { w: 1, l: "F2" }, { w: 1, l: "F3" }, { w: 1, l: "F4" },
    { w: 0.5, g: true },
    { w: 1, l: "F5" }, { w: 1, l: "F6" }, { w: 1, l: "F7" }, { w: 1, l: "F8" },
    { w: 0.5, g: true },
    { w: 1, l: "F9" }, { w: 1, l: "F10" }, { w: 1, l: "F11" }, { w: 1, l: "F12" },
  ],
  // Number row
  [
    { w: 1, l: "`" }, { w: 1, l: "1" }, { w: 1, l: "2" }, { w: 1, l: "3" }, { w: 1, l: "4" },
    { w: 1, l: "5" }, { w: 1, l: "6" }, { w: 1, l: "7" }, { w: 1, l: "8" }, { w: 1, l: "9" },
    { w: 1, l: "0" }, { w: 1, l: "-" }, { w: 1, l: "=" },
    { w: 2, l: "⌫", accent: "mod" },
  ],
  // QWERTY
  [
    { w: 1.5, l: "tab", accent: "mod" },
    { w: 1, l: "Q" }, { w: 1, l: "W", accent: "highlight" }, { w: 1, l: "E" }, { w: 1, l: "R" },
    { w: 1, l: "T" }, { w: 1, l: "Y" }, { w: 1, l: "U" }, { w: 1, l: "I" }, { w: 1, l: "O" },
    { w: 1, l: "P" }, { w: 1, l: "[" }, { w: 1, l: "]" },
    { w: 1.5, l: "\\" },
  ],
  // ASDF (home row)
  [
    { w: 1.75, l: "caps", accent: "mod" },
    { w: 1, l: "A", accent: "highlight" }, { w: 1, l: "S", accent: "highlight" },
    { w: 1, l: "D", accent: "highlight" }, { w: 1, l: "F" }, { w: 1, l: "G" },
    { w: 1, l: "H" }, { w: 1, l: "J" }, { w: 1, l: "K" }, { w: 1, l: "L" },
    { w: 1, l: ";" }, { w: 1, l: "'" },
    { w: 2.25, l: "enter", accent: "mod" },
  ],
  // ZXCV
  [
    { w: 2.25, l: "shift", accent: "mod" },
    { w: 1, l: "Z" }, { w: 1, l: "X" }, { w: 1, l: "C" }, { w: 1, l: "V" }, { w: 1, l: "B" },
    { w: 1, l: "N" }, { w: 1, l: "M" }, { w: 1, l: "," }, { w: 1, l: "." }, { w: 1, l: "/" },
    { w: 2.75, l: "shift", accent: "mod" },
  ],
  // Bottom modifiers
  [
    { w: 1.25, l: "ctrl", accent: "mod" },
    { w: 1.25, l: "win",  accent: "mod" },
    { w: 1.25, l: "alt",  accent: "mod" },
    { w: 6.25, l: "" },                            // spacebar
    { w: 1.25, l: "alt",  accent: "mod" },
    { w: 1.25, l: "fn",   accent: "mod" },
    { w: 1.25, l: "menu", accent: "mod" },
    { w: 1.25, l: "ctrl", accent: "mod" },
  ],
];

// Render one keyboard key
function KeyCap({
  x, y, wU, h, label, accent, U,
}: {
  x: number; y: number; wU: number; h: number; label?: string; accent?: K["accent"]; U: number;
}) {
  const w = wU * U - 2; // 2px combined gap
  const baseColor = "#171715";
  // Cap face color (top — what user sees)
  const capColor =
    accent === "esc"       ? "#7E1F1B" :
    accent === "highlight" ? "#1F2020" :
    accent === "mod"       ? "#1A1A18" :
                             "#1F1F1D";
  const capHighlight =
    accent === "esc"       ? "#A02C28" :
    accent === "highlight" ? "#3C3489" :
                             "#2A2A28";
  const labelColor =
    accent === "esc"       ? "#FFC079" :
    accent === "highlight" ? "#7F77DD" :
                             "#5F5E5A";
  return (
    <g>
      {/* Base shadow under key */}
      <rect x={x} y={y + 1} width={w} height={h - 1} rx={2} fill="#0A0A09" />
      {/* Side / chamfer (slightly larger, darker) */}
      <rect x={x} y={y} width={w} height={h - 2} rx={2} fill={baseColor} />
      {/* Cap top (inset, lighter) */}
      <rect x={x + 1} y={y + 0.5} width={w - 2} height={h - 5} rx={1.5} fill={capColor} />
      {/* Top-edge highlight */}
      <rect x={x + 1.5} y={y + 1} width={w - 3} height={0.6} rx={0.3} fill={capHighlight} opacity="0.7" />
      {/* Label */}
      {label && w >= 13 && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 1.4}
          fontSize={Math.min(5.5, w * 0.45)}
          fontFamily="ui-monospace, monospace"
          fill={labelColor}
          textAnchor="middle"
          opacity="0.95"
        >
          {label}
        </text>
      )}
      {/* F/J home-row bumps */}
      {(label === "F" || label === "J") && (
        <rect x={x + w / 2 - 2} y={y + h - 4} width={4} height={0.8} rx={0.4} fill="#5F5E5A" opacity="0.9" />
      )}
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

  let acc = 0;
  let cursorLineIdx = CODE.length - 1;
  for (let i = 0; i < CODE.length; i++) {
    acc += LINE_CHARS[i];
    if (typed < acc) { cursorLineIdx = i; break; }
  }
  const currentLineNumber = cursorLineIdx + 1;

  // ── KEYBOARD GEOMETRY ──────────────────────────────────────────────
  const KB_X = 105;
  const KB_Y = 530;
  const KB_W = 390;
  const KB_PAD = 10;
  const KB_INNER_W = KB_W - KB_PAD * 2;
  // Compute U size from widest row
  const maxU = Math.max(...KB_ROWS.map(r => r.reduce((s, k) => s + k.w, 0)));
  const U = KB_INNER_W / maxU;
  const KEY_H = U * 0.92;
  const ROW_GAP = 2.5;
  const KB_H = KB_PAD * 2 + KB_ROWS.length * KEY_H + (KB_ROWS.length - 1) * ROW_GAP;

  return (
    <svg
      viewBox="0 0 600 800"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <radialGradient id="ws-glow" cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="var(--violet-mid)" stopOpacity="0.20" />
          <stop offset="60%" stopColor="var(--violet-mid)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--violet-mid)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ws-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B1A16" />
          <stop offset="100%" stopColor="#0E0E0C" />
        </linearGradient>
        <linearGradient id="ws-laptop-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C2C2A" />
          <stop offset="100%" stopColor="#1A1A18" />
        </linearGradient>
        <linearGradient id="ws-laptop-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1A1A18" />
          <stop offset="50%" stopColor="#2C2C2A" />
          <stop offset="100%" stopColor="#1A1A18" />
        </linearGradient>
        <linearGradient id="ws-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E0E0C" />
          <stop offset="100%" stopColor="#161614" />
        </linearGradient>
        <linearGradient id="ws-mug" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E8A052" />
          <stop offset="55%" stopColor="#C97A24" />
          <stop offset="100%" stopColor="#7E4810" />
        </linearGradient>
        <linearGradient id="ws-pot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9A4F0E" />
          <stop offset="50%" stopColor="#C97A24" />
          <stop offset="100%" stopColor="#7E4810" />
        </linearGradient>
        <linearGradient id="ws-leaf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0E704D" />
          <stop offset="55%" stopColor="#1D9E75" />
          <stop offset="100%" stopColor="#5DCAA5" />
        </linearGradient>
        <linearGradient id="ws-mouse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3A38" />
          <stop offset="50%" stopColor="#1F1F1D" />
          <stop offset="100%" stopColor="#0A0A09" />
        </linearGradient>
        <radialGradient id="ws-mouse-shine" cx="35%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#5F5E5A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3A3A38" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ws-stand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3A38" />
          <stop offset="100%" stopColor="#1A1A18" />
        </linearGradient>
        <linearGradient id="ws-kb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#28282A" />
          <stop offset="100%" stopColor="#0E0E0C" />
        </linearGradient>
        <radialGradient id="ws-rgb" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="var(--violet-soft)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--violet-soft)" stopOpacity="0" />
        </radialGradient>
        <style>{`
          @keyframes ws-cursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }
          @keyframes ws-steam-a {
            0%   { opacity: 0;   transform: translate(0,0) scaleX(1) }
            10%  { opacity: 0.65; transform: translate(0,-3px) scaleX(1.05) }
            70%  { opacity: 0.45; transform: translate(-4px,-32px) scaleX(1.4) }
            100% { opacity: 0;   transform: translate(-9px,-58px) scaleX(1.7) }
          }
          @keyframes ws-steam-b {
            0%   { opacity: 0;   transform: translate(0,0) scaleX(1) }
            10%  { opacity: 0.65; transform: translate(0,-3px) scaleX(0.9) }
            70%  { opacity: 0.45; transform: translate(3px,-32px) scaleX(0.7) }
            100% { opacity: 0;   transform: translate(7px,-58px) scaleX(0.5) }
          }
          @keyframes ws-steam-c {
            0%   { opacity: 0;   transform: translate(0,0) scaleX(1) }
            10%  { opacity: 0.65; transform: translate(0,-3px) scaleX(1.1) }
            70%  { opacity: 0.45; transform: translate(-2px,-34px) scaleX(1.3) }
            100% { opacity: 0;   transform: translate(-4px,-62px) scaleX(1.5) }
          }
          @keyframes ws-leaf-sway   { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(2deg) } }
          @keyframes ws-leaf-sway-r { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(-2deg) } }
          @keyframes ws-glow-pulse  { 0%,100% { opacity: 0.85 } 50% { opacity: 1 } }
          @keyframes ws-rgb-pulse   { 0%,100% { opacity: 0.55 } 50% { opacity: 1 } }
          @keyframes ws-mouse-led   { 0%,75%,100% { opacity: 0.55 } 85% { opacity: 1 } }
          @keyframes ws-kb-glow     { 0%,100% { opacity: 0.4 } 50% { opacity: 0.75 } }
        `}</style>
      </defs>

      {/* Ambient glow — larger, centered behind the laptop */}
      <ellipse cx="300" cy="190" rx="320" ry="220" fill="url(#ws-glow)" />

      {/* ─── DESK (top moved up to meet the bigger laptop) ──────── */}
      <path d="M30,365 L570,365 L595,720 L5,720 Z" fill="url(#ws-desk)" />
      <rect x="0" y="720" width="600" height="40" fill="#08080A" />
      <line x1="5" y1="720" x2="595" y2="720" stroke="#2C2C2A" strokeWidth="1" />
      {/* Desk grain hints in the strip above the deskpad */}
      <line x1="40"  y1="425" x2="180" y2="425" stroke="#3D3025" strokeWidth="0.4" opacity="0.45" />
      <line x1="420" y1="430" x2="560" y2="430" stroke="#3D3025" strokeWidth="0.4" opacity="0.45" />
      <line x1="80"  y1="465" x2="220" y2="465" stroke="#3D3025" strokeWidth="0.4" opacity="0.4" />
      <line x1="380" y1="470" x2="520" y2="470" stroke="#3D3025" strokeWidth="0.4" opacity="0.4" />
      <line x1="60"  y1="708" x2="540" y2="708" stroke="#3D3025" strokeWidth="0.4" opacity="0.35" />

      {/* ═══ LAPTOP STAND ════════════════════════════════════════ */}
      <path d="M125,365 L475,365 L495,390 L105,390 Z" fill="url(#ws-stand)" opacity="0.9" />
      <line x1="125" y1="365" x2="475" y2="365" stroke="#0A0A09" strokeWidth="0.6" />

      {/* ═══ LAPTOP BASE (compact hinge area) ════════════════════ */}
      <path d="M85,330 L515,330 L545,370 L55,370 Z" fill="url(#ws-laptop-side)" />
      <line x1="85" y1="330" x2="515" y2="330" stroke="#3C3C3A" strokeWidth="0.6" />
      {/* Speaker grilles */}
      <g opacity="0.4">
        {[95, 105, 115, 125, 135, 145, 155, 165, 175, 185].map(x => (
          <circle key={`l${x}`} cx={x} cy={347} r="0.55" fill="#5F5E5A" />
        ))}
        {[420, 430, 440, 450, 460, 470, 480, 490, 500, 510].map(x => (
          <circle key={`r${x}`} cx={x} cy={347} r="0.55" fill="#5F5E5A" />
        ))}
      </g>
      {/* Trackpad */}
      <rect x="240" y="346" width="120" height="8" rx="2" fill="#0E0E0C" opacity="0.7" />

      {/* ═══ LAPTOP SCREEN LID — bigger, proper 16:10 ═══════════ */}
      <rect x="50" y="40" width="500" height="312" rx="9" fill="url(#ws-laptop-top)" />
      <rect x="60" y="50" width="480" height="292" rx="6" fill="url(#ws-screen)" />
      <rect x="60" y="50" width="480" height="292" rx="6" fill="url(#ws-glow)" opacity="0.45"
            style={{ animation: "ws-glow-pulse 5s ease-in-out infinite" }} />
      {/* Webcam */}
      <rect x="290" y="40" width="20" height="3" rx="1.5" fill="#0E0E0C" />
      <circle cx="300" cy="41.5" r="0.8" fill="#3A3A38" />
      {/* Subtle logo mark on lid bottom */}
      <circle cx="300" cy="345" r="2.6" fill="none" stroke="#3A3A38" strokeWidth="0.5" opacity="0.55" />

      {/* ═══ NEOVIM EDITOR (full HTML inside foreignObject) ══════ */}
      <foreignObject x="60" y="50" width="480" height="292">
        <div
          {...{ xmlns: "http://www.w3.org/1999/xhtml" }}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#161614",
            fontFamily: "ui-monospace, 'Geist Mono', 'Fira Code', monospace",
            fontSize: "10px",
            lineHeight: "14px",
            color: "#A8A69E",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {/* ── BUFFERLINE ────────────────────────────────────── */}
          <div style={{
            display: "flex",
            background: "#0E0E0C",
            borderBottom: "1px solid #1F1F1D",
            height: "20px",
            alignItems: "stretch",
            fontSize: "9px",
          }}>
            {BUFFERS.map(b => (
              <div key={b.num} style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                padding: "0 6px 0 5px",
                background: b.active ? "#161614" : "transparent",
                borderTop: b.active ? "1.5px solid #C18FFF" : "1.5px solid transparent",
                color: b.active ? "#E8E6DF" : "#5F5E5A",
                fontWeight: b.active ? 600 : 400,
              }}>
                <span style={{ color: "#5F5E5A" }}>{b.num}</span>
                <span>{b.name}</span>
                {b.modified && <span style={{ color: "#FFC079" }}>●</span>}
                {b.errors && <span style={{ color: "#E55B5B", fontSize: "7px" }}>{"●" + b.errors}</span>}
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ padding: "0 8px", color: "#5F5E5A", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "#7AE2C5" }}>●</span>
              <span>{BUFFERS.length}</span>
            </div>
          </div>

          {/* ── BODY (sidebar + code) ─────────────────────────── */}
          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

            {/* nvim-tree sidebar */}
            <div style={{
              width: "118px",
              background: "#0E0E0C",
              borderRight: "1px solid #1F1F1D",
              padding: "5px 5px",
              fontSize: "8px",
              lineHeight: "13px",
              color: "#5F5E5A",
              overflow: "hidden",
            }}>
              <div style={{
                color: "#C18FFF",
                fontWeight: 700,
                fontSize: "8.5px",
                padding: "0 0 5px 2px",
                borderBottom: "1px solid #1F1F1D",
                marginBottom: "4px",
                letterSpacing: "0.04em",
              }}>
                NVIM
              </div>
              {FILE_TREE.map((item, i) => {
                const indent = item.depth * 6;
                const isFolder = item.type === "folder";
                const icon = isFolder
                  ? (item.open ? "▾ " : "▸ ")
                  : "  ";
                const dotColor = item.ext ? EXT_COLOR[item.ext] : "#5F5E5A";
                return (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    paddingLeft: `${indent}px`,
                    background: item.active ? "rgba(193,143,255,0.15)" : "transparent",
                    color: item.active ? "#E8E6DF" : (isFolder ? "#FFC079" : "#888780"),
                    fontWeight: item.active ? 600 : 400,
                    height: "13px",
                  }}>
                    <span style={{ color: isFolder ? "#FFC079" : "#5F5E5A", width: "7px" }}>
                      {icon}
                    </span>
                    {!isFolder && (
                      <span style={{ color: dotColor, width: "4px" }}>●</span>
                    )}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </span>
                    {item.modified && <span style={{ color: "#FFC079", marginLeft: "auto" }}>M</span>}
                    {item.gitNew && <span style={{ color: "#7AE2C5", marginLeft: "auto" }}>U</span>}
                  </div>
                );
              })}
            </div>

            {/* Code area */}
            <div style={{
              flex: 1,
              padding: "6px 0 6px 0",
              fontSize: "11px",
              lineHeight: "17px",
              color: "#A8A69E",
              whiteSpace: "pre",
              overflow: "hidden",
              position: "relative",
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
                  // Relative line numbers
                  const displayed = isCursorLine
                    ? String(lineNum).padStart(2)
                    : String(Math.abs(lineNum - currentLineNumber)).padStart(2);
                  // Git sign in gutter (some lines)
                  const gitSign = i === 0 ? "+" : (i === 6 ? "~" : "");
                  const gitColor = gitSign === "+" ? "#5DCAA5" : "#FFC079";

                  out.push(
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      background: isCursorLine ? "rgba(193,143,255,0.06)" : "transparent",
                      paddingLeft: "3px",
                    }}>
                      {/* Git sign */}
                      <span style={{ color: gitColor, width: "8px", textAlign: "center", fontSize: "10px" }}>
                        {gitSign}
                      </span>
                      {/* Line number */}
                      <span style={{
                        color: isCursorLine ? "#FFC079" : "#5F5E5A",
                        opacity: isCursorLine ? 0.95 : 0.55,
                        width: "18px",
                        textAlign: "right",
                        fontSize: "9.5px",
                      }}>
                        {displayed}
                      </span>
                      {/* Code text + indent guides */}
                      <span style={{ position: "relative" }}>
                        {ln.indent > 0 && (
                          <span style={{
                            position: "absolute",
                            left: 0, top: 0, bottom: 0,
                            width: "1px",
                            background: "#1F1F1D",
                          }} />
                        )}
                        <span>{"  ".repeat(ln.indent)}</span>
                        {segNodes}
                        {isCursorLine && (
                          <span style={{
                            display: "inline-block",
                            width: insertMode ? "2px" : "6px",
                            height: "13px",
                            background: insertMode ? "#C18FFF" : "#E8E6DF",
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

              {/* LSP completion popup (shows briefly when typing) */}
              {insertMode && typed > 80 && typed < TOTAL_CHARS - 10 && (
                <div style={{
                  position: "absolute",
                  left: "110px",
                  top: `${(cursorLineIdx + 1) * 17 + 8}px`,
                  background: "#1A1A18",
                  border: "1px solid #2C2C2A",
                  borderRadius: "3px",
                  padding: "4px 6px",
                  fontSize: "8.5px",
                  lineHeight: "13px",
                  color: "#A8A69E",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                  minWidth: "78px",
                }}>
                  <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                    <span style={{ color: "#7AE2C5" }}>ƒ</span>
                    <span style={{ color: "#E8E6DF" }}>compile</span>
                  </div>
                  <div style={{ display: "flex", gap: "3px", alignItems: "center", opacity: 0.65 }}>
                    <span style={{ color: "#C18FFF" }}>ƒ</span>
                    <span>compileSync</span>
                  </div>
                  <div style={{ display: "flex", gap: "3px", alignItems: "center", opacity: 0.55 }}>
                    <span style={{ color: "#FFC079" }}>τ</span>
                    <span>Compiler</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── LUALINE STATUSLINE ────────────────────────────── */}
          <div style={{
            display: "flex",
            height: "20px",
            background: "#0A0A09",
            fontSize: "9px",
            lineHeight: "20px",
            alignItems: "stretch",
          }}>
            {/* Mode block */}
            <div style={{
              background: insertMode ? "#5DCAA5" : "#7F77DD",
              color: "#0E0E0C",
              fontWeight: 700,
              padding: "0 8px",
              letterSpacing: "0.06em",
            }}>
              {insertMode ? " INSERT " : " NORMAL "}
            </div>
            {/* Branch */}
            <div style={{
              background: "#1F1F1D",
              color: "#FFC079",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}>
              <span></span>
              <span>main</span>
              <span style={{ color: "#5DCAA5" }}>+12</span>
              <span style={{ color: "#E55B5B" }}>-3</span>
            </div>
            {/* File path */}
            <div style={{
              background: "#161614",
              color: "#A8A69E",
              padding: "0 8px",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              ~/portfolio/src/lib/build.ts
            </div>
            {/* Diagnostics */}
            <div style={{
              background: "#161614",
              padding: "0 6px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}>
              <span style={{ color: "#E55B5B" }}>● 0</span>
              <span style={{ color: "#FFC079" }}>▲ 1</span>
              <span style={{ color: "#7F77DD" }}>ⓘ 2</span>
            </div>
            {/* Filetype */}
            <div style={{
              background: "#1F1F1D",
              color: "#7AE2C5",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}>
              <span>ts</span>
              <span style={{ color: "#5F5E5A" }}>│</span>
              <span style={{ color: "#A8A69E" }}>utf-8</span>
              <span style={{ color: "#5F5E5A" }}>│</span>
              <span style={{ color: "#A8A69E" }}>unix</span>
            </div>
            {/* Line:col + percent */}
            <div style={{
              background: insertMode ? "#5DCAA5" : "#7F77DD",
              color: "#0E0E0C",
              fontWeight: 700,
              padding: "0 8px",
            }}>
              {currentLineNumber}:{Math.min(typed, 80)}  {Math.round((cursorLineIdx + 1) / CODE.length * 100)}%
            </div>
          </div>
        </div>
      </foreignObject>

      {/* ═══ PLANT (front-left, partially overlapping the laptop edge) ═══ */}
      <g>
        {/* Pot */}
        <path d="M14,388 L92,388 L86,442 Q86,448 81,448 L25,448 Q20,448 20,442 Z" fill="url(#ws-pot)" />
        {/* Pot rim band */}
        <ellipse cx="53" cy="388" rx="39" ry="4.5" fill="#7E4810" />
        <ellipse cx="53" cy="386.5" rx="37" ry="3" fill="#E8A052" />
        <rect x="15" y="392" width="77" height="2.5" fill="#7E4810" opacity="0.4" />
        {/* Soil */}
        <ellipse cx="53" cy="387" rx="34" ry="2" fill="#2A1408" />
        {/* Pot vertical ridges */}
        <line x1="32" y1="397" x2="30" y2="442" stroke="#7E4810" strokeWidth="0.6" opacity="0.5" />
        <line x1="53" y1="397" x2="53" y2="445" stroke="#7E4810" strokeWidth="0.6" opacity="0.5" />
        <line x1="74" y1="397" x2="76" y2="442" stroke="#7E4810" strokeWidth="0.6" opacity="0.5" />

        {/* Leaves */}
        <g style={{ transformOrigin: "53px 386px", animation: "ws-leaf-sway 4.5s ease-in-out infinite" }}>
          {/* Back-left leaf */}
          <path d="M30,386 Q10,358 16,325 Q28,302 38,325 Q42,365 32,386 Z"
                fill="url(#ws-leaf)" transform="rotate(-22 30 365)" />
          <path d="M27,383 Q22,358 23,330" stroke="#0E704D" strokeWidth="0.6" fill="none" opacity="0.7" transform="rotate(-22 30 365)" />
          {/* Center-tall leaf */}
          <path d="M53,386 Q36,350 41,308 Q53,284 65,308 Q70,350 53,386 Z" fill="url(#ws-leaf)" />
          <path d="M53,386 Q51,350 53,310" stroke="#0E704D" strokeWidth="0.6" fill="none" opacity="0.7" />
          {/* Back-right leaf */}
          <path d="M76,386 Q96,358 90,325 Q78,302 68,325 Q64,365 74,386 Z"
                fill="url(#ws-leaf)" transform="rotate(22 76 365)" />
          <path d="M79,383 Q84,358 83,330" stroke="#0E704D" strokeWidth="0.6" fill="none" opacity="0.7" transform="rotate(22 76 365)" />
        </g>
        {/* Front leaf (different sway) */}
        <g style={{ transformOrigin: "62px 386px", animation: "ws-leaf-sway-r 5.2s ease-in-out infinite" }}>
          <path d="M62,386 Q56,365 58,338 Q66,322 72,340 Q74,368 68,386 Z"
                fill="#1D9E75" transform="rotate(28 62 378)" />
          <path d="M64,386 Q62,365 66,342" stroke="#0E704D" strokeWidth="0.6" fill="none" opacity="0.7" transform="rotate(28 62 378)" />
        </g>
      </g>

      {/* ═══ COFFEE MUG (front-right, smaller, partially in front of laptop) ═══ */}
      <g>
        {/* Steam */}
        <g>
          <path d="M520,400 Q517,386 520,372 Q523,358 520,344" fill="none"
                stroke="#E8E6DF" strokeWidth="2" strokeLinecap="round"
                style={{ animation: "ws-steam-a 2.8s ease-out infinite", transformOrigin: "520px 400px" }} />
          <path d="M535,400 Q532,386 535,372 Q538,358 535,344" fill="none"
                stroke="#E8E6DF" strokeWidth="2" strokeLinecap="round"
                style={{ animation: "ws-steam-b 2.8s ease-out 0.9s infinite", transformOrigin: "535px 400px" }} />
          <path d="M550,400 Q547,386 550,372 Q553,358 550,344" fill="none"
                stroke="#E8E6DF" strokeWidth="2" strokeLinecap="round"
                style={{ animation: "ws-steam-c 2.8s ease-out 1.8s infinite", transformOrigin: "550px 400px" }} />
        </g>
        {/* Mug body — smaller (~75 tall, was 128) */}
        <path d="M500,402 L500,470 Q500,478 510,478 L560,478 Q570,478 570,470 L570,402 Z" fill="url(#ws-mug)" />
        {/* Right shadow */}
        <path d="M555,405 L555,470 Q555,478 565,478 L560,478 Q570,478 570,470 L570,405 Z"
              fill="#5C2F08" opacity="0.55" />
        {/* Rim */}
        <ellipse cx="535" cy="402" rx="35" ry="7" fill="#5C2F08" />
        <ellipse cx="535" cy="400" rx="34" ry="5" fill="#E8A052" />
        <ellipse cx="535" cy="402" rx="32" ry="4" fill="#7E4810" />
        {/* Coffee */}
        <ellipse cx="535" cy="403" rx="30" ry="4" fill="#1F0E04" />
        <ellipse cx="535" cy="402" rx="25" ry="2" fill="#5C3018" opacity="0.7" />
        {/* Foam ring (subtle) */}
        <ellipse cx="535" cy="401" rx="27" ry="1.5" fill="none" stroke="#E8C9A0" strokeWidth="0.5" opacity="0.55" />
        {/* Handle (smaller) */}
        <path d="M570,415 Q592,415 592,438 Q592,460 570,460"
              fill="none" stroke="#C97A24" strokeWidth="9" strokeLinecap="round" />
        <path d="M570,415 Q592,415 592,438 Q592,460 570,460"
              fill="none" stroke="#5C2F08" strokeWidth="9" strokeLinecap="round" opacity="0.45" />
        {/* Highlight stripe */}
        <path d="M507,415 L507,464" stroke="#FFC079" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
        {/* Bottom shadow on desk */}
        <ellipse cx="535" cy="478" rx="34" ry="2.5" fill="#000" opacity="0.6" />
      </g>

      {/* ═══ DESKPAD / DESK MAT (under keyboard + mouse) ═════════ */}
      <g>
        {/* Soft cast shadow underneath the mat */}
        <rect x="65" y="490" width="540" height="220" rx="8" fill="#000" opacity="0.35" />
        {/* Mat body — slightly lighter than desk so it reads as a separate surface */}
        <rect x="60" y="485" width="535" height="218" rx="6" fill="#1B1B19" />
        {/* Subtle top-edge highlight for depth */}
        <rect x="62" y="486" width="531" height="1" rx="0.5" fill="#2C2C2A" opacity="0.55" />
        {/* Stitched perimeter — inset 4px, dashed thin line */}
        <rect
          x="64" y="489" width="527" height="210" rx="4"
          fill="none"
          stroke="#3A3A38" strokeWidth="0.6"
          strokeDasharray="3 2"
          opacity="0.55"
        />
        {/* Subtle weave texture (sparse dots) */}
        <g opacity="0.06" fill="#A8A69E">
          {[80, 140, 200, 260, 320, 380, 440, 500, 560].flatMap(x =>
            [510, 560, 610, 660].map(y => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.4" />
            ))
          )}
        </g>
        {/* Tiny brand mark in bottom-right corner */}
        <text x="582" y="697" fontSize="5" fontFamily="ui-monospace, monospace"
              fill="#3A3A38" textAnchor="end" opacity="0.7">SA</text>
      </g>

      {/* ═══ KEYBOARD (realistic mechanical TKL) ════════════════ */}
      <g>
        {/* Drop shadow on the deskpad */}
        <ellipse cx="300" cy={KB_Y + KB_H + 10} rx="200" ry="9" fill="#000" opacity="0.4" />

        {/* Body — chamfered case */}
        <rect x={KB_X - 3} y={KB_Y - 2} width={KB_W + 6} height={KB_H + 6} rx="9" fill="#0A0A09" />
        <rect x={KB_X} y={KB_Y} width={KB_W} height={KB_H} rx="7" fill="url(#ws-kb-body)" />
        {/* Top edge highlight */}
        <rect x={KB_X + 4} y={KB_Y + 1} width={KB_W - 8} height="1.2" rx="0.6" fill="#3A3A38" opacity="0.8" />
        {/* Subtle inset around the keys */}
        <rect x={KB_X + 6} y={KB_Y + 6} width={KB_W - 12} height={KB_H - 12} rx="5" fill="none"
              stroke="#0E0E0C" strokeWidth="1" opacity="0.7" />

        {/* Keys */}
        {KB_ROWS.map((row, ri) => {
          const rowY = KB_Y + KB_PAD + ri * (KEY_H + ROW_GAP);
          let cursor = KB_X + KB_PAD;
          return (
            <g key={ri}>
              {row.map((k, ki) => {
                const kx = cursor;
                cursor += k.w * U;
                if (k.g) return null;
                return (
                  <KeyCap
                    key={ki}
                    x={kx + 1}
                    y={rowY}
                    wU={k.w}
                    h={KEY_H - 2}
                    label={k.l}
                    accent={k.accent}
                    U={U}
                  />
                );
              })}
            </g>
          );
        })}

        {/* USB cable hint going off to the laptop */}
        <path d={`M${KB_X + KB_W / 2} ${KB_Y - 1} Q300 ${KB_Y - 18} 300 ${KB_Y - 32}`}
              fill="none" stroke="#1A1A18" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />

        {/* RGB underglow */}
        <ellipse cx="300" cy={KB_Y + KB_H + 4} rx="180" ry="6"
                 fill="url(#ws-rgb)"
                 style={{ animation: "ws-kb-glow 4s ease-in-out infinite" }} />
      </g>

      {/* ═══ GAMING MOUSE (right of keyboard) ═════════════════ */}
      <g>
        {/* Drop shadow */}
        <ellipse cx="540" cy={695} rx="42" ry="6" fill="#000" opacity="0.5" />

        {/* RGB underglow */}
        <ellipse cx="540" cy="690" rx="40" ry="6"
                 fill="url(#ws-rgb)"
                 style={{ animation: "ws-rgb-pulse 3.5s ease-in-out infinite" }} />

        {/* Body — asymmetric egg with pinky rest, tapered front */}
        <path
          d="M515,600
             Q515,572 542,572
             Q572,572 575,605
             L578,665
             Q578,690 545,690
             Q510,690 510,668
             L508,635
             Q508,615 515,600 Z"
          fill="url(#ws-mouse)"
        />
        {/* Top shine */}
        <path
          d="M515,600
             Q515,572 542,572
             Q572,572 575,605
             L578,665
             Q578,690 545,690
             Q510,690 510,668
             L508,635
             Q508,615 515,600 Z"
          fill="url(#ws-mouse-shine)"
        />

        {/* Click split (left/right click separation line) */}
        <line x1="544" y1="574" x2="544" y2="630" stroke="#0A0A09" strokeWidth="0.9" opacity="0.85" />

        {/* Scroll wheel housing */}
        <rect x="540" y="595" width="9" height="16" rx="2" fill="#0A0A09" />
        {/* Scroll wheel ridges (rubberized) */}
        <rect x="541" y="597" width="7" height="1.6" rx="0.5" fill="#3A3A38" />
        <rect x="541" y="600.5" width="7" height="1.6" rx="0.5" fill="#3A3A38" />
        <rect x="541" y="604" width="7" height="1.6" rx="0.5" fill="#3A3A38" />
        <rect x="541" y="607.5" width="7" height="1.6" rx="0.5" fill="#3A3A38" />

        {/* DPI button (small, in front of scroll wheel) */}
        <rect x="540" y="615" width="9" height="3.5" rx="1" fill="#0A0A09" />
        <rect x="541" y="615.5" width="7" height="0.8" rx="0.4" fill="#3A3A38" />

        {/* Side buttons (back/forward, on the left "thumb" side) */}
        <rect x="510" y="618" width="8" height="5" rx="1" fill="#0A0A09" opacity="0.85" />
        <rect x="510" y="626" width="8" height="5" rx="1" fill="#0A0A09" opacity="0.85" />
        {/* Tiny labels (forward/back arrows) */}
        <text x="514" y="622" fontSize="3" fill="#5F5E5A" textAnchor="middle">◂</text>
        <text x="514" y="630" fontSize="3" fill="#5F5E5A" textAnchor="middle">▸</text>

        {/* Glowing logo on palm rest */}
        <g style={{ animation: "ws-rgb-pulse 3s ease-in-out infinite" }}>
          <circle cx="544" cy="660" r="6" fill="var(--violet-mid)" opacity="0.18" />
          <path d="M540,656 L548,656 M540,660 L548,660 M540,664 L548,664"
                stroke="var(--violet-soft)" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
        </g>

        {/* Pinky rest contour (subtle line) */}
        <path d="M575,615 Q577,640 575,665" stroke="#0A0A09" strokeWidth="0.6" opacity="0.7" fill="none" />

        {/* Mouse cable going up to the laptop */}
        <path d="M542,572 Q535,560 540,540 Q548,520 545,500"
              fill="none" stroke="#1A1A18" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      </g>
    </svg>
  );
}
