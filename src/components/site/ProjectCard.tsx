"use client";

import { useRef } from "react";
import { TechBadge } from "./TechBadge";

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
  active:   { label: "active",   color: "var(--green-bright)", dot: "var(--green-mid)" },
  shipped:  { label: "shipped",  color: "var(--text-muted)",   dot: "var(--gray-600)" },
  building: { label: "building", color: "var(--amber-bright)", dot: "var(--amber-mid)" },
};

type Props = {
  project: Project;
  index?: number;
  featured?: boolean;
};

export default function ProjectCard({ project, index, featured = false }: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const status = statusConfig[project.status] ?? statusConfig.shipped;
  const primaryHref = project.demo_url ?? project.github_url ?? null;

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 2.5}deg) rotateY(${(x - 0.5) * 2.5}deg) translateY(-2px)`;
    card.style.borderColor = "color-mix(in srgb, var(--violet-soft) 50%, transparent)";
    if (glow) {
      glow.style.background = `radial-gradient(220px circle at ${x * 100}% ${y * 100}%, color-mix(in srgb, var(--violet-soft) 11%, transparent), transparent 70%)`;
      glow.style.opacity = "1";
    }
  };

  const onLeave = () => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (card) {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      card.style.borderColor = "color-mix(in srgb, var(--gray-800) 60%, transparent)";
    }
    if (glow) glow.style.opacity = "0";
  };

  return (
    <article
      ref={cardRef}
      className={`project-card group relative flex flex-col cursor-default overflow-hidden ${featured ? "gap-5 p-8" : "gap-4 p-6"}`}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid color-mix(in srgb, var(--gray-800) 60%, transparent)",
        borderRadius: "8px",
        transition: "transform 320ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms",
        willChange: "transform",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Spotlight inner glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 rounded-[8px]"
        style={{ opacity: 0, transition: "opacity 300ms", background: "transparent" }}
      />

      {/* Faint corner index number */}
      {typeof index === "number" && (
        <span
          className="pointer-events-none absolute right-5 top-3 font-mono select-none"
          style={{
            fontSize: featured ? "64px" : "44px",
            lineHeight: 1,
            color: "var(--gray-800)",
            letterSpacing: "-0.04em",
            fontWeight: 500,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}

      {/* ── Header row: filename-style breadcrumb ──────────────────── */}
      <div className="relative flex items-center gap-2">
        <span
          className="w-[7px] h-[7px] rounded-full flex-shrink-0"
          style={{
            background: status.dot,
            boxShadow:
              project.status === "active"
                ? `0 0 8px ${status.dot}`
                : "none",
          }}
        />
        <span
          className="font-mono text-[11px] tracking-[0.08em] uppercase"
          style={{ color: status.color }}
        >
          {status.label}
        </span>
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--gray-800)" }}
        >
          /
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

      {/* Media */}
      {(project.video_url || project.image_url) && (
        <div
          className="relative overflow-hidden rounded-[6px] w-full"
          style={{
            aspectRatio: "16/9",
            background: "var(--bg-base)",
            border: "1px solid var(--gray-800)",
          }}
        >
          {project.video_url ? (
            <video src={project.video_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.image_url!} alt={project.name} className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* Title + arrow */}
      <div className="relative flex items-start justify-between gap-3">
        <h3
          className={featured ? "text-[24px] font-medium leading-[1.2] md:text-[28px]" : "text-[20px] font-medium leading-[1.25]"}
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            cursor: "crosshair",
          }}
        >
          {project.name}
        </h3>
        {primaryHref && (
          <a
            href={primaryHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`open ${project.name}`}
            className="shrink-0 mt-1 transition-all duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--violet-soft)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        )}
      </div>

      {/* Subtle divider under title */}
      <div
        className="relative h-px w-8"
        style={{ background: "var(--violet-mid)" }}
      />

      {/* Description */}
      <p
        className={featured ? "relative max-w-[58ch] text-[15px] leading-[1.75]" : "relative text-[14px] leading-[1.65]"}
        style={{ color: "var(--text-secondary)" }}
      >
        {project.description}
      </p>

      {/* Stack pills */}
      {project.stack.length > 0 && (
        <div className="relative flex flex-wrap gap-2 mt-1">
          {project.stack.map((tech) => (
            <TechBadge key={tech} label={tech} />
          ))}
        </div>
      )}

      {/* Footer links */}
      {(project.github_url || project.demo_url) && (
        <div
          className="relative flex items-center gap-5 mt-auto pt-3"
          style={{ borderTop: "1px solid color-mix(in srgb, var(--gray-800) 70%, transparent)" }}
        >
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[12px] transition-colors duration-150"
              style={{ color: "var(--violet-soft)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--violet-pale)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--violet-soft)")}
            >
              ↗ live
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[12px] transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
            >
              source
            </a>
          )}
        </div>
      )}
    </article>
  );
}
