"use client";

// Space field — the site's ambient layer, space edition:
//   · seeded starfield canvas (three depth tiers, per-star twinkle)
//   · meteors with a gravity fall (accelerating streaks): an opening
//     shower on load, then occasional strays
//   · haikei-style layered-blob nebulae anchored to the two corners,
//     heavily blurred, violet/amber at single-digit opacity
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

const STAR_COLORS = [
  [232, 230, 223], // warm white (text-primary)
  [206, 203, 246], // violet-pale
  [239, 159, 39], // amber-bright
] as const;

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
  const [strays, setStrays] = useState<Stray[]>([]);

  // starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of STARS) {
        const [cr, cg, cb] = STAR_COLORS[s.hue];
        const base = 0.25 + s.tier * 0.22;
        const twinkle = reduced
          ? 0
          : Math.sin(t * s.speed + s.phase) * (0.12 + s.tier * 0.1);
        const alpha = Math.max(0.06, base + twinkle);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.tier === 2) {
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.18})`;
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
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

  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 55, damping: 18, mass: 0.4 });
  const yTr = useTransform(smooth, (v) => (reduced ? 0 : v * 0.05));
  const yBl = useTransform(smooth, (v) => (reduced ? 0 : v * -0.07));

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
