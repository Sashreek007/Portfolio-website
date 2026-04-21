import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";
import CopyHandle from "@/components/site/CopyHandle";

// Variant 4 — Dossier.
// Press-kit style spread: a narrow left rail of status metadata
// (timezone, response time, currently, etc.) and a wide right column
// rendering the three channels as oversized editorial rows with a
// blurb under each. Built out of the existing ## markers + hairline
// vocabulary so it sits next to the blog archive.

export const metadata = {
  title: "Contact · dossier | Sashreek Addanki",
};

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

          <div className="flex flex-col max-w-[860px]">
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

              {/* 04 · discord — copy-on-click row, matches the others */}
              <CopyHandle
                value="sashreek"
                copiedLabel="copied to clipboard"
                className="group grid gap-6 py-8 w-full"
                style={{
                  gridTemplateColumns: "50px 1fr 40px",
                  borderBottom: "1px solid var(--gray-800)",
                  background: "transparent",
                  border: "none",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1px",
                  borderBottomColor: "var(--gray-800)",
                }}
              >
                <span
                  className="font-mono text-[11px] tracking-[0.2em] uppercase pt-[6px]"
                  style={{ color: "var(--violet-soft)" }}
                >
                  04
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-4">
                    <span
                      className="font-mono text-[10.5px] tracking-[0.2em] uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      discord
                    </span>
                    <span
                      className="text-[24px] lg:text-[28px] leading-[1.1] tracking-[-0.01em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      sashreek
                    </span>
                  </div>
                  <p
                    className="text-[14px] leading-[1.65] max-w-[560px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Quick DMs. Click the handle to copy — Discord has no
                    canonical profile URL to link out to.
                  </p>
                </div>
                <span
                  className="font-mono text-[18px] pt-[6px]"
                  style={{ color: "var(--violet-soft)" }}
                >
                  ⧉
                </span>
              </CopyHandle>
            </div>
          </div>
        </div>
      </main>
      <ContactVariantSwitcher current={4} />
    </>
  );
}
