"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SidebarPost = {
  slug: string;
  title: string;
  tags: string[];
};

export type TrendingPost = {
  slug: string;
  title: string;
  views: number;
};

function formatViewCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

// Strip reserved series/part tags and the `__…__` highlight markup so
// the tree reads cleanly.
function cleanTitle(text: string) {
  return text.replace(/__([^_]+)__/g, "$1");
}

function primaryCategory(tags: string[]): string {
  const filtered = tags.filter(
    (t) => !t.startsWith("series:") && !t.startsWith("part:"),
  );
  return filtered[0] ?? "misc";
}

// Right-rail navigation on blog post pages. Mirrors the structure of
// the reference design's left sidebar — brand, search, and a tree of
// posts grouped by their primary tag.
export default function PostSidebar({
  currentSlug,
  posts,
  trending = [],
}: {
  currentSlug: string;
  posts: SidebarPost[];
  trending?: TrendingPost[];
}) {
  const [query, setQuery] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const byCat = new Map<string, SidebarPost[]>();
    for (const p of posts) {
      const cat = primaryCategory(p.tags);
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat)!.push(p);
    }
    return [...byCat.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [posts]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return grouped;
    return grouped
      .map(([cat, rows]) => {
        const kept = rows.filter((r) =>
          cleanTitle(r.title).toLowerCase().includes(q),
        );
        return [cat, kept] as const;
      })
      .filter(([, rows]) => rows.length > 0);
  }, [grouped, q]);

  const isOpen = (cat: string) => {
    if (q) return true;
    if (cat in openCats) return openCats[cat];
    return true;
  };

  const toggle = (cat: string) => {
    setOpenCats((s) => ({ ...s, [cat]: !isOpen(cat) }));
  };

  return (
    <aside className="blog-post-sidebar" aria-label="Blog navigation">
      <Link href="/blog" className="blog-post-sidebar-brand">
        <span className="brand-name">home</span>
      </Link>

      <label className="blog-post-sidebar-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search"
          spellCheck={false}
          autoComplete="off"
        />
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        >
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3 3" />
        </svg>
      </label>

      <div className="blog-post-sidebar-section">
        <div className="blog-post-sidebar-label">## blogs</div>
        <div className="blog-post-sidebar-tree">
          {filtered.length === 0 && (
            <div className="blog-post-sidebar-empty">no matches</div>
          )}
          {filtered.map(([cat, rows]) => {
            const open = isOpen(cat);
            return (
              <div key={cat} className="blog-cat">
                <button
                  type="button"
                  onClick={() => toggle(cat)}
                  className={`blog-cat-head ${open ? "open" : ""}`}
                >
                  <span className="blog-cat-caret">{open ? "▾" : "▸"}</span>
                  <span className="blog-cat-name">{cat}</span>
                  <span className="blog-cat-count">{rows.length}</span>
                </button>
                {open && (
                  <ul className="blog-cat-list">
                    {rows.map((p) => {
                      const active = p.slug === currentSlug;
                      return (
                        <li key={p.slug}>
                          <Link
                            href={`/blog/${p.slug}`}
                            className={`blog-cat-item ${active ? "on" : ""}`}
                          >
                            {cleanTitle(p.title)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {trending.length > 0 && (
        <div className="blog-post-sidebar-section">
          <div className="blog-post-sidebar-label">## trending</div>
          <ol className="blog-trending">
            {trending.map((t, i) => {
              const active = t.slug === currentSlug;
              return (
                <li key={t.slug}>
                  <Link
                    href={`/blog/${t.slug}`}
                    className={`blog-trending-item ${active ? "on" : ""}`}
                  >
                    <span className="blog-trending-rank">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="blog-trending-title">
                      {cleanTitle(t.title)}
                    </span>
                    <span className="blog-trending-views">
                      {formatViewCount(t.views)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="blog-post-sidebar-socials">
        <a
          href="https://www.linkedin.com/in/sashreekaddanki"
          target="_blank"
          rel="noreferrer"
        >
          linkedin
        </a>
        <a href="https://github.com/Sashreek007" target="_blank" rel="noreferrer">
          github
        </a>
        <a href="https://x.com" target="_blank" rel="noreferrer">
          x
        </a>
      </div>
    </aside>
  );
}
