"use client";

import { useState } from "react";

export type Project = {
  id: string;
  name: string;
  description: string;
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  video_url: string | null;
  stack: string[];
  status: "active" | "shipped" | "building";
  year: number | null;
  is_best: boolean;
  is_current: boolean;
  sort_order: number;
};

const statusConfig = {
  active: { label: "active", color: "var(--green-bright)" },
  shipped: { label: "shipped", color: "var(--text-muted)" },
  building: { label: "building", color: "var(--amber-bright)" },
};

export default function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const status = statusConfig[project.status] ?? statusConfig.shipped;

  return (
    <article
      className="relative flex flex-col gap-3 p-5 transition-all duration-200 cursor-default"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? "color-mix(in srgb, var(--violet-soft) 40%, transparent)" : "color-mix(in srgb, var(--gray-800) 60%, transparent)"}`,
        borderRadius: "6px",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: status + year */}
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase"
          style={{ color: status.color }}
        >
          {status.label}
        </span>
        {project.year && (
          <span
            className="font-mono text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {project.year}
          </span>
        )}
      </div>

      {/* Media (image or video) — shown if present */}
      {(project.video_url || project.image_url) && (
        <div
          className="overflow-hidden rounded-[4px] w-full"
          style={{ aspectRatio: "16/9", background: "var(--bg-elevated)" }}
        >
          {project.video_url ? (
            <video
              src={project.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image_url!}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Name */}
      <h3
        className="text-[18px] font-medium leading-[1.3] transition-colors duration-200"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          cursor: "crosshair",
        }}
      >
        {project.name}
      </h3>

      {/* Description */}
      <p
        className="text-[14px] leading-[1.65]"
        style={{ color: "var(--text-secondary)" }}
      >
        {project.description}
      </p>

      {/* Stack pills */}
      {project.stack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase px-2 py-1"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--gray-800)",
                borderRadius: "3px",
                background: "var(--bg-elevated)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      {(project.github_url || project.demo_url) && (
        <div className="flex gap-4 mt-auto pt-1">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[12px] transition-colors duration-150"
              style={{ color: "var(--violet-soft)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--violet-pale)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--violet-soft)")
              }
            >
              ↗ visit
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[12px] transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--text-secondary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--text-muted)")
              }
            >
              github
            </a>
          )}
        </div>
      )}
    </article>
  );
}
