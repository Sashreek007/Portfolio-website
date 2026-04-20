"use client";

import { useEffect, useState } from "react";

// Translates the Mac-flavoured modifier glyphs to their Windows/Linux
// equivalents on non-Apple platforms. Renders as a single <kbd>.
const MAC_TO_PC: Record<string, string> = {
  "⌘": "Ctrl",
  "⌃": "Ctrl",
  "⌥": "Alt",
  "⇧": "Shift",
  "↵": "Enter",
  "⌫": "Backspace",
  "␣": "Space",
};

export function useIsMac() {
  // Default to Mac on the server/first paint so the majority platform
  // avoids a layout flicker on hydration; correct after mount.
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    setIsMac(/Mac|iPhone|iPod|iPad/i.test(ua));
  }, []);
  return isMac;
}

export default function Kbd({
  children,
  style,
}: {
  children: string;
  style?: React.CSSProperties;
}) {
  const isMac = useIsMac();
  const label = isMac ? children : MAC_TO_PC[children] ?? children;
  return (
    <kbd
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--text-secondary)",
        background: "var(--bg-elevated)",
        padding: "2px 6px",
        borderRadius: "3px",
        border: "1px solid var(--gray-800)",
        ...style,
      }}
    >
      {label}
    </kbd>
  );
}
