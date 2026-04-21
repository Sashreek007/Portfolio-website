// Unified editorial kicker row for homepage sections — matches the
// About pattern (LABEL ──────── meta.md). Use this on every homepage
// section so the transitions read consistently.
export default function SectionKicker({
  label,
  meta,
}: {
  label: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-14 max-w-[1200px] mx-auto">
      <span
        className="font-mono text-[11px] tracking-[0.2em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="h-px flex-1"
        style={{ background: "var(--gray-800)" }}
      />
      <span
        className="font-mono text-[11px] tracking-[0.2em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {meta}
      </span>
    </div>
  );
}
