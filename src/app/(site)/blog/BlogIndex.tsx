"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsMac } from "@/components/Kbd";

export type IndexPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  tags: string[];
  year: string;
  views: number;
};

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const rx = new RegExp(`(${escapeRegExp(q)})`, "gi");
  return text.replace(rx, "<mark>$1</mark>");
}

// Strip the `__…__` purple-highlight markup used in post titles — the
// index row is terse enough that the accent color would be noisy.
function cleanTitle(text: string) {
  return text.replace(/__([^_]+)__/g, "$1");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogIndex({ posts }: { posts: IndexPost[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const qRef = useRef<HTMLInputElement>(null);

  const isMac = useIsMac();

  // Tag counts, sorted descending by count.
  const tagList = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  // Filtered set.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchTag = activeTag === "all" || p.tags.includes(activeTag);
      if (!matchTag) return false;
      if (!q) return true;
      const haystack = `${cleanTitle(p.title)} ${p.tags.join(" ")} ${p.excerpt ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query, activeTag]);

  // Group by year (newest first).
  const grouped = useMemo(() => {
    const byYear = new Map<string, IndexPost[]>();
    for (const p of filtered) {
      if (!byYear.has(p.year)) byYear.set(p.year, []);
      byYear.get(p.year)!.push(p);
    }
    return [...byYear.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  // ⌘K / `/` to focus, Esc to clear + blur.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = document.activeElement === qRef.current;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        qRef.current?.focus();
        qRef.current?.select();
        return;
      }
      if (e.key === "/" && !inInput) {
        e.preventDefault();
        qRef.current?.focus();
        return;
      }
      if (e.key === "Escape" && inInput) {
        setQuery("");
        qRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const count = filtered.length;
  const total = posts.length;
  const countLabel =
    count === total ? `${total} posts` : `${count} / ${total}`;

  return (
    <>
      {/* Search + tag toolbar */}
      <section className="blog-toolbar mb-10">
        <div className="blog-search">
          <span className="blog-prompt">/</span>
          <input
            ref={qRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search posts by title, tag, or word…"
            autoComplete="off"
            spellCheck={false}
          />
          <span
            className={`blog-count ${count !== total ? "found" : ""}`}
            style={{
              color:
                count !== total
                  ? "var(--violet-soft)"
                  : "var(--text-muted)",
            }}
          >
            {countLabel}
          </span>
          <span className="blog-hint">{isMac ? "⌘K" : "Ctrl K"}</span>
        </div>

        {tagList.length > 0 && (
          <div className="blog-tags">
            <span className="blog-tagslabel">## filter</span>
            <button
              className={`blog-tag all ${activeTag === "all" ? "on" : ""}`}
              onClick={() => setActiveTag("all")}
            >
              all<span className="blog-tag-count">{total}</span>
            </button>
            {tagList.map(([tag, c]) => (
              <button
                key={tag}
                className={`blog-tag ${activeTag === tag ? "on" : ""}`}
                onClick={() =>
                  setActiveTag((cur) => (cur === tag ? "all" : tag))
                }
              >
                {tag}
                <span className="blog-tag-count">{c}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Post list — grouped by year */}
      {count === 0 ? (
        <div className="blog-empty">
          <div className="blog-empty-big">no posts match that filter.</div>
          <div>try a different tag or clear the search.</div>
          <button
            className="blog-empty-clear"
            onClick={() => {
              setActiveTag("all");
              setQuery("");
              qRef.current?.focus();
            }}
          >
            → clear filters
          </button>
        </div>
      ) : (
        grouped.map(([year, rows]) => (
          <section key={year} className="blog-group">
            <div className="blog-marker">
              <span>
                <span style={{ color: "var(--violet-soft)" }}>##</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>{year}</span>
              </span>
              <span className="blog-marker-r">
                {rows.length} {rows.length === 1 ? "post" : "posts"}
              </span>
            </div>

            {rows.map((p, i) => {
              const dateStr = formatDate(p.published_at ?? p.created_at);
              const cleaned = cleanTitle(p.title);
              const titleMarkup = query ? highlight(cleaned, query.trim()) : cleaned;
              return (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="blog-row"
                  style={{
                    borderTop: "1px solid var(--gray-800)",
                    borderBottom:
                      i === rows.length - 1 ? "1px solid var(--gray-800)" : undefined,
                  }}
                >
                  <span className="blog-row-idx">
                    {String(posts.indexOf(p) + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="blog-row-title"
                    dangerouslySetInnerHTML={{ __html: titleMarkup }}
                  />
                  <span className="blog-row-tags">
                    {p.tags.slice(0, 2).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                  <span
                    className={`blog-row-views ${p.views === 0 ? "none" : ""}`}
                    title={`${p.views.toLocaleString()} views`}
                  >
                    {p.views > 0 ? formatViews(p.views) : "·"}
                  </span>
                  <span className="blog-row-date">{dateStr}</span>
                </Link>
              );
            })}
          </section>
        ))
      )}
    </>
  );
}
