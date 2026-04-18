"use client";

import Link from "next/link";
import { useMemo } from "react";

export type BoardPost = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  isPublished: boolean;
  isProject: boolean;
  isHidden: boolean;
  postedAt: string;
  views: number;
  uniques: number;
  views7d: number;
  viewsPrev7d: number;
};

type Column = {
  key: "trending" | "steady" | "quiet" | "drafts";
  label: string;
  sub: string;
  accent: string;
  dashed?: boolean;
  posts: BoardPost[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Strip the purple-highlight markup we use in post titles, since the
// kanban card does its own visual emphasis.
function cleanTitle(text: string) {
  return text.replace(/__([^_]+)__/g, "$1");
}

function bucket(posts: BoardPost[]): { trending: BoardPost[]; steady: BoardPost[]; quiet: BoardPost[] } {
  const published = posts.filter((p) => p.isPublished);
  const sorted = [...published].sort((a, b) => b.views - a.views);

  // Anything with zero views falls straight to quiet; the rest split
  // into terciles so small libraries still produce three columns.
  const withViews = sorted.filter((p) => p.views > 0);
  const noViews = sorted.filter((p) => p.views === 0);
  const n = withViews.length;

  if (n === 0) {
    return { trending: [], steady: [], quiet: noViews };
  }

  const topCut = Math.max(1, Math.ceil(n / 3));
  const midCut = Math.max(topCut, Math.ceil((2 * n) / 3));
  const trending = withViews.slice(0, topCut);
  const steady = withViews.slice(topCut, midCut);
  const quiet = [...withViews.slice(midCut), ...noViews];
  return { trending, steady, quiet };
}

function Delta({ views7d, viewsPrev7d }: { views7d: number; viewsPrev7d: number }) {
  const delta = views7d - viewsPrev7d;
  if (views7d === 0 && viewsPrev7d === 0) return null;
  const up = delta > 0;
  const flat = delta === 0;
  const color = flat
    ? "var(--text-muted)"
    : up
      ? "var(--green-bright)"
      : "var(--text-muted)";
  const arrow = flat ? "·" : up ? "↑" : "↓";
  return (
    <span
      className="font-mono text-[10.5px] tabular-nums inline-flex items-baseline gap-[3px]"
      style={{ color, letterSpacing: "0.04em" }}
      title={`${views7d} views this week vs ${viewsPrev7d} prior`}
    >
      <span>{arrow}</span>
      <span>{Math.abs(delta)}</span>
      <span style={{ color: "var(--text-muted)" }}>· 7d</span>
    </span>
  );
}

function Card({ post, accent }: { post: BoardPost; accent: string }) {
  const editHref = post.isProject
    ? `/admin/projects` // project-linked posts have no blog editor
    : `/admin/blog/${post.id}`;
  return (
    <Link
      href={editHref}
      className="group flex flex-col gap-2 p-3 transition-all duration-150 hover:-translate-y-[1px]"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--gray-800)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: "4px",
      }}
    >
      {/* Status chips */}
      {(post.isProject || post.isHidden || !post.isPublished) && (
        <div className="flex flex-wrap gap-[6px]">
          {!post.isPublished && (
            <span
              className="font-mono text-[9px] tracking-[0.1em] uppercase px-[6px] py-[2px]"
              style={{
                color: "var(--text-muted)",
                border: "1px dashed var(--gray-800)",
                borderRadius: "2px",
              }}
            >
              draft
            </span>
          )}
          {post.isProject && (
            <span
              className="font-mono text-[9px] tracking-[0.1em] uppercase px-[6px] py-[2px]"
              style={{
                color: "var(--amber-bright)",
                border: "1px solid color-mix(in srgb, var(--amber-bright) 30%, transparent)",
                borderRadius: "2px",
              }}
            >
              project
            </span>
          )}
          {post.isHidden && (
            <span
              className="font-mono text-[9px] tracking-[0.1em] uppercase px-[6px] py-[2px]"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--gray-800)",
                borderRadius: "2px",
              }}
            >
              hidden
            </span>
          )}
        </div>
      )}

      {/* Title + slug */}
      <div className="flex flex-col gap-[2px]">
        <span
          className="text-[13.5px] font-medium leading-tight transition-colors duration-150 group-hover:text-[var(--violet-soft)]"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          {cleanTitle(post.title)}
        </span>
        <span
          className="font-mono text-[10.5px]"
          style={{ color: "var(--text-muted)" }}
        >
          /{post.slug}
        </span>
      </div>

      {/* Views row */}
      <div
        className="flex items-baseline justify-between pt-2 mt-1"
        style={{ borderTop: "1px solid var(--gray-800)" }}
      >
        <div className="flex items-baseline gap-[10px]">
          <span
            className="font-mono text-[20px] font-medium tabular-nums leading-none"
            style={{ color: accent }}
          >
            {post.views.toLocaleString()}
          </span>
          <span
            className="font-mono text-[10px] tracking-[0.08em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {post.uniques.toLocaleString()} uniq
          </span>
        </div>
        <Delta views7d={post.views7d} viewsPrev7d={post.viewsPrev7d} />
      </div>

      {/* Tags + date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-[4px] min-w-0">
          {post.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="font-mono text-[9.5px] px-[6px] py-[2px]"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--gray-800)",
                borderRadius: "2px",
                letterSpacing: "0.02em",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <span
          className="font-mono text-[10px] tabular-nums flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          {formatDate(post.postedAt)}
        </span>
      </div>
    </Link>
  );
}

export default function AnalyticsBoard({ posts }: { posts: BoardPost[] }) {
  const columns = useMemo<Column[]>(() => {
    const drafts = posts.filter((p) => !p.isPublished);
    const { trending, steady, quiet } = bucket(posts);
    return [
      {
        key: "trending",
        label: "trending",
        sub: "top third · ranked by views",
        accent: "var(--amber-bright)",
        posts: trending,
      },
      {
        key: "steady",
        label: "steady",
        sub: "middle third",
        accent: "var(--violet-soft)",
        posts: steady,
      },
      {
        key: "quiet",
        label: "quiet",
        sub: "bottom third + zero views",
        accent: "var(--gray-600)",
        posts: quiet,
      },
      {
        key: "drafts",
        label: "drafts",
        sub: "unpublished",
        accent: "var(--text-muted)",
        dashed: true,
        posts: drafts,
      },
    ];
  }, [posts]);

  const totalPublished = columns.reduce(
    (n, c) => (c.key === "drafts" ? n : n + c.posts.length),
    0,
  );

  if (posts.length === 0) {
    return (
      <p
        className="font-mono text-[13px] p-6"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--gray-800)",
          borderRadius: "6px",
        }}
      >
        no posts yet
      </p>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => (
        <div
          key={col.key}
          className="flex flex-col gap-3 p-3"
          style={{
            background: "color-mix(in srgb, var(--bg-surface) 40%, transparent)",
            border: col.dashed
              ? "1px dashed var(--gray-800)"
              : "1px solid var(--gray-800)",
            borderRadius: "6px",
            minHeight: "200px",
          }}
        >
          <div className="flex items-baseline justify-between pb-2" style={{ borderBottom: "1px solid var(--gray-800)" }}>
            <div className="flex items-baseline gap-2">
              <span
                className="inline-block w-[6px] h-[6px] rounded-full"
                style={{ background: col.accent, transform: "translateY(-1px)" }}
              />
              <span
                className="font-mono text-[12px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {col.label}
              </span>
              <span
                className="font-mono text-[10px] tabular-nums"
                style={{ color: "var(--text-muted)" }}
              >
                {col.posts.length}
              </span>
            </div>
            {col.key === "trending" && totalPublished > 0 && (
              <span
                className="font-mono text-[9px] tracking-[0.12em] uppercase"
                style={{ color: "var(--amber-bright)" }}
              >
                hot
              </span>
            )}
          </div>
          <span
            className="font-mono text-[10px]"
            style={{ color: "var(--text-muted)", letterSpacing: "0.02em", marginTop: "-4px" }}
          >
            {col.sub}
          </span>

          {col.posts.length === 0 ? (
            <div
              className="font-mono text-[11px] py-6 text-center"
              style={{ color: "var(--gray-600)" }}
            >
              empty
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {col.posts.map((p) => (
                <Card key={p.id} post={p} accent={col.accent} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
