"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

// Lensed accretion disc behind the contact section.
//
// The source renders on pure black, so `mix-blend-mode: screen` drops the
// background to nothing and the disc composites straight onto the starfield
// — no video box, no matte, no seam. That is the whole trick here; if the
// source ever comes back on dark grey instead of #000 a rectangle appears.
//
// It reacts to the pointer as a mass would: the disc leans toward the
// cursor, brightens, and spins up as you close on it. Driven entirely by
// motion values so nothing re-renders on mouse move, and read from a window
// listener rather than pointer events — the element stays
// pointer-events-none so it can never swallow a click meant for a channel
// link underneath it.
//
// Under prefers-reduced-motion the poster frame stands in, blended the same
// way, and none of the pointer tracking is wired up at all.

const PULL_PX = 26; // how far the disc leans toward the cursor at closest
const MAX_RATE = 1.55; // playback speed at closest approach

export default function BlackHole({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 0 = pointer far away, 1 = pointer at the disc's centre
  const proximity = useMotionValue(0);
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 55, damping: 20, mass: 0.7 };
  const x = useSpring(px, spring);
  const y = useSpring(py, spring);
  const near = useSpring(proximity, { stiffness: 70, damping: 22, mass: 0.5 });

  const scale = useTransform(near, [0, 1], [1, 1.05]);
  const filter = useTransform(near, (v) => `brightness(${1 + v * 0.45})`);

  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host) return;

    let active = false;

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      // reach a little beyond the disc so the response starts before the
      // cursor is actually on it — gravity has no edge
      const reach = Math.max(r.width, r.height) * 0.5;
      const t = Math.max(0, Math.min(1, 1 - dist / reach));

      proximity.set(t);
      const n = dist || 1;
      px.set((dx / n) * PULL_PX * t);
      py.set((dy / n) * PULL_PX * t);

      const v = videoRef.current;
      if (v) v.playbackRate = 1 + (MAX_RATE - 1) * t;
    };

    const reset = () => {
      proximity.set(0);
      px.set(0);
      py.set(0);
      const v = videoRef.current;
      if (v) v.playbackRate = 1;
    };

    // only listen while the section is actually on screen
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
    <div
      ref={hostRef}
      aria-hidden
      className={className}
      style={{
        mixBlendMode: "screen",
        // The disc is anchored right, off the text column, so only its left
        // flank runs under any copy — fade that side out and the rest can
        // stay at full strength. Strength itself is set by .bh-veil in
        // globals.css, which out-specifies utility classes.
        maskImage:
          "linear-gradient(to right, transparent 0%, transparent 32%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 66%, #000 78%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, transparent 32%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 66%, #000 78%)",
      }}
    >
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/blackhole/gargantua-poster.jpg"
          alt=""
          className="block w-full h-full object-contain"
        />
      ) : (
        <motion.div
          className="relative w-full h-full"
          style={{ x, y, scale, filter, willChange: "transform, filter" }}
        >
          <video
            ref={videoRef}
            src="/blackhole/gargantua.mp4"
            poster="/blackhole/gargantua-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="block w-full h-full object-contain"
          />
          {/* The source loop is very nearly a still — frames 5s apart differ
              by 0.2% — so the orbit is added here: a wedge of extra light
              sweeping the photon ring, masked to the ring's annulus so it
              never lights the empty corners. Rotating a gradient costs one
              composited transform and leaves the disc itself in place. */}
          <span className="bh-orbit" aria-hidden />
        </motion.div>
      )}
    </div>
  );
}
