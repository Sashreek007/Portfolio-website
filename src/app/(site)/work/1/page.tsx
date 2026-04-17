import Link from "next/link";
import { getAllProjects, projectHref } from "@/lib/projects";
import WorkVariantSwitcher from "@/components/site/WorkVariantSwitcher";

// Variant 1 — Archive Index
// Projects as a dense editorial table: numbered rows, columns for year /
// title / stack / status, row hover reveals a violet glow and a trailing arrow.
// Reads like a library catalog, not a terminal.

export const metadata = { title: "Work v1 — Archive Index" };

const statusTone = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
} as const;

export default async function WorkVariant1() {
  const projects = await getAllProjects();

  return (
    <div
      className="min-h-screen w-full px-[6vw] py-20"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Kicker */}
        <div className="flex items-center gap-4 mb-14">
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            WORK · ARCHIVE INDEX
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {String(projects.length).padStart(2, "0")} entries
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-[36px] lg:text-[44px] font-medium leading-[1.15] mb-4 tracking-[-0.015em]"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          An indexed record of{" "}
          <span style={{ color: "var(--violet-pale)" }}>every build</span>.
        </h1>
        <p
          className="text-[15px] leading-[1.75] mb-12 max-w-[640px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Personal projects, research, and community work — catalogued by year.
          Click any row to open the case file.
        </p>

        {/* Column header */}
        <div
          className="grid gap-4 font-mono text-[11px] tracking-[0.12em] uppercase pb-3 mb-1"
          style={{
            gridTemplateColumns: "40px 70px 1fr 140px 110px",
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--gray-800)",
          }}
        >
          <span>№</span>
          <span>year</span>
          <span>title · stack</span>
          <span className="text-right">status</span>
          <span className="text-right">open</span>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={projectHref(p)}
              className="archive-row group grid gap-4 py-5 items-baseline relative transition-colors duration-200"
              style={{
                gridTemplateColumns: "40px 70px 1fr 140px 110px",
                borderBottom: "1px solid var(--gray-800)",
              }}
            >
              <span
                className="font-mono text-[12px]"
                style={{ color: "var(--text-muted)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="font-mono text-[12px]"
                style={{ color: "var(--amber-bright)" }}
              >
                {p.year ?? "—"}
              </span>
              <span className="flex flex-col gap-[6px]">
                <span
                  className="text-[17px] font-medium leading-[1.3] transition-colors duration-150 group-hover:text-[var(--violet-pale)]"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    cursor: "crosshair",
                  }}
                >
                  {p.name}
                </span>
                <span
                  className="font-mono text-[11px] leading-[1.5]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {p.stack.slice(0, 5).join(" · ")}
                  {p.stack.length > 5 && " · …"}
                </span>
              </span>
              <span className="flex items-center justify-end gap-[6px]">
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
                <span
                  className="font-mono text-[11px] tracking-[0.08em] uppercase"
                  style={{ color: statusTone[p.status] }}
                >
                  {p.status}
                </span>
              </span>
              <span
                className="font-mono text-[12px] text-right transition-all duration-200 group-hover:text-[var(--violet-pale)] group-hover:translate-x-[3px]"
                style={{ color: "var(--text-muted)" }}
              >
                open →
              </span>

              {/* hover glow bar */}
              <span
                className="pointer-events-none absolute left-0 top-0 bottom-0 w-[2px] transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                style={{ background: "var(--violet-soft)" }}
              />
            </Link>
          ))}
        </div>

        {/* Back */}
        <div className="pt-10 mt-10" style={{ borderTop: "1px solid var(--gray-800)" }}>
          <Link
            href="/"
            className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            ← back to home
          </Link>
        </div>
      </div>

      <WorkVariantSwitcher current={1} />
    </div>
  );
}
