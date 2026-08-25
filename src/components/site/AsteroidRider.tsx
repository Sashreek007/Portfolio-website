"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ASTEROID_SPRITE as S } from "./asteroidSprite";

// A figure riding a tumbling asteroid, rendered out of Blender as a sprite
// sheet (scripts/blender/asteroid.py, then make-sprite-sheet.py).
//
// Deliberately NOT the black hole's approach. That one composites a video with
// mix-blend-mode: screen, which costs a full blend pass over its area every
// frame and only works because its source sits on pure black. This sheet
// carries a real alpha channel, so it needs no blend mode at all — and no
// video decoder. Stepping a sprite is one background-position write per frame
// on the compositor's fast path.
//
// The loop is seamless by construction: the render rotates the asteroid a full
// turn while the cape's ripple control makes a turn of its own, so the last
// frame lands exactly on the first.
//
// Offscreen it stops stepping entirely, and under prefers-reduced-motion it
// never starts — a single static frame stands in.

// Pace the loop by DURATION, not per-frame delay. Trading frame count for
// resolution is a normal thing to want here, and hardcoding milliseconds per
// frame would silently change the rotation speed every time that trade is made.
const LOOP_MS = 3800; // one full tumble; an asteroid should loaf
const FRAME_MS = LOOP_MS / S.frames;
const TILT_PX = 16; // how far it leans toward the cursor

export default function AsteroidRider({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const hostRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  // pointer lean, driven by motion values so nothing re-renders on mouse move
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const proximity = useMotionValue(0);
  const spring = { stiffness: 60, damping: 22, mass: 0.8 };
  const x = useSpring(px, spring);
  const y = useSpring(py, spring);
  const near = useSpring(proximity, { stiffness: 70, damping: 24, mass: 0.6 });
  const scale = useTransform(near, [0, 1], [1, 1.035]);

  // ── frame stepping ────────────────────────────────────────────────
  useEffect(() => {
    const cell = cellRef.current;
    const host = hostRef.current;
    if (!cell || !host) return;

    const show = (i: number) => {
      const col = i % S.cols;
      const row = Math.floor(i / S.cols);
      // Percentage background-position with an N×100% background-size is the
      // sprite idiom: the divisor is (count - 1) because 100% means "align the
      // last cell", not "advance by one cell".
      const bx = S.cols > 1 ? (col / (S.cols - 1)) * 100 : 0;
      const by = S.rows > 1 ? (row / (S.rows - 1)) * 100 : 0;
      cell.style.backgroundPosition = `${bx}% ${by}%`;
    };

    show(0);
    if (reduced) return;

    let raf = 0;
    let last = 0;
    let frame = 0;
    let onScreen = false;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || document.hidden) return;
      if (now - last < FRAME_MS) return;
      last = now;
      frame = (frame + 1) % S.frames;
      show(frame);
    };

    // Only step while it is actually on screen. Left running it would burn a
    // style write every 105ms for the entire length of the page.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        // Repaint the moment it comes into view rather than waiting up to a
        // frame interval, so it never enters on a stale cell.
        if (onScreen) show(frame);
      },
      { threshold: 0 }
    );
    io.observe(host);
    raf = requestAnimationFrame(tick);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // ── pointer lean ──────────────────────────────────────────────────
  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host) return;

    let active = false;

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(r.width, r.height) * 0.9;
      const t = Math.max(0, Math.min(1, 1 - dist / reach));
      proximity.set(t);
      const n = dist || 1;
      px.set((dx / n) * TILT_PX * t);
      py.set((dy / n) * TILT_PX * t);
    };

    const reset = () => {
      proximity.set(0);
      px.set(0);
      py.set(0);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (!active) reset();
      },
      { threshold: 0 }
    );
    io.observe(host);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", reset, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", reset);
    };
  }, [reduced, proximity, px, py]);

  return (
    <div ref={hostRef} aria-hidden className={className}>
      <motion.div
        className="w-full h-full"
        style={reduced ? undefined : { x, y, scale, willChange: "transform" }}
      >
        <div
          ref={cellRef}
          className="w-full h-full"
          style={{
            backgroundImage: "url(/asteroid/asteroid-sprite.webp)",
            backgroundSize: `${S.cols * 100}% ${S.rows * 100}%`,
            // React owns frame 0. The stepping loop writes backgroundPosition
            // imperatively (to avoid re-rendering 24 times a second), and an
            // imperative write outlives a Fast Refresh — so after the sheet
            // grid changed from 6x6 to 6x4, a stale "40% " from the old
            // closure was still on the element. Offscreen the rAF loop is
            // paused, so nothing ever corrected it and two cells showed at
            // once. Declaring it here means any re-render resets it to a
            // valid cell.
            backgroundPosition: "0% 0%",
            backgroundRepeat: "no-repeat",
            aspectRatio: `${S.cellW} / ${S.cellH}`,
            imageRendering: "auto",
          }}
        />
      </motion.div>
    </div>
  );
}
