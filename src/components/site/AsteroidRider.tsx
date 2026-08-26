"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { ASTEROID_SPRITE as S } from "./asteroidSprite";

// A figure working at a desk on an asteroid — typing, pausing once a loop to
// drink his coffee — rendered out of Blender as a sprite sheet
// (scripts/blender/desk.py, then make-sprite-sheet.py _deskframes). The
// earlier caped-rider asset lives on in asteroid.py as the revert path.
//
// Deliberately NOT the black hole's approach. That one composites a video with
// mix-blend-mode: screen, which costs a full blend pass over its area every
// frame and only works because its source sits on pure black. This sheet
// carries a real alpha channel, so it needs no blend mode at all — and no
// video decoder. Stepping a sprite is one background-position write per frame
// on the compositor's fast path.
//
// The loop is seamless by construction: every animation term in desk.py is an
// integer number of cycles per loop, so the last frame lands exactly on the
// first.
//
// Offscreen it stops stepping entirely, and under prefers-reduced-motion it
// never starts — a single static frame stands in.

// Pace the loop by DURATION, not per-frame delay. Trading frame count for
// resolution is a normal thing to want here, and hardcoding milliseconds per
// frame would silently change the loop speed every time that trade is made.
// One full work cycle: typing, a mouse gesture, and one sip of coffee —
// 48 cells at 200ms. Note the floor this sits on: much under ~3.3 steps a
// second starts to read as stuttering rather than calm. Slower than this
// needs more frames, not a longer interval.
const LOOP_MS = 9600;
const FRAME_MS = LOOP_MS / S.frames;
// The asteroid itself does not move. It used to drift on a 30s CSS loop and
// lean toward the cursor; both are gone. The scene now reads as a fixed
// vantage on a man at his desk, and the only motion in the frame is his —
// which is the thing worth watching.

export default function AsteroidRider({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const hostRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);


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

  return (
    <div ref={hostRef} aria-hidden className={className}>
      <div
        ref={cellRef}
        className="w-full h-full"
        style={{
          backgroundImage: "url(/asteroid/asteroid-sprite.webp)",
          backgroundSize: `${S.cols * 100}% ${S.rows * 100}%`,
          // React owns frame 0. The stepping loop writes backgroundPosition
          // imperatively (to avoid re-rendering 5 times a second), and an
          // imperative write outlives a Fast Refresh — so after the sheet
          // grid changed, a stale value from the old closure was still on
          // the element. Offscreen the rAF loop is paused, so nothing ever
          // corrected it and two cells showed at once. Declaring it here
          // means any re-render resets it to a valid cell.
          backgroundPosition: "0% 0%",
          backgroundRepeat: "no-repeat",
          aspectRatio: `${S.cellW} / ${S.cellH}`,
          imageRendering: "auto",
        }}
      />
    </div>
  );
}
