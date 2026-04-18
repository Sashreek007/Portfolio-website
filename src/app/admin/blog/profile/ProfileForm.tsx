"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  renderInlineMarkup,
  renderParagraphs,
} from "@/lib/blog-profile";

type Props = {
  initial: { heading: string; body: string };
};

export default function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const [heading, setHeading] = useState(initial.heading);
  const [body, setBody] = useState(initial.body);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("blog_profile")
      .upsert({
        id: 1,
        heading: heading.trim(),
        body: body.trim(),
        updated_at: new Date().toISOString(),
      });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setSaved(new Date());
    setSaving(false);
    router.refresh();
  };

  const inputSt: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--gray-800)",
    borderRadius: "4px",
    color: "var(--text-primary)",
  };
  const labelSt: React.CSSProperties = {
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };

  return (
    <div className="max-w-[760px] flex flex-col gap-6">
      {/* Markup hint */}
      <div
        className="font-mono text-[11px] p-3"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--gray-800)",
          borderRadius: "4px",
          background: "var(--bg-surface)",
        }}
      >
        inline color syntax:&nbsp;
        <span style={{ color: "var(--amber-bright)" }}>*amber*</span>
        &nbsp;·&nbsp;
        <span style={{ color: "var(--violet-pale)" }}>_violet_</span>
        &nbsp;·&nbsp;
        <span style={{ color: "var(--green-bright)" }}>~green~</span>
        . Body paragraphs split on blank lines.
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <label style={labelSt}>Heading</label>
        <textarea
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          rows={2}
          placeholder="i love research and building software."
          className="px-3 py-2 text-[15px] font-mono outline-none transition-colors duration-150 w-full resize-y"
          style={{ ...inputSt, fontFamily: "var(--font-mono)", lineHeight: "1.4" }}
          onFocus={(e) =>
            ((e.target as HTMLTextAreaElement).style.borderColor =
              "var(--violet-mid)")
          }
          onBlur={(e) =>
            ((e.target as HTMLTextAreaElement).style.borderColor =
              "var(--gray-800)")
          }
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2">
        <label style={labelSt}>Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="short notes on what i'm learning, reading, and breaking."
          className="px-3 py-2 text-[14px] font-mono outline-none transition-colors duration-150 w-full resize-y"
          style={{ ...inputSt, lineHeight: "1.6" }}
          onFocus={(e) =>
            ((e.target as HTMLTextAreaElement).style.borderColor =
              "var(--violet-mid)")
          }
          onBlur={(e) =>
            ((e.target as HTMLTextAreaElement).style.borderColor =
              "var(--gray-800)")
          }
        />
      </div>

      {/* Live preview */}
      <div className="flex flex-col gap-2">
        <label style={labelSt}>Preview</label>
        <div
          className="p-5"
          style={{
            border: "1px solid var(--gray-800)",
            borderRadius: "4px",
            background: "var(--bg-surface)",
          }}
        >
          <div
            className="font-mono text-[22px] font-medium leading-[1.35] tracking-[-0.01em] mb-3"
            style={{ color: "var(--text-primary)" }}
            dangerouslySetInnerHTML={{ __html: renderInlineMarkup(heading) }}
          />
          <div
            className="font-mono text-[13px] leading-[1.65]"
            style={{ color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: renderParagraphs(body) }}
          />
        </div>
      </div>

      {error && (
        <p
          className="font-mono text-[12px]"
          style={{ color: "oklch(0.704 0.191 22.216)" }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="font-mono text-[13px] px-5 py-2 transition-all hover:-translate-y-[1px] disabled:opacity-50"
          style={{
            background: "var(--violet-mid)",
            color: "var(--violet-pale)",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {saving ? "saving..." : "save"}
        </button>
        {saved && (
          <span
            className="font-mono text-[11px]"
            style={{ color: "var(--green-bright)" }}
          >
            saved {saved.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
