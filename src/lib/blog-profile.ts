// Tiny inline-markup renderer for the blog about block.
// `*word*` → amber, `_word_` → violet, `~word~` → green.
// HTML-escapes input first so admin text can't inject markup.
export function renderInlineMarkup(text: string): string {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return escaped
    .replace(
      /\*([^*\n]+)\*/g,
      '<span style="color: var(--amber-bright)">$1</span>'
    )
    .replace(
      /_([^_\n]+)_/g,
      '<span style="color: var(--violet-pale)">$1</span>'
    )
    .replace(
      /~([^~\n]+)~/g,
      '<span style="color: var(--green-bright)">$1</span>'
    );
}

// Split body on blank lines → paragraphs, each with inline markup.
export function renderParagraphs(text: string): string {
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${renderInlineMarkup(para.trim())}</p>`)
    .join("");
}

export type BlogProfile = {
  heading: string;
  body: string;
};

export const BLOG_PROFILE_DEFAULT: BlogProfile = {
  heading: "i *love research* and _building software_.",
  body:
    "short notes on what i'm learning, reading, and breaking. no cadence, no funnel.",
};
