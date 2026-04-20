import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { generateHTML } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TiptapImage from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { common, createLowlight } from "lowlight";
import hljs from "highlight.js";
import PostScroll from "./PostScroll";
import BlogToc, { type TocItem } from "./BlogToc";
import PostSidebar, { type SidebarPost, type TrendingPost } from "./PostSidebar";
import { getBlogViewStats, topTrendingSlugs } from "@/lib/blog-views";

const lowlight = createLowlight(common);

// Wrap each rendered code block with a language tag, copy button, and
// per-line markup so CSS can hang a gutter of line numbers alongside
// the highlighted source. Optional filename support: a leading shebang
// comment like `// file: src/foo.ts` is lifted out as a filename label.
function applyCodeHighlighting(html: string): string {
  return html.replace(
    /<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_, lang: string | undefined, escapedCode: string) => {
      const code = escapedCode
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      // Extract an optional filename marker from the first line, so
      // authors can tag a snippet without cluttering the rendered body.
      let filename: string | null = null;
      let body = code;
      const fileMatch = body.match(
        /^(?:\s*)(?:\/\/|#)\s*file:\s*(\S+)\s*\n/,
      );
      if (fileMatch) {
        filename = fileMatch[1];
        body = body.slice(fileMatch[0].length);
      }

      try {
        const result =
          lang && hljs.getLanguage(lang)
            ? hljs.highlight(body, { language: lang, ignoreIllegals: true })
            : hljs.highlightAuto(body);
        const highlighted = result.value.replace(/\n+$/, "");

        const label = filename
          ? `<span class="blog-code-file">${filename}</span>`
          : `<span class="blog-code-lang"><span class="blog-code-lang-mark">&lt;/&gt;</span>${lang || "code"}</span>`;
        // Inline SVG copy icon, swapped in JS with a check on success.
        const copyIcon = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="9" height="9" rx="1.5"/><path d="M10 4V2.5a1 1 0 0 0-1-1H3.5a1 1 0 0 0-1 1V10"/></svg>`;
        return `<div class="blog-code" data-lang="${lang || ""}"><div class="blog-code-head">${label}<button class="blog-code-copy" type="button" aria-label="Copy code">${copyIcon}</button></div><pre><code>${highlighted}</code></pre></div>`;
      } catch {
        return _;
      }
    },
  );
}

// Derive a URL-safe slug from heading text. Must match what
// `addHeadingIds` produces so TOC anchors resolve.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

// Walk the rendered HTML, inject deterministic `id` attributes on h2/h3
// elements, and return both the rewritten HTML and a flat TOC.
function addHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const out = html.replace(
    /<(h2|h3)>([\s\S]*?)<\/(h2|h3)>/g,
    (_, open: string, inner: string) => {
      const text = inner
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
      let id = slugify(text) || `section-${toc.length + 1}`;
      const n = used.get(id) ?? 0;
      if (n > 0) id = `${id}-${n + 1}`;
      used.set(id, n + 1);
      toc.push({ id, text, level: open === "h2" ? 2 : 3 });
      return `<${open} id="${id}">${inner}</${open}>`;
    },
  );
  return { html: out, toc };
}

// Promote standalone images to <figure> blocks so they can carry a
// caption (pulled from the image's alt text) and get visual treatment
// that distinguishes them from inline imagery. Tiptap's image
// extension renders block images as bare <img> tags at the top level,
// so we match those rather than paragraph-wrapped ones.
function wrapImagesInFigures(html: string): string {
  return html.replace(
    /(?:<p>\s*(<img\s+[^>]*?>)\s*<\/p>|(<img\s+[^>]*?>))/g,
    (_m, wrapped: string | undefined, bare: string | undefined) => {
      const imgTag = wrapped ?? bare ?? "";
      const altMatch = imgTag.match(/alt="([^"]*)"/);
      const alt = altMatch ? altMatch[1] : "";
      const caption = alt ? `<figcaption>${alt}</figcaption>` : "";
      return `<figure class="blog-figure">${imgTag}${caption}</figure>`;
    },
  );
}

import type { Database } from "@/lib/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  tags?: string[] | null;
};

export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

function formatDate(iso: string) {
  const d = new Date(iso);
  const month = d
    .toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    .toLowerCase();
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

// Highlight fragments of the title that the author tagged with
// double-underscores, e.g. "serving __7B__ on one gpu" renders "7B"
// in the accent color without touching the rest of the string.
function renderTitle(title: string): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return escape(title).replace(
    /__([^_]+)__/g,
    (_m, inner) =>
      `<span style="color:var(--violet-soft)">${inner}</span>`,
  );
}

function estimateReadingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    notFound();
  }

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) notFound();

  const typedPost = data as Post;

  // Prev/next navigation — ordered newest → oldest, same filter as the
  // index so we don't surface hidden posts as navigation targets.
  // Feed-reading convention: "previous" = the post sitting above this
  // one on the index (newer in time), "next" = the one below (older).
  const { data: sibData } = await supabase
    .from("posts")
    .select("slug, title, tags, published_at, created_at, project_id, show_on_writing, is_published")
    .eq("is_published", true)
    .eq("show_on_writing", true)
    .is("project_id", null)
    .order("published_at", { ascending: false });
  const siblings = (sibData ?? []) as Array<{
    slug: string;
    title: string;
    tags: string[] | null;
  }>;
  const idx = siblings.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next =
    idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const sidebarPosts: SidebarPost[] = siblings.map((s) => ({
    slug: s.slug,
    title: s.title,
    tags: s.tags ?? [],
  }));

  // Trending pulls from the public `page_views` aggregate. We scope
  // to the same sibling set so hidden/project posts don't leak into
  // the rail.
  const viewStats = await getBlogViewStats();
  const siblingSlugs = new Set(siblings.map((s) => s.slug));
  const titleBySlug = new Map(siblings.map((s) => [s.slug, s.title] as const));
  const trending: TrendingPost[] = topTrendingSlugs(
    viewStats,
    siblingSlugs,
    5,
  ).map((s) => ({
    slug: s.slug,
    title: titleBySlug.get(s.slug) ?? s.slug,
    views: s.views,
  }));
  const currentViews = viewStats.get(slug)?.views ?? 0;

  let html = "";
  if (typedPost.content) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = generateHTML(typedPost.content as any, [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockLowlight.configure({ lowlight }),
        TiptapImage.extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              width: {
                default: null,
                renderHTML: (a: Record<string, unknown>) =>
                  a.width ? { width: a.width } : {},
              },
            };
          },
        }),
        Highlight,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any);
      html = applyCodeHighlighting(raw);
      html = wrapImagesInFigures(html);
    } catch (e) {
      console.error("[blog] generateHTML failed:", e);
      html = "<p>Content could not be rendered.</p>";
    }
  }
  const { html: htmlWithIds, toc } = addHeadingIds(html);
  html = htmlWithIds;

  const readTime = estimateReadingTime(html);
  const postedAt = typedPost.published_at ?? typedPost.created_at;
  const allTags = (typedPost.tags as string[] | null) ?? [];
  // Tags of the form `series:serving-from-scratch` / `part:3` get pulled
  // out of the pill list and shown inline with the meta row as a
  // "serving-from-scratch · pt. 3" badge.
  let seriesSlug: string | null = null;
  let seriesPart: string | null = null;
  const tags: string[] = [];
  for (const t of allTags) {
    if (t.startsWith("series:")) seriesSlug = t.slice(7);
    else if (t.startsWith("part:")) seriesPart = t.slice(5);
    else tags.push(t);
  }
  const seriesLabel =
    seriesSlug && seriesPart
      ? `${seriesSlug} · pt. ${seriesPart}`
      : seriesSlug ?? null;

  return (
    <div className="blog-post-layout">
      <BlogToc items={toc} />

      <div className="blog-shell">
      <Link href="/blog" className="blog-back">
        ← back to blog
      </Link>

      <header className="blog-post-header">
        <h1
          className="blog-post-title"
          dangerouslySetInnerHTML={{ __html: renderTitle(typedPost.title) }}
        />
        <div className="blog-post-meta">
          <span>{formatDate(postedAt)}</span>
          <span className="blog-dot">·</span>
          <span>{readTime} min read</span>
          {currentViews > 0 && (
            <>
              <span className="blog-dot">·</span>
              <span className="blog-post-views">
                {currentViews.toLocaleString()}{" "}
                {currentViews === 1 ? "view" : "views"}
              </span>
            </>
          )}
          {seriesLabel && (
            <>
              <span className="blog-dot">·</span>
              <span className="blog-post-series">{seriesLabel}</span>
            </>
          )}
        </div>
        {tags.length > 0 && (
          <div className="blog-post-tags">
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
        {typedPost.excerpt && (
          <p className="blog-post-excerpt">{typedPost.excerpt}</p>
        )}
      </header>

      <article
        className="blog-post-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <nav className="blog-post-nav">
        {prev ? (
          <Link href={`/blog/${prev.slug}`} className="blog-prev">
            <div className="blog-nav-lbl">← previous</div>
            <div className="blog-nav-t">{prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/blog/${next.slug}`} className="blog-next">
            <div className="blog-nav-lbl">next →</div>
            <div className="blog-nav-t">{next.title}</div>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <div className="blog-to-top">
        <a href="#top" className="blog-to-top-link">
          ↑ back to top
        </a>
      </div>

      {/* Client-side scroll-to-top floater + copy-button wiring */}
      <PostScroll />
      </div>

      <PostSidebar
        currentSlug={slug}
        posts={sidebarPosts}
        trending={trending}
        toc={toc}
      />
    </div>
  );
}
