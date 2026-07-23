"use client";

// Blossom field — violet cherry-blossom branches anchored to two page
// corners with falling petals. The branch skeleton is grown
// procedurally (seeded recursion) and PAINTED into a canvas: every
// petal is a radial-gradient stroke (near-white core → violet edge),
// blossoms are layered back-to-front with soft bloom, bark is stroked
// in warm layered browns — a painterly render, not flat vector shapes.
// Painted once (DPR-aware) so it costs nothing per frame; Motion adds
// entrance + spring scroll parallax, CSS adds sway + falling petals.
// Hidden on /blog.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

// ── seeded RNG (deterministic) ───────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Seg = { x: number; y: number; mx: number; my: number; ex: number; ey: number; w: number; depth: number };
type Flower = { x: number; y: number; s: number; r: number; tone: number; back: boolean };
type Bud = { x: number; y: number; s: number };

const VIEW_W = 520;
const VIEW_H = 430;

// ── procedural skeleton ──────────────────────────────────────────────
function growBranch(seed: number) {
  const rng = mulberry32(seed);
  const segs: Seg[] = [];
  const flowers: Flower[] = [];
  const buds: Bud[] = [];

  const clampAng = (a: number) =>
    Math.min(Math.PI * 1.08, Math.max(Math.PI * 0.52, a));

  const grow = (
    x: number,
    y: number,
    ang: number,
    len: number,
    w: number,
    depth: number
  ) => {
    const bend = (rng() - 0.5) * 0.5 + 0.05;
    const a2 = clampAng(ang + bend);
    const mx = x + Math.cos(ang + bend * 0.5) * len * 0.5;
    const my = y + Math.sin(ang + bend * 0.5) * len * 0.5;
    const ex = x + Math.cos(a2) * len;
    const ey = y + Math.sin(a2) * len;
    segs.push({ x, y, mx, my, ex, ey, w, depth });

    if (depth >= 2 && rng() < 0.88) {
      const clusters = 1 + Math.floor(rng() * 2);
      for (let i = 0; i < clusters; i++) {
        const t = 0.25 + rng() * 0.75;
        const it = 1 - t;
        const qx = it * it * x + 2 * it * t * mx + t * t * ex;
        const qy = it * it * y + 2 * it * t * my + t * t * ey;
        const size = 2 + Math.floor(rng() * 4);
        for (let k = 0; k < size; k++) {
          const ox = qx + (rng() - 0.5) * 20;
          const oy = qy + (rng() - 0.3) * 20;
          if (rng() < 0.15) {
            buds.push({ x: ox, y: oy, s: 0.5 + rng() * 0.5 });
          } else {
            flowers.push({
              x: ox,
              y: oy,
              s: 0.6 + rng() * 0.65,
              r: rng() * Math.PI * 2,
              tone: rng(),
              back: rng() < 0.35,
            });
          }
        }
      }
    }

    if (depth < 4) {
      const kids = depth === 0 ? 3 : rng() < 0.72 ? 2 : 1;
      for (let i = 0; i < kids; i++) {
        const spread = (rng() - 0.5) * 0.85 + (i - (kids - 1) / 2) * 0.44;
        grow(
          ex,
          ey,
          clampAng(a2 + spread),
          len * (0.66 + rng() * 0.14),
          Math.max(0.8, w * 0.55),
          depth + 1
        );
      }
    } else if (rng() < 0.65) {
      flowers.push({
        x: ex,
        y: ey,
        s: 0.7 + rng() * 0.55,
        r: rng() * Math.PI * 2,
        tone: rng(),
        back: false,
      });
    }
  };

  grow(530, 22, Math.PI * 0.84, 150, 12, 0);
  return { segs, flowers, buds };
}

const TREE = growBranch(20260723);

// ── painterly canvas render ──────────────────────────────────────────
function paintPetal(
  ctx: CanvasRenderingContext2D,
  tone: number,
  jitter: () => number
) {
  // radial gradient: near-white core → pale violet → soft violet edge
  const len = 5.4 + jitter() * 1.6;
  const grad = ctx.createRadialGradient(0, -1.2, 0.4, 0, -len * 0.55, len);
  const core = tone < 0.45 ? "rgba(240, 238, 252, 0.95)" : "rgba(226, 222, 250, 0.92)";
  const mid = tone < 0.45 ? "rgba(206, 203, 246, 0.88)" : "rgba(190, 184, 240, 0.85)";
  const edge =
    tone < 0.2
      ? "rgba(127, 119, 221, 0.55)"
      : tone < 0.7
        ? "rgba(148, 140, 230, 0.6)"
        : "rgba(110, 100, 205, 0.55)";
  grad.addColorStop(0, core);
  grad.addColorStop(0.55, mid);
  grad.addColorStop(1, edge);
  ctx.fillStyle = grad;
  ctx.beginPath();
  // petal: teardrop with the classic sakura notch at the tip
  const hw = 2.6 + jitter() * 0.8;
  ctx.moveTo(0, -0.4);
  ctx.bezierCurveTo(-hw, -len * 0.35, -hw * 0.8, -len * 0.9, -hw * 0.28, -len);
  ctx.lineTo(0, -len * 0.86); // notch
  ctx.lineTo(hw * 0.28, -len);
  ctx.bezierCurveTo(hw * 0.8, -len * 0.9, hw, -len * 0.35, 0, -0.4);
  ctx.closePath();
  ctx.fill();
}

function paintFlower(
  ctx: CanvasRenderingContext2D,
  f: Flower,
  jitter: () => number
) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.r);
  ctx.scale(f.s, f.s);
  for (let p = 0; p < 5; p++) {
    ctx.save();
    ctx.rotate((p * Math.PI * 2) / 5 + (jitter() - 0.5) * 0.22);
    paintPetal(ctx, f.tone, jitter);
    ctx.restore();
  }
  // deep center + amber stamens
  ctx.fillStyle = "rgba(83, 74, 183, 0.6)";
  ctx.beginPath();
  ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
  ctx.fill();
  for (let p = 0; p < 6; p++) {
    const a = (p * Math.PI * 2) / 6 + jitter() * 0.5;
    const rr = 1.7 + jitter() * 0.9;
    ctx.fillStyle = "rgba(239, 159, 39, 0.85)";
    ctx.beginPath();
    ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function paintTree(ctx: CanvasRenderingContext2D, scale: number) {
  const jrng = mulberry32(97);
  const jitter = () => jrng();
  ctx.save();
  ctx.scale(scale, scale);

  // background blossoms — soft, dark, slightly blurred (depth layer)
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.filter = "blur(1.2px)";
  for (const f of TREE.flowers) {
    if (f.back) paintFlower(ctx, { ...f, s: f.s * 0.85 }, jitter);
  }
  ctx.filter = "none";
  ctx.restore();

  // bark — layered warm strokes: dark base, lighter ridge
  for (const s of TREE.segs) {
    ctx.lineCap = "round";
    ctx.strokeStyle = s.depth < 2 ? "rgba(46, 38, 30, 0.96)" : "rgba(58, 48, 38, 0.9)";
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.quadraticCurveTo(s.mx, s.my, s.ex, s.ey);
    ctx.stroke();
    if (s.w > 2.5) {
      ctx.strokeStyle = "rgba(112, 88, 60, 0.35)";
      ctx.lineWidth = s.w * 0.36;
      ctx.beginPath();
      ctx.moveTo(s.x - s.w * 0.14, s.y - s.w * 0.2);
      ctx.quadraticCurveTo(s.mx - s.w * 0.14, s.my - s.w * 0.2, s.ex, s.ey);
      ctx.stroke();
    }
  }

  // buds
  for (const b of TREE.buds) {
    const g = ctx.createRadialGradient(b.x - 0.5, b.y - 0.8, 0.2, b.x, b.y, 3 * b.s);
    g.addColorStop(0, "rgba(206, 203, 246, 0.9)");
    g.addColorStop(1, "rgba(83, 74, 183, 0.75)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 2.6 * b.s, 0, Math.PI * 2);
    ctx.fill();
  }

  // foreground blossoms — sharp, with a soft violet bloom behind them
  ctx.save();
  ctx.shadowColor = "rgba(127, 119, 221, 0.4)";
  ctx.shadowBlur = 9;
  for (const f of TREE.flowers) {
    if (!f.back) paintFlower(ctx, f, jitter);
  }
  ctx.restore();

  ctx.restore();
}

function BlossomCanvas({ flip }: { flip?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const paint = () => {
      const cssW = canvas.clientWidth;
      if (cssW === 0) return;
      const cssH = (cssW * VIEW_H) / VIEW_W;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      paintTree(ctx, cssW / VIEW_W);
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={ref}
      className={`bf-branch${flip ? " bf-branch-flip" : ""}`}
      style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
    />
  );
}

// Deterministic petal fall — hardcoded so server and client agree.
const PETALS: { l: number; w: number; h: number; t: number; d: number; x: number; o: number; pale?: boolean }[] = [
  { l: 8,  w: 7,  h: 9,  t: 18, d: 0,    x: 46,  o: 0.55 },
  { l: 16, w: 6,  h: 8,  t: 24, d: 5,    x: -60, o: 0.4 },
  { l: 24, w: 8,  h: 10, t: 16, d: 9,    x: 38,  o: 0.6, pale: true },
  { l: 33, w: 5,  h: 7,  t: 26, d: 2,    x: -44, o: 0.38 },
  { l: 41, w: 7,  h: 9,  t: 19, d: 12,   x: 52,  o: 0.5 },
  { l: 49, w: 6,  h: 8,  t: 22, d: 7,    x: -36, o: 0.45, pale: true },
  { l: 57, w: 9,  h: 11, t: 15, d: 14,   x: 42,  o: 0.6 },
  { l: 65, w: 5,  h: 7,  t: 25, d: 4,    x: -56, o: 0.4 },
  { l: 72, w: 7,  h: 9,  t: 18, d: 10,   x: 34,  o: 0.55, pale: true },
  { l: 79, w: 6,  h: 8,  t: 21, d: 16,   x: -48, o: 0.45 },
  { l: 86, w: 8,  h: 10, t: 17, d: 1,    x: 44,  o: 0.55 },
  { l: 93, w: 6,  h: 8,  t: 23, d: 8,    x: -38, o: 0.42, pale: true },
  { l: 12, w: 5,  h: 7,  t: 27, d: 19,   x: 30,  o: 0.35 },
  { l: 62, w: 6,  h: 8,  t: 20, d: 21,   x: -42, o: 0.45 },
  { l: 37, w: 7,  h: 9,  t: 22, d: 17,   x: 50,  o: 0.5, pale: true },
  { l: 88, w: 5,  h: 7,  t: 26, d: 13,   x: -32, o: 0.38 },
];

export default function BlossomField() {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;

  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 55, damping: 18, mass: 0.4 });
  const yTr = useTransform(smooth, (v) => (reduced ? 0 : v * 0.055));
  const yBl = useTransform(smooth, (v) => (reduced ? 0 : v * -0.075));

  if (pathname?.startsWith("/blog")) return null;

  return (
    <div aria-hidden className="bf-field">
      <motion.div
        className="bf-wrap bf-wrap-tr"
        style={{ y: yTr }}
        initial={reduced ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bf-sway-tr">
          <BlossomCanvas />
        </div>
      </motion.div>
      <motion.div
        className="bf-wrap bf-wrap-bl hidden md:block"
        style={{ y: yBl }}
        initial={reduced ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bf-sway-bl">
          <BlossomCanvas flip />
        </div>
      </motion.div>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={`bf-petal${p.pale ? " bf-petal-pale" : ""}`}
          style={
            {
              left: `${p.l}%`,
              width: `${p.w}px`,
              height: `${p.h}px`,
              "--t": `${p.t}s`,
              "--d": `${p.d}s`,
              "--x": `${p.x}px`,
              "--o": p.o,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
