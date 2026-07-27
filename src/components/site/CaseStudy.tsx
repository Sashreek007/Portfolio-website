import Link from "next/link";
import { projectHref } from "@/lib/projects";
import type { Project } from "@/components/site/ProjectCard";
import { TechBadge } from "@/components/site/TechBadge";
import ProjectConstellation from "@/components/site/ProjectConstellation";
import { Spotlight } from "@/components/motion-primitives/spotlight";

// Case-study strip — one editorial "chapter" per project. Layout only:
// every string rendered here comes from the project record (or is a
// fixed UI label), so swapping copy or data never touches this file.

const STATUS_META: Record<Project["status"], { label: string; color: string; dot: string }> = {
  active:   { label: "active",   color: "var(--green-bright)", dot: "var(--green-mid)" },
  shipped:  { label: "shipped",  color: "var(--gray-400)",     dot: "var(--gray-600)" },
  building: { label: "building", color: "var(--amber-bright)", dot: "var(--amber-mid)" },
};

function CaseMedia({ project: p, index }: { project: Project; index: number }) {
  return (
    <div className="case-media w-full" style={{ aspectRatio: "16 / 10" }}>
      {p.video_url ? (
        <video
          src={p.video_url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : p.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image_url}
          alt={p.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          <div
            className="media-grid absolute inset-0 pointer-events-none opacity-[0.3]"
            style={{
              backgroundImage:
                "linear-gradient(var(--gray-800) 1px, transparent 1px), linear-gradient(90deg, var(--gray-800) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              mixBlendMode: "screen",
            }}
          />
          <ProjectConstellation seed={p.name} />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 pointer-events-none">
            <span
              className="font-mono text-[10.5px] tracking-[0.18em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              case file
            </span>
            <span
              className="font-mono text-[10.5px] tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function CaseStudy({
  project: p,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reversed = index % 2 === 1;
  const num = String(index + 1).padStart(2, "0");
  const status = STATUS_META[p.status] ?? STATUS_META.shipped;

  return (
    <article className="case-strip overflow-hidden">
      {/* cursor-tracking glow across the whole strip */}
      <Spotlight
        className="from-violet-mid/25 via-violet-soft/10 to-transparent blur-2xl"
        size={420}
      />
      <div className="py-14 lg:py-16">
        {/* Kicker rail — chapter number, hairline, year, status */}
        <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.16em] uppercase mb-10">
          <span className="font-medium" style={{ color: "var(--amber-bright)" }}>
            case {num}
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          {p.year && <span style={{ color: "var(--text-muted)" }}>{p.year}</span>}
          <span className="flex items-center gap-2" style={{ color: status.color }}>
            <span
              className="inline-block w-[6px] h-[6px] rounded-full"
              style={{ background: status.dot }}
            />
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-16 items-center">
          {/* Media */}
          <Link
            href={projectHref(p)}
            aria-label={p.name}
            className={reversed ? "lg:order-2" : undefined}
          >
            <CaseMedia project={p} index={index} />
          </Link>

          {/* Dossier */}
          <div className={`relative ${reversed ? "lg:order-1" : ""}`}>
            <span aria-hidden className="case-ghost">
              {num}
            </span>

            <div className="relative z-10 flex flex-col gap-6">
              <h3>
                <Link
                  href={projectHref(p)}
                  className="case-title inline-block text-[30px] lg:text-[40px] font-medium leading-[1.12] tracking-[-0.018em]"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {p.name}
                </Link>
              </h3>

              <p
                className="text-[16px] lg:text-[17px] leading-[1.75] max-w-[560px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {p.description}
              </p>

              {p.stack.length > 0 && (
                <div className="flex flex-wrap gap-[6px] max-w-[560px]">
                  {p.stack.map((tech) => (
                    <TechBadge key={tech} label={tech} />
                  ))}
                </div>
              )}

              {/* Footer rail — external links + open affordance */}
              <div
                className="flex items-center gap-6 flex-wrap pt-5"
                style={{ borderTop: "1px solid var(--gray-800)" }}
              >
                {p.github_url && (
                  <a
                    href={p.github_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-mono text-[12.5px] inline-flex items-center gap-2 transition-colors duration-150 hover:text-[var(--violet-pale)]"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    github <span aria-hidden>↗</span>
                  </a>
                )}
                {p.demo_url && (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-mono text-[12.5px] inline-flex items-center gap-2 transition-colors duration-150 hover:text-[var(--green-bright)]"
                    style={{ color: "var(--green-mid)" }}
                  >
                    live demo <span aria-hidden>↗</span>
                  </a>
                )}
                <Link
                  href={projectHref(p)}
                  className="case-open font-mono text-[12.5px] inline-flex items-center gap-2 ml-auto"
                  style={{ color: "var(--violet-soft)" }}
                >
                  open case file <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
