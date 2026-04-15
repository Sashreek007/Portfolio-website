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
  active:   { label: "active",   color: "var(--green-bright)" },
  shipped:  { label: "shipped",  color: "var(--text-muted)" },
  building: { label: "building", color: "var(--amber-bright)" },
};

export default function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const status = statusConfig[project.status] ?? statusConfig.shipped;

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 7}deg) translateY(-4px)`;
    card.style.borderColor = "color-mix(in srgb, var(--violet-soft) 50%, transparent)";
    if (glow) {
      glow.style.background = `radial-gradient(180px circle at ${x * 100}% ${y * 100}%, color-mix(in srgb, var(--violet-soft) 10%, transparent), transparent 70%)`;
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
      className="relative flex flex-col gap-3 p-5 cursor-default overflow-hidden"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid color-mix(in srgb, var(--gray-800) 60%, transparent)",
        borderRadius: "6px",
        transition: "transform 400ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms",
        willChange: "transform",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Spotlight inner glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 rounded-[6px]"
        style={{ opacity: 0, transition: "opacity 300ms", background: "transparent" }}
      />

      {/* Top row: status + year */}
      <div className="relative flex items-center justify-between">
        <span
          className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase"
          style={{ color: status.color }}
        >
          {status.label}
        </span>
        {project.year && (
          <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
            {project.year}
          </span>
        )}
      </div>

      {/* Media */}
      {(project.video_url || project.image_url) && (
        <div
          className="relative overflow-hidden rounded-[4px] w-full"
          style={{ aspectRatio: "16/9", background: "var(--bg-elevated)" }}
        >
          {project.video_url ? (
            <video src={project.video_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.image_url!} alt={project.name} className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* Name */}
      <h3
        className="relative text-[18px] font-medium leading-[1.3]"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)", cursor: "crosshair" }}
      >
        {project.name}
      </h3>

      {/* Description */}
      <p className="relative text-[14px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
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

      {/* Links */}
      {(project.github_url || project.demo_url) && (
        <div className="relative flex gap-4 mt-auto pt-1">
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
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
            >
              github
            </a>
          )}
        </div>
      )}
    </article>
  );
}
