"use client";

// ScrollControls — floating bottom-right cluster on the homepage.
//
// While scrolled past the hero, two affordances appear:
//   (1) "next ↓" button — jumps to the next section based on which one is
//       currently in view (hero → work → about → writing → contact).
//   (2) "top ↑" button — jumps back to the top of the page.
//
// IntersectionObserver tracks the active section. Buttons fade in once the
// hero is out of frame so they never compete with the hero on first load.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SECTIONS = ["hero", "work", "about", "writing", "contact"] as const;
type Section = typeof SECTIONS[number];

const NEXT_LABEL: Record<Section, string | null> = {
  hero:    "work",
  work:    "about",
  about:   "writing",
  writing: "contact",
  contact: null,
};

export default function ScrollControls() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [active, setActive] = useState<Section>("hero");
  const [visible, setVisible] = useState(false);

  // Track which section is currently in view
  useEffect(() => {
    if (!isHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id as Section);
        }
      },
      { rootMargin: "-35% 0px -50% 0px" }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  // Show controls only after the hero is past
  useEffect(() => {
    if (!isHome) return;
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);

  if (!isHome) return null;

  const next = NEXT_LABEL[active];

  const scrollTo = (id: string) => {
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 280ms ease, transform 280ms ease",
      }}
    >
      {next && (
        <button
          type="button"
          onClick={() => scrollTo(next)}
          className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase px-4 py-2.5 transition-all duration-200 pointer-events-auto"
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
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--gray-800)";
          }}
          aria-label={`Jump to ${next}`}
        >
          <span style={{ color: "var(--text-muted)" }}>next</span>
          <span style={{ color: "var(--violet-soft)" }}>{next}</span>
          <span aria-hidden>↓</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => scrollTo("hero")}
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
