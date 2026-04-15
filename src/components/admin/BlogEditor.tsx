"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapImage from "@tiptap/extension-image";
import type { JSONContent } from "@tiptap/core";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

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

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: false }),
      Placeholder.configure({
        placeholder: "Start writing... Use / for commands",
        includeChildren: true,
      }),
    ],
    content: post?.content ?? undefined,
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      scheduleAutoSave(json);
    },
  });

  const scheduleAutoSave = useCallback(
    (newContent: JSONContent) => {
      if (mode !== "edit" || !post) return;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        const supabase = createClient();
        await supabase
          .from("posts")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update({ content: newContent as any })
          .eq("id", post.id);
        setLastSaved(new Date());
      }, 3000);
    },
    [mode, post]
  );

  // Cleanup on unmount
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

    if (uploadError) {
      setError(uploadError.message);
      setUploadingCover(false);
      return;
    }

    const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    setUploadingCover(false);
  };

  const handleSave = async (publish?: boolean) => {
    setSaving(true);
    setError("");

    const supabase = createClient();
    const shouldPublish = publish !== undefined ? publish : isPublished;
    const slug = mode === "new" ? slugify(title) : post!.slug;
    const content = editor?.getJSON() ?? null;

    const payload = {
      title: title.trim(),
      slug,
      content,
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
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("posts")
        .update(payload)
        .eq("id", post!.id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setIsPublished(shouldPublish);
    setLastSaved(new Date());
    setSaving(false);

    if (mode === "new") {
      router.push("/admin/blog");
      router.refresh();
    } else {
      router.refresh();
    }
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

  return (
    <div className="max-w-[800px] flex flex-col gap-5">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="px-3 py-2 text-[20px] font-medium outline-none transition-colors duration-150 w-full"
          style={{ ...inputStyle, fontFamily: "var(--font-body)" }}
          onFocus={(e) =>
            ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")
          }
          onBlur={(e) =>
            ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")
          }
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
          onFocus={(e) =>
            ((e.target as HTMLTextAreaElement).style.borderColor = "var(--violet-mid)")
          }
          onBlur={(e) =>
            ((e.target as HTMLTextAreaElement).style.borderColor = "var(--gray-800)")
          }
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
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--gray-800)",
              borderRadius: "4px",
              background: "var(--bg-surface)",
              cursor: "pointer",
            }}
          >
            {uploadingCover ? "uploading..." : "choose image"}
          </button>
          {coverUrl && (
            <span
              className="font-mono text-[11px]"
              style={{ color: "var(--green-bright)" }}
            >
              ✓ set
            </span>
          )}
        </div>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadCover(file);
          }}
        />
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="mt-1 rounded object-cover"
            style={{ maxHeight: "140px", border: "1px solid var(--gray-800)" }}
          />
        )}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--gray-800)" }} />

      {/* Tiptap editor */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Content</label>
        <div
          className="rounded-[6px] overflow-hidden"
          style={{
            border: "1px solid var(--gray-800)",
            background: "var(--bg-surface)",
            minHeight: "420px",
          }}
        >
          <style>{`
            .prose-editor {
              padding: 20px 24px;
              min-height: 380px;
              color: var(--text-primary);
              font-family: var(--font-body);
              font-size: 15px;
              line-height: 1.75;
            }
            .prose-editor p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              color: var(--text-muted);
              pointer-events: none;
              float: left;
              height: 0;
            }
            .prose-editor h1, .prose-editor h2, .prose-editor h3 {
              color: var(--text-primary);
              font-family: var(--font-display);
              margin-top: 1.5em;
              margin-bottom: 0.3em;
              font-weight: 500;
            }
            .prose-editor h1 { font-size: 26px; }
            .prose-editor h2 { font-size: 20px; }
            .prose-editor h3 { font-size: 17px; }
            .prose-editor p { margin-bottom: 1em; }
            .prose-editor strong { color: var(--text-primary); font-weight: 600; }
            .prose-editor em { color: var(--text-secondary); }
            .prose-editor a { color: var(--violet-soft); text-decoration: underline; }
            .prose-editor code {
              font-family: var(--font-mono);
              font-size: 13px;
              background: var(--bg-elevated);
              color: var(--amber-bright);
              padding: 2px 6px;
              border-radius: 3px;
              border: 1px solid var(--gray-800);
            }
            .prose-editor pre {
              background: var(--bg-elevated);
              border: 1px solid var(--gray-800);
              border-radius: 6px;
              padding: 16px;
              overflow-x: auto;
              margin-bottom: 1em;
            }
            .prose-editor pre code {
              background: transparent;
              border: none;
              padding: 0;
              color: var(--text-primary);
              font-size: 13px;
            }
            .prose-editor blockquote {
              border-left: 2px solid var(--violet-mid);
              padding-left: 1.25em;
              color: var(--text-secondary);
              font-style: italic;
              margin: 1.25em 0;
            }
            .prose-editor ul, .prose-editor ol {
              padding-left: 1.5em;
              margin-bottom: 1em;
            }
            .prose-editor li { color: var(--text-secondary); margin-bottom: 0.3em; }
            .prose-editor img { max-width: 100%; border-radius: 6px; margin: 1em 0; }
            .prose-editor hr { border: none; height: 1px; background: var(--gray-800); margin: 1.5em 0; }
          `}</style>
          <EditorContent editor={editor} />
        </div>
        {lastSaved && (
          <p className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
            saved {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <p
          className="font-mono text-[12px]"
          style={{ color: "oklch(0.704 0.191 22.216)" }}
        >
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 flex-wrap">
        <button
          onClick={() => handleSave(true)}
          disabled={saving || !title.trim()}
          className="font-mono text-[13px] px-5 py-2 transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50"
          style={{
            background: "var(--violet-mid)",
            color: "var(--violet-pale)",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {saving ? "saving..." : isPublished ? "save" : "publish"}
        </button>

        {isPublished && (
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="font-mono text-[13px] px-5 py-2 transition-all duration-200 disabled:opacity-50"
            style={{
              color: "var(--amber-bright)",
              border:
                "1px solid color-mix(in srgb, var(--amber-bright) 30%, transparent)",
              borderRadius: "4px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            unpublish
          </button>
        )}

        {!isPublished && mode === "edit" && (
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="font-mono text-[13px] px-5 py-2 transition-all duration-200 disabled:opacity-50"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--gray-800)",
              borderRadius: "4px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            save draft
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="font-mono text-[13px] px-5 py-2 transition-all duration-200"
          style={{
            color: "var(--text-muted)",
            border: "1px solid var(--gray-800)",
            borderRadius: "4px",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          cancel
        </button>

        {mode === "edit" && (
          <button
            onClick={handleDelete}
            className="font-mono text-[13px] px-5 py-2 ml-auto transition-all duration-200"
            style={{
              color: "oklch(0.704 0.191 22.216)",
              border:
                "1px solid color-mix(in srgb, oklch(0.704 0.191 22.216) 30%, transparent)",
              borderRadius: "4px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            delete post
          </button>
        )}
      </div>
    </div>
  );
}
