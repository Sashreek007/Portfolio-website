"use client";

import { useEffect, useRef, useState } from "react";
import { isVideoUrl, type Project } from "@/components/site/ProjectCard";

// Card media for a project. A video plays as-is; otherwise the hero image and
// any gallery figures cycle so a card shows more than one frame of the work.
//
// Auto-advance stops when the card is off-screen and never starts at all under
// prefers-reduced-motion, where the first frame is simply shown.

const INTERVAL_MS = 3600;

// Stills only. A gallery may hold clips, and a card that cycled those would
// pull every file on the grid — the hero video_url is the card's motion.
export function projectMediaImages(p: Project): string[] {
  return Array.from(
    new Set(
      [p.image_url, ...p.gallery.map((g) => g.url)].filter(
        (u): u is string => !!u && !isVideoUrl(u)
      )
    )
  );
}

export default function ProjectMediaRotator({
  project: p,
  fit = "contain",
  showDots = true,
}: {
  project: Project;
  fit?: "cover" | "contain";
  showDots?: boolean;
}) {
  const images = projectMediaImages(p);
  const [index, setIndex] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const host = hostRef.current;
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => setIndex((i) => (i + 1) % images.length), INTERVAL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    // Only animate what the reader can actually see.
    if (!host || typeof IntersectionObserver === "undefined") {
      start();
      return stop;
    }
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.25 }
    );
    io.observe(host);
    return () => {
      io.disconnect();
      stop();
    };
  }, [images.length]);

  if (p.video_url) {
    return (
      <video
        src={p.video_url}
        poster={p.image_url ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  if (images.length === 0) return null;

  // Prefer the gallery caption as alt text when the frame is a gallery figure.
  const altFor = (url: string) =>
    p.gallery.find((g) => g.url === url)?.alt ?? p.name;

  return (
    <div ref={hostRef} className="absolute inset-0">
      {images.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt={i === 0 ? altFor(url) : ""}
          aria-hidden={i !== 0}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          // Literal class names: Tailwind scans source statically, so an
          // interpolated `object-${fit}` would not be emitted.
          className={`absolute inset-0 w-full h-full ${
            fit === "cover" ? "object-cover" : "object-contain"
          }`}
          style={{
            opacity: i === index ? 1 : 0,
            transition: "opacity 700ms ease",
          }}
        />
      ))}

      {showDots && images.length > 1 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-[5px]">
          {images.map((url, i) => (
            <span
              key={url}
              aria-hidden
              style={{
                width: i === index ? "14px" : "5px",
                height: "5px",
                borderRadius: "999px",
                background:
                  i === index
                    ? "var(--violet-soft)"
                    : "color-mix(in srgb, var(--text-muted) 55%, transparent)",
                transition: "width 300ms ease, background 300ms ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
