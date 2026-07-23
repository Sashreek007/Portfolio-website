"use client";

// Circuit field — the site's signature edge motif (the schematic answer
// to painterly corner branches): circuit traces that draw themselves in
// from two corners, glowing node tips, packet pulses, and slow-rising
// data motes. Fixed behind all content; branches drift on scroll via
// spring parallax (Motion). Hidden on /blog.

import { usePathname } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

// Hand-authored branch: orthogonal runs with 45° chamfers, like board
// routing. Tips get node pads, elbows get vias.
const BRANCH_PATHS = [
  "M 520 88 H 428 L 402 114 V 178 H 336 L 308 206 V 268",
  "M 428 88 V 44 L 412 28 H 368",
  "M 402 140 H 358 L 336 162 H 290",
  "M 336 178 V 132 L 316 112 H 276",
  "M 308 236 H 262 L 240 258 V 300",
  "M 520 150 H 470 L 448 172 V 210 H 420",
  "M 470 150 V 118 L 456 104 H 432",
];
// Indexes of paths that carry an animated packet pulse.
const FLOW_PATHS = [0, 5];

const BRANCH_TIPS: { x: number; y: number; accent?: boolean; delay: number }[] = [
  { x: 308, y: 272, delay: 0 },
  { x: 364, y: 28, delay: 1.4 },
  { x: 286, y: 162, accent: true, delay: 0.6 },
  { x: 272, y: 112, delay: 2.2 },
  { x: 240, y: 304, delay: 3.1 },
  { x: 416, y: 210, accent: true, delay: 1.8 },
  { x: 428, y: 104, delay: 2.7 },
];

const BRANCH_VIAS: [number, number][] = [
  [428, 88],
  [402, 140],
  [336, 178],
  [308, 236],
  [470, 150],
  [448, 172],
];

function CircuitBranch({
  className,
  drawDelay,
  reduced,
}: {
  className?: string;
  drawDelay: number;
  reduced: boolean;
}) {
  return (
    <svg viewBox="0 0 520 320" className={className} aria-hidden>
      {BRANCH_PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="color-mix(in srgb, var(--violet-mid) 32%, transparent)"
          strokeWidth="1.1"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: {
              duration: 1.5,
              delay: drawDelay + i * 0.22,
              ease: [0.16, 1, 0.3, 1],
            },
            opacity: { duration: 0.3, delay: drawDelay + i * 0.22 },
          }}
        />
      ))}
      {FLOW_PATHS.map((i) => (
        <path
          key={`flow-${i}`}
          className="cf-flow"
          d={BRANCH_PATHS[i]}
          fill="none"
          stroke="var(--violet-soft)"
          strokeWidth="1.1"
          opacity="0.5"
        />
      ))}
      <motion.g
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: drawDelay + 1.1 }}
      >
        {BRANCH_VIAS.map(([x, y], i) => (
          <circle
            key={`via-${i}`}
            cx={x}
            cy={y}
            r="2.2"
            fill="color-mix(in srgb, var(--violet-mid) 50%, transparent)"
          />
        ))}
        {BRANCH_TIPS.map((t, i) => {
          const color = t.accent ? "var(--amber-bright)" : "var(--violet-soft)";
          return (
            <g key={`tip-${i}`}>
              <circle cx={t.x} cy={t.y} r="8" fill={color} opacity="0.12" />
              <circle
                className="cf-node"
                cx={t.x}
                cy={t.y}
                r="3.4"
                fill={color}
                style={{ animationDelay: `${t.delay}s` }}
              />
            </g>
          );
        })}
      </motion.g>
    </svg>
  );
}

// Deterministic mote field — hardcoded so server and client agree.
// l: left %, s: size px, t: duration s, d: delay s, x: sway px, o: peak opacity
const MOTES: { l: number; s: number; t: number; d: number; x: number; o: number; accent?: boolean }[] = [
  { l: 6,  s: 2.5, t: 36, d: 0,  x: 26,  o: 0.5 },
  { l: 14, s: 2,   t: 44, d: 6,  x: -34, o: 0.4 },
  { l: 22, s: 3,   t: 30, d: 12, x: 18,  o: 0.5 },
  { l: 31, s: 2,   t: 40, d: 3,  x: -22, o: 0.45, accent: true },
  { l: 38, s: 2.5, t: 34, d: 18, x: 30,  o: 0.5 },
  { l: 47, s: 2,   t: 46, d: 9,  x: -16, o: 0.4 },
  { l: 54, s: 3.5, t: 28, d: 15, x: 22,  o: 0.55 },
  { l: 61, s: 2,   t: 42, d: 21, x: -28, o: 0.4 },
  { l: 68, s: 2.5, t: 32, d: 5,  x: 16,  o: 0.5, accent: true },
  { l: 75, s: 2,   t: 38, d: 11, x: -20, o: 0.45 },
  { l: 82, s: 3,   t: 30, d: 24, x: 26,  o: 0.5 },
  { l: 89, s: 2,   t: 44, d: 8,  x: -30, o: 0.4 },
  { l: 94, s: 2.5, t: 36, d: 17, x: 14,  o: 0.5 },
  { l: 27, s: 2,   t: 48, d: 27, x: 20,  o: 0.35 },
];

export default function CircuitField() {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;

  // Spring-smoothed scroll parallax; the two corners drift at different
  // rates and directions for depth.
  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 55, damping: 18, mass: 0.4 });
  const yTr = useTransform(smooth, (v) => (reduced ? 0 : v * 0.055));
  const yBl = useTransform(smooth, (v) => (reduced ? 0 : v * -0.075));

  if (pathname?.startsWith("/blog")) return null;

  return (
    <div aria-hidden className="cf-field">
      <motion.div className="cf-wrap cf-wrap-tr" style={{ y: yTr }}>
        <CircuitBranch className="cf-branch" drawDelay={0.3} reduced={reduced} />
      </motion.div>
      <motion.div className="cf-wrap cf-wrap-bl hidden md:block" style={{ y: yBl }}>
        <CircuitBranch
          className="cf-branch cf-branch-flip"
          drawDelay={0.9}
          reduced={reduced}
        />
      </motion.div>
      {MOTES.map((m, i) => (
        <span
          key={i}
          className={`cf-mote${m.accent ? " cf-mote-accent" : ""}`}
          style={
            {
              left: `${m.l}%`,
              width: `${m.s}px`,
              height: `${m.s}px`,
              "--t": `${m.t}s`,
              "--d": `${m.d}s`,
              "--x": `${m.x}px`,
              "--o": m.o,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
