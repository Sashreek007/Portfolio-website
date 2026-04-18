"use client";

import { useEffect, useState } from "react";

// Handles the floating scroll-to-top button + wires up the copy-button
// click handlers injected into code blocks by applyCodeHighlighting.
export default function PostScroll() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handlers: Array<() => void> = [];
    document.querySelectorAll<HTMLButtonElement>(".blog-code-copy").forEach((btn) => {
      const originalIcon = btn.innerHTML;
      const onClick = () => {
        const code =
          btn.closest(".blog-code")?.querySelector("code")?.textContent ?? "";
        navigator.clipboard
          .writeText(code)
          .then(() => {
            btn.innerHTML =
              '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8 L7 12 L13 4"/></svg>';
            btn.classList.add("copied");
            setTimeout(() => {
              btn.innerHTML = originalIcon;
              btn.classList.remove("copied");
            }, 1200);
          })
          .catch(() => {
            /* ignore */
          });
      };
      btn.addEventListener("click", onClick);
      handlers.push(() => btn.removeEventListener("click", onClick));
    });
    return () => {
      handlers.forEach((h) => h());
    };
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      className={`blog-ftt ${show ? "show" : ""}`}
      onClick={toTop}
      aria-label="back to top"
      type="button"
    >
      ↑
    </button>
  );
}
