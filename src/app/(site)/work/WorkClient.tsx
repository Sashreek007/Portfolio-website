"use client";

import { useState } from "react";
import FeatureStrip from "@/components/site/FeatureStrip";
import type { Project } from "@/components/site/ProjectCard";

type Filter = "best" | "all" | "current";

const filters: { key: Filter; label: string }[] = [
  { key: "best", label: "Best Work" },
  { key: "all", label: "All" },
  { key: "current", label: "In Progress" },
];

export default function WorkClient({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Filter>("best");

  const filtered = projects.filter((p) => {
    if (active === "best") return p.is_best;
    if (active === "current") return p.is_current;
    return true;
  });

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-16">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className="font-mono text-[12px] px-4 py-[6px] transition-all duration-200"
            style={{
              color: active === key ? "var(--text-primary)" : "var(--text-muted)",
              border: `1px solid ${active === key ? "color-mix(in srgb, var(--violet-soft) 60%, transparent)" : "var(--gray-800)"}`,
              borderRadius: "4px",
              background:
                active === key
                  ? "color-mix(in srgb, var(--violet-dim) 15%, transparent)"
                  : "transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feature strips */}
      <div className="flex flex-col gap-24">
        {filtered.map((project, i) => (
          <FeatureStrip key={project.id} project={project} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p
          className="font-mono text-[13px] py-12 text-center"
          style={{ color: "var(--text-muted)" }}
        >
          no projects here yet
        </p>
      )}
    </>
  );
}
