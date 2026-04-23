import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";
import CopyHandle from "@/components/site/CopyHandle";

// Variant 9 — Liner notes.
// Back-of-the-record aesthetic: a track-list column of reasons to
// reach out on the left, the roles/credits (channels) on the right,
// a running "all songs written by" footer, everything in small caps
// with tracking pushed hard.

export const metadata = {
  title: "Contact · liner | Sashreek Addanki",
};

const reasons = [
  { n: "01", title: "for a co-op", sub: "intern slot, backend or MLOps" },
  { n: "02", title: "for a collab", sub: "systems project, weekend hack" },
  { n: "03", title: "for a referral", sub: "if you know someone hiring" },
  { n: "04", title: "for a paper", sub: "agentic AI, inference, runtime" },
  { n: "05", title: "for coffee", sub: "edmonton, or anywhere on MST" },
];

type Credit = {
  role: string;
  handle: string;
  href?: string;
  ext?: boolean;
  copy?: boolean;
  copyValue?: string;
};

const credits: Credit[] = [
  {
    role: "written & sent to",
    handle: "sashreek.addanki@gmail.com",
    href: "mailto:sashreek.addanki@gmail.com",
  },
  {
    role: "source · pushed by",
    handle: "github.com/Sashreek007",
    href: "https://github.com/Sashreek007",
    ext: true,
  },
  {
    role: "represented by",
    handle: "linkedin.com/in/sashreek-addanki",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    ext: true,
  },
  {
    role: "whispered to",
    handle: "discord · sashreek",
    copy: true,
    copyValue: "sashreek",
  },
];

export default function ContactVariant9() {
  return (
    <>
      <main
        className="min-h-screen w-full px-[6vw] py-24"
        style={{
          background:
            "radial-gradient(1100px circle at 10% 10%, color-mix(in srgb, var(--violet-dim) 10%, transparent), transparent 55%), var(--bg-base)",
        }}
      >
        <div className="max-w-[1120px] mx-auto">
          {/* Top plate — catalog number + title */}
          <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <div className="flex flex-col">
              <span
                className="font-mono text-[10.5px] tracking-[0.3em] uppercase mb-3"
                style={{ color: "var(--amber-bright)" }}
              >
                cat. № SA-2026-B &nbsp;·&nbsp; side b
              </span>
              <h1
                className="text-[54px] lg:text-[72px] leading-[0.95] font-medium tracking-[-0.02em]"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                liner{" "}
                <span
                  style={{
                    color: "var(--amber-bright)",
                    fontStyle: "italic",
                  }}
                >
                  notes.
                </span>
              </h1>
            </div>
            <div
              className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-right leading-[1.8]"
              style={{ color: "var(--text-muted)" }}
            >
              <div>A1 · reasons</div>
              <div>B1 · credits</div>
              <div style={{ color: "var(--gray-600)" }}>runtime: ~24h</div>
            </div>
          </div>

          <div
            className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-16"
            style={{ borderTop: "1px solid var(--gray-800)", paddingTop: "32px" }}
          >
            {/* LEFT — reasons (tracklist) */}
            <section>
              <h2 className="font-mono text-[13px] flex items-baseline gap-2 mb-6">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>
                  reasons to drop a line
                </span>
              </h2>
              <ol className="flex flex-col gap-[2px]">
                {reasons.map((r) => (
                  <li
                    key={r.n}
                    className="grid gap-4 py-[10px] font-mono"
                    style={{
                      gridTemplateColumns: "36px 1fr",
                      borderBottom: "1px solid var(--gray-800)",
                    }}
                  >
                    <span
                      className="text-[11px] tracking-[0.2em] uppercase pt-[2px]"
                      style={{ color: "var(--amber-bright)" }}
                    >
                      {r.n}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className="text-[15px] tracking-[0.02em]"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {r.title}
                      </span>
                      <span
                        className="text-[11.5px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {r.sub}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* RIGHT — credits (channels as roles) */}
            <section>
              <h2 className="font-mono text-[13px] flex items-baseline gap-2 mb-6">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>credits</span>
              </h2>
              <div className="flex flex-col gap-[2px]">
                {credits.map((c) => {
                  const body = (
                    <>
                      <span
                        className="text-[10.5px] tracking-[0.22em] uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {c.role}
                      </span>
                      <span
                        className="text-[16px] lg:text-[18px] tracking-[-0.005em] transition-colors duration-200 group-hover:text-[var(--violet-pale)] truncate"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {c.handle}
                      </span>
                      <span
                        className="text-[15px] text-right"
                        style={{ color: "var(--violet-soft)" }}
                      >
                        {c.copy ? "⧉" : c.ext ? "↗" : "→"}
                      </span>
                    </>
                  );
                  const rowStyle: React.CSSProperties = {
                    gridTemplateColumns: "150px 1fr 22px",
                    borderBottom: "1px solid var(--gray-800)",
                    textAlign: "left",
                  };
                  if (c.copy) {
                    return (
                      <CopyHandle
                        key={c.role}
                        value={c.copyValue ?? c.handle}
                        className="group grid items-baseline gap-5 py-[14px] w-full"
                        style={{
                          ...rowStyle,
                          background: "transparent",
                          border: "none",
                          borderBottomStyle: "solid",
                          borderBottomWidth: "1px",
                          borderBottomColor: "var(--gray-800)",
                        }}
                      >
                        {body}
                      </CopyHandle>
                    );
                  }
                  return (
                    <a
                      key={c.role}
                      href={c.href}
                      target={c.ext ? "_blank" : undefined}
                      rel={c.ext ? "noreferrer noopener" : undefined}
                      className="group grid items-baseline gap-5 py-[14px]"
                      style={rowStyle}
                    >
                      {body}
                    </a>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Running footer — album back-cover small-caps */}
          <div
            className="mt-14 pt-6 flex flex-wrap items-baseline justify-between gap-4 font-mono text-[10.5px] tracking-[0.22em] uppercase"
            style={{
              color: "var(--gray-600)",
              borderTop: "1px solid var(--gray-800)",
            }}
          >
            <span>
              all songs written &amp; sent by sashreek addanki
            </span>
            <span>℗ &amp; © 2026 · edmonton, ab</span>
          </div>
        </div>
      </main>
      <ContactVariantSwitcher current={9} />
    </>
  );
}
