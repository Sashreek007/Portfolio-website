"use client";

import {
  useState, useCallback, useRef, useEffect, forwardRef,
  useImperativeHandle,
} from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapUnderline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Link from "@tiptap/extension-link";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import { common, createLowlight } from "lowlight";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import {
  DEFAULT_TITLE_ACCENT,
  TITLE_ACCENTS,
  escapeTitleHTML,
  highlightTitleFragments,
  type TitleAccent,
} from "@/lib/title-accent";

const lowlight = createLowlight(common);

// ── Code block languages ───────────────────────────────────────────────────────
const LANGUAGES = [
  { value: "", label: "auto-detect" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "java", label: "Java" },
  { value: "bash", label: "Bash / Shell" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "markdown", label: "Markdown" },
  { value: "docker", label: "Dockerfile" },
  { value: "xml", label: "XML" },
];

// ── Code block node view ───────────────────────────────────────────────────────
// Matches the reader's `.blog-code` + `.blog-code-head` markup so the
// editor renders the same chrome that publishes. Filename is an
// explicit attribute instead of the old "// file:" first-line hack.
function CodeBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const attrs = node.attrs as { language?: string; filename?: string };
  const language = attrs.language ?? "";
  const filename = attrs.filename ?? "";
  const [copied, setCopied] = useState(false);
  const [editingFilename, setEditingFilename] = useState(false);

  const copyCode = () => {
    const text = node.textContent;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <NodeViewWrapper className="blog-code" data-lang={language || undefined}>
      <div className="blog-code-head" contentEditable={false}>
        {filename || editingFilename ? (
          <span className="blog-code-file" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <input
              autoFocus={editingFilename && !filename}
              value={filename}
              placeholder="filename.ext"
              onChange={(e) => updateAttributes({ filename: e.target.value })}
              onBlur={() => setEditingFilename(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "inherit",
                font: "inherit",
                padding: 0,
                width: `${Math.max(10, filename.length || 12)}ch`,
              }}
            />
            {filename && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); updateAttributes({ filename: "" }); }}
                title="Remove filename — show language badge instead"
                style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer", fontSize: "11px", padding: 0 }}
              >
                ×
              </button>
            )}
          </span>
        ) : (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setEditingFilename(true); }}
            className="blog-code-lang"
            title="Add a filename"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", font: "inherit", padding: 0, display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span className="blog-code-lang-mark">&lt;/&gt;</span>
            {language || "code"}
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <select
            value={language}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: language ? "var(--violet-soft)" : "var(--text-muted)",
              background: "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
            }}
            title="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value} style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            className="blog-code-copy"
            onMouseDown={(e) => { e.preventDefault(); copyCode(); }}
            title="Copy code"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: copied ? "var(--green-bright)" : "var(--text-muted)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              letterSpacing: "0.05em",
            }}
          >
            {copied ? "copied!" : "copy"}
          </button>
        </div>
      </div>
      <pre>
        {/* Wrap in a <code> so `.blog-post-body .blog-code code`
            selectors match both the editor and the reader. ProseMirror
            mounts NodeViewContent inside it as a plain div — that's
            fine, the reader regex also receives plain text content. */}
        <code style={{ display: "block" }}>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
}

// ── Image node view (wrapped in a figure with an editable caption) ──────────────
// The reader wraps top-level images in .blog-figure + figcaption taken
// from the alt attribute. We do the same here so the author sees the
// caption live and can edit it in place instead of guessing.
function ImageView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const attrs = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
  };
  const imgRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startW = useRef(0);

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startW.current = imgRef.current?.offsetWidth ?? (attrs.width ?? 600);

    const onMouseMove = (ev: MouseEvent) => {
      const newW = Math.max(80, startW.current + (ev.clientX - startX.current));
      updateAttributes({ width: Math.round(newW) });
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const caption = attrs.alt ?? "";

  return (
    <NodeViewWrapper as="figure" className="blog-figure" style={{ position: "relative" }}>
      <div style={{ position: "relative", lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={attrs.src}
          alt={caption}
          style={{
            width: attrs.width ? `${attrs.width}px` : "100%",
            maxWidth: "100%",
            display: "block",
            outline: (selected as boolean)
              ? "2px solid var(--violet-soft)"
              : "none",
            outlineOffset: "2px",
            borderRadius: "6px",
          }}
        />
        {(selected as boolean) && (
          <div
            onMouseDown={onResizeMouseDown}
            style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              width: "14px",
              height: "14px",
              background: "var(--violet-soft)",
              borderRadius: "3px",
              cursor: "ew-resize",
              zIndex: 10,
            }}
            title="Drag to resize"
          />
        )}
      </div>
      <figcaption contentEditable={false}>
        <input
          value={caption}
          onChange={(e) => updateAttributes({ alt: e.target.value })}
          placeholder="caption — doubles as alt text"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "inherit",
            font: "inherit",
            width: "100%",
            padding: 0,
          }}
        />
      </figcaption>
    </NodeViewWrapper>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Post = {
  id: string; title: string; slug: string;
  content: JSONContent | null; excerpt: string | null;
  cover_image_url: string | null; is_published: boolean; published_at: string | null;
  project_id?: string | null;
  show_on_writing?: boolean;
  tags?: string[];
  title_accent?: string | null;
};
type Props = { post?: Post; mode: "new" | "edit" };

// ── Image upload ───────────────────────────────────────────────────────────────
async function uploadImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `inline/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("blog-media").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("blog-media").getPublicUrl(path).data.publicUrl;
}

// ── Slash command items ────────────────────────────────────────────────────────
type CommandItem = {
  icon: string;
  title: string;
  description: string;
  keywords: string[];
  command: (editor: Editor, range: Range) => void;
};

const COMMANDS: CommandItem[] = [
  { icon: "¶", title: "Text", description: "Plain paragraph", keywords: ["p", "text", "paragraph"],
    command: (e, r) => e.chain().focus().deleteRange(r).setParagraph().run() },
  { icon: "H1", title: "Heading 1", description: "Large heading", keywords: ["h1", "heading"],
    command: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 1 }).run() },
  { icon: "H2", title: "Heading 2", description: "Medium heading", keywords: ["h2", "subheading"],
    command: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 2 }).run() },
  { icon: "H3", title: "Heading 3", description: "Small heading", keywords: ["h3"],
    command: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 3 }).run() },
  { icon: "•", title: "Bullet List", description: "Unordered list", keywords: ["ul", "bullet", "list"],
    command: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run() },
  { icon: "1.", title: "Numbered List", description: "Ordered list", keywords: ["ol", "numbered"],
    command: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run() },
  { icon: "</>", title: "Code Block", description: "Multi-line code snippet", keywords: ["code", "pre", "snippet", "block"],
    command: (e, r) => e.chain().focus().deleteRange(r).setCodeBlock().run() },
  { icon: "❝", title: "Blockquote", description: "Indented quote", keywords: ["quote", "blockquote"],
    command: (e, r) => e.chain().focus().deleteRange(r).setBlockquote().run() },
  {
    icon: "⚑",
    title: "Quote w/ label",
    description: "Labelled callout — bold title + body",
    keywords: ["callout", "label", "titled", "note", "warning"],
    // Inserts the two-paragraph shape the reader's CSS uses to flip
    // a blockquote into its bordered-card variant. Author edits both
    // paragraphs in place.
    command: (e, r) =>
      e
        .chain()
        .focus()
        .deleteRange(r)
        .insertContent({
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "bold" }], text: "THE TRAP" },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text:
                    "Body of the note. The reader styles this blockquote as a full border box when the first child is a strong label.",
                },
              ],
            },
          ],
        })
        .run(),
  },
  { icon: "—", title: "Divider", description: "Horizontal rule", keywords: ["hr", "divider", "rule"],
    command: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run() },
  { icon: "▣", title: "Image", description: "Upload image at cursor", keywords: ["image", "img", "upload", "photo"],
    command: (e, r) => {
      e.chain().focus().deleteRange(r).run();
      const input = document.createElement("input");
      input.type = "file"; input.accept = "image/*";
      input.onchange = async (ev) => {
        const file = (ev.target as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
          const url = await uploadImage(file);
          e.chain().focus().setImage({ src: url }).run();
        } catch { /* silent */ }
      };
      input.click();
    },
  },
];

function filterCommands(query: string) {
  const q = query.toLowerCase();
  return COMMANDS.filter(
    (c) => c.title.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q))
  );
}

// ── Slash command popup component ──────────────────────────────────────────────
type SlashMenuRef = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

type SlashMenuProps = {
  items: CommandItem[];
  command: (item: CommandItem) => void;
};

const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(({ items, command }, ref) => {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowUp") {
        setSelected((s) => (s - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelected((s) => (s + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selected];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) return (
    <div style={menuStyle}>
      <div style={{ padding: "8px 12px", ...monoMuted, fontSize: "12px" }}>No results</div>
    </div>
  );

  return (
    <div style={menuStyle}>
      {items.map((item, i) => (
        <button
          key={item.title}
          onMouseDown={(e) => { e.preventDefault(); command(item); }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            width: "100%", padding: "8px 12px", border: "none",
            background: i === selected ? "color-mix(in srgb, var(--violet-mid) 18%, transparent)" : "transparent",
            borderRadius: "4px", cursor: "pointer", textAlign: "left",
          }}
          onMouseEnter={() => setSelected(i)}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--violet-soft)", width: "28px", flexShrink: 0 }}>
            {item.icon}
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)" }}>{item.title}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});
SlashMenu.displayName = "SlashMenu";

const menuStyle: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--gray-800)",
  borderRadius: "8px",
  padding: "4px",
  minWidth: "240px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  zIndex: 9999,
};
const monoMuted: React.CSSProperties = { fontFamily: "var(--font-mono)", color: "var(--text-muted)" };

// ── Slash command state (shared with extension via module-level ref) ───────────
type SlashState = {
  items: CommandItem[];
  range: Range;
  clientRect: (() => DOMRect | null) | null;
} | null;

// We use a module-level registry so the Tiptap extension can poke React state.
// This is safe because there's only one editor instance on the page at a time.
const slashRegistry = {
  setState: null as ((s: SlashState) => void) | null,
  menuRef: null as React.RefObject<SlashMenuRef | null> | null,
};

// ── Slash command Tiptap extension ─────────────────────────────────────────────
const SlashCommandExtension = Extension.create({
  name: "slashCommand",
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }) => {
          (props as CommandItem).command(editor, range);
        },
        items: ({ query }) => filterCommands(query),
        render: () => ({
          onStart: (props) => {
            slashRegistry.setState?.({
              items: props.items as CommandItem[],
              range: props.range,
              clientRect: props.clientRect ?? null,
            });
          },
          onUpdate: (props) => {
            slashRegistry.setState?.({
              items: props.items as CommandItem[],
              range: props.range,
              clientRect: props.clientRect ?? null,
            });
          },
          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              slashRegistry.setState?.(null);
              return true;
            }
            return slashRegistry.menuRef?.current?.onKeyDown(props.event) ?? false;
          },
          onExit: () => {
            slashRegistry.setState?.(null);
          },
        }),
      }),
    ];
  },
});

// ── Slash popup (positioned near cursor) ──────────────────────────────────────
function SlashPopup({ editorEl }: { editorEl: HTMLDivElement | null }) {
  const [state, setState] = useState<SlashState>(null);
  const stateRef = useRef<SlashState>(null);
  const menuRef = useRef<SlashMenuRef | null>(null);

  const setSlashState = useCallback((s: SlashState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  useEffect(() => {
    slashRegistry.setState = setSlashState;
    slashRegistry.menuRef = menuRef;
    return () => {
      slashRegistry.setState = null;
      slashRegistry.menuRef = null;
    };
  }, [setSlashState]);

  if (!state || !state.clientRect) return null;

  const rect = state.clientRect();
  if (!rect || !editorEl) return null;

  const editorRect = editorEl.getBoundingClientRect();
  const top = rect.bottom - editorRect.top + editorEl.scrollTop + 4;
  const left = Math.max(0, rect.left - editorRect.left);

  return (
    <div style={{ position: "absolute", top, left, zIndex: 9999 }}>
      <SlashMenu
        ref={menuRef}
        items={state.items}
        command={(item) => {
          const editor = (window as any).__tiptapEditorRef?.current;
          const range = stateRef.current?.range;
          setSlashState(null);
          if (editor && range) item.command(editor, range);
        }}
      />
    </div>
  );
}

// ── Preview ────────────────────────────────────────────────────────────────────
// Renders inside the actual `.blog-post-body` class, so the preview
// is visually identical to what /blog/<slug> publishes. The title
// uses the shared title-accent helper so the highlight colour matches
// whatever the author picked.
function previewTitle(title: string, accent: TitleAccent): string {
  return highlightTitleFragments(escapeTitleHTML(title), accent);
}

function BlogPreview({
  title,
  excerpt,
  html,
  coverUrl,
  accent,
}: {
  title: string;
  excerpt: string;
  html: string;
  coverUrl: string;
  accent: TitleAccent;
}) {
  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 16px" }}>
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt=""
          style={{
            width: "100%",
            borderRadius: "6px",
            marginBottom: "2rem",
            maxHeight: "360px",
            objectFit: "cover",
            border: "1px solid var(--gray-800)",
          }}
        />
      )}
      <h1
        className="blog-post-title"
        dangerouslySetInnerHTML={{
          __html: title
            ? previewTitle(title, accent)
            : '<span style="color:var(--text-muted)">Untitled</span>',
        }}
      />
      {excerpt && (
        <p
          className="blog-post-excerpt"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {excerpt}
        </p>
      )}
      <div
        style={{
          height: "1px",
          background: "var(--gray-800)",
          margin: "32px 0",
        }}
      />
      <div
        className="blog-post-body"
        dangerouslySetInnerHTML={{
          __html:
            html ||
            '<p style="color:var(--text-muted)">No content.</p>',
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BlogEditor({ post, mode }: Props) {
  const router = useRouter();
  const coverRef = useRef<HTMLInputElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [titleAccent, setTitleAccent] = useState<TitleAccent>(() => {
    const saved = post?.title_accent ?? null;
    return saved && saved in TITLE_ACCENTS
      ? (saved as TitleAccent)
      : DEFAULT_TITLE_ACCENT;
  });
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? "");
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false);
  const [showOnWriting, setShowOnWriting] = useState(post?.show_on_writing ?? true);
  const [tagsStr, setTagsStr] = useState((post?.tags ?? []).join(", "));
  const isProjectPost = !!post?.project_id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const scheduleAutoSave = useCallback(
    (content: JSONContent) => {
      if (mode !== "edit" || !post) return;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from("posts").update({ content: content as any }).eq("id", post.id);
        setLastSaved(new Date());
      }, 3000);
    },
    [mode, post]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      // Filename travels as a node attribute and serializes to
      // `<pre data-filename="...">`. The reader picks it up from there
      // (see applyCodeHighlighting in blog/[slug]/page.tsx).
      CodeBlockLowlight.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            filename: {
              default: null,
              parseHTML: (el) =>
                (el as HTMLElement).getAttribute("data-filename") || null,
              renderHTML: (attrs) => {
                const f = (attrs as { filename?: string | null }).filename;
                return f ? { "data-filename": f } : {};
              },
            },
          };
        },
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockView);
        },
      }).configure({ lowlight }),
      // Images render as <figure class="blog-figure"><img/><figcaption>
      // alt</figcaption></figure> on serialization, matching the
      // reader 1:1. The node view shows the same structure live.
      TiptapImage.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              renderHTML: (a) => (a.width ? { width: a.width } : {}),
            },
          };
        },
        renderHTML({ HTMLAttributes }) {
          const { alt, ...rest } = HTMLAttributes as {
            alt?: string;
            [k: string]: unknown;
          };
          const caption = (alt ?? "").toString();
          return [
            "figure",
            { class: "blog-figure" },
            ["img", { ...rest, alt: caption }],
            ...(caption ? [["figcaption", {}, caption] as const] : []),
          ];
        },
        addNodeView() {
          return ReactNodeViewRenderer(ImageView);
        },
      }).configure({ inline: false, allowBase64: false }),
      TiptapUnderline,
      Highlight.configure({ multicolor: false }),
      HorizontalRule,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: "Start writing… or type / for commands",
        includeChildren: true,
      }),
      SlashCommandExtension,
    ],
    content: post?.content ?? undefined,
    editorProps: {
      // Use the public reader class directly so every .blog-post-body
      // rule (h2 `##` prefix, labelled blockquote, figure caption,
      // etc.) renders live in the editor. The editor-specific tweaks
      // live under the .blog-editor-surface modifier.
      attributes: {
        class: "blog-post-body blog-editor-surface",
        spellcheck: "true",
      },
      handlePaste(view, event) {
        const files = event.clipboardData?.files;
        if (files?.length) {
          const file = files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadImage(file).then((url) => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image!.create({ src: url })
                )
              );
            });
            return true;
          }
        }
        return false;
      },
      handleDrop(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            uploadImage(file).then((url) => {
              view.dispatch(
                view.state.tr.insert(
                  pos?.pos ?? 0,
                  view.state.schema.nodes.image!.create({ src: url })
                )
              );
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      scheduleAutoSave(editor.getJSON());
    },
  });

  // Expose editor to slash command callbacks
  useEffect(() => {
    (window as any).__tiptapEditorRef = { current: editor };
  }, [editor]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      delete (window as any).__tiptapEditorRef;
    };
  }, []);

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    try {
      const url = await uploadImage(file);
      setCoverUrl(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
    setUploadingCover(false);
  };

  const handlePreview = () => {
    const content = editor?.getJSON();
    if (content) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Keep the preview extensions in lockstep with the live editor
        // so what `preview` shows is byte-identical to what gets saved
        // and then rendered on /blog/<slug>.
        const html = generateHTML(content, [
          StarterKit.configure({ codeBlock: false }),
          CodeBlockLowlight.extend({
            addAttributes() {
              return {
                ...this.parent?.(),
                filename: {
                  default: null,
                  renderHTML: (attrs) => {
                    const f = (attrs as { filename?: string | null }).filename;
                    return f ? { "data-filename": f } : {};
                  },
                },
              };
            },
          }).configure({ lowlight }),
          TiptapImage.extend({
            addAttributes() {
              return {
                ...this.parent?.(),
                width: {
                  default: null,
                  renderHTML: (a) => (a.width ? { width: a.width } : {}),
                },
              };
            },
            renderHTML({ HTMLAttributes }) {
              const { alt, ...rest } = HTMLAttributes as {
                alt?: string;
                [k: string]: unknown;
              };
              const caption = (alt ?? "").toString();
              return [
                "figure",
                { class: "blog-figure" },
                ["img", { ...rest, alt: caption }],
                ...(caption ? [["figcaption", {}, caption] as const] : []),
              ];
            },
          }),
          TiptapUnderline,
          Highlight,
          HorizontalRule,
          Link.configure({ openOnClick: false }),
        ] as any);
        setPreviewHtml(html);
      } catch {
        setPreviewHtml("<p>Could not render preview.</p>");
      }
    }
    setShowPreview(true);
  };

  const handleSave = async (publish?: boolean) => {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const shouldPublish = publish !== undefined ? publish : isPublished;
    const slug = mode === "new" ? slugify(title) : post!.slug;
    const content = editor?.getJSON() ?? null;

    const payload = {
      title: title.trim(), slug,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: content as any,
      excerpt: excerpt.trim() || null,
      cover_image_url: coverUrl || null,
      is_published: shouldPublish,
      published_at: shouldPublish && !post?.published_at
        ? new Date().toISOString()
        : post?.published_at ?? null,
      show_on_writing: showOnWriting,
      tags: tagsStr
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      // Store the default as NULL so the DB stays sparse and older
      // rows don't need a one-off backfill.
      title_accent: titleAccent === DEFAULT_TITLE_ACCENT ? null : titleAccent,
    };

    const { error: dbError } = mode === "new"
      ? await supabase.from("posts").insert(payload)
      : await supabase.from("posts").update(payload).eq("id", post!.id);

    if (dbError) { setError(dbError.message); setSaving(false); return; }
    setIsPublished(shouldPublish);
    setLastSaved(new Date());
    setSaving(false);
    if (mode === "new") { router.push("/admin/blog"); router.refresh(); }
    else router.refresh();
  };

  const handleDelete = async () => {
    if (!post || !confirm("Delete this post?")) return;
    await createClient().from("posts").delete().eq("id", post.id);
    router.push("/admin/blog");
    router.refresh();
  };

  const inputSt: React.CSSProperties = { background: "var(--bg-surface)", border: "1px solid var(--gray-800)", borderRadius: "4px", color: "var(--text-primary)" };
  const labelSt: React.CSSProperties = { color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" };
  const btnMuted: React.CSSProperties = { color: "var(--text-muted)", border: "1px solid var(--gray-800)", borderRadius: "4px", background: "transparent", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "13px" };

  if (showPreview) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
          style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--gray-800)" }}>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>preview</span>
          <button onClick={() => setShowPreview(false)} className="font-mono text-[12px] px-3 py-1" style={btnMuted}>
            ← back to editor
          </button>
        </div>
        <BlogPreview
          title={title}
          excerpt={excerpt}
          html={previewHtml}
          coverUrl={coverUrl}
          accent={titleAccent}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] flex flex-col gap-5">
      <style>{`
        /* The editor uses the real .blog-post-body styles from globals
           so WYSIWYG is exact. This block adds ONLY editor-specific
           chrome: the writable outline, the empty-state placeholder,
           and editing affordances on figure/code-block node views. */
        .blog-editor-surface {
          padding: 20px 24px;
          min-height: 380px;
          outline: none;
        }
        .blog-editor-surface p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
          float: left;
          height: 0;
        }
        /* Remove the top-margin from the very first heading/paragraph
           so the first block sits flush with the editor top edge. */
        .blog-editor-surface > :first-child { margin-top: 0; }

        /* Figure caption — borrow the reader's figcaption look but
           give the input a dotted outline on focus so the author can
           see it's editable. */
        .blog-editor-surface .blog-figure figcaption input {
          display: block;
          width: 100%;
          transition: border-color 120ms;
          border-radius: 3px;
        }
        .blog-editor-surface .blog-figure figcaption input::placeholder {
          color: var(--gray-600);
          font-style: italic;
        }
        .blog-editor-surface .blog-figure figcaption input:focus {
          outline: 1px dashed
            color-mix(in srgb, var(--violet-soft) 50%, transparent);
          outline-offset: 2px;
        }

        /* Code block — node view renders .blog-code directly so the
           reader styles apply; only the header dropdown/input needs
           a bit of editor-specific polish. */
        .blog-editor-surface .blog-code .blog-code-head select:focus {
          outline: 1px dashed
            color-mix(in srgb, var(--violet-soft) 50%, transparent);
          outline-offset: 2px;
          border-radius: 3px;
        }

        /* Bubble menu ---------------------------------------------- */
        .bubble-menu {
          display: flex; align-items: center; gap: 1px; padding: 3px;
          background: var(--bg-elevated);
          border: 1px solid var(--gray-800);
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .bubble-btn {
          padding: 4px 9px; border-radius: 4px;
          font-family: var(--font-mono); font-size: 12px;
          color: var(--text-secondary); background: transparent;
          border: none; cursor: pointer;
          transition: background 120ms, color 120ms;
        }
        .bubble-btn:hover, .bubble-btn.is-active {
          background: var(--violet-mid); color: var(--violet-pale);
        }
      `}</style>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label style={labelSt}>
          Title *
          <span
            className="ml-2 normal-case tracking-normal"
            style={{ color: "var(--gray-600)" }}
          >
            — wrap words in __double-underscores__ to accent them
          </span>
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title — e.g. serving __7B__ on one gpu"
          className="px-3 py-2 text-[20px] font-medium outline-none transition-colors w-full"
          style={{ ...inputSt, fontFamily: "var(--font-body)" }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")}
        />

        {/* Accent colour — one swatch per option in the shared palette.
            The active one has a violet ring + pale check. */}
        <div className="flex items-center gap-2 mt-1">
          <span style={{ ...labelSt, letterSpacing: "0.08em" }}>accent</span>
          {(Object.entries(TITLE_ACCENTS) as Array<[TitleAccent, { label: string; color: string }]>).map(
            ([key, meta]) => {
              const active = titleAccent === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTitleAccent(key)}
                  title={meta.label}
                  className="inline-flex items-center gap-[6px] px-2 py-[5px] transition-colors"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    background: active
                      ? "color-mix(in srgb, var(--violet-mid) 14%, transparent)"
                      : "transparent",
                    border: `1px solid ${active ? "var(--violet-mid)" : "var(--gray-800)"}`,
                    borderRadius: "999px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: meta.color,
                      boxShadow: active ? `0 0 8px ${meta.color}` : "none",
                    }}
                  />
                  {meta.label}
                </button>
              );
            },
          )}
        </div>

        {/__([^_]+)__/.test(title) && (
          <div
            className="blog-post-title"
            style={{
              fontSize: "28px",
              lineHeight: 1.15,
              marginTop: "4px",
            }}
            dangerouslySetInnerHTML={{ __html: previewTitle(title, titleAccent) }}
          />
        )}
      </div>

      {/* Excerpt */}
      <div className="flex flex-col gap-2">
        <label style={labelSt}>Excerpt</label>
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
          rows={2} placeholder="One or two sentences describing this post."
          className="px-3 py-2 text-[14px] outline-none transition-colors w-full resize-y"
          style={{ ...inputSt, fontFamily: "var(--font-body)", lineHeight: "1.6" }}
          onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "var(--violet-mid)")}
          onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "var(--gray-800)")}
        />
      </div>

      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label style={labelSt}>Cover image</label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => coverRef.current?.click()} disabled={uploadingCover}
            className="font-mono text-[12px] px-3 py-2 transition-colors disabled:opacity-50"
            style={{ ...btnMuted, cursor: "pointer" }}>
            {uploadingCover ? "uploading..." : "choose image"}
          </button>
          {coverUrl && <span className="font-mono text-[11px]" style={{ color: "var(--green-bright)" }}>✓ set</span>}
          {coverUrl && (
            <button type="button" onClick={() => setCoverUrl("")} className="font-mono text-[11px] px-2 py-1"
              style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}>
              remove
            </button>
          )}
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="mt-1 rounded object-cover"
            style={{ maxHeight: "140px", border: "1px solid var(--gray-800)" }} />
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <label style={labelSt}>Tags (comma-separated)</label>
        <input
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          placeholder="systems, postgres, papers"
          className="px-3 py-2 text-[13px] font-mono outline-none transition-colors duration-150 w-full"
          style={inputSt}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")}
        />
      </div>

      {/* Writing-page visibility toggle */}
      <div className="flex flex-col gap-2">
        <label style={labelSt}>Writing page visibility</label>
        <label
          className="flex items-center gap-3 cursor-pointer"
          style={{ color: "var(--text-secondary)", fontSize: "13px" }}
        >
          <input
            type="checkbox"
            checked={showOnWriting}
            onChange={(e) => setShowOnWriting(e.target.checked)}
            className="w-4 h-4 accent-violet-500 cursor-pointer"
          />
          <span>
            show in the /writing list and home Writing rail
            {isProjectPost && (
              <span
                className="ml-2 font-mono text-[10px] tracking-[0.08em] uppercase"
                style={{ color: "var(--amber-bright)" }}
              >
                project post · off by default
              </span>
            )}
          </span>
        </label>
      </div>

      <div style={{ height: "1px", background: "var(--gray-800)" }} />

      {/* Editor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label style={labelSt}>Content</label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              type <kbd style={{ background: "var(--bg-elevated)", padding: "1px 4px", borderRadius: "3px", border: "1px solid var(--gray-800)" }}>/</kbd> for commands
            </span>
            <a href="/admin/blog/help" target="_blank"
              className="font-mono text-[11px] transition-colors" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              ? reference
            </a>
          </div>
        </div>

        {/* Editor wrapper — position:relative so the slash popup is positioned inside it */}
        <div ref={editorWrapperRef} className="rounded-[6px]"
          style={{ border: "1px solid var(--gray-800)", background: "var(--bg-surface)", minHeight: "420px", position: "relative" }}>

          {editor && (
            <BubbleMenu editor={editor} className="bubble-menu">
              {(
                [
                  { mark: "bold", label: "B", cmd: () => editor.chain().focus().toggleBold().run(), style: { fontWeight: 700 } },
                  { mark: "italic", label: "I", cmd: () => editor.chain().focus().toggleItalic().run(), style: { fontStyle: "italic" } },
                  { mark: "underline", label: "U", cmd: () => editor.chain().focus().toggleUnderline().run(), style: { textDecoration: "underline" } },
                  { mark: "code", label: "<>", cmd: () => editor.chain().focus().toggleCode().run(), style: { fontFamily: "var(--font-mono)" } },
                  { mark: "highlight", label: "▐", cmd: () => editor.chain().focus().toggleHighlight().run(), style: {} },
                ] as Array<{ mark: string; label: string; cmd: () => void; style: React.CSSProperties }>
              ).map(({ mark, label, cmd, style }) => (
                <button
                  key={mark}
                  onMouseDown={(e) => { e.preventDefault(); cmd(); }}
                  className={`bubble-btn${editor.isActive(mark) ? " is-active" : ""}`}
                  style={style}
                >
                  {label}
                </button>
              ))}
              {/* Link — separate because the action is bimodal: add/edit
                  if no link on selection, remove if link is active. */}
              <button
                key="link"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (editor.isActive("link")) {
                    editor.chain().focus().unsetLink().run();
                    return;
                  }
                  const current = (editor.getAttributes("link") as { href?: string }).href ?? "";
                  const url = window.prompt("URL", current || "https://");
                  if (url === null) return;
                  if (url === "") {
                    editor.chain().focus().unsetLink().run();
                    return;
                  }
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: url })
                    .run();
                }}
                className={`bubble-btn${editor.isActive("link") ? " is-active" : ""}`}
                title={editor.isActive("link") ? "Remove link" : "Add link"}
              >
                ↗
              </button>
            </BubbleMenu>
          )}

          <EditorContent editor={editor} />

          {/* Slash command popup — absolutely positioned inside the editor wrapper */}
          <SlashPopup editorEl={editorWrapperRef.current} />
        </div>

        {lastSaved && (
          <p className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
            saved {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <p className="font-mono text-[12px]" style={{ color: "oklch(0.704 0.191 22.216)" }}>{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 flex-wrap">
        <button onClick={() => handleSave(true)} disabled={saving || !title.trim()}
          className="font-mono text-[13px] px-5 py-2 transition-all hover:-translate-y-[1px] disabled:opacity-50"
          style={{ background: "var(--violet-mid)", color: "var(--violet-pale)", borderRadius: "4px", border: "none", cursor: "pointer" }}>
          {saving ? "saving..." : isPublished ? "save" : "publish"}
        </button>

        <button onClick={handlePreview} className="font-mono text-[13px] px-5 py-2 transition-all" style={btnMuted}>
          preview
        </button>

        {isPublished && (
          <button onClick={() => handleSave(false)} disabled={saving}
            className="font-mono text-[13px] px-5 py-2 transition-all disabled:opacity-50"
            style={{ color: "var(--amber-bright)", border: "1px solid color-mix(in srgb, var(--amber-bright) 30%, transparent)", borderRadius: "4px", background: "transparent", cursor: "pointer", fontFamily: "var(--font-mono)" }}>
            unpublish
          </button>
        )}
        {!isPublished && mode === "edit" && (
          <button onClick={() => handleSave(false)} disabled={saving}
            className="font-mono text-[13px] px-5 py-2 transition-all disabled:opacity-50" style={btnMuted}>
            save draft
          </button>
        )}
        <button onClick={() => router.back()} className="font-mono text-[13px] px-5 py-2 transition-all" style={btnMuted}>
          cancel
        </button>
        {mode === "edit" && (
          <button onClick={handleDelete} className="font-mono text-[13px] px-5 py-2 ml-auto transition-all"
            style={{ color: "oklch(0.704 0.191 22.216)", border: "1px solid color-mix(in srgb, oklch(0.704 0.191 22.216) 30%, transparent)", borderRadius: "4px", background: "transparent", cursor: "pointer", fontFamily: "var(--font-mono)" }}>
            delete post
          </button>
        )}
      </div>
    </div>
  );
}
