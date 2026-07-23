"use client";

// Lenis smooth scrolling for the whole site — the inertia/lerp feel
// that makes scroll-linked motion read as "alive". `anchors` keeps
// in-page #links smooth through Lenis instead of native jumps.
// Reduced-motion users get native scrolling untouched.

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useState } from "react";

export default function SmoothScroll() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!enabled) return null;

  return <ReactLenis root options={{ lerp: 0.11, anchors: true }} />;
}
