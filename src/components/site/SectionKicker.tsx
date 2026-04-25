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
    <div className="flex items-center gap-4 mb-14 max-w-[1320px] mx-auto">
      <span
        className="inline-block w-[7px] h-[7px] rounded-full"
        style={{ background: "var(--violet-soft)", boxShadow: "0 0 14px color-mix(in srgb, var(--violet-soft) 60%, transparent)" }}
      />
      <span
        className="font-mono text-[12.5px] tracking-[0.22em] uppercase font-medium"
        style={{ color: "var(--violet-pale)" }}
      >
        {label}
      </span>
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--violet-mid) 60%, transparent), var(--gray-800) 70%)",
        }}
      />
      <span
        className="font-mono text-[12px] tracking-[0.18em]"
        style={{ color: "var(--amber-bright)" }}
      >
        {meta}
      </span>
    </div>
  );
}
