"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isVideoUrl, type GalleryItem } from "@/components/site/ProjectCard";

// Ordered figure carousel for a project's detail page. Layout only: every
// string rendered here comes from the project record, so a project with an
// empty gallery renders nothing and no copy change reaches this file.
//
// Slides share one grid cell rather than sitting in a fixed-aspect frame, so
// the frame is as tall as the tallest figure and nothing is cropped or
// letterboxed — these are diagrams and dashboards, and a crop loses text.

export default function ProjectGallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const regionRef = useRef<HTMLDivElement>(null);
  const count = items.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  // Keep the rendered caption in sync if the gallery shrinks between renders.
  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  if (count === 0) return null;

  const active = items[Math.min(index, count - 1)];

  return (
    <section className="mb-16">
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <h2 className="font-mono text-[14px] flex items-baseline gap-2">
          <span style={{ color: "var(--violet-soft)" }}>##</span>
          <span style={{ color: "var(--text-primary)" }}>gallery</span>
        </h2>
        <span
          className="font-mono text-[11px] tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      </div>

      <div
        ref={regionRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Project figures"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="project-gallery outline-none"
        style={{
          border: "1px solid var(--gray-800)",
          borderRadius: "8px",
          background: "var(--bg-surface)",
          overflow: "hidden",
        }}
      >
        {/* Slides stacked in a single grid cell — container height follows the
            tallest figure, so switching slides never jumps the page. */}
        <div className="grid">
          {items.map((item, i) => (
            <figure
              key={item.url}
              className="min-w-0"
              style={{
                gridArea: "1 / 1",
                opacity: i === index ? 1 : 0,
                transition: "opacity 320ms ease",
                pointerEvents: i === index ? "auto" : "none",
              }}
              aria-hidden={i !== index}
            >
              {isVideoUrl(item.url) ? (
                // Only the visible slide is allowed to load or play — a
                // gallery of clips would otherwise pull every file at once.
                <video
                  src={i === index ? item.url : undefined}
                  poster={item.poster}
                  aria-label={item.alt}
                  autoPlay={i === index}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="block w-full h-auto"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  className="block w-full h-auto"
                />
              )}
            </figure>
          ))}
        </div>

        {/* Control rail — carries the caption so it reads as one unit */}
        <div
          className="flex items-center gap-4 px-5 py-4"
          style={{ borderTop: "1px solid var(--gray-800)" }}
        >
          <span
            className="font-mono text-[11px] tracking-[0.18em] shrink-0"
            style={{ color: "var(--amber-bright)" }}
          >
            {`FIG ${String(index + 1).padStart(2, "0")}`}
          </span>
          <span
            aria-live="polite"
            className="text-[14px] leading-[1.6] flex-1 min-w-0"
            style={{ color: "var(--text-secondary)" }}
          >
            {active.caption}
          </span>

          {count > 1 && (
            <div className="flex items-center gap-3 shrink-0">
              {/* Dots */}
              <div className="hidden sm:flex items-center gap-[6px]">
                {items.map((item, i) => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Figure ${i + 1}`}
                    aria-current={i === index}
                    className="gallery-dot"
                    style={{
                      width: i === index ? "18px" : "6px",
                      height: "6px",
                      borderRadius: "999px",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      background:
                        i === index ? "var(--violet-soft)" : "var(--gray-800)",
                      transition: "width 240ms ease, background 240ms ease",
                    }}
                  />
                ))}
              </div>

              {(["prev", "next"] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => go(index + (dir === "next" ? 1 : -1))}
                  aria-label={dir === "next" ? "Next figure" : "Previous figure"}
                  className="gallery-arrow font-mono text-[13px]"
                  style={{
                    width: "30px",
                    height: "30px",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--text-muted)",
                    border: "1px solid var(--gray-800)",
                    borderRadius: "6px",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "color 150ms, border-color 150ms",
                  }}
                >
                  {dir === "next" ? "→" : "←"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
