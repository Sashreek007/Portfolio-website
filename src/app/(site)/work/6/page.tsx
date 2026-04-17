import Link from "next/link";
import { projectHref } from "@/lib/projects";
import { getAllProjects } from "@/lib/projects.server";
import WorkVariantSwitcher from "@/components/site/WorkVariantSwitcher";

// Variant 6 — Broadsheet
// Newspaper front-page layout: masthead row with date + volume, one lead
// story (featured project with demo frame, large display title, deck), then a
// multi-column "below the fold" grid of secondary stories. Shares v4's
// featured-demo energy and v5's card grid but composes them editorially.

export const metadata = { title: "Work v6 — Broadsheet" };

const statusTone = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
} as const;

function LeadMedia() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 9",
        background:
          "radial-gradient(900px circle at 25% 0%, color-mix(in srgb, var(--violet-dim) 18%, transparent), transparent 60%), var(--bg-surface)",
        border: "1px solid var(--gray-800)",
        borderRadius: "6px",
      }}
    >
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
            borderTop: pos.top !== undefined ? "1px solid var(--gray-600)" : undefined,
            borderBottom: pos.bottom !== undefined ? "1px solid var(--gray-600)" : undefined,
            borderLeft: pos.left !== undefined ? "1px solid var(--gray-600)" : undefined,
            borderRight: pos.right !== undefined ? "1px solid var(--gray-600)" : undefined,
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-[6px]"
          style={{
            color: "var(--text-muted)",
            border: "1px solid var(--gray-800)",
            borderRadius: "999px",
            background: "color-mix(in srgb, var(--bg-base) 70%, transparent)",
          }}
        >
          lead · demo reel
        </div>
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--gray-800) 1px, transparent 1px), linear-gradient(90deg, var(--gray-800) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

export default async function WorkVariant6() {
  const projects = await getAllProjects();
  const [lead, ...rest] = projects;

  return (
    <div
      className="min-h-screen w-full px-[6vw] py-16"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Masthead */}
        <div
          className="flex items-baseline justify-between pb-4 mb-3"
          style={{ borderBottom: "2px solid var(--gray-800)" }}
        >
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            VOL. 01 · NO. {String(projects.length).padStart(2, "0")}
          </span>
          <h1
            className="text-[28px] lg:text-[34px] font-medium tracking-[-0.02em]"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            The Build Broadsheet
          </h1>
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            edmonton · 2024—25
          </span>
        </div>

        {/* Hairline rule (second line of masthead) */}
        <div
          className="flex items-center justify-between pb-8 mb-10"
          style={{ borderBottom: "1px solid var(--gray-800)" }}
        >
          <span
            className="font-mono text-[10px] tracking-[0.25em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            engineering · ai · systems
          </span>
          <span
            className="font-mono text-[10px] tracking-[0.25em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            by sashreek addanki
          </span>
        </div>

        {/* Lead story */}
        {lead && (
          <Link
            href={projectHref(lead)}
            className="lead group block mb-14"
          >
            {/* eyebrow */}
            <div className="flex items-center gap-3 mb-4 font-mono text-[11px] tracking-[0.12em] uppercase">
              <span
                className="px-[6px] py-[2px]"
                style={{
                  color: "var(--bg-base)",
                  background: "var(--amber-bright)",
                  borderRadius: "2px",
                  letterSpacing: "0.14em",
                }}
              >
                LEAD
              </span>
              <span style={{ color: "var(--text-muted)" }}>
                filed {lead.year ?? "—"}
              </span>
              <span style={{ color: "var(--gray-800)" }}>·</span>
              <span
                className="flex items-center gap-[6px]"
                style={{ color: statusTone[lead.status] }}
              >
                <span
                  className="w-[6px] h-[6px] rounded-full"
                  style={{
                    background: statusTone[lead.status],
                    boxShadow:
                      lead.status === "active"
                        ? `0 0 8px ${statusTone.active}`
                        : "none",
                  }}
                />
                {lead.status}
              </span>
            </div>

            <div
              className="grid gap-10 lg:gap-14 items-center"
              style={{ gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)" }}
            >
              <LeadMedia />

              <div className="flex flex-col gap-5">
                <h2
                  className="font-medium tracking-[-0.018em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                  style={{
                    fontSize: "clamp(32px, 4.4vw, 54px)",
                    lineHeight: 1.05,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    cursor: "crosshair",
                  }}
                >
                  {lead.name}
                </h2>

                <div
                  className="h-px w-12"
                  style={{ background: "var(--violet-mid)" }}
                />

                {/* Deck */}
                <p
                  className="text-[17px] leading-[1.6] font-medium"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                >
                  {lead.description.split(".")[0]}.
                </p>

                <p
                  className="text-[14.5px] leading-[1.75]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {lead.description.split(".").slice(1).join(".").trim()}
                </p>

                <div
                  className="mt-3 pt-4 flex flex-wrap gap-x-5 gap-y-1"
                  style={{ borderTop: "1px solid var(--gray-800)" }}
                >
                  <span
                    className="font-mono text-[10px] tracking-[0.15em] uppercase w-full"
                    style={{ color: "var(--text-muted)" }}
                  >
                    byline · stack
                  </span>
                  {lead.stack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[11px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <span
                  className="font-mono text-[12px] mt-3 inline-flex items-center gap-2 transition-all duration-200 group-hover:translate-x-[3px]"
                  style={{ color: "var(--violet-soft)" }}
                >
                  continue on A2
                  <span>→</span>
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Below the fold — section rule */}
        <div
          className="flex items-center gap-4 mt-6 mb-10"
          style={{ borderTop: "2px solid var(--gray-800)", paddingTop: "20px" }}
        >
          <span
            className="font-mono text-[11px] tracking-[0.22em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            · BELOW THE FOLD ·
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.22em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            more stories
          </span>
        </div>

        {/* Columns of secondary stories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((p, i) => (
            <Link
              key={p.id}
              href={projectHref(p)}
              className="story group flex flex-col gap-3 pb-6 transition-all duration-200 hover:-translate-y-[2px]"
              style={{
                borderBottom: "1px solid var(--gray-800)",
              }}
            >
              {/* story header: slug number + dateline */}
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase">
                <span style={{ color: "var(--amber-bright)" }}>
                  №{String(i + 2).padStart(2, "0")}
                </span>
                <span style={{ color: "var(--gray-800)" }}>·</span>
                <span style={{ color: "var(--text-muted)" }}>
                  {p.year ?? "—"}
                </span>
                <span style={{ color: "var(--gray-800)" }}>·</span>
                <span
                  className="flex items-center gap-[5px]"
                  style={{ color: statusTone[p.status] }}
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full"
                    style={{
                      background: statusTone[p.status],
                      boxShadow:
                        p.status === "active"
                          ? `0 0 6px ${statusTone.active}`
                          : "none",
                    }}
                  />
                  {p.status}
                </span>
              </div>

              <h3
                className="text-[20px] font-medium leading-[1.2] tracking-[-0.012em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  cursor: "crosshair",
                }}
              >
                {p.name}
              </h3>

              <div
                className="h-px w-6"
                style={{ background: "var(--violet-mid)" }}
              />

              <p
                className="text-[13.5px] leading-[1.6]"
                style={{ color: "var(--text-secondary)" }}
              >
                {p.description}
              </p>

              <div
                className="font-mono text-[11px] mt-auto pt-2"
                style={{ color: "var(--text-muted)" }}
              >
                {p.stack.slice(0, 4).join(" · ")}
                {p.stack.length > 4 && " · …"}
              </div>

              <span
                className="font-mono text-[11px] transition-all duration-200 group-hover:translate-x-[3px]"
                style={{ color: "var(--violet-soft)" }}
              >
                read →
              </span>
            </Link>
          ))}
        </div>

        <div className="pt-10 mt-16" style={{ borderTop: "2px solid var(--gray-800)" }}>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-muted)" }}
            >
              ← back to home
            </Link>
            <span
              className="font-mono text-[10px] tracking-[0.25em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              — 30 —
            </span>
          </div>
        </div>
      </div>

      <WorkVariantSwitcher current={6} />
    </div>
  );
}
