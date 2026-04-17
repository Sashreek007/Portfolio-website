import Link from "next/link";
import { projectHref } from "@/lib/projects";
import type { Project } from "@/components/site/ProjectCard";

const statusTone = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
} as const;

export default function SpecimenCard({
  project: p,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <Link
      href={projectHref(p)}
      className="specimen group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-[2px]"
      style={{
        border: "1px solid var(--gray-800)",
        borderRadius: "6px",
        background: "var(--bg-surface)",
        minHeight: "340px",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 font-mono text-[11px] tracking-[0.1em] uppercase"
        style={{
          borderBottom: "1px solid var(--gray-800)",
          background: "var(--bg-elevated)",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>
          SPC-{String(index + 1).padStart(3, "0")}
        </span>
        <span
          className="flex items-center gap-[6px]"
          style={{ color: statusTone[p.status] }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{
              background: statusTone[p.status],
              boxShadow:
                p.status === "active"
                  ? `0 0 8px ${statusTone.active}`
                  : "none",
            }}
          />
          {p.status}
        </span>
      </div>

      {/* Poster body */}
      <div
        className="flex-1 relative flex items-center justify-center px-6 py-10"
        style={{
          background:
            "radial-gradient(600px circle at 80% 10%, color-mix(in srgb, var(--violet-dim) 12%, transparent), transparent 60%)",
        }}
      >
        <h3
          className="font-medium text-center transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
          style={{
            fontSize: "clamp(24px, 2.8vw, 32px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            cursor: "crosshair",
          }}
        >
          {p.name}
        </h3>

        <span
          className="absolute bottom-4 right-5 font-mono text-[11px] tracking-[0.14em]"
          style={{ color: "var(--amber-bright)" }}
        >
          {p.year ?? "—"}
        </span>

        <span
          className="absolute bottom-4 left-5 font-mono text-[11px] tracking-[0.1em] uppercase transition-all duration-200 group-hover:translate-x-[3px] group-hover:text-[var(--violet-pale)]"
          style={{ color: "var(--text-muted)" }}
        >
          open →
        </span>
      </div>

      {/* Caption */}
      <div
        className="px-5 py-4 flex flex-col gap-2"
        style={{
          borderTop: "1px solid var(--gray-800)",
          background: "var(--bg-surface)",
        }}
      >
        <p
          className="text-[13px] leading-[1.55]"
          style={{ color: "var(--text-secondary)" }}
        >
          {p.description}
        </p>
        <div
          className="font-mono text-[11px] tracking-[0.02em] mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          {p.stack.slice(0, 5).join(" · ")}
          {p.stack.length > 5 && " · …"}
        </div>
      </div>
    </Link>
  );
}
