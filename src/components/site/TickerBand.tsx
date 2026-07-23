"use client";

// Stack ticker — infinite marquee of the technologies used across the
// projects on the page. Data-driven (aggregated from project stacks),
// so it updates itself as projects change. Hover pauses the drift.

import { TECH_META } from "@/components/site/TechBadge";

function TickerItem({ label }: { label: string }) {
  const meta = TECH_META[label];
  const Icon = meta?.icon;
  return (
    <span
      className="flex items-center gap-[9px] font-mono text-[12px] tracking-[0.14em] uppercase whitespace-nowrap"
      style={{ color: "var(--text-muted)" }}
    >
      {Icon ? (
        <Icon size={13} style={{ color: meta.color, flexShrink: 0, opacity: 0.85 }} />
      ) : (
        <span
          aria-hidden
          className="inline-block w-[5px] h-[5px] rotate-45"
          style={{ background: "var(--violet-dim)" }}
        />
      )}
      {label}
    </span>
  );
}

export default function TickerBand({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="ticker-band py-[16px]" aria-label="technologies used across projects">
      <div className="ticker-track">
        {[0, 1].map((half) => (
          <div
            key={half}
            aria-hidden={half === 1}
            className="flex items-center gap-12 pr-12"
          >
            {items.map((label) => (
              <TickerItem key={label} label={label} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
