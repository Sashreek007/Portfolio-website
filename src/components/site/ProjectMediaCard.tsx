import Link from "next/link";
import { projectHref } from "@/lib/projects";
import type { Project } from "@/components/site/ProjectCard";

function MediaFrame({
  project: p,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 10",
        background:
          "radial-gradient(900px circle at 25% 0%, color-mix(in srgb, var(--violet-dim) 16%, transparent), transparent 55%), var(--bg-surface)",
        borderBottom: "1px solid var(--gray-800)",
      }}
    >
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
          {/* corner crosshairs */}
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-[6px]"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--gray-800)",
                borderRadius: "999px",
                background: "color-mix(in srgb, var(--bg-base) 70%, transparent)",
              }}
            >
              demo · reel {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35]"
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
}: {
  project: Project;
  index: number;
}) {
  return (
    <Link
      href={projectHref(p)}
      className="media-card group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-[2px]"
      style={{
        border: "1px solid var(--gray-800)",
        borderRadius: "8px",
        background: "var(--bg-surface)",
      }}
    >
      <MediaFrame project={p} index={index} />

      <div className="flex flex-col gap-4 p-6">
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
          className="text-[24px] font-medium leading-[1.2] tracking-[-0.015em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {p.name}
        </h3>

        <div
          className="h-[2px] w-12"
          style={{
            background:
              "linear-gradient(to right, var(--violet-soft), var(--amber-bright))",
          }}
        />

        {/* Description */}
        <p
          className="text-[15px] leading-[1.6]"
          style={{ color: "var(--text-primary)" }}
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
          open project
          <span style={{ color: "var(--amber-bright)" }}>→</span>
        </span>
      </div>
    </Link>
  );
}
