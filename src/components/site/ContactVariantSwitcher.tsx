"use client";

import Link from "next/link";

const VARIANTS = [
  { n: 1, tag: "letter" },
  { n: 2, tag: "masthead" },
  { n: 3, tag: "cards" },
  { n: 4, tag: "dossier" },
  { n: 5, tag: "monument" },
];

export default function ContactVariantSwitcher({
  current,
}: {
  current: number;
}) {
  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-full font-mono text-[11px]"
      style={{
        background: "color-mix(in srgb, var(--bg-elevated) 85%, transparent)",
        border: "1px solid var(--gray-800)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <span className="pr-2 pl-1" style={{ color: "var(--text-muted)" }}>
        contact ·
      </span>
      {VARIANTS.map(({ n, tag }) => (
        <Link
          key={n}
          href={`/${n}`}
          className="transition-colors duration-150 inline-flex items-center gap-[6px]"
          style={{
            color: current === n ? "var(--violet-pale)" : "var(--text-muted)",
            padding: "3px 8px",
            borderRadius: "999px",
            background: current === n ? "var(--violet-dim)" : "transparent",
          }}
        >
          <span style={{ fontWeight: current === n ? 500 : 400 }}>{n}</span>
          <span style={{ opacity: 0.75 }}>{tag}</span>
        </Link>
      ))}
      <span className="px-2" style={{ color: "var(--gray-800)" }}>
        |
      </span>
      <Link
        href="/"
        className="px-2 hover:text-[var(--text-primary)] transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        home ↩
      </Link>
    </div>
  );
}
