import Link from "next/link";
import { getAllProjects, projectHref } from "@/lib/projects";
import WorkVariantSwitcher from "@/components/site/WorkVariantSwitcher";

// Variant 2 — Monolith Chapters
// Each project is a full-width chapter with an enormous display number on the
// left (mono, -0.04em tracking) and the editorial content stacked on the right.
// Reads like flipping through a printed monograph.

export const metadata = { title: "Work v2 — Monolith Chapters" };

const statusTone = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
} as const;

export default async function WorkVariant2() {
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
            WORK · CHAPTERS
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            vol. 01
          </span>
        </div>

        <h1
          className="text-[36px] lg:text-[44px] font-medium leading-[1.15] mb-4 tracking-[-0.015em] max-w-[720px]"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Projects, one{" "}
          <span style={{ color: "var(--amber-bright)" }}>chapter</span>{" "}
          at a time.
        </h1>
        <p
          className="text-[15px] leading-[1.75] mb-20 max-w-[640px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Each build gets its own page-sized opener. Click the chapter head to
          read the full write-up and watch the demo.
        </p>

        <div className="flex flex-col gap-0">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={projectHref(p)}
              className="chapter group grid gap-10 lg:gap-16 py-14 items-start relative"
              style={{
                gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)",
                borderTop:
                  i === 0 ? "1px solid var(--gray-800)" : "none",
                borderBottom: "1px solid var(--gray-800)",
              }}
            >
              {/* Massive chapter number */}
              <div
                className="font-mono transition-colors duration-300 group-hover:text-[var(--violet-soft)]"
                style={{
                  fontSize: "clamp(72px, 11vw, 140px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                  color: "var(--gray-800)",
                  fontWeight: 500,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Chapter body */}
              <div className="flex flex-col gap-5 pt-3">
                <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] uppercase">
                  <span style={{ color: "var(--text-muted)" }}>
                    chapter {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ color: "var(--gray-800)" }}>·</span>
                  <span style={{ color: "var(--amber-bright)" }}>
                    {p.year ?? "—"}
                  </span>
                  <span style={{ color: "var(--gray-800)" }}>·</span>
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

                <h2
                  className="text-[28px] lg:text-[34px] font-medium leading-[1.2] tracking-[-0.015em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    cursor: "crosshair",
                  }}
                >
                  {p.name}
                </h2>

                <div
                  className="h-px w-12"
                  style={{ background: "var(--violet-mid)" }}
                />

                <p
                  className="text-[15px] leading-[1.75] max-w-[620px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                  {p.stack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <span
                  className="font-mono text-[12px] mt-4 transition-all duration-200 group-hover:translate-x-[3px]"
                  style={{ color: "var(--violet-soft)" }}
                >
                  read the chapter →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-10 mt-10">
          <Link
            href="/"
            className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            ← back to home
          </Link>
        </div>
      </div>

      <WorkVariantSwitcher current={2} />
    </div>
  );
}
