"use client";

import { useState, useTransition } from "react";
import { syncMissingProjectPosts } from "./actions";

export default function SyncProjectPostsButton() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>("");

  const handleClick = () => {
    setStatus("");
    startTransition(async () => {
      const res = await syncMissingProjectPosts();
      if (res.error) setStatus(`error: ${res.error}`);
      else if (res.created === 0) setStatus("already in sync");
      else setStatus(`created ${res.created} post${res.created === 1 ? "" : "s"}`);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={pending}
        className="font-mono text-[12px] px-3 py-2 transition-colors duration-150 disabled:opacity-50"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--gray-800)",
          borderRadius: "4px",
          background: "transparent",
          cursor: pending ? "wait" : "pointer",
        }}
      >
        {pending ? "syncing..." : "sync blog posts"}
      </button>
      {status && (
        <span
          className="font-mono text-[11px]"
          style={{
            color: status.startsWith("error")
              ? "oklch(0.704 0.191 22.216)"
              : "var(--green-bright)",
          }}
        >
          {status}
        </span>
      )}
    </div>
  );
}
