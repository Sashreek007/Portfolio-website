"use client";

import Link from "next/link";

export default function WorkVariantSwitcher({ current }: { current: number }) {
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
        work ·
      </span>
      {[1, 2, 3, 4, 5].map((n) => (
        <Link
          key={n}
          href={`/work/${n}`}
          className="transition-colors duration-150"
          style={{
            color: current === n ? "var(--violet-pale)" : "var(--text-muted)",
            padding: "3px 8px",
            borderRadius: "999px",
            background: current === n ? "var(--violet-dim)" : "transparent",
          }}
        >
          {n}
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
