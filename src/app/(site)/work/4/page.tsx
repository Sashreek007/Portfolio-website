import Link from "next/link";
import { projectHref } from "@/lib/projects";
import { getAllProjects } from "@/lib/projects.server";
import WorkVariantSwitcher from "@/components/site/WorkVariantSwitcher";

// Variant 4 — Feature Strips
// Full-width horizontal spreads, alternating left/right. Each strip has a
// geometric placeholder frame for the demo video on one side and an editorial
// block (eyebrow, title, blurb, stack as colophon) on the other. Magazine
// feature-spread rhythm.

export const metadata = { title: "Work v4 — Feature Strips" };

const statusTone = {
  active: "var(--green-bright)",
  shipped: "var(--text-muted)",
  building: "var(--amber-bright)",
} as const;

function MediaFrame({ index }: { index: number }) {
  // Decorative placeholder that hints "demo lives here" with crosshair marks.
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 10",
        background:
          "radial-gradient(1200px circle at 20% 0%, color-mix(in srgb, var(--violet-dim) 14%, transparent), transparent 55%), var(--bg-surface)",
        border: "1px solid var(--gray-800)",
        borderRadius: "6px",
      }}
    >
      {/* corner marks */}
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

      {/* centre label */}
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
          demo · reel {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      {/* faint grid lines */}
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

export default async function WorkVariant4() {
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
            WORK · FEATURE SPREADS
          </span>
          <span className="h-px flex-1" style={{ background: "var(--gray-800)" }} />
          <span
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            issue 01
          </span>
        </div>

        <h1
          className="text-[36px] lg:text-[44px] font-medium leading-[1.15] mb-4 tracking-[-0.015em] max-w-[720px]"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Builds, laid out as{" "}
          <span style={{ color: "var(--amber-bright)" }}>feature spreads</span>.
        </h1>
        <p
          className="text-[15px] leading-[1.75] mb-20 max-w-[640px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Every project gets a full-width feature with a demo frame and a
          reading column. Alternates sides so scrolling feels like turning
          pages.
        </p>

        <div className="flex flex-col gap-24">
          {projects.map((p, i) => {
            const reversed = i % 2 === 1;
            return (
              <Link
                key={p.id}
                href={projectHref(p)}
                className="feature group grid gap-10 lg:gap-14 items-center"
                style={{
                  gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
                  direction: reversed ? "rtl" : "ltr",
                }}
              >
                {/* Media */}
                <div style={{ direction: "ltr" }}>
                  <MediaFrame index={i} />
                </div>

                {/* Text column */}
                <div
                  className="flex flex-col gap-5"
                  style={{ direction: "ltr" }}
                >
                  <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] uppercase">
                    <span style={{ color: "var(--text-muted)" }}>
                      feature {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: "var(--gray-800)" }}>/</span>
                    <span style={{ color: "var(--amber-bright)" }}>
                      {p.year ?? "—"}
                    </span>
                    <span style={{ color: "var(--gray-800)" }}>/</span>
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
                    className="text-[30px] lg:text-[36px] font-medium leading-[1.15] tracking-[-0.015em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-body)",
                      cursor: "crosshair",
                    }}
                  >
                    {p.name}
                  </h2>

                  <div
                    className="h-px w-10"
                    style={{ background: "var(--violet-mid)" }}
                  />

                  <p
                    className="text-[15px] leading-[1.8]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.description}
                  </p>

                  {/* Colophon */}
                  <div
                    className="mt-3 pt-4 flex flex-wrap gap-x-5 gap-y-1"
                    style={{ borderTop: "1px solid var(--gray-800)" }}
                  >
                    <span
                      className="font-mono text-[10px] tracking-[0.15em] uppercase w-full"
                      style={{ color: "var(--text-muted)" }}
                    >
                      colophon
                    </span>
                    {p.stack.map((tech) => (
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
                    className="font-mono text-[12px] mt-4 inline-flex items-center gap-2 transition-all duration-200 group-hover:translate-x-[3px]"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    read the feature
                    <span>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pt-10 mt-20" style={{ borderTop: "1px solid var(--gray-800)" }}>
          <Link
            href="/"
            className="font-mono text-[12px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            ← back to home
          </Link>
        </div>
      </div>

      <WorkVariantSwitcher current={4} />
    </div>
  );
}
