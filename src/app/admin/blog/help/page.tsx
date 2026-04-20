import Link from "next/link";
import Kbd from "@/components/Kbd";

export const metadata = { title: "Editor Reference | Admin" };

const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const muted: React.CSSProperties = { color: "var(--text-muted)" };
const primary: React.CSSProperties = { color: "var(--text-primary)" };
const secondary: React.CSSProperties = { color: "var(--text-secondary)" };
const surface: React.CSSProperties = { background: "var(--bg-surface)", border: "1px solid var(--gray-800)", borderRadius: "6px" };
const elevated: React.CSSProperties = { background: "var(--bg-elevated)", border: "1px solid var(--gray-800)", borderRadius: "6px" };

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...mono, ...muted, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
      {children}
    </p>
  );
}

function Row({ command, keys, description }: { command: string; keys?: string[]; description: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--gray-800)" }}>
      <div style={{ width: "160px", flexShrink: 0 }}>
        <code style={{ ...mono, fontSize: "13px", color: "var(--violet-soft)", background: "var(--bg-elevated)", padding: "2px 7px", borderRadius: "4px", border: "1px solid var(--gray-800)" }}>
          {command}
        </code>
      </div>
      {keys && (
        <div style={{ display: "flex", gap: "4px", width: "200px", flexShrink: 0 }}>
          {keys.map((k) => (
            <Kbd key={k}>{k}</Kbd>
          ))}
        </div>
      )}
      <p style={{ ...secondary, fontSize: "14px", flex: 1 }}>{description}</p>
    </div>
  );
}

function Preview({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <p style={{ ...mono, ...muted, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
      <div style={{ ...surface, padding: "16px 20px" }}>
        {children}
      </div>
    </div>
  );
}

export default function EditorHelpPage() {
  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
        <div>
          <p style={{ ...mono, ...muted, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>
            Admin / Blog / Help
          </p>
          <h1 style={{ ...primary, fontSize: "22px", fontWeight: 500, fontFamily: "var(--font-body)" }}>
            Editor reference
          </h1>
        </div>
        <Link
          href="/admin/blog"
          style={{ ...mono, ...muted, fontSize: "12px", padding: "6px 12px", border: "1px solid var(--gray-800)", borderRadius: "4px", textDecoration: "none" }}
        >
          ← blog
        </Link>
      </div>

      {/* ── Slash commands ── */}
      <section style={{ marginBottom: "48px" }}>
        <Label>Slash commands — type / to open</Label>
        <p style={{ ...secondary, fontSize: "14px", marginBottom: "20px", lineHeight: "1.6" }}>
          Type <code style={{ ...mono, fontSize: "13px", color: "var(--violet-soft)", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: "3px", border: "1px solid var(--gray-800)" }}>/</code> on any empty line or after a space to open the command menu. Then type to filter, use ↑↓ to navigate, Enter to apply.
        </p>
        <div style={{ ...surface, padding: "0 16px" }}>
          <Row command="/text" description="Plain paragraph — the default block type" />
          <Row command="/h1" description="Large heading — use for major sections" />
          <Row command="/h2" description="Medium heading — use for subsections" />
          <Row command="/h3" description="Small heading — use for minor labels" />
          <Row command="/bullet" description="Unordered list — hit Tab to indent, Shift+Tab to outdent" />
          <Row command="/numbered" description="Ordered list — auto-numbers items" />
          <Row command="/code" description="Fenced code block with syntax highlighting" />
          <Row command="/quote" description="Blockquote — indented with a left violet border" />
          <Row command="/divider" description="Horizontal rule — visual separator between sections" />
          <Row command="/image" description="Upload an image at the cursor position (20 MB max)" />
        </div>
      </section>

      {/* ── Keyboard shortcuts ── */}
      <section style={{ marginBottom: "48px" }}>
        <Label>Keyboard shortcuts</Label>
        <div style={{ ...surface, padding: "0 16px" }}>
          <Row command="Bold" keys={["⌘", "B"]} description="Toggle bold on selected text" />
          <Row command="Italic" keys={["⌘", "I"]} description="Toggle italic on selected text" />
          <Row command="Underline" keys={["⌘", "U"]} description="Toggle underline on selected text" />
          <Row command="Inline code" keys={["⌘", "E"]} description="Wrap selected text in inline code style" />
          <Row command="Code block" keys={["⌘", "⌥", "C"]} description="Convert current paragraph to a code block" />
          <Row command="Undo" keys={["⌘", "Z"]} description="Undo last action" />
          <Row command="Redo" keys={["⌘", "⇧", "Z"]} description="Redo last undone action" />
          <Row command="Hard break" keys={["⇧", "↵"]} description="Line break without starting a new paragraph" />
          <Row command="Exit block" keys={["↵", "↵"]} description="Press Enter twice to exit a list, code block, or quote" />
        </div>
      </section>

      {/* ── Markdown shortcuts ── */}
      <section style={{ marginBottom: "48px" }}>
        <Label>Markdown input shortcuts — type and press Space</Label>
        <div style={{ ...surface, padding: "0 16px" }}>
          <Row command="# " description="Converts to Heading 1" />
          <Row command="## " description="Converts to Heading 2" />
          <Row command="### " description="Converts to Heading 3" />
          <Row command="- " description="Starts a bullet list" />
          <Row command="1. " description="Starts a numbered list" />
          <Row command="> " description="Starts a blockquote" />
          <Row command="``` " description="Starts a code block (backtick backtick backtick Space)" />
          <Row command="--- " description="Inserts a horizontal divider" />
          <Row command="**text**" description="Bold (wrap with double asterisks)" />
          <Row command="*text*" description="Italic (wrap with single asterisks)" />
          <Row command="`text`" description="Inline code (wrap with single backticks)" />
        </div>
      </section>

      {/* ── Bubble menu ── */}
      <section style={{ marginBottom: "48px" }}>
        <Label>Bubble menu — appears when you select text</Label>
        <p style={{ ...secondary, fontSize: "14px", marginBottom: "20px", lineHeight: "1.6" }}>
          Select any text with your cursor to reveal the floating toolbar.
        </p>
        <div style={{ ...elevated, padding: "12px 16px", display: "inline-flex", gap: "4px", marginBottom: "20px" }}>
          {[
            { label: "B", style: { fontWeight: 700 } },
            { label: "I", style: { fontStyle: "italic" } },
            { label: "U", style: { textDecoration: "underline" } },
            { label: "<>", style: { fontFamily: "var(--font-mono)" } },
            { label: "▐", style: {} },
          ].map(({ label, style }) => (
            <button
              key={label}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "default",
                ...style,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ ...surface, padding: "0 16px" }}>
          <Row command="B" description="Bold — strong emphasis" />
          <Row command="I" description="Italic — soft emphasis or titles" />
          <Row command="U" description="Underline — use sparingly" />
          <Row command="<>" description="Inline code — for variable names, commands, file paths" />
          <Row command="▐" description="Highlight — background highlight on selected text" />
        </div>
      </section>

      {/* ── Images ── */}
      <section style={{ marginBottom: "48px" }}>
        <Label>Images</Label>
        <div style={{ ...surface, padding: "0 16px" }}>
          <Row command="/image" description="Upload via slash command at cursor position" />
          <Row command="Paste" description="Paste an image from clipboard — uploads automatically" />
          <Row command="Drag & drop" description="Drop an image file directly onto the editor" />
          <Row command="Cover image" description="Separate field above the editor — shown at the top of the post" />
        </div>
      </section>

      {/* ── Visual reference ── */}
      <section style={{ marginBottom: "48px" }}>
        <Label>How elements render on the published post</Label>

        <Preview label="Heading 1">
          <p style={{ ...primary, fontSize: "26px", fontWeight: 500, ...mono, margin: 0 }}>Large section heading</p>
        </Preview>

        <Preview label="Heading 2">
          <p style={{ ...primary, fontSize: "20px", fontWeight: 500, ...mono, margin: 0 }}>Medium section heading</p>
        </Preview>

        <Preview label="Heading 3">
          <p style={{ ...primary, fontSize: "17px", fontWeight: 500, ...mono, margin: 0 }}>Small heading</p>
        </Preview>

        <Preview label="Paragraph">
          <p style={{ ...secondary, fontSize: "16px", lineHeight: "1.8", margin: 0 }}>
            Regular body text. This is how a standard paragraph looks on the published post — comfortable reading size with generous line height.
          </p>
        </Preview>

        <Preview label="Bold and italic">
          <p style={{ ...secondary, fontSize: "16px", lineHeight: "1.8", margin: 0 }}>
            Use <strong style={primary}>bold for emphasis</strong> and <em>italic for titles or soft emphasis</em> inline.
          </p>
        </Preview>

        <Preview label="Inline code">
          <p style={{ ...secondary, fontSize: "16px", lineHeight: "1.8", margin: 0 }}>
            Reference variables like{" "}
            <code style={{ ...mono, fontSize: "13px", color: "var(--amber-bright)", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: "3px", border: "1px solid var(--gray-800)" }}>
              myVariable
            </code>
            {" "}or commands like{" "}
            <code style={{ ...mono, fontSize: "13px", color: "var(--amber-bright)", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: "3px", border: "1px solid var(--gray-800)" }}>
              npm install
            </code>
            {" "}inline.
          </p>
        </Preview>

        <Preview label="Code block">
          <pre style={{ background: "var(--bg-base)", border: "1px solid var(--gray-800)", borderRadius: "6px", padding: "16px 20px", overflowX: "auto", margin: 0 }}>
            <code style={{ ...mono, fontSize: "13px", lineHeight: "1.7", color: "var(--text-primary)" }}>
{`function greet(name: string) {
  return \`Hello, \${name}\`;
}

console.log(greet("Sashreek"));`}
            </code>
          </pre>
        </Preview>

        <Preview label="Blockquote">
          <blockquote style={{ borderLeft: "2px solid var(--violet-mid)", paddingLeft: "1.25em", margin: 0, color: "var(--text-secondary)", fontStyle: "italic", fontSize: "16px", lineHeight: "1.8" }}>
            A well-placed quote adds credibility and breaks up the visual flow of dense paragraphs.
          </blockquote>
        </Preview>

        <Preview label="Bullet list">
          <ul style={{ paddingLeft: "1.5em", margin: 0 }}>
            {["First item in the list", "Second item — lists work great for features or steps", "Third item"].map((item) => (
              <li key={item} style={{ ...secondary, fontSize: "15px", marginBottom: "4px" }}>{item}</li>
            ))}
          </ul>
        </Preview>

        <Preview label="Numbered list">
          <ol style={{ paddingLeft: "1.5em", margin: 0 }}>
            {["Install dependencies", "Configure environment variables", "Run the dev server"].map((item) => (
              <li key={item} style={{ ...secondary, fontSize: "15px", marginBottom: "4px" }}>{item}</li>
            ))}
          </ol>
        </Preview>

        <Preview label="Horizontal divider">
          <hr style={{ border: "none", height: "1px", background: "var(--gray-800)", margin: "4px 0" }} />
        </Preview>
      </section>

      {/* ── Auto-save ── */}
      <section style={{ marginBottom: "48px" }}>
        <Label>Auto-save & publishing</Label>
        <div style={{ ...surface, padding: "0 16px" }}>
          <Row command="Auto-save" description="Content auto-saves to draft every 3 seconds while editing an existing post" />
          <Row command="Save draft" description="Saves without publishing — visible only in admin, not on the public blog" />
          <Row command="Publish" description="Makes the post live at /blog/[slug] — slug is generated from the title" />
          <Row command="Unpublish" description="Takes the post offline but keeps it in the database as a draft" />
          <Row command="Preview" description="Renders a full preview of the post in the current editor state before publishing" />
          <Row command="Excerpt" description="Shown on the /blog listing page as the post summary — keep under 2 sentences" />
          <Row command="Cover image" description="Displayed at the top of the post and on the blog listing card" />
        </div>
      </section>

      {/* ── Tips ── */}
      <section style={{ marginBottom: "48px" }}>
        <Label>Tips</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            "The slug is set from the title when you first publish — changing the title after publishing does not change the URL.",
            "Images pasted from clipboard or dragged in are automatically uploaded to Supabase Storage.",
            "Code blocks support syntax highlighting for common languages — the language is auto-detected.",
            "Use the Preview button before publishing to catch layout issues — especially around headings and code blocks.",
            "Press Enter twice to exit out of a list, blockquote, or code block back to a normal paragraph.",
            "The excerpt field is optional but strongly recommended — it appears on the /blog listing page.",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "12px" }}>
              <span style={{ ...mono, color: "var(--violet-soft)", fontSize: "13px", flexShrink: 0, marginTop: "2px" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p style={{ ...secondary, fontSize: "14px", lineHeight: "1.7", margin: 0 }}>{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
