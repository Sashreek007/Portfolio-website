"use client";

import { useEffect } from "react";
import Link from "next/link";
import { projectHref } from "@/lib/projects";
import type { Project } from "@/components/site/ProjectCard";
import { useProjectModal } from "@/components/site/ProjectModalProvider";

function MediaFrame({ index }: { index: number }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 10",
        background:
          "radial-gradient(1200px circle at 20% 0%, color-mix(in srgb, var(--violet-dim) 14%, transparent), transparent 55%), var(--bg-surface)",
        border: "1px solid var(--gray-800)",
        borderRadius: "6px",
      }}
    >
      {[
        { top: 10, left: 10 },
        { top: 10, right: 10 },
        { bottom: 10, left: 10 },
        { bottom: 10, right: 10 },
      ].map((pos, i) => (
        <span
          key={i}
          className="absolute w-3 h-3"
          style={{
            ...pos,
            borderTop: pos.top !== undefined ? "1px solid var(--gray-600)" : undefined,
            borderBottom: pos.bottom !== undefined ? "1px solid var(--gray-600)" : undefined,
            borderLeft: pos.left !== undefined ? "1px solid var(--gray-600)" : undefined,
            borderRight: pos.right !== undefined ? "1px solid var(--gray-600)" : undefined,
          }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-[6px]"
          style={{
            color: "var(--text-muted)",
            border: "1px solid var(--gray-800)",
            borderRadius: "999px",
            background: "color-mix(in srgb, var(--bg-base) 70%, transparent)",
          }}
        >
          demo · reel {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--gray-800) 1px, transparent 1px), linear-gradient(90deg, var(--gray-800) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

export default function FeatureStrip({
  project: p,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reversed = index % 2 === 1;
  const { openProject, register } = useProjectModal();
  useEffect(() => {
    register([p]);
  }, [p, register]);
  return (
    <Link
      href={projectHref(p)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        openProject(p);
      }}
      className="feature group grid gap-10 lg:gap-14 items-center"
      style={{
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
        direction: reversed ? "rtl" : "ltr",
      }}
    >
      <div style={{ direction: "ltr" }}>
        <MediaFrame index={index} />
      </div>

      <div className="flex flex-col gap-5" style={{ direction: "ltr" }}>
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] uppercase">
          <span style={{ color: "var(--text-muted)" }}>
            project {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ color: "var(--gray-800)" }}>/</span>
          <span style={{ color: "var(--green-bright)" }}>{p.year ?? "—"}</span>
        </div>

        <h3
          className="text-[30px] lg:text-[36px] font-medium leading-[1.15] tracking-[-0.015em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            cursor: "crosshair",
          }}
        >
          {p.name}
        </h3>

        <div
          className="h-px w-10"
          style={{ background: "var(--violet-mid)" }}
        />

        <p
          className="text-[15px] leading-[1.8]"
          style={{ color: "var(--text-secondary)" }}
        >
          {p.description}
        </p>

        <div
          className="mt-3 pt-4 flex flex-wrap gap-x-5 gap-y-1"
          style={{ borderTop: "1px solid var(--gray-800)" }}
        >
          <span
            className="font-mono text-[10px] tracking-[0.15em] uppercase w-full"
            style={{ color: "var(--text-muted)" }}
          >
            languages &amp; stack used
          </span>
          {p.stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[11px]"
              style={{ color: "var(--text-secondary)" }}
            >
              {tech}
            </span>
          ))}
        </div>

        <span
          className="font-mono text-[12px] mt-4 inline-flex items-center gap-2 transition-all duration-200 group-hover:translate-x-[3px]"
          style={{ color: "var(--violet-soft)" }}
        >
          read the feature
          <span>→</span>
        </span>
      </div>
    </Link>
  );
}
