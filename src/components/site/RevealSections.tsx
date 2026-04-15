"use client";

import { useEffect } from "react";

export default function RevealSections() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".section-hidden"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("section-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    els.forEach((el) => {
      // Already in the viewport on mount (e.g. after back-navigation) — reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("section-visible");
      } else {
        io.observe(el);
      }
    });

    return () => io.disconnect();
  }, []);

  return null;
}
