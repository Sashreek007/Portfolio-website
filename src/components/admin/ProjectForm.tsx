"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/components/site/ProjectCard";
import { buildProjectPostPayload } from "@/lib/project-post";

type FormData = {
  name: string;
  description: string;
  github_url: string;
  demo_url: string;
  stack: string;
  status: "active" | "shipped" | "building";
  year: string;
  is_best: boolean;
  is_current: boolean;
};

type Props = {
  project?: Project;
  mode: "new" | "edit";
};

export default function ProjectForm({ project, mode }: Props) {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(project?.image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(project?.video_url ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: project?.name ?? "",
    description: project?.description ?? "",
    github_url: project?.github_url ?? "",
    demo_url: project?.demo_url ?? "",
    stack: project?.stack.join(", ") ?? "",
    status: project?.status ?? "shipped",
    year: project?.year?.toString() ?? new Date().getFullYear().toString(),
    is_best: project?.is_best ?? false,
    is_current: project?.is_current ?? false,
  });

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadFile = async (
    file: File,
    bucket: string,
    setter: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setter(data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      github_url: form.github_url.trim() || null,
      demo_url: form.demo_url.trim() || null,
      image_url: imageUrl || null,
      video_url: videoUrl || null,
      stack: form.stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: form.status,
      year: form.year ? parseInt(form.year) : null,
      is_best: form.is_best,
      is_current: form.is_current,
    };

    const supabase = createClient();

    if (mode === "new") {
      const { data: inserted, error } = await supabase
        .from("projects")
        .insert({ ...payload, sort_order: 99 })
        .select()
        .single();
      if (error || !inserted) { setError(error?.message ?? "insert failed"); setSaving(false); return; }

      // Auto-create the matching project blog post. Hidden from /writing
      // by default; shown in /blog → Project blogs section.
      const postPayload = buildProjectPostPayload(inserted as Project);
      const { error: postErr } = await supabase.from("posts").insert(postPayload);
      if (postErr) { setError(`project saved, but blog post failed: ${postErr.message}`); setSaving(false); return; }
    } else {
      const { data: updated, error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", project!.id)
        .select()
        .single();
      if (error || !updated) { setError(error?.message ?? "update failed"); setSaving(false); return; }

      // Upsert the linked post. Preserve existing content/published_at/show_on_writing
      // so admin edits aren't clobbered — only sync the project-derived fields.
      const { data: existingPost } = await supabase
        .from("posts")
        .select("id, published_at")
        .eq("project_id", project!.id)
        .maybeSingle();

      const fresh = buildProjectPostPayload(updated as Project, {
        preservePublishedAt: existingPost?.published_at ?? null,
      });

      if (existingPost) {
        // Only sync fields that should track the project — leave content,
        // show_on_writing, and is_published alone to preserve admin edits.
        const { error: postErr } = await supabase
          .from("posts")
          .update({
            title: fresh.title,
            slug: fresh.slug,
            excerpt: fresh.excerpt,
            cover_image_url: fresh.cover_image_url,
          })
          .eq("id", existingPost.id);
        if (postErr) { setError(`project saved, but blog post sync failed: ${postErr.message}`); setSaving(false); return; }
      } else {
        const { error: postErr } = await supabase.from("posts").insert(fresh);
        if (postErr) { setError(`project saved, but blog post create failed: ${postErr.message}`); setSaving(false); return; }
      }
    }

    router.push("/admin/projects");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!project || !confirm("Delete this project?")) return;
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", project.id);
    router.push("/admin/projects");
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
    <div className="max-w-[700px] flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Name *</label>
        <input
          value={form.name}
          onChange={set("name")}
          required
          className="px-3 py-2 text-[14px] outline-none transition-colors duration-150 w-full"
          style={inputStyle}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Description *</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={3}
          required
          className="px-3 py-2 text-[14px] outline-none transition-colors duration-150 w-full resize-y"
          style={{ ...inputStyle, fontFamily: "var(--font-body)", lineHeight: "1.6" }}
          onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "var(--violet-mid)")}
          onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "var(--gray-800)")}
        />
      </div>

      {/* Stack */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Stack (comma-separated)</label>
        <input
          value={form.stack}
          onChange={set("stack")}
          placeholder="Python, FastAPI, PostgreSQL"
          className="px-3 py-2 text-[14px] outline-none transition-colors duration-150 w-full font-mono"
          style={inputStyle}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")}
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>GitHub URL</label>
          <input
            value={form.github_url}
            onChange={set("github_url")}
            className="px-3 py-2 text-[13px] font-mono outline-none transition-colors duration-150 w-full"
            style={inputStyle}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")}
            onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>Demo URL</label>
          <input
            value={form.demo_url}
            onChange={set("demo_url")}
            className="px-3 py-2 text-[13px] font-mono outline-none transition-colors duration-150 w-full"
            style={inputStyle}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")}
            onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")}
          />
        </div>
      </div>

      {/* Status + Year */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>Status</label>
          <select
            value={form.status}
            onChange={set("status")}
            className="px-3 py-2 text-[14px] font-mono outline-none transition-colors duration-150 w-full"
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="shipped">shipped</option>
            <option value="active">active</option>
            <option value="building">building</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>Year</label>
          <input
            type="number"
            value={form.year}
            onChange={set("year")}
            className="px-3 py-2 text-[14px] font-mono outline-none transition-colors duration-150 w-full"
            style={inputStyle}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--violet-mid)")}
            onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--gray-800)")}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        {(["is_best", "is_current"] as const).map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer"
            style={{ color: "var(--text-secondary)", fontSize: "13px" }}
          >
            <input
              type="checkbox"
              checked={form[key] as boolean}
              onChange={set(key)}
              className="w-4 h-4 accent-violet-500 cursor-pointer"
            />
            {key === "is_best" ? "Best work" : "In progress"}
          </label>
        ))}
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Project image</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            disabled={uploadingImage}
            className="font-mono text-[12px] px-3 py-2 transition-colors duration-150 disabled:opacity-50"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--gray-800)",
              borderRadius: "4px",
              background: "var(--bg-surface)",
              cursor: "pointer",
            }}
          >
            {uploadingImage ? "uploading..." : "choose image"}
          </button>
          {imageUrl && (
            <span className="font-mono text-[11px]" style={{ color: "var(--green-bright)" }}>
              ✓ uploaded
            </span>
          )}
        </div>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file, "project-media", setImageUrl, setUploadingImage);
          }}
        />
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="mt-2 rounded object-cover"
            style={{ maxHeight: "160px", border: "1px solid var(--gray-800)" }}
          />
        )}
      </div>

      {/* Video upload */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Demo video (mp4/webm)</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            disabled={uploadingVideo}
            className="font-mono text-[12px] px-3 py-2 transition-colors duration-150 disabled:opacity-50"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--gray-800)",
              borderRadius: "4px",
              background: "var(--bg-surface)",
              cursor: "pointer",
            }}
          >
            {uploadingVideo ? "uploading..." : "choose video"}
          </button>
          {videoUrl && (
            <span className="font-mono text-[11px]" style={{ color: "var(--green-bright)" }}>
              ✓ uploaded
            </span>
          )}
        </div>
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file, "project-media", setVideoUrl, setUploadingVideo);
          }}
        />
      </div>

      {error && (
        <p className="font-mono text-[12px]" style={{ color: "oklch(0.704 0.191 22.216)" }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.description}
          className="font-mono text-[13px] px-5 py-2 transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50"
          style={{
            background: "var(--violet-mid)",
            color: "var(--violet-pale)",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {saving ? "saving..." : mode === "new" ? "create project" : "save changes"}
        </button>
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
              border: "1px solid color-mix(in srgb, oklch(0.704 0.191 22.216) 30%, transparent)",
              borderRadius: "4px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            delete
          </button>
        )}
      </div>
    </div>
  );
}
