import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";
import CopyHandle from "@/components/site/CopyHandle";

// Variant 6 — Ledger.
// Accounting-register treatment: a tabulated book with channel name,
// handle, response time, and a posted-since date. Alternating row tint
// and tabular-nums everywhere so it reads as a balance sheet.

export const metadata = {
  title: "Contact · ledger | Sashreek Addanki",
};

const rows = [
  {
    label: "email",
    handle: "sashreek.addanki@gmail.com",
    response: "24–48h",
    since: "2022-09",
    href: "mailto:sashreek.addanki@gmail.com",
  },
  {
    label: "github",
    handle: "Sashreek007",
    response: "1–2 days",
    since: "2021-06",
    href: "https://github.com/Sashreek007",
    ext: true,
  },
  {
    label: "linkedin",
    handle: "sashreek-addanki",
    response: "2–4 days",
    since: "2023-02",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    ext: true,
  },
  {
    label: "discord",
    handle: "sashreek",
    response: "~same day",
    since: "2020-03",
    copy: true,
  },
];

export default function ContactVariant6() {
  return (
    <>
      <main
        className="min-h-screen w-full px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-[980px] mx-auto">
          {/* Masthead */}
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p
                className="font-mono text-[11px] tracking-[0.22em] uppercase mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Contact · Ledger
              </p>
              <h1
                className="text-[44px] lg:text-[54px] leading-[1.05] font-medium tracking-[-0.015em]"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                The channel register.
              </h1>
            </div>
            <div
              className="font-mono text-[11px] tracking-[0.12em] uppercase text-right"
              style={{ color: "var(--text-muted)" }}
            >
              <div>FY 2026 · Q2</div>
              <div style={{ color: "var(--gray-600)" }}>posted by SA</div>
            </div>
          </div>

          {/* Register */}
          <div
            className="font-mono text-[12px]"
            style={{
              border: "1px solid var(--gray-800)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {/* Header row */}
            <div
              className="grid items-baseline gap-4 px-5 py-3 tracking-[0.14em] uppercase text-[10.5px]"
              style={{
                gridTemplateColumns: "100px 1fr 120px 90px 32px",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                borderBottom: "1px solid var(--gray-800)",
              }}
            >
              <span>channel</span>
              <span>handle</span>
              <span>response</span>
              <span className="text-right tabular-nums">posted</span>
              <span />
            </div>

            {/* Entries */}
            {rows.map((r, i) => {
              const rowStyle: React.CSSProperties = {
                gridTemplateColumns: "100px 1fr 120px 90px 32px",
                background:
                  i % 2 === 0
                    ? "transparent"
                    : "color-mix(in srgb, var(--bg-elevated) 35%, transparent)",
                borderBottom:
                  i < rows.length - 1
                    ? "1px solid var(--gray-800)"
                    : undefined,
                textAlign: "left",
              };
              const body = (
                <>
                  <span
                    className="tracking-[0.14em] uppercase text-[10.5px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.label}
                  </span>
                  <span
                    className="transition-colors duration-150 truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.handle}
                  </span>
                  <span
                    className="tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {r.response}
                  </span>
                  <span
                    className="text-right tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.since}
                  </span>
                  <span
                    className="text-right"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    {r.copy ? "⧉" : r.ext ? "↗" : "→"}
                  </span>
                </>
              );

              if (r.copy) {
                return (
                  <CopyHandle
                    key={r.label}
                    value={r.handle}
                    className="group grid items-baseline gap-4 px-5 py-4 w-full hover:bg-[color-mix(in_srgb,var(--violet-dim)_10%,transparent)] transition-colors"
                    style={{
                      ...rowStyle,
                      border: "none",
                    }}
                  >
                    {body}
                  </CopyHandle>
                );
              }

              return (
                <a
                  key={r.label}
                  href={r.href}
                  target={r.ext ? "_blank" : undefined}
                  rel={r.ext ? "noreferrer noopener" : undefined}
                  className="group grid items-baseline gap-4 px-5 py-4 hover:bg-[color-mix(in_srgb,var(--violet-dim)_10%,transparent)] transition-colors"
                  style={rowStyle}
                >
                  {body}
                </a>
              );
            })}

            {/* Totals row */}
            <div
              className="grid items-baseline gap-4 px-5 py-3 tracking-[0.14em] uppercase text-[10.5px]"
              style={{
                gridTemplateColumns: "100px 1fr 120px 90px 32px",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                borderTop: "1px solid var(--gray-800)",
              }}
            >
              <span>total</span>
              <span style={{ color: "var(--text-primary)" }}>
                4 channels · 1 author
              </span>
              <span className="tabular-nums">—</span>
              <span
                className="text-right tabular-nums"
                style={{ color: "var(--green-bright)" }}
              >
                balanced
              </span>
              <span />
            </div>
          </div>

          <p
            className="font-mono text-[10.5px] tracking-[0.22em] uppercase mt-4"
            style={{ color: "var(--gray-600)" }}
          >
            — entries stay open until closed. mailbox active.
          </p>
        </div>
      </main>
      <ContactVariantSwitcher current={6} />
    </>
  );
}
