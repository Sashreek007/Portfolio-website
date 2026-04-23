"use client";

import Link from "next/link";

const VARIANTS = [
  { n: 1, tag: "letter" },
  { n: 2, tag: "masthead" },
  { n: 3, tag: "cards" },
  { n: 4, tag: "dossier" },
  { n: 5, tag: "monument" },
];

// Tiny floating switcher — numbers only, tag name via title attr.
// Sits above the global footer so it doesn't crowd content on any
// particular variant.
export default function ContactVariantSwitcher({
  current,
}: {
  current: number;
}) {
  const currentTag = VARIANTS.find((v) => v.n === current)?.tag ?? "";
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-[2px] px-[8px] py-[4px] rounded-full font-mono text-[10px]"
      style={{
        background: "color-mix(in srgb, var(--bg-elevated) 80%, transparent)",
        border: "1px solid var(--gray-800)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        letterSpacing: "0.04em",
      }}
      // Announce the active variant to screen readers via aria-label
      // since the numbers on their own aren't descriptive.
      aria-label={`Contact variant ${current} — ${currentTag}`}
    >
      {VARIANTS.map(({ n, tag }) => {
        const active = current === n;
        return (
          <Link
            key={n}
            href={`/${n}`}
            title={tag}
            className="transition-colors duration-150 inline-flex items-center justify-center tabular-nums"
            style={{
              color: active ? "var(--violet-pale)" : "var(--text-muted)",
              width: "18px",
              height: "18px",
              borderRadius: "999px",
              background: active ? "var(--violet-dim)" : "transparent",
              fontWeight: active ? 500 : 400,
            }}
          >
            {n}
          </Link>
        );
      })}
      <span className="mx-[4px]" style={{ color: "var(--gray-800)" }}>
        ·
      </span>
      <Link
        href="/"
        title="home"
        className="transition-colors duration-150 inline-flex items-center justify-center"
        style={{
          color: "var(--text-muted)",
          padding: "0 6px",
          height: "18px",
        }}
      >
        ↩
      </Link>
    </div>
  );
}
