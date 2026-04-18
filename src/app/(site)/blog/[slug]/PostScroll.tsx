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
      const onClick = () => {
        const code =
          btn.parentElement?.querySelector("code")?.textContent ?? "";
        navigator.clipboard
          .writeText(code)
          .then(() => {
            btn.textContent = "copied";
            btn.classList.add("copied");
            setTimeout(() => {
              btn.textContent = "copy";
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
