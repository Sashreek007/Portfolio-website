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

const lowlight = createLowlight(common);

// Post-process HTML to apply hljs syntax highlighting to code blocks.
// generateHTML renders code blocks as plain <pre><code class="language-X">...</code></pre>
// (no token spans) — we have to run hljs over the decoded code ourselves.
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
        const result = lang && hljs.getLanguage(lang)
          ? hljs.highlight(code, { language: lang, ignoreIllegals: true })
          : hljs.highlightAuto(code);
        const langClass = lang ? ` class="language-${lang}"` : "";
        const langLabel = lang || "";
        return `<div class="code-block-wrap"><div class="code-block-header"><span class="code-lang">${langLabel}</span><button class="copy-btn" data-code="">copy</button></div><pre><code${langClass}>${result.value}</code></pre></div>`;
      } catch {
        return _;
      }
    }
  );
}
import type { Database } from "@/lib/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  let html = "";
  if (typedPost.content) {
    try {
      // StarterKit already includes: underline, horizontalRule — don't add separately
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = generateHTML(typedPost.content as any, [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockLowlight.configure({ lowlight }),
        TiptapImage.extend({
          addAttributes() {
            return { ...this.parent?.(), width: { default: null, renderHTML: (a: Record<string, unknown>) => a.width ? { width: a.width } : {} } };
          },
        }),
        Highlight,
      ] as any);
      html = applyCodeHighlighting(raw);
    } catch (e) {
      console.error("[blog] generateHTML failed:", e);
      html = "<p>Content could not be rendered.</p>";
    }
  }

  const readTime = estimateReadingTime(html);

  return (
    <div className="px-[6vw] py-16 w-full max-w-[860px] mx-auto">
      {/* Back */}
      <Link
        href="/blog"
        className="font-mono text-[12px] inline-flex items-center gap-2 mb-10 transition-colors duration-150 hover:text-[var(--text-secondary)]"
        style={{ color: "var(--text-muted)" }}
      >
        ← writing
      </Link>

      {/* Meta */}
      <div className="mb-8">
        {typedPost.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={typedPost.cover_image_url!}
            alt=""
            className="w-full rounded-[6px] mb-8 object-cover"
            style={{ maxHeight: "360px", border: "1px solid var(--gray-800)" }}
          />
        )}
        <p
          className="font-mono text-[11px] tracking-[0.08em] uppercase mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          {formatDate(typedPost.published_at ?? typedPost.created_at)}&nbsp;&nbsp;·&nbsp;&nbsp;{readTime} min read
        </p>
        <h1
          className="text-[32px] font-medium leading-[1.25] mb-4"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          {typedPost.title}
        </h1>
        {typedPost.excerpt && (
          <p
            className="text-[16px] leading-[1.7]"
            style={{ color: "var(--text-secondary)" }}
          >
            {typedPost.excerpt}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mb-8" style={{ height: "1px", background: "var(--gray-800)" }} />

      {/* Content */}
      <div
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "16px",
          lineHeight: "1.8",
        }}
      />
      {/* Copy button wiring — buttons are already in the HTML, just attach handlers */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('.copy-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var code = btn.closest('.code-block-wrap').querySelector('code');
            navigator.clipboard.writeText(code ? code.innerText : '').then(function() {
              btn.textContent = 'copied!';
              btn.classList.add('copied');
              setTimeout(function() { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1500);
            });
          });
        });
      ` }} />

      <style>{`
        .prose-content h1,
        .prose-content h2,
        .prose-content h3 {
          color: var(--text-primary);
          font-family: var(--font-display);
          margin-top: 2em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }
        .prose-content h1 { font-size: 26px; }
        .prose-content h2 { font-size: 20px; }
        .prose-content h3 { font-size: 17px; }
        .prose-content p { margin-bottom: 1.25em; }
        .prose-content a { color: var(--violet-soft); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--violet-soft) 40%, transparent); }
        .prose-content a:hover { color: var(--violet-pale); }
        .prose-content strong { color: var(--text-primary); font-weight: 600; }
        .prose-content em { color: var(--text-secondary); font-style: italic; }
        .prose-content code {
          font-family: var(--font-mono);
          font-size: 13px;
          background: var(--bg-elevated);
          color: var(--amber-bright);
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid var(--gray-800);
        }
        .prose-content .code-block-wrap {
          margin-bottom: 1.25em;
          border: 1px solid var(--gray-800);
          border-radius: 6px;
          overflow: hidden;
        }
        .prose-content .code-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px;
          background: var(--bg-base);
          border-bottom: 1px solid var(--gray-800);
        }
        .prose-content .code-lang {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .prose-content .copy-btn {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          background: transparent;
          border: 1px solid var(--gray-800);
          border-radius: 3px;
          padding: 2px 8px;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: color 120ms, border-color 120ms;
        }
        .prose-content .copy-btn:hover { color: var(--text-secondary); border-color: var(--gray-400); }
        .prose-content .copy-btn.copied { color: var(--green-bright); border-color: var(--green-bright); }
        .prose-content pre {
          background: var(--bg-elevated);
          padding: 18px 20px;
          overflow-x: auto;
          margin: 0;
        }
        .prose-content > pre {
          border: 1px solid var(--gray-800);
          border-radius: 6px;
          margin-bottom: 1.25em;
        }
        .prose-content pre code {
          background: transparent;
          border: none;
          padding: 0;
          color: var(--text-primary);
          font-size: 13px;
          line-height: 1.7;
        }
        .prose-content ul,
        .prose-content ol {
          padding-left: 1.5em;
          margin-bottom: 1.25em;
        }
        .prose-content li { margin-bottom: 0.4em; color: var(--text-secondary); }
        .prose-content blockquote {
          border-left: 2px solid var(--violet-mid);
          padding-left: 1.25em;
          margin: 1.5em 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        .prose-content img {
          max-width: 100%;
          border-radius: 6px;
          border: 1px solid var(--gray-800);
          margin: 1.5em 0;
        }
        .prose-content hr {
          border: none;
          height: 1px;
          background: var(--gray-800);
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}
