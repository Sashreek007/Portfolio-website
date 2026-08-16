"use client";

import { useReducedMotion } from "motion/react";

// Lensed accretion disc behind the contact section.
//
// The source renders on pure black, so `mix-blend-mode: screen` drops the
// background to nothing and the disc composites straight onto the starfield
// — no video box, no matte, no seam. That is the whole trick here; if the
// source ever comes back on dark grey instead of #000 a rectangle appears.
//
// Under prefers-reduced-motion the poster frame stands in, blended the same
// way, so the section keeps its composition without anything moving.

export default function BlackHole({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div
      aria-hidden
      className={className}
      style={{
        mixBlendMode: "screen",
        // The disc is anchored right, off the text column, so only its left
        // flank runs under any copy — fade that side out and the rest can
        // stay at full strength. Opacity is set by the caller's classes so
        // it can drop on small screens where the columns collapse.
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
        <video
          src="/blackhole/gargantua.mp4"
          poster="/blackhole/gargantua-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="block w-full h-full object-contain"
        />
      )}
    </div>
  );
}
