"use client";

// Vim motions for the blog — an easter egg for readers who'd notice.
//   j / k   scroll down / up
//   gg / G  jump to top / bottom
//   /       focus the post search
// Inputs and modifier combos are left alone.

import { useEffect } from "react";

export default function VimKeys() {
  useEffect(() => {
    let lastG = 0;

    const isEditable = (el: EventTarget | null) => {
      const t = el as HTMLElement | null;
      if (!t) return false;
      return (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (isEditable(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "j":
          window.scrollBy({ top: 90, behavior: "instant" });
          e.preventDefault();
          break;
        case "k":
          window.scrollBy({ top: -90, behavior: "instant" });
          e.preventDefault();
          break;
        case "G":
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
          e.preventDefault();
          break;
        case "g": {
          const now = performance.now();
          if (now - lastG < 450) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            lastG = 0;
          } else {
            lastG = now;
          }
          break;
        }
        case "/": {
          const input = document.querySelector<HTMLInputElement>(
            ".blog-search input, .blog-post-sidebar-search input"
          );
          if (input) {
            input.focus();
            e.preventDefault();
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
