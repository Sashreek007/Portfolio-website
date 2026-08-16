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
        // Soft edges so the band merges into the section instead of ending
        // on a hard line, and held well under full strength: this sits
        // behind body copy, and at full brightness the disc swallows it.
        maskImage:
          "radial-gradient(115% 78% at 50% 50%, #000 42%, rgba(0,0,0,0.55) 68%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(115% 78% at 50% 50%, #000 42%, rgba(0,0,0,0.55) 68%, transparent 100%)",
        opacity: 0.3,
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
