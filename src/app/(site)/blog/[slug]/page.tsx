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

const lowlight = createLowlight(common);

// Wrap each rendered code block with a header that carries the language
// tag (shown top-right of the block) and a copy button, then run hljs
// over the raw source so we get syntax-highlighted spans.
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
      try {
        const result =
          lang && hljs.getLanguage(lang)
            ? hljs.highlight(code, { language: lang, ignoreIllegals: true })
            : hljs.highlightAuto(code);
        const langLabel = lang || "";
        return `<div class="blog-code"><span class="blog-code-lang">${langLabel}</span><button class="blog-code-copy" type="button">copy</button><pre><code>${result.value}</code></pre></div>`;
      } catch {
        return _;
      }
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
    .select("slug, title, published_at, created_at, project_id, show_on_writing, is_published")
    .eq("is_published", true)
    .eq("show_on_writing", true)
    .is("project_id", null)
    .order("published_at", { ascending: false });
  const siblings = (sibData ?? []) as Array<{ slug: string; title: string }>;
  const idx = siblings.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next =
    idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

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
    } catch (e) {
      console.error("[blog] generateHTML failed:", e);
      html = "<p>Content could not be rendered.</p>";
    }
  }

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
  );
}
