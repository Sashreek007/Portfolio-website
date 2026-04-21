"use client";

import { useState } from "react";

// Copies a value to the clipboard and flashes a "copied" label.
// Rendered as a button so it matches the link-style rows without
// falsely claiming to be a hyperlink.
export default function CopyHandle({
  value,
  className,
  children,
  style,
  copiedLabel = "copied",
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable (older browser or insecure context)
      // — fail quietly; the handle is still visible on screen so the
      // user can select it manually.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      style={{ textAlign: "left", cursor: "pointer", ...style }}
      aria-label={`copy ${value}`}
      data-copied={copied || undefined}
    >
      {children}
      {/* Tiny copy affordance shown on hover / focus. Wrapped in a
          data-attr so variants can override positioning if needed. */}
      <span
        className="copy-flash"
        style={{
          marginLeft: "8px",
          opacity: copied ? 1 : 0,
          transition: "opacity 180ms",
          color: "var(--green-bright)",
          fontSize: "10.5px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {copiedLabel}
      </span>
    </button>
  );
}
