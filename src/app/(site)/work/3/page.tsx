import Link from "next/link";
import { projectHref } from "@/lib/projects";
import { getAllProjects } from "@/lib/projects.server";
import WorkVariantSwitcher from "@/components/site/WorkVariantSwitcher";

// Variant 3 — Release Log
// Project list rendered as a vertical CHANGELOG with version tags, release
// dates, ## release headings, and scope bullets. Leans into the markdown /
// readme identity of the rest of the site without becoming a terminal.

export const metadata = { title: "Work v3 — Release Log" };

const statusTone = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
} as const;

// synthesize a fake semver from sort_order so each release feels distinct
const versionFor = (i: number, total: number) => {
  const major = total - i;
  return `v${major}.${(i * 3) % 10}.${(i * 7) % 10}`;
};

export default async function WorkVariant3() {
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
            WORK · RELEASE LOG
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            CHANGELOG.md
          </span>
        </div>

        <h1
          className="text-[36px] lg:text-[44px] font-medium leading-[1.15] mb-4 tracking-[-0.015em] max-w-[720px]"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          A running log of{" "}
          <span style={{ color: "var(--violet-pale)" }}>what shipped</span>.
        </h1>
        <p
          className="text-[15px] leading-[1.75] mb-16 max-w-[640px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Projects framed as releases — each tagged with a version, a date, and
          the scope of work. Open any entry to read the full release notes.
        </p>

        {/* Timeline */}
        <div
          className="relative flex flex-col gap-0 pl-8"
          style={{
            borderLeft: "1px dashed var(--gray-800)",
          }}
        >
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={projectHref(p)}
              className="release group relative block py-8"
              style={{
                borderBottom:
                  i < projects.length - 1
                    ? "1px solid var(--gray-800)"
                    : "none",
              }}
            >
              {/* dot on timeline */}
              <span
                className="absolute w-[11px] h-[11px] rounded-full"
                style={{
                  left: "-38px",
                  top: "36px",
                  background: "var(--bg-base)",
                  border: `2px solid ${
                    p.status === "active"
                      ? "var(--green-bright)"
                      : p.status === "building"
                      ? "var(--amber-bright)"
                      : "var(--violet-mid)"
                  }`,
                  boxShadow:
                    p.status === "active"
                      ? "0 0 10px var(--green-mid)"
                      : "none",
                }}
              />

              {/* release header */}
              <div className="flex items-baseline gap-3 flex-wrap mb-3 font-mono text-[12px]">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span
                  className="px-2 py-[2px]"
                  style={{
                    color: "var(--violet-pale)",
                    border: "1px solid var(--violet-mid)",
                    borderRadius: "3px",
                    background:
                      "color-mix(in srgb, var(--violet-dim) 25%, transparent)",
                  }}
                >
                  {versionFor(i, projects.length)}
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  released {p.year ?? "—"}
                </span>
                <span style={{ color: "var(--gray-800)" }}>·</span>
                <span
                  className="flex items-center gap-[6px] uppercase tracking-[0.08em]"
                  style={{ color: statusTone[p.status] }}
                >
                  <span
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ background: statusTone[p.status] }}
                  />
                  {p.status}
                </span>
              </div>

              {/* title */}
              <h2
                className="text-[22px] lg:text-[26px] font-medium leading-[1.25] mb-3 tracking-[-0.012em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  cursor: "crosshair",
                }}
              >
                {p.name}
              </h2>

              {/* scope bullets — synthesized from stack */}
              <ul className="flex flex-col gap-[6px] mb-4 font-mono text-[12.5px] leading-[1.65]">
                <li className="flex gap-3" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--amber-bright)" }}>+</span>
                  <span>{p.description}</span>
                </li>
                <li className="flex gap-3" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--green-bright)" }}>·</span>
                  <span>
                    <span style={{ color: "var(--text-muted)" }}>stack:</span>{" "}
                    {p.stack.join(", ")}
                  </span>
                </li>
              </ul>

              <span
                className="font-mono text-[12px] transition-all duration-200 inline-flex items-center gap-2 group-hover:translate-x-[3px]"
                style={{ color: "var(--violet-soft)" }}
              >
                read release notes
                <span>→</span>
              </span>
            </Link>
          ))}
        </div>

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

      <WorkVariantSwitcher current={3} />
    </div>
  );
}
