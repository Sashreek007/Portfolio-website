"use client";

// MdrTerminal — Lumon Macrodata Refinement terminal (Severance),
// refining the Cold Harbor file. Show-accurate details:
//   · header: boxed file name, "N% Complete", Lumon oval logo
//   · field of single digits (0–9) that bob individually; the cursor
//     magnifies digits around it (fisheye)
//   · "scary" clusters tremble; they get box-selected and fly into one
//     of five lidded bins (01–05) whose doors flap open
//   · bins must fill EVENLY — deposits always go to the lowest bin
//   · after a deposit a panel rises off the bin showing the four
//     tempers: WO (woe) · FC (frolic) · DR (dread) · MA (malice)
//   · footer hex readouts; CRT scanlines/vignette/flicker
//   · at 100%: "COLD HARBOR / 100% COMPLETE" splash, then a new cycle
//
// The terminal refines itself (a ghost cursor works autonomously), but
// hovering pauses the ghost: your cursor becomes the magnifier and you
// can drag-select trembling clusters yourself.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BorderTrail } from "@/components/motion-primitives/border-trail";

type Digit = {
  col: number;
  row: number;
  x: number;
  y: number;
  glyph: number;
  phase: number;
  amp: number;
  speed: number;
  scary: boolean;
  flash: number; // 0..1 white flash
  fly: { sx: number; sy: number; tx: number; ty: number; t0: number; dur: number } | null;
  dead: boolean;
  respawnAt: number;
  alpha: number;
};

type Phase = "wander" | "approach" | "select" | "flash" | "fly" | "deposit";

const START_BINS = [92, 88, 90, 86, 89];
const TEMPERS = ["WO", "FC", "DR", "MA"] as const;

function LumonLogo({ height = 16 }: { height?: number }) {
  return (
    <svg viewBox="0 0 88 34" style={{ height }} aria-hidden className="mdr-logo">
      <ellipse cx="44" cy="17" rx="42" ry="15" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M 7 12 Q 44 4 81 12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <path d="M 7 22 Q 44 30 81 22" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <text
        x="44"
        y="21.5"
        textAnchor="middle"
        fontSize="12.5"
        letterSpacing="1.5"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        LUMON
      </text>
    </svg>
  );
}

function randHex(): string {
  return (
    "0x" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, "0")
  );
}

export default function MdrTerminal({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bins, setBins] = useState<number[]>(START_BINS);
  const [openBin, setOpenBin] = useState<number | null>(null);
  const [temper, setTemper] = useState<{ bin: number; values: number[] } | null>(null);
  const [complete, setComplete] = useState(false);
  const [hexes, setHexes] = useState<[string, string]>(["0x15084A", "0x0DAE4F"]);

  const total = Math.min(
    100,
    Math.floor(bins.reduce((a, b) => a + b, 0) / bins.length)
  );

  // Everything the rAF loop touches lives in refs.
  const sim = useRef({
    digits: [] as Digit[],
    cols: 0,
    rows: 0,
    w: 0,
    h: 0,
    phase: "wander" as Phase,
    phaseAt: 0,
    ghost: { x: 120, y: 90 },
    ghostTarget: { x: 200, y: 120 },
    wanderAt: 0,
    clusterAt: 0,
    sel: null as null | { x1: number; y1: number; x2: number; y2: number; p: number },
    targetBin: 0,
    pointerIn: false,
    pointer: { x: 0, y: 0 },
    drag: null as null | { x1: number; y1: number; x2: number; y2: number },
    visible: true,
    fontFamily: "monospace",
    binsLive: [...START_BINS],
    completing: false,
  });

  const binGain = useCallback((bin: number, gain: number) => {
    setBins((prev) => {
      const next = prev.map((v, i) => (i === bin ? Math.min(100, v + gain) : v));
      sim.current.binsLive = next;
      return next;
    });
  }, []);

  const resetCycle = useCallback(() => {
    sim.current.binsLive = [...START_BINS];
    setBins([...START_BINS]);
    setComplete(false);
    sim.current.completing = false;
    for (const d of sim.current.digits) {
      d.dead = true;
      d.respawnAt = performance.now() + 300 + Math.random() * 1200;
    }
  }, []);

  useEffect(() => {
    const field = fieldRef.current;
    const canvas = canvasRef.current;
    if (!field || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;
    s.fontFamily = getComputedStyle(canvas).fontFamily || "monospace";

    // ── layout ────────────────────────────────────────────────────────
    const layout = () => {
      const rect = field.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.cols = Math.max(8, Math.floor(s.w / 36));
      s.rows = Math.max(5, Math.floor(s.h / 44));
      s.digits = [];
      for (let r = 0; r < s.rows; r++) {
        for (let c = 0; c < s.cols; c++) {
          s.digits.push({
            col: c,
            row: r,
            x: (c + 0.5) * (s.w / s.cols),
            y: (r + 0.5) * (s.h / s.rows),
            glyph: Math.floor(Math.random() * 10),
            phase: Math.random() * Math.PI * 2,
            amp: 1.2 + Math.random() * 2.2,
            speed: 0.5 + Math.random() * 0.7,
            scary: false,
            flash: 0,
            fly: null,
            dead: false,
            respawnAt: 0,
            alpha: 1,
          });
        }
      }
    };
    layout();
    const ro = new ResizeObserver(() => {
      layout();
      staticPaint(); // repaint after resize even while the loop is paused
    });
    ro.observe(field);

    // ── visibility gating ────────────────────────────────────────────
    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
    });
    io.observe(field);
    const onVis = () => (s.visible = !document.hidden && s.visible);
    document.addEventListener("visibilitychange", onVis);

    // ── pointer ──────────────────────────────────────────────────────
    const toLocal = (e: PointerEvent) => {
      const r = field.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onEnter = () => (s.pointerIn = true);
    const onLeave = () => {
      s.pointerIn = false;
      s.drag = null;
    };
    const onMove = (e: PointerEvent) => {
      s.pointer = toLocal(e);
      if (s.drag) {
        s.drag.x2 = s.pointer.x;
        s.drag.y2 = s.pointer.y;
      }
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      s.drag = { x1: p.x, y1: p.y, x2: p.x, y2: p.y };
    };
    const onUp = () => {
      if (!s.drag) return;
      const { x1, y1, x2, y2 } = s.drag;
      const [lx, hx] = [Math.min(x1, x2), Math.max(x1, x2)];
      const [ly, hy] = [Math.min(y1, y2), Math.max(y1, y2)];
      const caught = s.digits.filter(
        (d) => d.scary && !d.dead && !d.fly && d.x >= lx && d.x <= hx && d.y >= ly && d.y <= hy
      );
      s.drag = null;
      // A manual catch launches the same flash → fly pipeline.
      if (caught.length > 0 && (s.phase === "wander" || s.phase === "approach" || s.phase === "select")) {
        startFlash(performance.now());
      }
    };
    field.addEventListener("pointerenter", onEnter);
    field.addEventListener("pointerleave", onLeave);
    field.addEventListener("pointermove", onMove);
    field.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    // ── state machine helpers ────────────────────────────────────────
    const scaryDigits = () => s.digits.filter((d) => d.scary && !d.dead);

    const spawnCluster = (now: number) => {
      const alive = s.digits.filter((d) => !d.dead && !d.scary && !d.fly);
      if (alive.length < 12) return;
      const center = alive[Math.floor(Math.random() * alive.length)];
      const cellW = s.w / s.cols;
      const cellH = s.h / s.rows;
      const members = alive
        .filter(
          (d) =>
            Math.abs(d.x - center.x) <= cellW * 1.6 &&
            Math.abs(d.y - center.y) <= cellH * 1.6
        )
        .slice(0, 8);
      if (members.length < 4) return;
      for (const m of members) m.scary = true;
      s.clusterAt = now;
    };

    const clusterBBox = () => {
      const ds = scaryDigits();
      if (ds.length === 0) return null;
      const xs = ds.map((d) => d.x);
      const ys = ds.map((d) => d.y);
      return {
        lx: Math.min(...xs) - 16,
        ly: Math.min(...ys) - 18,
        hx: Math.max(...xs) + 16,
        hy: Math.max(...ys) + 18,
      };
    };

    const startFlash = (now: number) => {
      s.phase = "flash";
      s.phaseAt = now;
      for (const d of scaryDigits()) d.flash = 1;
    };

    const startFly = (now: number) => {
      const live = s.binsLive;
      s.targetBin = live.indexOf(Math.min(...live));
      setOpenBin(s.targetBin);
      const binX = ((s.targetBin + 0.5) / 5) * s.w;
      scaryDigits().forEach((d, i) => {
        d.fly = {
          sx: d.x,
          sy: d.y,
          tx: binX,
          ty: s.h + 14,
          t0: now + i * 70,
          dur: 780,
        };
      });
      s.phase = "fly";
      s.phaseAt = now;
    };

    const finishDeposit = (now: number) => {
      const flock = s.digits.filter((d) => d.fly);
      for (const d of flock) {
        d.fly = null;
        d.scary = false;
        d.dead = true;
        d.alpha = 0;
        d.respawnAt = now + 1600 + Math.random() * 1800;
      }
      const gain = 2 + Math.floor(Math.random() * 3);
      const bin = s.targetBin;
      binGain(bin, gain);
      // Temper split — four values that read like the show's panel.
      const base = s.binsLive[bin];
      setTemper({
        bin,
        values: TEMPERS.map((_, i) =>
          Math.min(100, Math.max(4, Math.round(base + Math.sin((base + i * 37) * 2.1) * 22 - i * 3)))
        ),
      });
      s.phase = "deposit";
      s.phaseAt = now;
    };

    // ── main loop ────────────────────────────────────────────────────
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!s.visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // clusters keep appearing whether or not the user is hovering
      if (
        !s.completing &&
        s.phase === "wander" &&
        scaryDigits().length === 0 &&
        now - s.clusterAt > 5200 + Math.random() * 2600
      ) {
        spawnCluster(now);
      }

      // ghost pilot (paused while the real pointer is inside)
      if (!s.pointerIn && !reduced && !s.completing) {
        if (s.phase === "wander") {
          if (now - s.wanderAt > 1700) {
            s.wanderAt = now;
            s.ghostTarget = {
              x: 40 + Math.random() * (s.w - 80),
              y: 40 + Math.random() * (s.h - 80),
            };
          }
          if (scaryDigits().length > 0 && now - s.clusterAt > 1400) {
            s.phase = "approach";
            s.phaseAt = now;
          }
        } else if (s.phase === "approach") {
          const bb = clusterBBox();
          if (bb) {
            s.ghostTarget = { x: (bb.lx + bb.hx) / 2, y: (bb.ly + bb.hy) / 2 };
            const dx = s.ghost.x - s.ghostTarget.x;
            const dy = s.ghost.y - s.ghostTarget.y;
            if (Math.hypot(dx, dy) < 24) {
              s.phase = "select";
              s.phaseAt = now;
              s.sel = { ...{ x1: s.ghost.x, y1: s.ghost.y, x2: s.ghost.x, y2: s.ghost.y }, p: 0 };
            }
          } else {
            s.phase = "wander";
          }
        } else if (s.phase === "select") {
          const bb = clusterBBox();
          if (bb && s.sel) {
            s.sel.p = Math.min(1, s.sel.p + dt / 0.65);
            const e = 1 - Math.pow(1 - s.sel.p, 3);
            s.sel.x1 = s.ghost.x + (bb.lx - s.ghost.x) * e;
            s.sel.y1 = s.ghost.y + (bb.ly - s.ghost.y) * e;
            s.sel.x2 = s.ghost.x + (bb.hx - s.ghost.x) * e;
            s.sel.y2 = s.ghost.y + (bb.hy - s.ghost.y) * e;
            if (s.sel.p >= 1 && now - s.phaseAt > 900) {
              s.sel = null;
              startFlash(now);
            }
          } else {
            s.sel = null;
            s.phase = "wander";
          }
        }
        // ease ghost toward target
        s.ghost.x += (s.ghostTarget.x - s.ghost.x) * Math.min(1, dt * 2.4);
        s.ghost.y += (s.ghostTarget.y - s.ghost.y) * Math.min(1, dt * 2.4);
      }

      // shared phases (also reached via manual selection)
      if (s.phase === "flash" && now - s.phaseAt > 380) startFly(now);
      if (s.phase === "fly") {
        const flock = s.digits.filter((d) => d.fly);
        if (flock.length === 0 || flock.every((d) => now > d.fly!.t0 + d.fly!.dur)) {
          finishDeposit(now);
        }
      }
      if (s.phase === "deposit" && now - s.phaseAt > 2300) {
        setTemper(null);
        setOpenBin(null);
        s.phase = "wander";
        s.phaseAt = now;
        s.clusterAt = now;
        // full file?
        if (s.binsLive.every((b) => b >= 100) && !s.completing) {
          s.completing = true;
          setComplete(true);
          window.setTimeout(resetCycle, 4600);
        }
      }

      // respawn dead digits
      for (const d of s.digits) {
        if (d.dead && now > d.respawnAt) {
          d.dead = false;
          d.glyph = Math.floor(Math.random() * 10);
          d.alpha = 0;
        }
        if (!d.dead && d.alpha < 1) d.alpha = Math.min(1, d.alpha + dt * 2);
        if (d.flash > 0) d.flash = Math.max(0, d.flash - dt * 2.4);
      }

      // ── draw ───────────────────────────────────────────────────────
      ctx.clearRect(0, 0, s.w, s.h);
      const lens = s.pointerIn ? s.pointer : s.ghost;
      const lensR = s.pointerIn ? 92 : 76;
      const lensK = s.pointerIn ? 1.2 : 0.75;

      for (const d of s.digits) {
        if (d.dead) continue;
        let x = d.x;
        let y = d.y + Math.sin(t * d.speed + d.phase) * d.amp;
        let scale = 1;
        if (d.fly) {
          const p = Math.min(1, Math.max(0, (now - d.fly.t0) / d.fly.dur));
          if (p <= 0) {
            // waiting for stagger
          } else {
            const e = p * p * (3 - 2 * p);
            const cx = (d.fly.sx + d.fly.tx) / 2;
            const cy = Math.min(d.fly.sy, d.fly.ty) - 60;
            const a = 1 - e;
            x = a * a * d.fly.sx + 2 * a * e * cx + e * e * d.fly.tx;
            y = a * a * d.fly.sy + 2 * a * e * cy + e * e * d.fly.ty;
            scale = 1 - 0.6 * e;
          }
          if (p >= 1) continue;
        } else {
          if (d.scary) {
            x += (Math.random() - 0.5) * 2.4;
            y += (Math.random() - 0.5) * 2.4;
            scale *= 1 + 0.1 * Math.sin(t * 9 + d.phase);
          }
          const dist = Math.hypot(x - lens.x, y - lens.y);
          if (dist < lensR) {
            scale *= 1 + lensK * (0.5 + 0.5 * Math.cos((dist / lensR) * Math.PI));
          }
        }

        const size = 15 * scale;
        ctx.font = `500 ${size}px ${s.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const bright = d.scary ? 1 : 0.82;
        ctx.shadowColor = "rgba(140, 214, 245, 0.6)";
        ctx.shadowBlur = d.scary ? 14 : 8;
        if (d.flash > 0) {
          ctx.fillStyle = `rgba(255,255,255,${0.6 + 0.4 * d.flash})`;
        } else {
          ctx.fillStyle = `rgba(168, 224, 248, ${bright * d.alpha})`;
        }
        ctx.fillText(String(d.glyph), x, y);
      }
      ctx.shadowBlur = 0;

      // selection rectangles
      const rect = s.drag ?? s.sel;
      if (rect) {
        ctx.strokeStyle = "rgba(230, 248, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(
          Math.min(rect.x1, rect.x2),
          Math.min(rect.y1, rect.y2),
          Math.abs(rect.x2 - rect.x1),
          Math.abs(rect.y2 - rect.y1)
        );
        ctx.setLineDash([]);
      }

      // ghost cursor
      if (!s.pointerIn && !reduced) {
        ctx.strokeStyle = "rgba(215, 242, 255, 0.9)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.ghost.x - 7, s.ghost.y);
        ctx.lineTo(s.ghost.x + 7, s.ghost.y);
        ctx.moveTo(s.ghost.x, s.ghost.y - 7);
        ctx.lineTo(s.ghost.x, s.ghost.y + 7);
        ctx.stroke();
      }
    };

    // First frame paints immediately — a paused/offscreen terminal should
    // still show its number field, not a black screen.
    const staticPaint = () => {
      ctx.clearRect(0, 0, s.w, s.h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `500 15px ${s.fontFamily}`;
      ctx.shadowColor = "rgba(140, 214, 245, 0.6)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "rgba(168, 224, 248, 0.82)";
      for (const d of s.digits) ctx.fillText(String(d.glyph), d.x, d.y);
      ctx.shadowBlur = 0;
    };
    staticPaint();

    if (!reduced) {
      raf = requestAnimationFrame(tick);
    }

    // footer hex churn
    const hexTimer = window.setInterval(() => {
      if (s.visible && !document.hidden && !reduced) {
        setHexes([randHex(), randHex()]);
      }
    }, 900);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(hexTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      field.removeEventListener("pointerenter", onEnter);
      field.removeEventListener("pointerleave", onLeave);
      field.removeEventListener("pointermove", onMove);
      field.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [reduced, binGain, resetCycle]);

  return (
    <div className={className}>
      <div className="mdr-frame" role="img" aria-label="Macrodata refinement terminal refining the Cold Harbor file">
        <BorderTrail
          className="bg-[#9fdcf0] opacity-60 blur-[3px]"
          size={54}
          transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
        />
        <div className="mdr-header">
          <span className="mdr-file">Cold Harbor</span>
          <span className="mdr-head-right">
            <span className="mdr-pct">{total}% Complete</span>
            <LumonLogo />
          </span>
        </div>
        <div className="mdr-sep" />

        <div ref={fieldRef} className="mdr-field">
          <canvas ref={canvasRef} className="mdr-canvas" />
          <div className="mdr-scan" aria-hidden />
          <AnimatePresence>
            {temper && (
              <motion.div
                key="temper"
                className="mdr-temper"
                style={{ left: `${temper.bin * 20 + 10}%` }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {TEMPERS.map((k, i) => (
                  <div key={k} className="mdr-temper-row">
                    <span>{k}</span>
                    <span className="mdr-temper-bar">
                      <i style={{ width: `${temper.values[i]}%` }} />
                    </span>
                    <span className="mdr-temper-val">{temper.values[i]}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mdr-bins">
          {bins.map((p, i) => (
            <div key={i} className={`mdr-bin${openBin === i ? " open" : ""}`}>
              <span className="mdr-bin-doors" aria-hidden>
                <i />
                <i />
              </span>
              <span className="mdr-bin-label">0{i + 1}</span>
              <span className="mdr-bin-bar">
                <i style={{ width: `${p}%` }} />
              </span>
              <span className="mdr-bin-pct">{p}%</span>
            </div>
          ))}
        </div>

        <div className="mdr-footer">
          <span>{hexes[0]} : {hexes[1]}</span>
          <span>0x15084A : 0xDAE4FC</span>
        </div>

        <AnimatePresence>
          {complete && (
            <motion.div
              key="complete"
              className="mdr-complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LumonLogo height={30} />
              <span className="mdr-complete-file">COLD HARBOR</span>
              <span className="mdr-complete-pct">100% COMPLETE</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mdr-caption">
        fig. 02 — lumon · macrodata refinement
      </div>
    </div>
  );
}
