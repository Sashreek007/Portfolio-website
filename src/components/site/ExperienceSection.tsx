import { EXPERIENCE, type Role } from "@/lib/experience";

// Experience as a wiring diagram rather than a list of cards: one spine per
// role, with each bullet branching off it. It echoes the hero schematic and
// the "## channels" dossier rows, so it reads as part of the same system
// instead of a résumé pasted in. Layout only — every string comes from
// src/lib/experience.ts.

function OrgMark({ role }: { role: Role }) {
  return (
    <span
      className="xp-mark"
      aria-hidden
      style={{
        backgroundImage: role.logo ? `url(${role.logo})` : undefined,
      }}
    >
      {!role.logo && (
        <span className="font-mono text-[13px] tracking-[0.04em]">
          {role.monogram}
        </span>
      )}
    </span>
  );
}

function RoleEntry({ role, index }: { role: Role; index: number }) {
  return (
    <article
      className="reveal-child xp-role"
      style={{ "--ri": Math.min(index + 1, 3) } as React.CSSProperties}
    >
      {/* Header: mark, title/org on the left, dates on the right */}
      <div className="xp-head">
        <OrgMark role={role} />

        <div className="min-w-0">
          <h3
            className="text-[21px] lg:text-[25px] font-medium leading-[1.2] tracking-[-0.015em]"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            {role.title}
          </h3>
          <p
            className="font-mono text-[12.5px] mt-[6px]"
            style={{ color: "var(--violet-soft)" }}
          >
            {role.org}
          </p>
        </div>

        <div className="xp-when font-mono text-[11.5px] tracking-[0.1em] uppercase">
          <span
            className="flex items-center gap-2 justify-end"
            style={{ color: role.current ? "var(--green-bright)" : "var(--text-muted)" }}
          >
            {role.current && (
              <span
                className="inline-block w-[5px] h-[5px] rounded-full"
                style={{
                  background: "var(--green-mid)",
                  boxShadow: "0 0 8px var(--green-mid)",
                }}
              />
            )}
            {role.period}
          </span>
          <span className="block mt-[6px]" style={{ color: "var(--gray-600)" }}>
            {role.location}
          </span>
        </div>
      </div>

      {/* Branches — the spine runs down the ul, each li taps off it */}
      <ul className="xp-branches">
        {role.bullets.map((line) => (
          <li key={line} className="xp-branch">
            <span
              className="text-[14.5px] leading-[1.65]"
              style={{ color: "var(--text-secondary)" }}
            >
              {line}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ExperienceSection() {
  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="reveal-child flex items-end justify-between flex-wrap gap-4 mb-12">
        <h2
          className="font-medium"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(32px, 4.4vw, 54px)",
            lineHeight: 1.06,
            letterSpacing: "-0.022em",
          }}
        >
          Where I&apos;ve{" "}
          <span style={{ color: "var(--violet-pale)" }}>worked</span>
        </h2>
        <span
          className="font-mono text-[12px] tracking-[0.16em] uppercase pb-2"
          style={{ color: "var(--amber-bright)" }}
        >
          {String(EXPERIENCE.length).padStart(2, "0")} roles
        </span>
      </div>

      {EXPERIENCE.map((role, i) => (
        <RoleEntry key={role.org + role.title} role={role} index={i} />
      ))}
    </div>
  );
}
