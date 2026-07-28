"use client";

// Space field — the site's ambient layer, space edition:
//   · seeded starfield canvas (three depth tiers, per-star twinkle)
//   · galactic band: a milky-way lane of clustered stars + soft dust
//     running top-right → bottom-left, connecting the two nebulae
//   · three "hero" stars with 4-point diffraction spikes
//   · a distant galaxy smudge and a crescent-lit gas giant anchored in
//     the bottom-left nebula glow (desktop only)
//   · meteors with a gravity fall (accelerating streaks): an opening
//     shower on load, then occasional strays
//   · haikei-style layered-blob nebulae anchored to the two corners,
//     heavily blurred, violet/amber at single-digit opacity
//   · tiered scroll parallax: near stars drift more than far ones
// Canvas paints a static first frame, animates only while the tab is
// visible, and everything respects reduced motion. Hidden on /blog.

import { useEffect, useRef, useState } from "react";
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

// scroll-parallax factors per depth tier (fraction of scroll distance)
const TIER_PARALLAX = [0.018, 0.034, 0.055] as const;

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
function renderPlanet(R: number, dpr: number) {
  const pad = Math.round(R * 0.85);
  const S = (R + pad) * 2;
  const c = document.createElement("canvas");
  c.width = c.height = Math.round(S * dpr);
  const g = c.getContext("2d");
  if (!g) return { canvas: c, size: S };
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cx = S / 2;
  const cy = S / 2;
  const lx = 0.66; // light direction (lower-right)
  const ly = 0.52;

  // atmosphere glow
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

  // sphere base — radial gradient offset toward the light
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

  // latitude bands, clipped to the sphere
  g.globalCompositeOperation = "source-atop";
  g.save();
  g.translate(cx, cy);
  g.rotate(-0.3);
  const bands = [
    { y: -0.55, h: 0.1, color: "rgba(20,16,44,0.20)" },
    { y: -0.2, h: 0.15, color: "rgba(20,16,44,0.16)" },
    { y: 0.12, h: 0.09, color: "rgba(186,117,23,0.09)" }, // faint warm band
    { y: 0.42, h: 0.14, color: "rgba(20,16,44,0.20)" },
    { y: 0.7, h: 0.1, color: "rgba(20,16,44,0.24)" },
  ];
  for (const b of bands) {
    const yPx = b.y * R;
    const hPx = b.h * R;
    const bg = g.createLinearGradient(0, yPx - hPx, 0, yPx + hPx);
    bg.addColorStop(0, "rgba(0,0,0,0)");
    bg.addColorStop(0.5, b.color);
    bg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = bg;
    g.fillRect(-R * 1.2, yPx - hPx, R * 2.4, hPx * 2);
  }
  g.restore();

  // deepen the night side
  grad = g.createRadialGradient(
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

  // crescent limb highlight along the lit edge
  const la = Math.atan2(ly, lx);
  g.strokeStyle = "rgba(216,213,250,0.68)";
  g.lineWidth = 2.2;
  g.shadowColor = "rgba(206,203,246,0.9)";
  g.shadowBlur = 10;
  g.beginPath();
  g.arc(cx, cy, R - 0.8, la - 1.2, la + 1.2);
  g.stroke();
  g.shadowBlur = 0;
  g.globalCompositeOperation = "source-over";
  return { canvas: c, size: S };
}

// Opening meteor shower — one-shot, front-loaded delays.
const BURST_METEORS: { l: number; d: number; t: number; len: number; o: number }[] = [
  { l: 78, d: 0.6, t: 2.6, len: 150, o: 0.85 },
  { l: 30, d: 1.4, t: 3.2, len: 110, o: 0.6 },
  { l: 55, d: 2.1, t: 2.2, len: 170, o: 0.9 },
  { l: 90, d: 3.0, t: 3.6, len: 100, o: 0.5 },
  { l: 14, d: 3.8, t: 2.8, len: 130, o: 0.7 },
  { l: 66, d: 4.7, t: 3.4, len: 120, o: 0.6 },
  { l: 42, d: 5.9, t: 2.5, len: 160, o: 0.8 },
  { l: 84, d: 7.2, t: 3.8, len: 105, o: 0.5 },
];

type Stray = { id: number; l: number; t: number; len: number; o: number };

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
  const reduced = useReducedMotion() ?? false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const [strays, setStrays] = useState<Stray[]>([]);

  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 55, damping: 18, mass: 0.4 });
  // nebula parallax eases into a cap (tanh) so the corner glows drift
  // with the hero but never escape their corners on long pages
  const yTr = useTransform(smooth, (v) =>
    reduced ? 0 : 90 * Math.tanh((v * 0.05) / 90)
  );
  const yBl = useTransform(smooth, (v) =>
    reduced ? 0 : -110 * Math.tanh((v * 0.07) / 110)
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let dust: HTMLCanvasElement | null = null;
    let galaxy: HTMLCanvasElement | null = null;
    let planet: { canvas: HTMLCanvasElement; size: number } | null = null;

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
          ? renderPlanet(Math.round(Math.min(Math.max(w * 0.13, 130), 220)), dpr)
          : null;
    };

    const drawStar = (
      s: Star,
      base: number,
      t: number,
      scroll: number,
      wrap: boolean
    ) => {
      const [cr, cg, cb] = STAR_COLORS[s.hue];
      const twinkle = reduced
        ? 0
        : Math.sin(t * s.speed + s.phase) * (0.12 + s.tier * 0.1);
      const alpha = Math.max(0.06, base + twinkle);
      let py = s.y * h - scroll * TIER_PARALLAX[s.tier];
      if (wrap) py = ((py % h) + h) % h;
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x * w, py, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.tier === 2) {
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.18})`;
        ctx.beginPath();
        ctx.arc(s.x * w, py, s.r * 3.2, 0, Math.PI * 2);
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

    const draw = (t: number) => {
      if (w !== window.innerWidth || h !== window.innerHeight) layout();
      if (!w || !h) return;
      const scroll = reduced ? 0 : scrollRef.current;
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
      for (const s of STARS) drawStar(s, 0.25 + s.tier * 0.22, t, scroll, true);
      for (const s of BAND_STARS)
        drawStar(s, 0.12 + s.tier * 0.12, t, scroll, false);
      for (const sp of SPIKE_STARS) drawSpikeStar(sp, t, scroll);
      if (planet) {
        // anchored into the top-left corner, partially off-screen —
        // clean dark sky there, well away from both nebulae
        const bob = reduced ? 0 : Math.sin(t * 0.05 + 1) * 3;
        ctx.drawImage(
          planet.canvas,
          w * 0.03 - planet.size / 2,
          h * -0.04 - planet.size / 2 - scroll * 0.04 + bob,
          planet.size,
          planet.size
        );
      }
    };

    layout();
    draw(0);
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
  }, [reduced]);

  // occasional stray meteors after the opening shower
  useEffect(() => {
    if (reduced) return;
    let id = 0;
    let timer = 0;
    const spawn = () => {
      if (!document.hidden) {
        id += 1;
        setStrays((prev) => [
          ...prev.slice(-4),
          {
            id,
            l: 8 + Math.random() * 86,
            t: 2.2 + Math.random() * 1.8,
            len: 100 + Math.random() * 70,
            o: 0.5 + Math.random() * 0.4,
          },
        ]);
      }
      timer = window.setTimeout(spawn, 8000 + Math.random() * 8000);
    };
    timer = window.setTimeout(spawn, 11000);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  if (pathname?.startsWith("/blog")) return null;

  return (
    <div aria-hidden className="sf-field">
      {/* nebula corners (haikei-style layered blobs) */}
      <motion.div className="sf-wrap sf-wrap-tr" style={{ y: yTr }}>
        <Nebula className="sf-nebula" />
      </motion.div>
      <motion.div className="sf-wrap sf-wrap-bl hidden md:block" style={{ y: yBl }}>
        <Nebula className="sf-nebula sf-nebula-flip" />
      </motion.div>

      {/* starfield */}
      <canvas ref={canvasRef} className="sf-stars" />

      {/* opening meteor shower — falls once with gravity, then it's gone */}
      {!reduced &&
        BURST_METEORS.map((m, i) => (
          <span
            key={`b-${i}`}
            className="sf-meteor"
            style={
              {
                left: `${m.l}%`,
                "--mt": `${m.t}s`,
                "--md": `${m.d}s`,
                "--len": `${m.len}px`,
                "--o": m.o,
              } as React.CSSProperties
            }
          />
        ))}

      {/* stray meteors */}
      {strays.map((m) => (
        <span
          key={m.id}
          className="sf-meteor"
          style={
            {
              left: `${m.l}%`,
              "--mt": `${m.t}s`,
              "--md": "0s",
              "--len": `${m.len}px`,
              "--o": m.o,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
