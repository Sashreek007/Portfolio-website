"use client";

// SystemSchematic — hero animation, v2.
//
// Two stacked panels that tell one story: "the code builds the machine."
//   TOP    : floating Neovim editor typing mint — Sashreek's real Go
//            API-key service (github.com/Sashreek007/mint): pgx store,
//            prewarmed Redis cache, token-bucket rate limiting.
//            (vim loop — INSERT → NORMAL → V-LINE delete → :w → bench)
//   BOTTOM : a live blueprint schematic of that exact service. Nodes and
//            wires materialize as their defining lines of code complete,
//            and while the :term split runs the bench, green request
//            pulses travel between the service and its backends.
//
// No desk furniture, no laptop chrome — the editor window and the
// schematic ARE the illustration.

import { useEffect, useRef, useState } from "react";

type Props = { className?: string; style?: React.CSSProperties };

type Seg = { t: string; k: "kw" | "fn" | "var" | "str" | "num" | "punct" | "cm" | "type" };
type Line = { indent: number; segs: Seg[] };

// mint — Go API-key service (the user's real project). The schematic
// below mirrors its actual system design: nginx → keyservice replicas
// (L1 in-process) → Redis (shared L2 + rate buckets + evict bus) →
// Postgres (source of truth, off the hot path).
const CODE: Line[] = [
  { indent: 0, segs: [
    { t: "package ", k: "kw" },
    { t: "keyservice", k: "var" },
  ]},
  { indent: 0, segs: [] }, // blank
  { indent: 0, segs: [
    { t: "l1", k: "var" },
    { t: " := ", k: "punct" },
    { t: "cache.InProcess", k: "fn" },
    { t: "(", k: "punct" },
    { t: "64", k: "num" },
    { t: " << ", k: "punct" },
    { t: "20", k: "num" },
    { t: ")", k: "punct" },
  ]},
  { indent: 0, segs: [
    { t: "l2", k: "var" },
    { t: " := ", k: "punct" },
    { t: "redis.Shared", k: "fn" },
    { t: "(", k: "punct" },
    { t: "ctx", k: "var" },
    { t: ", ", k: "punct" },
    { t: "env", k: "fn" },
    { t: "(", k: "punct" },
    { t: '"REDIS_URL"', k: "str" },
    { t: "))", k: "punct" },
  ]},
  { indent: 0, segs: [{ t: "// TODO: rotate key pepper on deploy", k: "cm" }] },
  { indent: 0, segs: [
    { t: "srv", k: "var" },
    { t: " := ", k: "punct" },
    { t: "mint.New", k: "fn" },
    { t: "(", k: "punct" },
    { t: "mint.Config", k: "type" },
    { t: "{", k: "punct" },
  ]},
  { indent: 1, segs: [
    { t: "Limit", k: "var" },
    { t: ":  ", k: "punct" },
    { t: "redis.Buckets", k: "fn" },
    { t: "(", k: "punct" },
    { t: "100", k: "num" },
    { t: ", ", k: "punct" },
    { t: "200", k: "num" },
    { t: "),", k: "punct" },
  ]},
  { indent: 1, segs: [
    { t: "Source", k: "var" },
    { t: ": ", k: "punct" },
    { t: "pg.OffHotPath", k: "fn" },
    { t: "(", k: "punct" },
    { t: "dsn", k: "var" },
    { t: "),", k: "punct" },
  ]},
  { indent: 0, segs: [{ t: "})", k: "punct" }] },
];

const DELETE_LINE_IDX = 4;

const CHAR_BASE_MS = 42;
const CHAR_JITTER_MS = 27;
const POST_LINE_MS = 300;
const NORMAL_HOLD_MS = 1400;
const VISUAL_MS = 1100;
const DELETE_FLASH_MS = 360;
const POST_DELETE_MS = 1500;
const RESET_PAUSE_MS = 1600;

const TERM_LINE_MS = 420;
const TERM_HOLD_MS = 1500;
const TERM_OUTPUT: { text: string; mark?: "prompt" | "pass" | "sum" }[] = [
  { text: "make bench", mark: "prompt" },
  { text: "L1 hit 99.0% · ~0.2ms", mark: "pass" },
  { text: "L2 hit 0.9% · ~1.1ms", mark: "pass" },
  { text: "limiter holds at burst 200", mark: "pass" },
  { text: "8.2k req/s · p99 4.1ms", mark: "sum" },
];

const TOTAL_CHARS = CODE.reduce((n, ln) => n + ln.segs.reduce((m, s) => m + s.t.length, 0), 0);
const LINE_CHARS = CODE.map(ln => ln.segs.reduce((m, s) => m + s.t.length, 0));

// Cumulative char count at the end of each line — drives both the typing
// math and the schematic (a node appears when its line of code lands).
const LINE_END: number[] = [];
{
  let a = 0;
  for (const n of LINE_CHARS) { a += n; LINE_END.push(a); }
}

const charJitter = (i: number) => (((i * 2654435761) >>> 0) % CHAR_JITTER_MS);
const CHAR_TIMES: number[] = [];
{
  let t = 0;
  let idx = 0;
  for (let li = 0; li < CODE.length; li++) {
    for (let c = 0; c < LINE_CHARS[li]; c++) {
      t += CHAR_BASE_MS + charJitter(idx);
      idx++;
      CHAR_TIMES.push(t);
    }
    if (li < CODE.length - 1) t += POST_LINE_MS;
  }
}
const TOTAL_TYPE_MS = (CHAR_TIMES[CHAR_TIMES.length - 1] ?? 0) + 200;

function charsAt(elapsed: number): number {
  let lo = 0, hi = CHAR_TIMES.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (CHAR_TIMES[mid] <= elapsed) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const T_TYPE   = TOTAL_TYPE_MS;
const T_NORMAL = T_TYPE + NORMAL_HOLD_MS;
const T_VISUAL = T_NORMAL + VISUAL_MS;
const T_DELETE = T_VISUAL + DELETE_FLASH_MS;
const T_POST   = T_DELETE + POST_DELETE_MS;
const T_SAVE   = T_POST + RESET_PAUSE_MS;
const T_TERM   = T_SAVE + TERM_OUTPUT.length * TERM_LINE_MS + TERM_HOLD_MS;
const T_LOOP   = T_TERM;

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

type FT = { type: "folder" | "file"; name: string; depth: number; open?: boolean; active?: boolean; ext?: string; modified?: boolean; gitNew?: boolean };
// Mirrors the real repo layout: keyservice/{main.go, internal/*}
const FILE_TREE: FT[] = [
  { type: "folder", name: "keyservice",   depth: 0, open: true },
  { type: "file",   name: "main.go",      depth: 1, ext: "go", active: true },
  { type: "folder", name: "internal",     depth: 1, open: true },
  { type: "file",   name: "api.go",       depth: 2, ext: "go" },
  { type: "file",   name: "keys.go",      depth: 2, ext: "go", modified: true },
  { type: "file",   name: "ratelimit.go", depth: 2, ext: "go" },
  { type: "file",   name: "store.go",     depth: 2, ext: "go", gitNew: true },
  { type: "folder", name: "benchmarks",   depth: 0, open: false },
  { type: "file",   name: "docker-compose.yml", depth: 0, ext: "yml" },
  { type: "file",   name: "go.mod",       depth: 0, ext: "mod" },
  { type: "file",   name: "README.md",    depth: 0, ext: "md" },
];

const EXT_COLOR: Record<string, string> = {
  go:   "#00ADD8",
  yml:  "#FFC079",
  mod:  "#C18FFF",
  md:   "#A8A69E",
};

type Buf = { num: number; name: string; active?: boolean; modified?: boolean; errors?: number };
const BUFFERS: Buf[] = [
  { num: 1, name: "main.go",      active: true, modified: true },
  { num: 2, name: "store.go",     errors: 1 },
  { num: 3, name: "ratelimit.go" },
  { num: 4, name: "api.go" },
  { num: 5, name: ".env" },
];

type Phase = "typing" | "normal" | "visual" | "delete" | "post" | "reset" | "term";
type Mode  = "INSERT" | "NORMAL" | "V-LINE";

// ── Schematic geometry (viewBox 0 0 600 300) ───────────────────────────
// Mirrors mint's real system design: nginx fans out to two keyservice
// replicas (each with an in-process L1), misses fall through to a shared
// Redis L2 (which also runs the evict bus + rate buckets), and Postgres
// stays off the hot path as the source of truth.
const NODE = {
  nginx: { x: 70,  y: 14,  w: 140, h: 38 },
  r1:    { x: 40,  y: 92,  w: 200, h: 62 },
  r2:    { x: 40,  y: 176, w: 200, h: 62 },
  redis: { x: 420, y: 76,  w: 160, h: 92 },
  pg:    { x: 420, y: 212, w: 160, h: 62 },
};
// Orthogonally routed wires.
const WIRE_IN1    = "M 140 52 L 140 70 L 110 70 L 110 92";
const WIRE_IN2    = "M 140 52 L 140 70 L 24 70 L 24 207 L 40 207";
const WIRE_MISS1  = "M 240 123 L 330 123 L 330 110 L 420 110";
const WIRE_MISS2  = "M 240 207 L 330 207 L 330 243 L 420 243";
const WIRE_L2MISS = "M 500 168 L 500 212";
const WIRE_EVICT  = "M 420 130 L 350 130 L 350 145 L 240 145";

export default function SystemSchematic({ className, style }: Props) {
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [flash, setFlash] = useState(0);
  const [termLines, setTermLines] = useState(0);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMq = () => setReduced(mq.matches);
    applyMq();
    mq.addEventListener("change", applyMq);
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.05 });
    if (wrapRef.current) io.observe(wrapRef.current);
    return () => {
      mq.removeEventListener("change", applyMq);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced) {
      setTyped(TOTAL_CHARS);
      setPhase("post");
      setFlash(0);
      setTermLines(0);
      return;
    }
    if (!onScreen) return;

    let raf = 0;
    let start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;

      if (elapsed > T_LOOP) {
        start = now;
        setTyped(0);
        setPhase("typing");
        setFlash(0);
        setTermLines(0);
      } else if (elapsed > T_SAVE) {
        setTyped(TOTAL_CHARS);
        setPhase("term");
        setFlash(0);
        setTermLines(Math.min(TERM_OUTPUT.length, 1 + Math.floor((elapsed - T_SAVE) / TERM_LINE_MS)));
      } else if (elapsed > T_POST) {
        setTyped(TOTAL_CHARS);
        setPhase("reset");
        setFlash(0);
      } else if (elapsed > T_DELETE) {
        setTyped(TOTAL_CHARS);
        setPhase("post");
        setFlash(0);
      } else if (elapsed > T_VISUAL) {
        const p = (elapsed - T_VISUAL) / DELETE_FLASH_MS;
        setTyped(TOTAL_CHARS);
        setPhase("delete");
        setFlash(1 - p);
      } else if (elapsed > T_NORMAL) {
        setTyped(TOTAL_CHARS);
        setPhase("visual");
        setFlash(0);
      } else if (elapsed > T_TYPE) {
        setTyped(TOTAL_CHARS);
        setPhase("normal");
        setFlash(0);
      } else {
        setPhase("typing");
        setFlash(0);
        setTyped(Math.min(charsAt(elapsed), TOTAL_CHARS));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onScreen, reduced]);

  const insertMode = phase === "typing";
  const visualActive = phase === "visual" || phase === "delete";
  const lineHidden   = phase === "post" || phase === "reset" || phase === "term";
  const mode: Mode =
    phase === "typing" ? "INSERT" :
    phase === "visual" ? "V-LINE" :
                         "NORMAL";

  let acc = 0;
  let cursorLineIdx = CODE.length - 1;
  for (let i = 0; i < CODE.length; i++) {
    acc += LINE_CHARS[i];
    if (typed < acc) { cursorLineIdx = i; break; }
  }
  if (visualActive) cursorLineIdx = DELETE_LINE_IDX;
  else if (lineHidden) cursorLineIdx = Math.max(0, DELETE_LINE_IDX - 1);
  const currentLineNumber = cursorLineIdx + 1;

  // ── Schematic state, derived from the buffer ──────────────────────
  const nginxOn    = typed >= LINE_END[0]; // package line     → entry point
  const replicasOn = typed >= LINE_END[2]; // l1 in-process    → replicas
  const redisOn    = typed >= LINE_END[3]; // l2 redis.Shared  → redis node
  const liveOn     = typed >= LINE_END[5]; // mint.New         → nginx fans out
  const bucketsOn  = typed >= LINE_END[6]; // Limit line       → rate-bucket chip
  const pgOn       = typed >= LINE_END[7]; // Source line      → postgres + miss paths
  const running = phase === "term";
  const saving  = phase === "reset";

  const nodeStroke = (on: boolean, accent: string) =>
    !on ? "transparent" : running ? "#1D9E75" : saving ? "#7F77DD" : accent;

  const wireStyle = (on: boolean): React.CSSProperties => ({
    strokeDasharray: 1,
    strokeDashoffset: on ? 0 : 1,
    transition: "stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1), stroke 300ms ease",
  });

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        position: "relative",
        containerType: "inline-size",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        ...style,
      }}
      aria-hidden
    >
      {/* Ambient glow behind the editor */}
      <div
        style={{
          position: "absolute",
          inset: "-8% -12% auto -12%",
          height: "70%",
          background:
            "radial-gradient(58% 55% at 50% 38%, color-mix(in srgb, var(--violet-mid) 14%, transparent), transparent 75%)",
          pointerEvents: "none",
        }}
      />

      {/* ═══ EDITOR WINDOW ═══════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "480 / 292",
          borderRadius: "10px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "#131211",
          border: "1px solid #2C2C2A",
          boxShadow:
            "0 1px 0 rgba(0,0,0,0.5), 0 30px 60px -30px rgba(0,0,0,0.8), 0 0 40px color-mix(in srgb, var(--violet-mid) 7%, transparent)",
          fontFamily: "ui-monospace, 'Geist Mono', 'Fira Code', monospace",
          fontSize: "clamp(6px, 2cqi, 11px)",
          lineHeight: 1.4,
          color: "#A8A69E",
        }}
      >
        {/* ── BUFFERLINE ── */}
        <div style={{
          display: "flex",
          background: "#0E0E0C",
          borderBottom: "1px solid #1F1F1D",
          height: "2em",
          alignItems: "stretch",
          fontSize: "0.9em",
          flexShrink: 0,
        }}>
          {BUFFERS.map(b => (
            <div key={b.num} style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3em",
              padding: "0 0.6em 0 0.5em",
              background: b.active ? "#161614" : "transparent",
              borderTop: b.active ? "0.15em solid #C18FFF" : "0.15em solid transparent",
              color: b.active ? "#E8E6DF" : "#5F5E5A",
              fontWeight: b.active ? 600 : 400,
            }}>
              <span style={{ color: "#5F5E5A" }}>{b.num}</span>
              <span>{b.name}</span>
              {b.modified && <span style={{ color: "#FFC079" }}>●</span>}
              {b.errors && <span style={{ color: "#E55B5B", fontSize: "0.8em" }}>{"●" + b.errors}</span>}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ padding: "0 0.8em", color: "#5F5E5A", display: "flex", alignItems: "center", gap: "0.4em" }}>
            <span style={{ color: "#7AE2C5" }}>●</span>
            <span>{BUFFERS.length}</span>
          </div>
        </div>

        {/* ── BODY (sidebar + code) ── */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div style={{
            width: "25%",
            background: "#0E0E0C",
            borderRight: "1px solid #1F1F1D",
            padding: "0.5em",
            fontSize: "0.8em",
            lineHeight: 1.3,
            color: "#5F5E5A",
            overflow: "hidden",
          }}>
            <div style={{
              color: "#C18FFF",
              fontWeight: 700,
              fontSize: "0.9em",
              padding: "0 0 0.5em 0.2em",
              borderBottom: "1px solid #1F1F1D",
              marginBottom: "0.4em",
              letterSpacing: "0.04em",
            }}>
              NVIM
            </div>
            {FILE_TREE.map((item, i) => {
              const indent = item.depth * 0.6;
              const isFolder = item.type === "folder";
              const icon = isFolder ? (item.open ? "▾ " : "▸ ") : "  ";
              const dotColor = item.ext ? EXT_COLOR[item.ext] : "#5F5E5A";
              return (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2em",
                  paddingLeft: `${indent}em`,
                  background: item.active ? "rgba(193,143,255,0.15)" : "transparent",
                  color: item.active ? "#E8E6DF" : (isFolder ? "#FFC079" : "#888780"),
                  fontWeight: item.active ? 600 : 400,
                  height: "1.5em",
                  whiteSpace: "nowrap",
                }}>
                  <span style={{ color: isFolder ? "#FFC079" : "#5F5E5A", flexShrink: 0 }}>{icon}</span>
                  {!isFolder && <span style={{ color: dotColor, flexShrink: 0 }}>●</span>}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                  {item.modified && <span style={{ color: "#FFC079", marginLeft: "auto" }}>M</span>}
                  {item.gitNew && <span style={{ color: "#7AE2C5", marginLeft: "auto" }}>U</span>}
                </div>
              );
            })}
          </div>

          <div style={{
            flex: 1,
            padding: "0.5em 0",
            fontSize: "1.05em",
            lineHeight: 1.5,
            color: "#A8A69E",
            whiteSpace: "pre",
            overflow: "hidden",
            position: "relative",
          }}>
            {(() => {
              let used = 0;
              const out: React.ReactNode[] = [];
              let displayRow = 0;
              for (let i = 0; i < CODE.length; i++) {
                const ln = CODE[i];
                const lnChars = LINE_CHARS[i];
                const startUsed = used;
                const visibleInLine = Math.max(0, Math.min(lnChars, typed - used));
                used += lnChars;

                const skipLine = lineHidden && i === DELETE_LINE_IDX;
                if (skipLine) {
                  if (typed <= startUsed && i > 0) break;
                  continue;
                }

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
                const isVisualLine = visualActive && i === DELETE_LINE_IDX;
                const isDeleteLine = phase === "delete" && i === DELETE_LINE_IDX;
                displayRow += 1;
                const displayed = isCursorLine
                  ? String(displayRow).padStart(2)
                  : String(Math.abs(displayRow - (cursorLineIdx === i ? displayRow : currentLineNumber))).padStart(2);
                const gitSign = i === 0 ? "+" : (i === 5 ? "~" : "");
                const gitColor = gitSign === "+" ? "#5DCAA5" : "#FFC079";

                let lineBg = "transparent";
                if (isDeleteLine) {
                  lineBg = `rgba(229,91,91,${0.35 * flash + 0.1})`;
                } else if (isVisualLine) {
                  lineBg = "rgba(255,192,121,0.18)";
                } else if (isCursorLine && !visualActive) {
                  lineBg = "rgba(193,143,255,0.10)";
                }

                out.push(
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3em",
                    background: lineBg,
                    paddingLeft: "0.3em",
                    position: "relative",
                    transition: "background 180ms ease",
                  }}>
                    <span style={{ color: gitColor, width: "0.9em", textAlign: "center", flexShrink: 0 }}>
                      {gitSign}
                    </span>
                    <span style={{
                      color: isVisualLine ? "#FFC079" : (isCursorLine ? "#FFC079" : "#5F5E5A"),
                      opacity: (isCursorLine || isVisualLine) ? 0.95 : 0.55,
                      width: "1.6em",
                      textAlign: "right",
                      fontSize: "0.9em",
                      flexShrink: 0,
                    }}>
                      {displayed}
                    </span>
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
                      {isCursorLine && !isVisualLine && (
                        <span style={{
                          display: "inline-block",
                          width: insertMode ? "0.2em" : "0.55em",
                          height: "1.1em",
                          background: insertMode ? "#C18FFF" : "#E8E6DF",
                          verticalAlign: "text-bottom",
                          marginLeft: "0.1em",
                          opacity: insertMode ? 1 : 0.85,
                          animation: "ss-cursor 1s steps(2) infinite",
                        }} />
                      )}
                      {isVisualLine && phase === "visual" && (
                        <span style={{
                          display: "inline-block",
                          width: "0.55em",
                          height: "1.1em",
                          background: "#FFC079",
                          verticalAlign: "text-bottom",
                          marginLeft: "0.1em",
                          opacity: 0.9,
                        }} />
                      )}
                    </span>
                  </div>,
                );
                if (typed <= startUsed && i > 0) break;
              }
              return out;
            })()}

            {/* Vim command hint */}
            {phase !== "typing" && phase !== "term" && (
              <div style={{
                position: "absolute",
                right: "0.8em",
                bottom: "0.5em",
                fontSize: "0.8em",
                color: "#5F5E5A",
                letterSpacing: "0.06em",
                background: "rgba(14,14,12,0.7)",
                padding: "0.2em 0.5em",
                borderRadius: "0.2em",
                border: "1px solid #1F1F1D",
              }}>
                {phase === "normal" && "esc"}
                {phase === "visual" && "V"}
                {phase === "delete" && "Vd"}
                {phase === "post"   && "1 fewer line"}
                {phase === "reset"  && ":w"}
              </div>
            )}

            {/* LSP completion popup */}
            {insertMode && typed > 80 && typed < TOTAL_CHARS - 10 && (
              <div style={{
                position: "absolute",
                left: "8em",
                top: `${(cursorLineIdx + 1) * 1.5 + 0.5}em`,
                background: "#1A1A18",
                border: "1px solid #2C2C2A",
                borderRadius: "0.2em",
                padding: "0.3em 0.5em",
                fontSize: "0.8em",
                lineHeight: 1.3,
                color: "#A8A69E",
                boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                minWidth: "7em",
              }}>
                <div style={{ display: "flex", gap: "0.3em", alignItems: "center" }}>
                  <span style={{ color: "#7AE2C5" }}>ƒ</span>
                  <span style={{ color: "#E8E6DF" }}>Prewarm</span>
                </div>
                <div style={{ display: "flex", gap: "0.3em", alignItems: "center", opacity: 0.65 }}>
                  <span style={{ color: "#C18FFF" }}>ƒ</span>
                  <span>PrewarmN</span>
                </div>
                <div style={{ display: "flex", gap: "0.3em", alignItems: "center", opacity: 0.55 }}>
                  <span style={{ color: "#FFC079" }}>τ</span>
                  <span>Pool</span>
                </div>
              </div>
            )}

            {/* :term split — test suite */}
            {phase === "term" && (
              <div style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "46%",
                background: "rgba(10,10,9,0.96)",
                borderTop: "1px solid #2C2C2A",
                padding: "0.4em 0.8em",
                fontSize: "0.9em",
                lineHeight: 1.6,
                overflow: "hidden",
              }}>
                <div style={{
                  fontSize: "0.75em",
                  color: "#5F5E5A",
                  letterSpacing: "0.08em",
                  marginBottom: "0.3em",
                }}>
                  term://tests
                </div>
                {TERM_OUTPUT.slice(0, termLines).map((ln, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5em", alignItems: "baseline" }}>
                    {ln.mark === "prompt" && (
                      <>
                        <span style={{ color: "#C18FFF" }}>❯</span>
                        <span style={{ color: "#E8E6DF" }}>{ln.text}</span>
                      </>
                    )}
                    {ln.mark === "pass" && (
                      <>
                        <span style={{ color: "#5DCAA5" }}>✓</span>
                        <span style={{ color: "#A8A69E" }}>{ln.text}</span>
                      </>
                    )}
                    {ln.mark === "sum" && (
                      <span style={{ color: "#5DCAA5", marginTop: "0.2em" }}>{ln.text}</span>
                    )}
                  </div>
                ))}
                {termLines < TERM_OUTPUT.length && (
                  <span style={{
                    display: "inline-block",
                    width: "0.55em",
                    height: "1.1em",
                    background: "#E8E6DF",
                    opacity: 0.7,
                    animation: "ss-cursor 1s steps(2) infinite",
                  }} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── LUALINE ── */}
        <div style={{
          display: "flex",
          height: "2em",
          background: "#0A0A09",
          fontSize: "0.85em",
          lineHeight: 2,
          alignItems: "stretch",
          flexShrink: 0,
        }}>
          <div style={{
            background:
              mode === "INSERT" ? "#5DCAA5" :
              mode === "V-LINE" ? "#FFC079" :
                                  "#7F77DD",
            color: "#0E0E0C",
            fontWeight: 700,
            padding: "0 0.8em",
            letterSpacing: "0.06em",
            transition: "background 160ms ease",
          }}>
            {` ${mode} `}
          </div>
          <div style={{
            background: "#1F1F1D",
            color: "#FFC079",
            padding: "0 0.8em",
            display: "flex",
            alignItems: "center",
            gap: "0.3em",
          }}>
            <span>main</span>
            <span style={{ color: "#5DCAA5" }}>+12</span>
            <span style={{ color: "#E55B5B" }}>-3</span>
          </div>
          <div style={{
            background: "#161614",
            color: "#A8A69E",
            padding: "0 0.8em",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            ~/mint/keyservice/main.go
          </div>
          <div style={{
            background: "#161614",
            padding: "0 0.6em",
            display: "flex",
            alignItems: "center",
            gap: "0.5em",
          }}>
            <span style={{ color: "#E55B5B" }}>● 0</span>
            <span style={{ color: "#FFC079" }}>▲ 1</span>
            <span style={{ color: "#7F77DD" }}>ⓘ 2</span>
          </div>
          <div style={{
            background:
              mode === "INSERT" ? "#5DCAA5" :
              mode === "V-LINE" ? "#FFC079" :
                                  "#7F77DD",
            color: "#0E0E0C",
            fontWeight: 700,
            padding: "0 0.8em",
            transition: "background 160ms ease",
          }}>
            {currentLineNumber}:{Math.min(typed, 80)}  {Math.round((cursorLineIdx + 1) / CODE.length * 100)}%
          </div>
        </div>
      </div>

      {/* ═══ SCHEMATIC — what the buffer builds ═══════════════════════ */}
      <svg
        viewBox="0 0 600 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <defs>
          <style>{`
            @keyframes ss-cursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }
            .ss-node { transition: opacity 500ms ease, transform 500ms cubic-bezier(0.16,1,0.3,1), stroke 300ms ease; }
            .ss-label { font-family: ui-monospace, 'Geist Mono', monospace; }
          `}</style>
        </defs>

        {/* blueprint grid */}
        <g stroke="#2C2C2A" strokeWidth="0.5" opacity="0.35">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="300" />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 60 + 20} x2="600" y2={i * 60 + 20} />
          ))}
        </g>

        {/* figure caption */}
        <text className="ss-label" x="598" y="294" fontSize="10" textAnchor="end"
              fill="#5F5E5A" letterSpacing="1.5">
          fig. 01 — mint · api-key service
        </text>

        {/* ── wires ── */}
        {/* nginx fans out to both replicas once the service is up */}
        <path d={WIRE_IN1} pathLength={1} fill="none"
              stroke={running ? "#1D9E75" : saving ? "#7F77DD" : "#5F5E5A"} strokeWidth="1"
              style={wireStyle(liveOn)} />
        <path d={WIRE_IN2} pathLength={1} fill="none"
              stroke={running ? "#1D9E75" : saving ? "#7F77DD" : "#5F5E5A"} strokeWidth="1"
              style={wireStyle(liveOn)} />
        {/* miss paths */}
        <path d={WIRE_MISS1} pathLength={1} fill="none"
              stroke={running ? "#1D9E75" : "#5F5E5A"} strokeWidth="1"
              style={wireStyle(liveOn && redisOn)} />
        <path d={WIRE_MISS2} pathLength={1} fill="none"
              stroke={running ? "#1D9E75" : "#5F5E5A"} strokeWidth="1"
              style={wireStyle(pgOn)} />
        <path d={WIRE_L2MISS} pathLength={1} fill="none"
              stroke="#5F5E5A" strokeWidth="1"
              style={wireStyle(pgOn)} />
        {/* revoke → evict bus (dashed return path, fades in with redis) */}
        <path d={WIRE_EVICT} fill="none"
              stroke="#5F5E5A" strokeWidth="0.8" strokeDasharray="4 3"
              style={{ opacity: redisOn ? 0.7 : 0, transition: "opacity 600ms ease" }} />

        {/* wire labels */}
        <g className="ss-label" fill="#5F5E5A" fontSize="8" letterSpacing="0.5">
          <g style={{ opacity: liveOn && redisOn ? 1 : 0, transition: "opacity 500ms ease 300ms" }}>
            <text x="330" y="118" textAnchor="middle">L1 miss ~1%</text>
          </g>
          <g style={{ opacity: pgOn ? 1 : 0, transition: "opacity 500ms ease 300ms" }}>
            <text x="330" y="202" textAnchor="middle">L1+L2 miss</text>
            <text x="506" y="193">L2 miss</text>
          </g>
          <g style={{ opacity: redisOn ? 1 : 0, transition: "opacity 500ms ease 300ms" }}>
            <text x="332" y="140" textAnchor="middle">revoke → evict L1</text>
          </g>
        </g>

        {/* ── request pulses while the bench runs ── */}
        {running && !reduced && (
          <g>
            <circle r="3" fill="#5DCAA5">
              <animateMotion dur="1.2s" repeatCount="indefinite" path={WIRE_IN1} />
            </circle>
            <circle r="3" fill="#5DCAA5" opacity="0.85">
              <animateMotion dur="1.6s" begin="0.4s" repeatCount="indefinite" path={WIRE_IN2} />
            </circle>
            <circle r="2.5" fill="#5DCAA5" opacity="0.7">
              <animateMotion dur="1.4s" begin="0.8s" repeatCount="indefinite" path={WIRE_MISS1} />
            </circle>
          </g>
        )}

        {/* ── nginx entry node (dashed = in front of the service) ── */}
        <g className="ss-node" style={{ opacity: nginxOn ? 1 : 0, transform: nginxOn ? "none" : "translateY(6px)" }}>
          <rect x={NODE.nginx.x} y={NODE.nginx.y} width={NODE.nginx.w} height={NODE.nginx.h}
                rx="3" fill="color-mix(in srgb, #131211 80%, transparent)"
                stroke={nodeStroke(nginxOn, "#5F5E5A")} strokeWidth="1" strokeDasharray="4 3" />
          <text className="ss-label" x={NODE.nginx.x + 12} y={NODE.nginx.y + 24} fontSize="11" fill="#888780">
            nginx
          </text>
          <text className="ss-label" x={NODE.nginx.x + NODE.nginx.w - 12} y={NODE.nginx.y + 24}
                fontSize="9" textAnchor="end" fill="#5F5E5A">
            /validate
          </text>
        </g>

        {/* ── keyservice replicas (the service itself, violet) ── */}
        {([NODE.r1, NODE.r2] as const).map((n, i) => (
          <g key={i} className="ss-node"
             style={{ opacity: replicasOn ? 1 : 0, transform: replicasOn ? "none" : "translateY(8px)" }}>
            <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  rx="4" fill="color-mix(in srgb, #131211 85%, transparent)"
                  stroke={nodeStroke(replicasOn, "#7F77DD")} strokeWidth="1.2" />
            <text className="ss-label" x={n.x + 14} y={n.y + 21} fontSize="11.5"
                  fill="#E8E6DF" fontWeight="600">
              keyservice · r{i + 1}
            </text>
            {/* in-process L1 chip */}
            <rect x={n.x + 14} y={n.y + 30} width={n.w - 28} height="22"
                  rx="3" fill="transparent" stroke="#5F5E5A" strokeOpacity="0.6" strokeWidth="0.8" />
            <text className="ss-label" x={n.x + 24} y={n.y + 45} fontSize="9" fill="#888780">
              L1 in-process · <tspan fill="#EF9F27">~0.2ms</tspan>
            </text>
            {/* status lamp */}
            <circle cx={n.x + n.w - 16} cy={n.y + 16} r="3.5"
                    fill={running ? "#5DCAA5" : saving ? "#7F77DD" : "#2C2C2A"}
                    style={{ transition: "fill 300ms ease" }} />
          </g>
        ))}

        {/* ── redis node (L2 + evict bus + rate buckets) ── */}
        <g className="ss-node" style={{ opacity: redisOn ? 1 : 0, transform: redisOn ? "none" : "translateY(8px)" }}>
          <rect x={NODE.redis.x} y={NODE.redis.y} width={NODE.redis.w} height={NODE.redis.h}
                rx="3" fill="color-mix(in srgb, #131211 85%, transparent)"
                stroke={nodeStroke(redisOn, "#5F5E5A")} strokeWidth="1" />
          <text className="ss-label" x={NODE.redis.x + 14} y={NODE.redis.y + 21} fontSize="11.5"
                fill="#E8E6DF" fontWeight="500">
            redis
          </text>
          <text className="ss-label" x={NODE.redis.x + 14} y={NODE.redis.y + 36} fontSize="9"
                fill="#5F5E5A" letterSpacing="0.8">
            L2 SHARED · <tspan fill="#EF9F27">~1ms</tspan>
          </text>
          <text className="ss-label" x={NODE.redis.x + 14} y={NODE.redis.y + 49} fontSize="9"
                fill="#5F5E5A" letterSpacing="0.8">
            pub/sub evict bus
          </text>
          {/* rate-bucket chip */}
          <g style={{ opacity: bucketsOn ? 1 : 0, transition: "opacity 400ms ease" }}>
            <rect x={NODE.redis.x + 14} y={NODE.redis.y + 58} width={NODE.redis.w - 28} height="22"
                  rx="3" fill="transparent" stroke="#BA7517" strokeOpacity="0.55" strokeWidth="0.8" />
            <text className="ss-label" x={NODE.redis.x + 24} y={NODE.redis.y + 73} fontSize="9.5" fill="#EF9F27">
              rate buckets 100/200
            </text>
          </g>
        </g>

        {/* ── postgres node (source of truth, off the hot path) ── */}
        <g className="ss-node" style={{ opacity: pgOn ? 1 : 0, transform: pgOn ? "none" : "translateY(8px)" }}>
          <rect x={NODE.pg.x} y={NODE.pg.y} width={NODE.pg.w} height={NODE.pg.h}
                rx="3" fill="color-mix(in srgb, #131211 85%, transparent)"
                stroke={nodeStroke(pgOn, "#5F5E5A")} strokeWidth="1" />
          <text className="ss-label" x={NODE.pg.x + 14} y={NODE.pg.y + 21} fontSize="11.5"
                fill="#E8E6DF" fontWeight="500">
            postgres
          </text>
          <text className="ss-label" x={NODE.pg.x + 14} y={NODE.pg.y + 36} fontSize="9"
                fill="#5F5E5A" letterSpacing="0.8">
            SOURCE OF TRUTH
          </text>
          <text className="ss-label" x={NODE.pg.x + 14} y={NODE.pg.y + 49} fontSize="9"
                fill="#5F5E5A" letterSpacing="0.8">
            off the hot path
          </text>
        </g>

        {/* throughput badge while the bench runs */}
        {running && (
          <g>
            <rect x="40" y="262" width="100" height="22" rx="11"
                  fill="color-mix(in srgb, #085041 35%, transparent)"
                  stroke="#1D9E75" strokeWidth="0.8" />
            <circle cx="54" cy="273" r="3" fill="#5DCAA5" />
            <text className="ss-label" x="64" y="277" fontSize="10" fill="#5DCAA5" letterSpacing="0.5">
              8.2k req/s
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
