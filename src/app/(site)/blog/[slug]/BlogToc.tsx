"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; text: string; level: 2 | 3 };

// Left-rail table of contents. IntersectionObserver highlights the section
// whose heading most recently crossed into the top-third of the viewport
// so the active marker tracks the user as they scroll.
export default function BlogToc({
  items,
  variant = "rail",
}: {
  items: TocItem[];
  // "rail" is the left-column sticky TOC. "inline" is the same TOC
  // slotted into the right sidebar for medium viewports where the left
  // rail collapses but the sidebar still has room.
  variant?: "rail" | "inline";
}) {
  const [activeId, setActiveId] = useState<string | null>(
    items[0]?.id ?? null,
  );

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // Scroll-listener strategy: whichever heading is last above the
    // 120px offset line wins. Simpler than IntersectionObserver when
    // you want "last passed heading" semantics — IO only fires on
    // crossings, which leaves you stale between two headings.
    const OFFSET = 120;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top - OFFSET <= 0) current = h.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  if (items.length < 2) return null;

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside
      className={`blog-toc blog-toc--${variant}`}
      aria-label="Table of contents"
    >
      <div className="blog-toc-label">## contents</div>
      <nav className="blog-toc-list">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            onClick={(e) => onClick(e, it.id)}
            className={`blog-toc-link level-${it.level} ${
              activeId === it.id ? "on" : ""
            }`}
          >
            <span className="blog-toc-dot" />
            <span className="blog-toc-text">{it.text}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
