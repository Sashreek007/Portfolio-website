import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";

// Variant 4 — Dossier.
// Press-kit style spread: a narrow left rail of status metadata
// (timezone, response time, currently, etc.) and a wide right column
// rendering the three channels as oversized editorial rows with a
// blurb under each. Built out of the existing ## markers + hairline
// vocabulary so it sits next to the blog archive.

export const metadata = {
  title: "Contact · dossier | Sashreek Addanki",
};

const meta = [
  { k: "status", v: "available · open to inbound" },
  { k: "timezone", v: "MST · UTC-7" },
  { k: "response", v: "24–48 hours" },
  { k: "currently", v: "2nd year CS · UAlberta" },
  { k: "open for", v: "internships, research, collaborations" },
  { k: "not for", v: "cold crypto pitches, recruiters selling courses" },
];

const channels = [
  {
    n: "01",
    label: "email",
    value: "sashreek.addanki@gmail.com",
    blurb:
      "Fastest route — long or short, I read everything. Mark [urgent] in the subject if it actually is.",
    href: "mailto:sashreek.addanki@gmail.com",
  },
  {
    n: "02",
    label: "github",
    value: "Sashreek007",
    blurb:
      "Projects, half-finished experiments, and the occasional issue reply. Pull requests welcome.",
    href: "https://github.com/Sashreek007",
    ext: true,
  },
  {
    n: "03",
    label: "linkedin",
    value: "sashreek-addanki",
    blurb:
      "Recruiter-facing. The place for formal intros, referrals, and co-op conversations.",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    ext: true,
  },
];

export default function ContactVariant4() {
  return (
    <>
      <main
        className="min-h-screen w-full px-[6vw] py-20"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-[1280px] mx-auto flex flex-col">
          {/* Kicker */}
          <div className="flex items-center gap-4 mb-14">
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Contact · dossier
            </span>
            <span
              className="h-px flex-1"
              style={{ background: "var(--gray-800)" }}
            />
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              press-kit.md
            </span>
          </div>

          <h1
            className="text-[38px] lg:text-[46px] leading-[1.1] font-medium tracking-[-0.015em] mb-20 max-w-[820px]"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            How to reach me, in{" "}
            <span style={{ color: "var(--violet-pale)" }}>one page</span>.
          </h1>

          <div className="grid lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-20">
            {/* Left — meta stack */}
            <aside
              className="flex flex-col gap-5 pr-6"
              style={{ borderRight: "1px solid var(--gray-800)" }}
            >
              <h2 className="font-mono text-[13px] flex items-baseline gap-2 mb-1">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>status</span>
              </h2>
              <dl className="flex flex-col gap-[12px] font-mono text-[12px]">
                {meta.map(({ k, v }) => (
                  <div
                    key={k}
                    className="grid grid-cols-[110px_1fr] items-baseline gap-3"
                  >
                    <dt
                      className="tracking-[0.14em] uppercase text-[10.5px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {k}
                    </dt>
                    <dd style={{ color: "var(--text-primary)" }}>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--gray-800)" }}>
                <span
                  className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase"
                  style={{ color: "var(--green-bright)" }}
                >
                  <span
                    className="w-[7px] h-[7px] rounded-full inline-block"
                    style={{
                      background: "var(--green-bright)",
                      animation: "pulse-dot 2.5s ease-in-out infinite",
                      boxShadow: "0 0 12px var(--green-bright)",
                    }}
                  />
                  mailbox open
                </span>
              </div>
            </aside>

            {/* Right — channels */}
            <div className="flex flex-col">
              <h2 className="font-mono text-[13px] flex items-baseline gap-2 mb-8">
                <span style={{ color: "var(--violet-soft)" }}>##</span>
                <span style={{ color: "var(--text-primary)" }}>channels</span>
              </h2>

              <div
                className="flex flex-col"
                style={{ borderTop: "1px solid var(--gray-800)" }}
              >
                {channels.map(({ n, label, value, blurb, href, ext }) => (
                  <a
                    key={label}
                    href={href}
                    target={ext ? "_blank" : undefined}
                    rel={ext ? "noreferrer noopener" : undefined}
                    className="group grid gap-6 py-8 transition-colors duration-200"
                    style={{
                      gridTemplateColumns: "50px 1fr 40px",
                      borderBottom: "1px solid var(--gray-800)",
                    }}
                  >
                    <span
                      className="font-mono text-[11px] tracking-[0.2em] uppercase pt-[6px]"
                      style={{ color: "var(--violet-soft)" }}
                    >
                      {n}
                    </span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline gap-4">
                        <span
                          className="font-mono text-[10.5px] tracking-[0.2em] uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {label}
                        </span>
                        <span
                          className="text-[24px] lg:text-[28px] leading-[1.1] tracking-[-0.01em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {value}
                        </span>
                      </div>
                      <p
                        className="text-[14px] leading-[1.65] max-w-[560px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {blurb}
                      </p>
                    </div>
                    <span
                      className="font-mono text-[20px] pt-[6px] transition-transform duration-200 group-hover:translate-x-[3px]"
                      style={{ color: "var(--violet-soft)" }}
                    >
                      {ext ? "↗" : "→"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <ContactVariantSwitcher current={4} />
    </>
  );
}
