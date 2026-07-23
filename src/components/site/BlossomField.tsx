"use client";

// Blossom field — violet cherry-blossom branches anchored to two page
// corners with falling petals: the painterly corner motif translated
// into the site's palette (violet blooms, amber stamens, warm-gray
// boughs). Branches draw in on load (Motion pathLength), blooms pop in
// with springs, the whole bough sways gently, and petals drift down
// the page. Spring scroll parallax gives the corners depth.
// Hidden on /blog.

import { usePathname } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

// ── Branch anatomy (hand-authored, anchored to the top-right of a
//    520×400 viewBox; the bottom-left copy is the same art rotated). ──
const BOUGH =
  "M 520 48 C 440 60, 380 84, 330 120 C 300 142, 272 168, 252 190 L 259 197 C 282 172, 308 148, 338 128 C 386 96, 444 74, 520 66 Z";

const TWIGS = [
  "M 360 105 C 340 140, 330 170, 336 205",
  "M 300 145 C 282 128, 270 108, 268 84",
  "M 256 188 C 230 210, 210 240, 206 276",
  "M 420 80 C 408 106, 402 126, 406 148",
  "M 452 66 C 448 48, 440 34, 424 24",
];

// Blooms: position, scale, rotation, tone (0 = violet-soft, 1 = pale).
const BLOOMS: { x: number; y: number; s: number; r: number; tone: 0 | 1 }[] = [
  { x: 336, y: 205, s: 1.15, r: 15, tone: 0 },
  { x: 268, y: 84, s: 0.9, r: -30, tone: 1 },
  { x: 206, y: 276, s: 1.25, r: 40, tone: 0 },
  { x: 406, y: 148, s: 0.85, r: 70, tone: 1 },
  { x: 424, y: 24, s: 0.75, r: -12, tone: 0 },
  { x: 300, y: 148, s: 1.0, r: 100, tone: 0 },
  { x: 360, y: 108, s: 0.95, r: -55, tone: 1 },
  { x: 472, y: 58, s: 0.8, r: 22, tone: 0 },
  { x: 252, y: 192, s: 1.05, r: -80, tone: 1 },
];

const BUDS: [number, number][] = [
  [340, 180],
  [286, 110],
  [222, 250],
  [398, 132],
  [440, 40],
];

function Bloom({
  x,
  y,
  s,
  r,
  tone,
  delay,
  reduced,
}: (typeof BLOOMS)[number] & { delay: number; reduced: boolean }) {
  const petal =
    tone === 0
      ? "color-mix(in srgb, var(--violet-soft) 52%, transparent)"
      : "color-mix(in srgb, var(--violet-pale) 42%, transparent)";
  const edge =
    tone === 0
      ? "color-mix(in srgb, var(--violet-pale) 35%, transparent)"
      : "color-mix(in srgb, var(--violet-soft) 45%, transparent)";
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <motion.g
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: s, opacity: 1 }}
        transition={{
          delay,
          type: "spring",
          stiffness: 160,
          damping: 14,
          opacity: { delay, duration: 0.25 },
        }}
      >
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-6.6"
            rx="4.3"
            ry="6.6"
            transform={`rotate(${a})`}
            fill={petal}
            stroke={edge}
            strokeWidth="0.5"
          />
        ))}
        <circle r="2.4" fill="color-mix(in srgb, var(--amber-bright) 85%, transparent)" />
        {[30, 150, 270].map((a) => (
          <circle
            key={a}
            cx={Math.cos((a * Math.PI) / 180) * 3.6}
            cy={Math.sin((a * Math.PI) / 180) * 3.6}
            r="0.8"
            fill="color-mix(in srgb, var(--amber-bright) 60%, transparent)"
          />
        ))}
      </motion.g>
    </g>
  );
}

function BlossomBranch({
  className,
  baseDelay,
  reduced,
}: {
  className?: string;
  baseDelay: number;
  reduced: boolean;
}) {
  return (
    <svg viewBox="0 0 520 400" className={className} aria-hidden>
      {/* main bough — filled taper */}
      <motion.path
        d={BOUGH}
        fill="color-mix(in srgb, var(--gray-600) 55%, transparent)"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: baseDelay }}
      />
      {/* twigs — drawn strokes */}
      {TWIGS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="color-mix(in srgb, var(--gray-600) 60%, transparent)"
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: {
              duration: 0.9,
              delay: baseDelay + 0.35 + i * 0.16,
              ease: [0.16, 1, 0.3, 1],
            },
            opacity: { duration: 0.25, delay: baseDelay + 0.35 + i * 0.16 },
          }}
        />
      ))}
      {/* buds */}
      {BUDS.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="color-mix(in srgb, var(--violet-dim) 80%, transparent)"
          stroke="color-mix(in srgb, var(--violet-soft) 40%, transparent)"
          strokeWidth="0.6"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: baseDelay + 1.1 + i * 0.1 }}
        />
      ))}
      {/* blooms */}
      {BLOOMS.map((b, i) => (
        <Bloom
          key={i}
          {...b}
          delay={baseDelay + 0.9 + i * 0.14}
          reduced={reduced}
        />
      ))}
    </svg>
  );
}

// Deterministic petal fall — hardcoded so server and client agree.
// l: left %, w/h px, t duration s, d delay s, x sway px, o peak opacity
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
      <motion.div className="bf-wrap bf-wrap-tr" style={{ y: yTr }}>
        <BlossomBranch
          className="bf-branch bf-sway-tr"
          baseDelay={0.3}
          reduced={reduced}
        />
      </motion.div>
      <motion.div className="bf-wrap bf-wrap-bl hidden md:block" style={{ y: yBl }}>
        <BlossomBranch
          className="bf-branch bf-branch-flip bf-sway-bl"
          baseDelay={0.9}
          reduced={reduced}
        />
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
