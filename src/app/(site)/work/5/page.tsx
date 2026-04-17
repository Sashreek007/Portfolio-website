import Link from "next/link";
import { projectHref } from "@/lib/projects";
import { getAllProjects } from "@/lib/projects.server";
import WorkVariantSwitcher from "@/components/site/WorkVariantSwitcher";

// Variant 5 — Specimen Sheet
// Each project rendered as a type-specimen tile: poster-sized title, catalog
// number in the header bar, a metadata block across the bottom like a museum
// caption. Grid of posters — dense, silent, a little institutional.

export const metadata = { title: "Work v5 — Specimen Sheet" };

const statusTone = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
} as const;

export default async function WorkVariant5() {
  const projects = await getAllProjects();

  return (
    <div
      className="min-h-screen w-full px-[6vw] py-20"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Kicker */}
        <div className="flex items-center gap-4 mb-14">
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            WORK · SPECIMEN SHEET
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            catalog · 2024–25
          </span>
        </div>

        <h1
          className="text-[36px] lg:text-[44px] font-medium leading-[1.15] mb-4 tracking-[-0.015em] max-w-[720px]"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          A catalog of{" "}
          <span style={{ color: "var(--violet-pale)" }}>working specimens</span>.
        </h1>
        <p
          className="text-[15px] leading-[1.75] mb-16 max-w-[640px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Each project is a specimen — poster-sized title, catalog number,
          captioned metadata. Click a specimen to open its write-up and demo.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={projectHref(p)}
              className="specimen group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-[2px]"
              style={{
                border: "1px solid var(--gray-800)",
                borderRadius: "6px",
                background: "var(--bg-surface)",
                minHeight: "380px",
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
                  SPC-{String(i + 1).padStart(3, "0")}
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
                <h2
                  className="font-medium text-center transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                  style={{
                    fontSize: "clamp(28px, 3.6vw, 40px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    cursor: "crosshair",
                  }}
                >
                  {p.name}
                </h2>

                {/* asymmetric corner year */}
                <span
                  className="absolute bottom-4 right-5 font-mono text-[11px] tracking-[0.14em]"
                  style={{ color: "var(--amber-bright)" }}
                >
                  {p.year ?? "—"}
                </span>

                {/* asymmetric corner arrow */}
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
                  className="text-[13px] leading-[1.6]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {p.description}
                </p>
                <div
                  className="font-mono text-[11px] tracking-[0.02em] mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {p.stack.join(" · ")}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-10 mt-16" style={{ borderTop: "1px solid var(--gray-800)" }}>
          <Link
            href="/"
            className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            ← back to home
          </Link>
        </div>
      </div>

      <WorkVariantSwitcher current={5} />
    </div>
  );
}
