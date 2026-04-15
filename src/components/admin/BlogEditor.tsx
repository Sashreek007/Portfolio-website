"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandItem,
  EditorCommandList,
  EditorCommandEmpty,
  EditorBubble,
  EditorBubbleItem,
  StarterKit,
  TiptapImage,
  Placeholder,
  CodeBlockLowlight,
  TiptapUnderline,
  HighlightExtension,
  HorizontalRule,
  createSuggestionItems,
  handleCommandNavigation,
  createImageUpload,
  handleImagePaste,
  handleImageDrop,
  Command,
  renderItems,
  useEditor,
} from "novel";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

type Post = {
  id: string;
  title: string;
  slug: string;
  content: JSONContent | null;
  excerpt: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
};

type Props = {
  post?: Post;
  mode: "new" | "edit";
};

// ── Image upload via Supabase Storage ───────────────────────────────────────
async function uploadImageToSupabase(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `inline/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("blog-media")
    .upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
  return data.publicUrl;
}

const uploadFn = createImageUpload({
  onUpload: uploadImageToSupabase,
  validateFn: (file) => {
    if (!file.type.startsWith("image/")) return false;
    if (file.size > 20 * 1024 * 1024) return false;
    return true;
  },
});

// ── Slash command suggestions ────────────────────────────────────────────────
const S = (t: string) => <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", minWidth: "18px", display: "inline-block" }}>{t}</span>;

const suggestionItems = createSuggestionItems([
  {
    title: "Text",
    description: "Plain paragraph",
    icon: S("¶"),
    searchTerms: ["p", "paragraph"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: S("H1"),
    searchTerms: ["h1", "heading", "title"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: S("H2"),
    searchTerms: ["h2", "subheading"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small heading",
    icon: S("H3"),
    searchTerms: ["h3"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Unordered list",
    icon: S("•—"),
    searchTerms: ["ul", "list", "bullet"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered list",
    icon: S("1."),
    searchTerms: ["ol", "numbered", "ordered"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Code Block",
    description: "Fenced code with syntax highlighting",
    icon: S("</>"),
    searchTerms: ["code", "pre", "snippet", "codeblock"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: "Blockquote",
    description: "Indented quote block",
    icon: S("❝"),
    searchTerms: ["quote", "blockquote"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setBlockquote().run(),
  },
  {
    title: "Divider",
    description: "Horizontal rule",
    icon: S("—"),
    searchTerms: ["hr", "divider", "separator", "rule"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Image",
    description: "Upload an image from your computer",
    icon: S("▣"),
    searchTerms: ["img", "image", "upload", "photo"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
          const url = await uploadImageToSupabase(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch {
          // silently fail
        }
      };
      input.click();
    },
  },
]);

// ── Preview renderer ──────────────────────────────────────────────────────────
function BlogPreview({ title, excerpt, html, coverUrl }: {
  title: string;
  excerpt: string;
  html: string;
  coverUrl: string;
}) {
  return (
    <div className="max-w-[720px] mx-auto py-10 px-4">
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt=""
          className="w-full rounded-[6px] mb-8 object-cover"
          style={{ maxHeight: "360px", border: "1px solid var(--gray-800)" }}
        />
      )}
      <h1
        className="text-[32px] font-medium leading-[1.25] mb-4"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
      >
        {title || <span style={{ color: "var(--text-muted)" }}>Untitled</span>}
      </h1>
      {excerpt && (
        <p className="text-[16px] leading-[1.7] mb-8" style={{ color: "var(--text-secondary)" }}>
          {excerpt}
        </p>
      )}
      <div style={{ height: "1px", background: "var(--gray-800)", marginBottom: "2rem" }} />
      <div
        className="prose-preview"
        dangerouslySetInnerHTML={{ __html: html || "<p style='color:var(--text-muted)'>No content yet.</p>" }}
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "16px", lineHeight: "1.8" }}
      />
      <style>{`
        .prose-preview h1,.prose-preview h2,.prose-preview h3{color:var(--text-primary);font-family:var(--font-mono);margin-top:2em;margin-bottom:0.5em;line-height:1.3}
        .prose-preview h1{font-size:26px}.prose-preview h2{font-size:20px}.prose-preview h3{font-size:17px}
        .prose-preview p{margin-bottom:1.25em}
        .prose-preview a{color:var(--violet-soft);text-decoration:underline}
        .prose-preview strong{color:var(--text-primary);font-weight:600}
        .prose-preview em{color:var(--text-secondary);font-style:italic}
        .prose-preview code{font-family:var(--font-mono);font-size:13px;background:var(--bg-elevated);color:var(--amber-bright);padding:2px 6px;border-radius:3px;border:1px solid var(--gray-800)}
        .prose-preview pre{background:var(--bg-elevated);border:1px solid var(--gray-800);border-radius:6px;padding:20px;overflow-x:auto;margin-bottom:1.25em}
        .prose-preview pre code{background:transparent;border:none;padding:0;color:var(--text-primary);font-size:13px;line-height:1.7}
        .prose-preview ul,.prose-preview ol{padding-left:1.5em;margin-bottom:1.25em}
        .prose-preview li{margin-bottom:0.4em;color:var(--text-secondary)}
        .prose-preview blockquote{border-left:2px solid var(--violet-mid);padding-left:1.25em;margin:1.5em 0;color:var(--text-secondary);font-style:italic}
        .prose-preview img{max-width:100%;border-radius:6px;border:1px solid var(--gray-800);margin:1.5em 0}
        .prose-preview hr{border:none;height:1px;background:var(--gray-800);margin:2em 0}
      `}</style>
    </div>
  );
}

// ── Bubble button (reads active state via useEditor hook) ────────────────────
function BubbleBtn({
  mark, label, onSelect, italic: isItalic, underline: isUnderline, mono,
}: {
  mark: string;
  label: string;
  onSelect: (editor: NonNullable<ReturnType<typeof useEditor>["editor"]>) => void;
  italic?: boolean;
  underline?: boolean;
  mono?: boolean;
}) {
  const { editor } = useEditor();
  const active = editor?.isActive(mark) ?? false;
  return (
    <EditorBubbleItem onSelect={() => editor && onSelect(editor)}>
      <button
        className={`bubble-btn${active ? " active" : ""}`}
        style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
      >
        {isItalic ? <em>{label}</em> : isUnderline ? <u>{label}</u> : label}
      </button>
    </EditorBubbleItem>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
export default function BlogEditor({ post, mode }: Props) {
  const router = useRouter();
  const coverRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? "");
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const contentRef = useRef<JSONContent | null>(post?.content ?? null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const scheduleAutoSave = useCallback(
    (newContent: JSONContent) => {
      contentRef.current = newContent;
      if (mode !== "edit" || !post) return;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from("posts").update({ content: newContent as any }).eq("id", post.id);
        setLastSaved(new Date());
      }, 3000);
    },
    [mode, post]
  );

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `covers/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("blog-media")
      .upload(path, file, { upsert: true });
    if (uploadError) { setError(uploadError.message); setUploadingCover(false); return; }
    const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    setUploadingCover(false);
  };

  const handlePreview = () => {
    const content = contentRef.current;
    if (content) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const html = generateHTML(content, [StarterKit, TiptapImage, HorizontalRule] as any);
        setPreviewHtml(html);
      } catch {
        setPreviewHtml("<p>Could not render preview.</p>");
      }
    } else {
      setPreviewHtml("");
    }
    setShowPreview(true);
  };

  const handleSave = async (publish?: boolean) => {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const shouldPublish = publish !== undefined ? publish : isPublished;
    const slug = mode === "new" ? slugify(title) : post!.slug;
    const content = contentRef.current;

    const payload = {
      title: title.trim(),
      slug,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: content as any,
      excerpt: excerpt.trim() || null,
      cover_image_url: coverUrl || null,
      is_published: shouldPublish,
      published_at:
        shouldPublish && !post?.published_at
          ? new Date().toISOString()
          : post?.published_at ?? null,
    };

    if (mode === "new") {
      const { error } = await supabase.from("posts").insert(payload);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("posts").update(payload).eq("id", post!.id);
      if (error) { setError(error.message); setSaving(false); return; }
    }

    setIsPublished(shouldPublish);
    setLastSaved(new Date());
    setSaving(false);
    if (mode === "new") { router.push("/admin/blog"); router.refresh(); }
    else { router.refresh(); }
  };

  const handleDelete = async () => {
    if (!post || !confirm("Delete this post?")) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", post.id);
    router.push("/admin/blog");
    router.refresh();
  };

  const inputStyle = {
    background: "var(--bg-surface)",
    border: "1px solid var(--gray-800)",
    borderRadius: "4px",
    color: "var(--text-primary)",
  };
  const labelStyle = {
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
  };
  const btnMuted = {
    color: "var(--text-muted)",
    border: "1px solid var(--gray-800)",
    borderRadius: "4px",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
  };

  // ── Preview overlay ──────────────────────────────────────────────────────────
  if (showPreview) {
    return (
      <div className="flex flex-col">
        <div
          className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
          style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--gray-800)" }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
            preview
          </span>
          <button
            onClick={() => setShowPreview(false)}
            className="font-mono text-[12px] px-3 py-1 transition-colors duration-150"
            style={btnMuted}
          >
            ← back to editor
          </button>
        </div>
        <BlogPreview title={title} excerpt={excerpt} html={previewHtml} coverUrl={coverUrl} />
      </div>
    );
  }

  // ── Editor ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[800px] flex flex-col gap-5">
      <style>{`
        /* Novel editor container */
        .novel-editor-wrapper .tiptap {
          padding: 20px 24px;
          min-height: 380px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.75;
          outline: none;
        }
        .novel-editor-wrapper .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
          float: left;
          height: 0;
        }
        .novel-editor-wrapper .tiptap h1,.novel-editor-wrapper .tiptap h2,.novel-editor-wrapper .tiptap h3 {
          color: var(--text-primary);
          font-family: var(--font-mono);
          margin-top: 1.5em;
          margin-bottom: 0.3em;
          font-weight: 500;
        }
        .novel-editor-wrapper .tiptap h1{font-size:26px}
        .novel-editor-wrapper .tiptap h2{font-size:20px}
        .novel-editor-wrapper .tiptap h3{font-size:17px}
        .novel-editor-wrapper .tiptap p{margin-bottom:1em}
        .novel-editor-wrapper .tiptap strong{color:var(--text-primary);font-weight:600}
        .novel-editor-wrapper .tiptap em{color:var(--text-secondary)}
        .novel-editor-wrapper .tiptap a{color:var(--violet-soft);text-decoration:underline}
        .novel-editor-wrapper .tiptap code{
          font-family:var(--font-mono);font-size:13px;
          background:var(--bg-elevated);color:var(--amber-bright);
          padding:2px 6px;border-radius:3px;border:1px solid var(--gray-800)
        }
        .novel-editor-wrapper .tiptap pre{
          background:var(--bg-elevated);border:1px solid var(--gray-800);
          border-radius:6px;padding:16px;overflow-x:auto;margin-bottom:1em
        }
        .novel-editor-wrapper .tiptap pre code{
          background:transparent;border:none;padding:0;
          color:var(--text-primary);font-size:13px
        }
        .novel-editor-wrapper .tiptap blockquote{
          border-left:2px solid var(--violet-mid);padding-left:1.25em;
          color:var(--text-secondary);font-style:italic;margin:1.25em 0
        }
        .novel-editor-wrapper .tiptap ul,.novel-editor-wrapper .tiptap ol{padding-left:1.5em;margin-bottom:1em}
        .novel-editor-wrapper .tiptap li{color:var(--text-secondary);margin-bottom:0.3em}
        .novel-editor-wrapper .tiptap img{max-width:100%;border-radius:6px;margin:1em 0;border:1px solid var(--gray-800)}
        .novel-editor-wrapper .tiptap hr{border:none;height:1px;background:var(--gray-800);margin:1.5em 0}
        /* Slash command menu */
        .novel-slash-menu {
          background: var(--bg-elevated);
          border: 1px solid var(--gray-800);
          border-radius: 6px;
          padding: 4px;
          min-width: 220px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          font-family: var(--font-mono);
        }
        .novel-slash-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 8px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 120ms;
        }
        .novel-slash-item[data-selected="true"],
        .novel-slash-item:hover {
          background: color-mix(in srgb, var(--violet-mid) 15%, transparent);
        }
        .novel-slash-item-title {
          font-size: 13px;
          color: var(--text-primary);
        }
        .novel-slash-item-desc {
          font-size: 11px;
          color: var(--text-muted);
        }
        /* Bubble menu */
        .novel-bubble-menu {
          background: var(--bg-elevated);
          border: 1px solid var(--gray-800);
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 1px;
          padding: 3px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .bubble-btn {
          padding: 4px 8px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 120ms, color 120ms;
        }
        .bubble-btn:hover { background: var(--gray-800); color: var(--text-primary); }
        .bubble-btn.active { background: var(--violet-mid); color: var(--violet-pale); }
      `}</style>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="px-3 py-2 text-[20px] font-medium outline-none transition-colors duration-150 w-full"
          style={{ ...inputStyle, fontFamily: "var(--font-body)" }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")}
        />
      </div>

      {/* Excerpt */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="One or two sentences describing this post."
          className="px-3 py-2 text-[14px] outline-none transition-colors duration-150 w-full resize-y"
          style={{ ...inputStyle, fontFamily: "var(--font-body)", lineHeight: "1.6" }}
          onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "var(--violet-mid)")}
          onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "var(--gray-800)")}
        />
      </div>

      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Cover image</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            disabled={uploadingCover}
            className="font-mono text-[12px] px-3 py-2 transition-colors duration-150 disabled:opacity-50"
            style={{ ...btnMuted, cursor: "pointer" }}
          >
            {uploadingCover ? "uploading..." : "choose image"}
          </button>
          {coverUrl && (
            <span className="font-mono text-[11px]" style={{ color: "var(--green-bright)" }}>✓ set</span>
          )}
          {coverUrl && (
            <button
              type="button"
              onClick={() => setCoverUrl("")}
              className="font-mono text-[11px] px-2 py-1"
              style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
            >
              remove
            </button>
          )}
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }}
        />
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="mt-1 rounded object-cover"
            style={{ maxHeight: "140px", border: "1px solid var(--gray-800)" }}
          />
        )}
      </div>

      <div style={{ height: "1px", background: "var(--gray-800)" }} />

      {/* Novel editor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label style={labelStyle}>Content</label>
          <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
            type <kbd style={{ background: "var(--bg-elevated)", padding: "1px 4px", borderRadius: "3px", border: "1px solid var(--gray-800)" }}>/</kbd> for commands
          </span>
        </div>
        <div
          className="novel-editor-wrapper rounded-[6px] overflow-visible"
          style={{ border: "1px solid var(--gray-800)", background: "var(--bg-surface)", minHeight: "420px" }}
        >
          <EditorRoot>
            <EditorContent
              className="relative"
              initialContent={post?.content ?? undefined}
              extensions={[
                StarterKit.configure({ codeBlock: false }),
                CodeBlockLowlight.configure({ lowlight }),
                TiptapImage.configure({ inline: false, allowBase64: false }),
                TiptapUnderline,
                HighlightExtension,
                HorizontalRule,
                Placeholder.configure({
                  placeholder: "Start writing, or type / to open the command menu...",
                  includeChildren: true,
                }),
                Command.configure({
                  suggestion: {
                    items: () => suggestionItems,
                    render: renderItems,
                  },
                }),
              ]}
              editorProps={{
                handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
                handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
                attributes: { spellcheck: "true" },
              }}
              onUpdate={({ editor }) => {
                scheduleAutoSave(editor.getJSON());
              }}
            >
              {/* Slash command menu */}
              <EditorCommand className="novel-slash-menu z-50">
                <EditorCommandEmpty className="font-mono text-[12px] px-3 py-2" style={{ color: "var(--text-muted)" }}>
                  No results
                </EditorCommandEmpty>
                <EditorCommandList>
                  {suggestionItems.map((item) => (
                    <EditorCommandItem
                      key={item.title}
                      value={item.title}
                      onCommand={item.command!}
                      className="novel-slash-item"
                    >
                      <span className="novel-slash-item-title">{item.title}</span>
                      <span className="novel-slash-item-desc">{item.description}</span>
                    </EditorCommandItem>
                  ))}
                </EditorCommandList>
              </EditorCommand>

              {/* Bubble formatting menu */}
              <EditorBubble
                tippyOptions={{ duration: 100, placement: "top" }}
                className="novel-bubble-menu"
              >
                <BubbleBtn mark="bold" label="B" onSelect={(e) => e.chain().focus().toggleBold().run()} />
                <BubbleBtn mark="italic" label="I" onSelect={(e) => e.chain().focus().toggleItalic().run()} italic />
                <BubbleBtn mark="underline" label="U" onSelect={(e) => e.chain().focus().toggleUnderline().run()} underline />
                <BubbleBtn mark="code" label="<>" onSelect={(e) => e.chain().focus().toggleCode().run()} mono />
                <BubbleBtn mark="highlight" label="▐" onSelect={(e) => e.chain().focus().toggleHighlight().run()} />
              </EditorBubble>
            </EditorContent>
          </EditorRoot>
        </div>
        {lastSaved && (
          <p className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
            saved {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <p className="font-mono text-[12px]" style={{ color: "oklch(0.704 0.191 22.216)" }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 flex-wrap">
        <button
          onClick={() => handleSave(true)}
          disabled={saving || !title.trim()}
          className="font-mono text-[13px] px-5 py-2 transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50"
          style={{ background: "var(--violet-mid)", color: "var(--violet-pale)", borderRadius: "4px", border: "none", cursor: "pointer" }}
        >
          {saving ? "saving..." : isPublished ? "save" : "publish"}
        </button>

        <button
          onClick={handlePreview}
          className="font-mono text-[13px] px-5 py-2 transition-all duration-200"
          style={btnMuted}
        >
          preview
        </button>

        {isPublished && (
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="font-mono text-[13px] px-5 py-2 transition-all duration-200 disabled:opacity-50"
            style={{ color: "var(--amber-bright)", border: "1px solid color-mix(in srgb, var(--amber-bright) 30%, transparent)", borderRadius: "4px", background: "transparent", cursor: "pointer", fontFamily: "var(--font-mono)" }}
          >
            unpublish
          </button>
        )}

        {!isPublished && mode === "edit" && (
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="font-mono text-[13px] px-5 py-2 transition-all duration-200 disabled:opacity-50"
            style={btnMuted}
          >
            save draft
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="font-mono text-[13px] px-5 py-2 transition-all duration-200"
          style={btnMuted}
        >
          cancel
        </button>

        {mode === "edit" && (
          <button
            onClick={handleDelete}
            className="font-mono text-[13px] px-5 py-2 ml-auto transition-all duration-200"
            style={{ color: "oklch(0.704 0.191 22.216)", border: "1px solid color-mix(in srgb, oklch(0.704 0.191 22.216) 30%, transparent)", borderRadius: "4px", background: "transparent", cursor: "pointer", fontFamily: "var(--font-mono)" }}
          >
            delete post
          </button>
        )}
      </div>
    </div>
  );
}

