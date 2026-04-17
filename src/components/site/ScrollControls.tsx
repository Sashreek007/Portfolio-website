"use client";

// ScrollControls — floating scroll-to-top button (homepage only).
// Section navigation is handled by the top nav once it slides in, so this
// component now only provides the "back to top" affordance.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ScrollControls() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(false);

  // Show after the hero is past
  useEffect(() => {
    if (!isHome) return;
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);

  if (!isHome) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 280ms ease, transform 280ms ease",
      }}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="flex items-center justify-center w-10 h-10 transition-all duration-200 pointer-events-auto"
        style={{
          color: "var(--text-muted)",
          background: "color-mix(in srgb, var(--bg-elevated) 85%, transparent)",
          border: "1px solid var(--gray-800)",
          borderRadius: "4px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
          e.currentTarget.style.borderColor =
            "color-mix(in srgb, var(--violet-soft) 50%, transparent)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.borderColor = "var(--gray-800)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        aria-label="Scroll to top"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 12 V2 M2 7 L7 2 L12 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
