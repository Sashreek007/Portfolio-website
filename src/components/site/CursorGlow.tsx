"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const move = (e: MouseEvent) => {
      raf = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.background = `radial-gradient(550px circle at ${e.clientX}px ${e.clientY}px, color-mix(in srgb, var(--violet-dim) 7%, transparent), transparent 40%)`;
        }
      });
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 9, background: "transparent" }}
    />
  );
}
