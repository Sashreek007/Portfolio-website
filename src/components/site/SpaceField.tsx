"use client";

// Space field — the site's ambient layer, space edition:
//   · seeded starfield canvas (three depth tiers, per-star twinkle)
//   · galactic band: a milky-way lane of clustered stars + soft dust
//     running top-right → bottom-left, connecting the two nebulae
//   · three "hero" stars with 4-point diffraction spikes
//   · a distant galaxy smudge and a crescent-lit gas giant anchored in
//     the bottom-left nebula glow (desktop only)
//   · canvas meteors: bright head, tapered self-drawing trail, mid-sky
//     burnout with occasional terminal flare; an opening shower on
//     load, then occasional strays — all parallel to one radiant
//   · haikei-style layered-blob nebulae anchored to the two corners,
//     heavily blurred, violet/amber at single-digit opacity
//   · spatial scroll: wide tier-separated parallax (far crawls, near
//     sweeps) + velocity motion-blur — fast scrolling smears near
//     stars into streaks, reading as a fly-through rather than a
//     sliding flat image
// Canvas paints a static first frame, animates only while the tab is
// visible, and everything respects reduced motion. Hidden on /blog.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

// ── seeded RNG ───────────────────────────────────────────────────────
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

function gauss(rng: () => number) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

type Star = {
  x: number; // 0..1 of viewport
  y: number;
  r: number;
  tier: 0 | 1 | 2; // 0 = far/dim, 2 = near/bright
  phase: number;
  speed: number;
  hue: 0 | 1 | 2; // 0 warm-white, 1 violet, 2 amber
};

const STARS: Star[] = (() => {
  const rng = mulberry32(11071996);
  return Array.from({ length: 150 }, () => {
    const tier = (rng() < 0.5 ? 0 : rng() < 0.75 ? 1 : 2) as 0 | 1 | 2;
    return {
      x: rng(),
      y: rng(),
      r: 0.5 + tier * 0.45 + rng() * 0.5,
      tier,
      phase: rng() * Math.PI * 2,
      speed: 0.25 + rng() * 0.6,
      hue: (rng() < 0.78 ? 0 : rng() < 0.6 ? 1 : 2) as 0 | 1 | 2,
    };
  });
})();

// The galactic lane runs between the two nebula corners. Endpoints sit
// just past the viewport so the band bleeds off-screen naturally.
const BAND = { ax: 1.08, ay: -0.08, bx: -0.08, by: 1.08 };

// Milky-way stars: gaussian-clustered around the lane, smaller and
// dimmer than the field stars so the band reads as depth, not clutter.
const BAND_STARS: Star[] = (() => {
  const rng = mulberry32(20260727);
  const dx = BAND.bx - BAND.ax;
  const dy = BAND.by - BAND.ay;
  const dl = Math.hypot(dx, dy);
  const nx = -dy / dl;
  const ny = dx / dl;
  const out: Star[] = [];
  while (out.length < 130) {
    const t = rng();
    const off = gauss(rng) * 0.07 * (0.55 + rng() * 0.9);
    const x = BAND.ax + dx * t + nx * off;
    const y = BAND.ay + dy * t + ny * off;
    if (x < -0.02 || x > 1.02 || y < -0.02 || y > 1.02) continue;
    out.push({
      x,
      y,
      r: 0.35 + rng() * 0.7,
      tier: (rng() < 0.72 ? 0 : 1) as 0 | 1,
      phase: rng() * Math.PI * 2,
      speed: 0.2 + rng() * 0.5,
      hue: (rng() < 0.68 ? 0 : 1) as 0 | 1,
    });
  }
  return out;
})();

// Hand-placed bright stars with telescope-style diffraction spikes,
// kept out of the hero's two focal columns.
const SPIKE_STARS = [
  { x: 0.08, y: 0.15, r: 1.5, phase: 0.7, speed: 0.32 },
  { x: 0.57, y: 0.1, r: 1.2, phase: 2.4, speed: 0.26 },
  { x: 0.93, y: 0.9, r: 1.4, phase: 4.4, speed: 0.38 },
];

const STAR_COLORS = [
  [232, 230, 223], // warm white (text-primary)
  [206, 203, 246], // violet-pale
  [239, 159, 39], // amber-bright
] as const;

// scroll-parallax factors per depth tier (fraction of scroll distance).
// Spread wide on purpose: depth reads through velocity CONTRAST — far
// stars crawl, near stars sweep. The galactic band + dust use the
// slowest factor (they are the farthest thing in the scene).
const TIER_PARALLAX = [0.04, 0.11, 0.24] as const;
const BAND_PARALLAX = 0.012;

// ── prerendered layers (built once per resize, cheap to blit) ────────

function renderDust(w: number, h: number, dpr: number) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext("2d");
  if (!g) return c;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const ax = BAND.ax * w;
  const ay = BAND.ay * h;
  const bx = BAND.bx * w;
  const by = BAND.by * h;
  const M = Math.max(w, h);
  // wide faint lane
  for (let i = 0; i <= 7; i++) {
    const t = 0.08 + (i / 7) * 0.84;
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    const R = M * (0.13 + 0.05 * Math.sin(i * 2.1));
    const grad = g.createRadialGradient(x, y, 0, x, y, R);
    grad.addColorStop(0, "rgba(60,52,137,0.055)"); // violet-dim
    grad.addColorStop(0.6, "rgba(60,52,137,0.025)");
    grad.addColorStop(1, "rgba(60,52,137,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, R, 0, Math.PI * 2);
    g.fill();
  }
  // narrow brighter core lane
  for (let i = 0; i <= 7; i++) {
    const t = 0.12 + (i / 7) * 0.76;
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    const R = M * 0.055;
    const grad = g.createRadialGradient(x, y, 0, x, y, R);
    grad.addColorStop(0, "rgba(206,203,246,0.05)"); // violet-pale
    grad.addColorStop(1, "rgba(206,203,246,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, R, 0, Math.PI * 2);
    g.fill();
  }
  // one warm patch mid-lane for temperature variance
  {
    const t = 0.46;
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    const R = M * 0.09;
    const grad = g.createRadialGradient(x, y, 0, x, y, R);
    grad.addColorStop(0, "rgba(186,117,23,0.028)"); // amber-mid
    grad.addColorStop(1, "rgba(186,117,23,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, R, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

// A distant galaxy: elongated smudge with a bright nucleus.
const GALAXY_SIZE = 170;
function renderGalaxy(dpr: number) {
  const S = GALAXY_SIZE;
  const c = document.createElement("canvas");
  c.width = c.height = Math.round(S * dpr);
  const g = c.getContext("2d");
  if (!g) return c;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.translate(S / 2, S / 2);
  g.rotate(-0.5);
  g.scale(1, 0.36);
  let grad = g.createRadialGradient(0, 0, 0, 0, 0, 74);
  grad.addColorStop(0, "rgba(206,203,246,0.14)");
  grad.addColorStop(1, "rgba(206,203,246,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, 74, 0, Math.PI * 2);
  g.fill();
  grad = g.createRadialGradient(0, 0, 0, 0, 0, 26);
  grad.addColorStop(0, "rgba(232,230,223,0.4)");
  grad.addColorStop(0.55, "rgba(232,230,223,0.09)");
  grad.addColorStop(1, "rgba(232,230,223,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, 26, 0, Math.PI * 2);
  g.fill();
  grad = g.createRadialGradient(0, 0, 0, 0, 0, 7);
  grad.addColorStop(0, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, 7, 0, Math.PI * 2);
  g.fill();
  return c;
}

// Crescent-lit gas giant. Light arrives from the lower-right (where the
// content lives), so the visible limb hanging out of the top-left
// corner is the lit one and the night side stays off-screen.
// Split into three layers so the cloud bands can drift (the planet
// "rotates") while the lighting stays physically fixed:
//   base    — atmosphere glow + lit sphere gradient (static)
//   bands   — tileable horizontal cloud-band strip, drifted per frame
//   overlay — night-side shading + crescent limb (static, on top)
function renderPlanetLayers(R: number, dpr: number) {
  const pad = Math.round(R * 0.85);
  const S = (R + pad) * 2;
  const lx = 0.66; // light direction (lower-right)
  const ly = 0.52;

  const make = (wCss: number, hCss: number) => {
    const c = document.createElement("canvas");
    c.width = Math.round(wCss * dpr);
    c.height = Math.round(hCss * dpr);
    const g = c.getContext("2d");
    if (g) g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c, g };
  };

  // ── base: atmosphere glow + lit sphere ─────────────────────────────
  const base = make(S, S);
  if (base.g) {
    const g = base.g;
    const cx = S / 2;
    const cy = S / 2;
    let grad = g.createRadialGradient(
      cx + R * 0.2 * lx,
      cy + R * 0.2 * ly,
      R * 0.8,
      cx,
      cy,
      R * 1.7
    );
    grad.addColorStop(0, "rgba(127,119,221,0.14)"); // violet-soft
    grad.addColorStop(0.5, "rgba(83,74,183,0.05)");
    grad.addColorStop(1, "rgba(83,74,183,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx, cy, R * 1.7, 0, Math.PI * 2);
    g.fill();

    grad = g.createRadialGradient(
      cx + R * 0.55 * lx,
      cy + R * 0.55 * ly,
      R * 0.06,
      cx,
      cy,
      R * 1.35
    );
    grad.addColorStop(0, "#b3aae8");
    grad.addColorStop(0.16, "#7d73cb");
    grad.addColorStop(0.4, "#4a4280");
    grad.addColorStop(0.66, "#211d3e");
    grad.addColorStop(1, "#090812");
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.fillStyle = grad;
    g.fill();
  }

  // ── bands: tileable strip, drifted along the band axis per frame ───
  const tw = Math.round(R * 4); // tile width (one full drift cycle)
  const th = Math.round(R * 3);
  const bandsLayer = make(tw, th);
  if (bandsLayer.g) {
    const g = bandsLayer.g;
    const midY = th / 2;
    const bands = [
      { y: -0.55, h: 0.1, color: "rgba(20,16,44,0.20)" },
      { y: -0.2, h: 0.15, color: "rgba(20,16,44,0.16)" },
      { y: 0.12, h: 0.09, color: "rgba(186,117,23,0.09)" }, // faint warm band
      { y: 0.42, h: 0.14, color: "rgba(20,16,44,0.20)" },
      { y: 0.7, h: 0.1, color: "rgba(20,16,44,0.24)" },
    ];
    for (const b of bands) {
      const yPx = midY + b.y * R;
      const hPx = b.h * R;
      const bg = g.createLinearGradient(0, yPx - hPx, 0, yPx + hPx);
      bg.addColorStop(0, "rgba(0,0,0,0)");
      bg.addColorStop(0.5, b.color);
      bg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = bg;
      g.fillRect(0, yPx - hPx, tw, hPx * 2);
    }
    // storm spots — features that make the drift readable. Drawn twice
    // (x and x ± tw) so the tile wraps seamlessly.
    const spots = [
      { x: 0.3, y: 0.18, rx: 0.34, ry: 0.12, color: "206,203,246", a: 0.09 },
      { x: 0.72, y: -0.35, rx: 0.26, ry: 0.1, color: "10,8,24", a: 0.2 },
    ];
    for (const sp of spots) {
      for (const xo of [sp.x * tw, sp.x * tw - tw, sp.x * tw + tw]) {
        const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1);
        grad.addColorStop(0, `rgba(${sp.color},${sp.a})`);
        grad.addColorStop(1, `rgba(${sp.color},0)`);
        g.save();
        g.translate(xo, midY + sp.y * R);
        g.scale(sp.rx * R, sp.ry * R);
        g.fillStyle = grad;
        g.beginPath();
        g.arc(0, 0, 1, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
    }
  }

  // ── overlay: night-side shading + crescent limb ────────────────────
  const overlay = make(S, S);
  if (overlay.g) {
    const g = overlay.g;
    const cx = S / 2;
    const cy = S / 2;
    let grad = g.createRadialGradient(
      cx - R * 0.6 * lx,
      cy - R * 0.6 * ly,
      R * 0.1,
      cx - R * 0.3 * lx,
      cy - R * 0.3 * ly,
      R * 1.4
    );
    grad.addColorStop(0, "rgba(4,4,10,0.62)");
    grad.addColorStop(0.6, "rgba(4,4,10,0.24)");
    grad.addColorStop(1, "rgba(4,4,10,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.fill();

    const la = Math.atan2(ly, lx);
    g.strokeStyle = "rgba(216,213,250,0.68)";
    g.lineWidth = 2.2;
    g.shadowColor = "rgba(206,203,246,0.9)";
    g.shadowBlur = 10;
    g.beginPath();
    g.arc(cx, cy, R - 0.8, la - 1.2, la + 1.2);
    g.stroke();
    g.shadowBlur = 0;
  }

  return { base: base.c, bands: bandsLayer.c, overlay: overlay.c, size: S, R, tw, th };
}

// Meteors — canvas-drawn: a bright head with a tapered trail that
// draws itself out behind, burns out mid-sky, sometimes with a small
// terminal flare. All meteors share one radiant direction (parallel),
// like a real shower. Opening burst, then occasional strays.
const METEOR_DIR = { x: -0.29, y: 0.956 };

// spawn x (fraction of width) + front-loaded delays for the opener
const BURST: { l: number; d: number }[] = [
  { l: 0.78, d: 0.6 },
  { l: 0.3, d: 1.4 },
  { l: 0.55, d: 2.1 },
  { l: 0.9, d: 3.0 },
  { l: 0.14, d: 3.8 },
  { l: 0.66, d: 4.7 },
  { l: 0.42, d: 5.9 },
  { l: 0.84, d: 7.2 },
];

type Meteor = {
  x0: number; // spawn point, fraction of viewport
  y0: number;
  path: number; // travel distance, fraction of viewport height
  dur: number; // lifetime in seconds
  start: number;
  trail: number; // max trail length, px
  bright: number;
  flare: boolean;
};

// Meteors live in the upper sky band: top-edge spawns, burnout by
// ~0.4 viewport heights, modest brightness. They must never carry a
// blazing head across the hero text on shorter (tablet) viewports.
function makeMeteor(start: number, l: number): Meteor {
  return {
    x0: l,
    y0: -0.04 + Math.random() * 0.08,
    path: 0.2 + Math.random() * 0.18,
    dur: 1.3 + Math.random() * 0.7,
    start,
    trail: 110 + Math.random() * 100,
    bright: 0.4 + Math.random() * 0.25,
    flare: Math.random() < 0.4,
  };
}

// Haikei-style layered blobs — three organic paths per nebula.
function Nebula({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 500" className={className} aria-hidden>
      <path
        d="M614,-18 C476,-6 388,64 356,158 C326,246 366,338 458,372 C540,402 614,368 626,352 Z"
        fill="color-mix(in srgb, var(--violet-dim) 30%, transparent)"
      />
      <path
        d="M612,20 C516,28 446,84 424,158 C402,230 438,300 512,322 C570,338 616,310 620,300 Z"
        fill="color-mix(in srgb, var(--violet-mid) 22%, transparent)"
      />
      <path
        d="M610,70 C548,78 502,116 490,168 C478,220 506,268 558,282 C592,290 614,274 616,268 Z"
        fill="color-mix(in srgb, var(--amber-mid) 14%, transparent)"
      />
    </svg>
  );
}

export default function SpaceField() {
  const pathname = usePathname();
  // On /blog the field renders null, which unmounts the canvas. The
  // draw effect must key on this so it rebinds to the fresh canvas
  // element when the user navigates back.
  const hidden = pathname?.startsWith("/blog") ?? false;
  const reduced = useReducedMotion() ?? false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);

  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 55, damping: 18, mass: 0.4 });
  // nebula parallax eases into a tight cap (tanh) so the corner glows
  // barely breathe — they must never read as detached from the corners
  const yTr = useTransform(smooth, (v) =>
    reduced ? 0 : 36 * Math.tanh((v * 0.05) / 36)
  );
  const yBl = useTransform(smooth, (v) =>
    reduced ? 0 : -44 * Math.tanh((v * 0.07) / 44)
  );

  // feed the smoothed scroll into the canvas parallax
  useEffect(() => {
    if (reduced) return;
    const unsub = smooth.on("change", (v) => {
      scrollRef.current = v;
    });
    return () => unsub();
  }, [smooth, reduced]);

  // starfield canvas
  useEffect(() => {
    if (hidden) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let dust: HTMLCanvasElement | null = null;
    let galaxy: HTMLCanvasElement | null = null;
    let planet: ReturnType<typeof renderPlanetLayers> | null = null;
    const meteors: Meteor[] = [];
    let burstAt = -1; // first-draw timestamp: anchors the opening shower
    let nextStray = 0;
    let lastScroll = 0;
    let lastT = -1; // for scroll velocity (drives star motion blur)

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!w || !h) {
        // pre-layout state (hidden tab / zero viewport): retry via draw()
        dust = galaxy = null;
        planet = null;
        return;
      }
      dust = renderDust(w, h, dpr);
      galaxy = renderGalaxy(dpr);
      planet =
        w >= 768
          ? renderPlanetLayers(
              Math.round(Math.min(Math.max(w * 0.13, 130), 220)),
              dpr
            )
          : null;
    };

    const drawStar = (
      s: Star,
      base: number,
      t: number,
      scroll: number,
      vel: number,
      factor: number,
      wrap: boolean
    ) => {
      const [cr, cg, cb] = STAR_COLORS[s.hue];
      const twinkle = reduced
        ? 0
        : Math.sin(t * s.speed + s.phase) * (0.12 + s.tier * 0.1);
      let alpha = Math.max(0.06, base + twinkle);
      const px = s.x * w;
      let py = s.y * h - scroll * factor;
      if (wrap) py = ((py % h) + h) % h;
      // motion blur: on fast scroll a star's on-screen velocity smears
      // it into a short streak — near tiers smear most. This is what
      // turns flat parallax into a spatial fly-through.
      const stretch = Math.max(-26, Math.min(26, vel * factor * 0.045));
      if (Math.abs(stretch) > 1.6) {
        alpha *= 8 / (8 + Math.abs(stretch) * 0.6);
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.lineWidth = s.r * 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py - stretch / 2);
        ctx.lineTo(px, py + stretch / 2);
        ctx.stroke();
        return;
      }
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.tier === 2) {
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.18})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawSpikeStar = (
      sp: (typeof SPIKE_STARS)[number],
      t: number,
      scroll: number
    ) => {
      const tw = reduced ? 0 : Math.sin(t * sp.speed + sp.phase) * 0.18;
      const alpha = 0.6 + tw;
      const sx = sp.x * w;
      const sy = sp.y * h - scroll * 0.06;
      const len = sp.r * (16 + tw * 10);
      let grad = ctx.createLinearGradient(sx, sy - len, sx, sy + len);
      grad.addColorStop(0, "rgba(232,230,223,0)");
      grad.addColorStop(0.5, `rgba(232,230,223,${alpha * 0.9})`);
      grad.addColorStop(1, "rgba(232,230,223,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(sx - 0.5, sy - len, 1, len * 2);
      grad = ctx.createLinearGradient(sx - len, sy, sx + len, sy);
      grad.addColorStop(0, "rgba(232,230,223,0)");
      grad.addColorStop(0.5, `rgba(232,230,223,${alpha * 0.9})`);
      grad.addColorStop(1, "rgba(232,230,223,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(sx - len, sy - 0.5, len * 2, 1);
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sp.r * 6);
      glow.addColorStop(0, `rgba(206,203,246,${alpha * 0.45})`);
      glow.addColorStop(1, "rgba(206,203,246,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, sp.r * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sp.r * 0.9, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawMeteor = (m: Meteor, t: number) => {
      const u = (t - m.start) / m.dur;
      if (u <= 0 || u >= 1) return;
      const s = Math.pow(u, 1.15) * m.path * h; // slight gravity feel
      const hx = m.x0 * w + METEOR_DIR.x * s;
      const hy = m.y0 * h + METEOR_DIR.y * s;
      let a = m.bright;
      if (u < 0.08) a *= u / 0.08; // ignite
      if (u > 0.7) a *= Math.max(0, (1 - u) / 0.3); // burn out
      if (m.flare) {
        const f = Math.exp(-Math.pow((u - 0.68) / 0.06, 2));
        a = Math.min(1, a + f * 0.5); // brief terminal flare
      }
      if (a <= 0.01) return;
      // tapered trail: three overlapping strokes, long/thin → short/bright
      const trail = Math.min(m.trail, s * 0.8);
      const layers: [number, number, number][] = [
        [1.0, 1.1, 0.22],
        [0.55, 2.0, 0.45],
        [0.22, 3.0, 0.85],
      ];
      ctx.lineCap = "round";
      for (const [frac, width, la] of layers) {
        const tx = hx - METEOR_DIR.x * trail * frac;
        const ty = hy - METEOR_DIR.y * trail * frac;
        const grad = ctx.createLinearGradient(hx, hy, tx, ty);
        grad.addColorStop(0, `rgba(244,242,255,${a * la})`);
        grad.addColorStop(0.6, `rgba(206,203,246,${a * la * 0.45})`);
        grad.addColorStop(1, "rgba(206,203,246,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
      const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 8);
      glow.addColorStop(0, `rgba(255,255,255,${a * 0.75})`);
      glow.addColorStop(0.35, `rgba(206,203,246,${a * 0.35})`);
      glow.addColorStop(1, "rgba(206,203,246,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(hx, hy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, a * 1.1)})`;
      ctx.beginPath();
      ctx.arc(hx, hy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (t: number) => {
      if (w !== window.innerWidth || h !== window.innerHeight) layout();
      if (!w || !h) return;
      const scroll = reduced ? 0 : scrollRef.current;
      const vel =
        lastT < 0 || reduced
          ? 0
          : (scroll - lastScroll) / Math.max(t - lastT, 1e-3);
      lastScroll = scroll;
      lastT = t;
      ctx.clearRect(0, 0, w, h);
      if (dust) ctx.drawImage(dust, 0, -scroll * 0.012, w, h);
      if (galaxy) {
        ctx.drawImage(
          galaxy,
          w * 0.4 - GALAXY_SIZE / 2,
          h * 0.11 - GALAXY_SIZE / 2 - scroll * 0.01,
          GALAXY_SIZE,
          GALAXY_SIZE
        );
      }
      for (const s of STARS)
        drawStar(s, 0.25 + s.tier * 0.22, t, scroll, vel, TIER_PARALLAX[s.tier], true);
      for (const s of BAND_STARS)
        drawStar(s, 0.12 + s.tier * 0.12, t, scroll, vel, BAND_PARALLAX, false);
      for (const sp of SPIKE_STARS) drawSpikeStar(sp, t, scroll);
      if (planet) {
        // anchored into the top-left corner, partially off-screen —
        // clean dark sky there, well away from both nebulae.
        //
        // Offset by its OWN radius, not by viewport height: the radius
        // tracks width, so tying the centre to h let the limb creep down
        // over the hero greeting on shorter/narrower windows. At -0.65R the
        // limb always bottoms out ~0.35R from the top, which clears the
        // greeting on short laptop viewports (1512x700 was the tight case)
        // and keeps the same crescent at every size. The soft atmosphere
        // still spills further down, which is the intent.
        const bob = reduced ? 0 : Math.sin(t * 0.05 + 1) * 3;
        const pcx = w * 0.03;
        const pcy = -planet.R * 0.65 - scroll * 0.04 + bob;
        const S = planet.size;
        ctx.drawImage(planet.base, pcx - S / 2, pcy - S / 2, S, S);
        // cloud bands drift along the band axis — the "rotation".
        // Lighting stays fixed; only the surface moves.
        ctx.save();
        ctx.beginPath();
        ctx.arc(pcx, pcy, planet.R - 0.5, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(pcx, pcy);
        ctx.rotate(-0.3);
        const off = reduced ? 0 : (t * 2.4) % planet.tw;
        for (let k = -1; k <= 1; k++) {
          ctx.drawImage(
            planet.bands,
            k * planet.tw - off - planet.tw / 2,
            -planet.th / 2,
            planet.tw,
            planet.th
          );
        }
        ctx.restore();
        ctx.drawImage(planet.overlay, pcx - S / 2, pcy - S / 2, S, S);
      }

      // meteors (topmost — they're the nearest thing in the scene)
      if (!reduced) {
        if (burstAt < 0) {
          burstAt = t;
          for (const b of BURST) meteors.push(makeMeteor(burstAt + b.d, b.l));
          nextStray = burstAt + 11;
        }
        if (t >= nextStray) {
          meteors.push(makeMeteor(t + 0.01, 0.08 + Math.random() * 0.86));
          nextStray = t + 8 + Math.random() * 8;
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
          if (t > meteors[i].start + meteors[i].dur) {
            meteors.splice(i, 1);
            continue;
          }
          drawMeteor(meteors[i], t);
        }
      }
    };

    layout();
    draw(performance.now() / 1000);
    window.addEventListener("resize", layout);

    let raf = 0;
    if (!reduced) {
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (document.hidden) return;
        draw(now / 1000);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
    };
  }, [reduced, hidden]);

  if (hidden) return null;

  return (
    <div aria-hidden className="sf-field">
      {/* nebula corners (haikei-style layered blobs) */}
      <motion.div className="sf-wrap sf-wrap-tr" style={{ y: yTr }}>
        <Nebula className="sf-nebula" />
      </motion.div>
      <motion.div className="sf-wrap sf-wrap-bl hidden md:block" style={{ y: yBl }}>
        <Nebula className="sf-nebula sf-nebula-flip" />
      </motion.div>

      {/* starfield + meteors (canvas-drawn) */}
      <canvas ref={canvasRef} className="sf-stars" />
    </div>
  );
}
