import Link from "next/link";
import { projectHref } from "@/lib/projects";
import type { Project } from "@/components/site/ProjectCard";
import ProjectMediaRotator from "@/components/site/ProjectMediaRotator";

function MediaFrame({
  project: p,
  index,
  featured = false,
}: {
  project: Project;
  index: number;
  featured?: boolean;
}) {
  return (
    <div
      className={`media-frame relative w-full overflow-hidden ${
        featured
          ? "aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[340px] border-b lg:border-b-0 lg:border-r border-[var(--gray-800)]"
          : ""
      }`}
      style={{
        aspectRatio: featured ? undefined : "16 / 10",
        background:
          "radial-gradient(900px circle at 25% 0%, color-mix(in srgb, var(--violet-dim) 16%, transparent), transparent 55%), var(--bg-surface)",
        borderBottom: featured ? undefined : "1px solid var(--gray-800)",
      }}
    >
      {p.video_url || p.image_url ? (
        <ProjectMediaRotator project={p} />
      ) : (
        <>
          {/* corner crosshairs — close in toward the target on hover */}
          {[
            { top: 10, left: 10 },
            { top: 10, right: 10 },
            { bottom: 10, left: 10 },
            { bottom: 10, right: 10 },
          ].map((pos, i) => (
            <span
              key={i}
              className={`corner corner-${i} absolute w-3 h-3`}
              style={{
                ...pos,
                borderTop:
                  pos.top !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderBottom:
                  pos.bottom !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderLeft:
                  pos.left !== undefined ? "1px solid var(--gray-600)" : undefined,
                borderRight:
                  pos.right !== undefined ? "1px solid var(--gray-600)" : undefined,
              }}
            />
          ))}
          {/* Typographic cover — oversized index numeral, bottom-left */}
          <div className="absolute inset-0 flex items-end justify-between p-5">
            <span className="media-cover-num" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className="font-mono text-[11px] tracking-[0.18em] uppercase pb-2"
              style={{ color: "var(--text-muted)" }}
            >
              case file
            </span>
          </div>
          <div
            className="media-grid absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--gray-800) 1px, transparent 1px), linear-gradient(90deg, var(--gray-800) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              mixBlendMode: "screen",
            }}
          />
        </>
      )}
    </div>
  );
}

export default function ProjectMediaCard({
  project: p,
  index,
  featured = false,
}: {
  project: Project;
  index: number;
  // Magazine front-page hierarchy: the featured card runs full width with
  // the cover beside the text at desktop; the rest stay vertical.
  featured?: boolean;
}) {
  return (
    <Link
      href={projectHref(p)}
      className={`media-card group relative w-full overflow-hidden ${
        featured
          ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
          : "flex flex-col"
      }`}
    >
      <MediaFrame project={p} index={index} featured={featured} />

      <div
        className={`flex flex-col ${
          featured ? "gap-5 p-6 lg:p-10 lg:justify-center" : "gap-4 p-6"
        }`}
      >
        {p.year && (
          <span
            className="font-mono text-[12px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--amber-bright)" }}
          >
            {p.year}
          </span>
        )}

        {/* Title */}
        <h3
          className={`font-medium leading-[1.15] tracking-[-0.015em] transition-colors duration-200 group-hover:text-[var(--violet-pale)] ${
            featured ? "text-[28px] lg:text-[38px]" : "text-[24px]"
          }`}
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {p.name}
        </h3>

        {/* Description — secondary so the title stays the loudest element */}
        <p
          className={featured ? "text-[16px] leading-[1.7] max-w-[480px]" : "text-[15px] leading-[1.6]"}
          style={{ color: "var(--text-secondary)" }}
        >
          {p.description}
        </p>

        {/* Stack */}
        {p.stack.length > 0 && (
          <div
            className="font-mono text-[12px] leading-[1.6]"
            style={{ color: "var(--text-secondary)" }}
          >
            {p.stack.slice(0, 5).join(" · ")}
            {p.stack.length > 5 && " · …"}
          </div>
        )}

        {/* open affordance */}
        <span
          className="font-mono text-[13px] mt-2 inline-flex items-center gap-2 transition-all duration-200 group-hover:translate-x-[3px]"
          style={{ color: "var(--violet-soft)" }}
        >
          open project <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
