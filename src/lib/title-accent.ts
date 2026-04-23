// Shared accent palette for __highlighted__ title fragments. Used by
// both the reader (src/app/(site)/blog/[slug]/page.tsx) and the editor
// (src/components/admin/BlogEditor.tsx) so the live preview can't
// drift from the published colour.
export type TitleAccent = "violet" | "amber" | "green" | "pale";

export const TITLE_ACCENTS: Record<TitleAccent, { label: string; color: string }> = {
  violet: { label: "violet", color: "var(--violet-soft)" },
  amber:  { label: "amber",  color: "var(--amber-bright)" },
  green:  { label: "green",  color: "var(--green-bright)" },
  pale:   { label: "pale",   color: "var(--violet-pale)" },
};

export const DEFAULT_TITLE_ACCENT: TitleAccent = "violet";

export function resolveTitleAccent(
  key: string | null | undefined,
): { color: string; name: TitleAccent } {
  const k = (key ?? "") as TitleAccent;
  if (k in TITLE_ACCENTS) return { color: TITLE_ACCENTS[k].color, name: k };
  return {
    color: TITLE_ACCENTS[DEFAULT_TITLE_ACCENT].color,
    name: DEFAULT_TITLE_ACCENT,
  };
}

// Replace __word__ fragments with a coloured span. Used by both the
// editor preview and the published post page. The input is assumed to
// already be HTML-escaped (see escapeHTML below).
export function highlightTitleFragments(
  escapedTitle: string,
  key: string | null | undefined,
): string {
  const { color } = resolveTitleAccent(key);
  return escapedTitle.replace(
    /__([^_]+)__/g,
    (_m, inner: string) => `<span style="color:${color}">${inner}</span>`,
  );
}

export function escapeTitleHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
