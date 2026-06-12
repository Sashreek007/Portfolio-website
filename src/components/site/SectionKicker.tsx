"use client";

// Unified editorial kicker row for homepage sections — matches the
// About pattern (LABEL ──────── meta.md). The label types itself out
// with a block cursor when the row first scrolls into view, then the
// meta fades in. Reduced-motion users get the finished row instantly.

import { useEffect, useRef, useState } from "react";

export default function SectionKicker({
  label,
  meta,
}: {
  label: string;
  meta: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);
  const [n, setN] = useState(0);
  const [cursorGone, setCursorGone] = useState(false);
  const done = n >= label.length;

  // Start typing on first viewport entry.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStarted(true);
      setN(label.length);
      setCursorGone(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [label]);

  // One character per tick.
  useEffect(() => {
    if (!started || done) return;
    const t = setTimeout(() => setN((v) => v + 1), 52);
    return () => clearTimeout(t);
  }, [started, n, done]);

  // Cursor lingers briefly after the label lands, then disappears.
  useEffect(() => {
    if (!done || cursorGone) return;
    const t = setTimeout(() => setCursorGone(true), 1600);
    return () => clearTimeout(t);
  }, [done, cursorGone]);

  return (
    <div ref={ref} className="flex items-center gap-4 mb-14 max-w-[1320px] mx-auto">
      <span
        className="inline-block w-[7px] h-[7px] rounded-full"
        style={{
          background: "var(--violet-soft)",
          boxShadow:
            "0 0 14px color-mix(in srgb, var(--violet-soft) 60%, transparent)",
        }}
      />
      <span
        className="relative font-mono text-[12.5px] tracking-[0.22em] uppercase font-medium whitespace-nowrap"
        style={{ color: "var(--violet-pale)" }}
      >
        {/* Invisible full label reserves the width so the hairline never shifts */}
        <span className="invisible" aria-hidden>
          {label}
        </span>
        <span className="absolute inset-0" aria-hidden>
          {label.slice(0, n)}
          {!cursorGone && (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: "0.55em",
                height: "1em",
                background: "var(--violet-soft)",
                verticalAlign: "text-bottom",
                marginLeft: "2px",
                animation: "blink-cursor 1.1s steps(2) infinite",
              }}
            />
          )}
        </span>
        {/* Screen readers get the full label immediately */}
        <span className="sr-only">{label}</span>
      </span>
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--violet-mid) 60%, transparent), var(--gray-800) 70%)",
        }}
      />
      <span
        className="font-mono text-[12px] tracking-[0.18em]"
        style={{
          color: "var(--text-muted)",
          opacity: done ? 1 : 0,
          transition: "opacity 450ms ease 150ms",
        }}
      >
        {meta}
      </span>
    </div>
  );
}
