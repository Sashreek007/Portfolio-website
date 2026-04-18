"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a POST /api/track on every public-page navigation. The route
// itself filters out /admin and /api paths, but we also skip here to
// avoid an unnecessary round trip when admin pages share a layout.
export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const controller = new AbortController();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      /* swallow — tracking must not break navigation */
    });

    return () => controller.abort();
  }, [pathname]);

  return null;
}
