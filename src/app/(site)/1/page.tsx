import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";
import CopyHandle from "@/components/site/CopyHandle";

// Variant 1 — Correspondence.
// A tight editorial letter: dateline, salutation, a short note, a
// list of channels, signed off at the bottom. Centered narrow column,
// no cards or chrome — reads like a page ripped out of a journal.

export const metadata = {
  title: "Contact · letter | Sashreek Addanki",
};

const channels = [
  {
    label: "email",
    value: "sashreek.addanki@gmail.com",
    href: "mailto:sashreek.addanki@gmail.com",
  },
  {
    label: "github",
    value: "Sashreek007",
    href: "https://github.com/Sashreek007",
    ext: true,
  },
  {
    label: "linkedin",
    value: "sashreek-addanki",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    ext: true,
  },
];

export default function ContactVariant1() {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <main
        className="min-h-screen w-full flex items-center justify-center px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <article
          className="w-full max-w-[620px] flex flex-col"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {/* Dateline kicker */}
          <div className="flex items-center gap-4 mb-14">
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Contact · Letter № 01
            </span>
            <span
              className="h-px flex-1"
              style={{ background: "var(--gray-800)" }}
            />
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              correspondence.md
            </span>
          </div>

          <div
            className="font-mono text-[12px] leading-[1.8] mb-10"
            style={{ color: "var(--text-muted)" }}
          >
            Edmonton, AB
            <br />
            {today}
          </div>

          <p
            className="text-[18px] leading-[1.55] mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            To whoever&rsquo;s reading —
          </p>

          <div
            className="flex flex-col gap-5 text-[16px] leading-[1.8] mb-12"
            style={{ color: "var(--text-secondary)" }}
          >
            <p>
              I&rsquo;m Sashreek. I study computing science at UAlberta and
              spend most of my time on AI + systems work that isn&rsquo;t
              trying to be a demo.
            </p>
            <p>
              Open to internship offers, a second pair of eyes on a weird
              systems problem, or a long email about a paper you can&rsquo;t
              stop thinking about. If that&rsquo;s you, any of the addresses
              below reach me:
            </p>
          </div>

          {/* Channel list — dotted-leader TOC style */}
          <div
            className="flex flex-col font-mono text-[13px] mb-14"
            style={{ color: "var(--text-primary)" }}
          >
            {channels.map(({ label, value, href, ext }, i) => (
              <a
                key={label}
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noreferrer noopener" : undefined}
                className="group grid items-baseline gap-3 py-[10px] transition-colors duration-150"
                style={{
                  gridTemplateColumns: "90px 1fr auto",
                  borderTop: "1px dashed var(--gray-800)",
                }}
              >
                <span
                  className="tracking-[0.12em] uppercase text-[10.5px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
                <span
                  className="group-hover:text-[var(--violet-pale)] transition-colors duration-150"
                  style={{ color: "var(--text-primary)" }}
                >
                  {value}
                </span>
                <span
                  className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ color: "var(--violet-soft)" }}
                >
                  {ext ? "↗" : "→"}
                </span>
              </a>
            ))}
            {/* Discord has no canonical URL — render as a copy-on-click
                row so the handle is still one gesture away. */}
            <CopyHandle
              value="sashreek"
              className="group grid items-baseline gap-3 py-[10px] w-full font-mono text-[13px]"
              style={{
                gridTemplateColumns: "90px 1fr auto",
                borderTop: "1px dashed var(--gray-800)",
                borderBottom: "1px dashed var(--gray-800)",
                background: "transparent",
                border: "none",
                borderTopStyle: "dashed",
                borderBottomStyle: "dashed",
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                borderTopColor: "var(--gray-800)",
                borderBottomColor: "var(--gray-800)",
              }}
            >
              <span
                className="tracking-[0.12em] uppercase text-[10.5px]"
                style={{ color: "var(--text-muted)" }}
              >
                discord
              </span>
              <span
                className="group-hover:text-[var(--violet-pale)] transition-colors duration-150"
                style={{ color: "var(--text-primary)" }}
              >
                sashreek
              </span>
              <span
                className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ color: "var(--violet-soft)" }}
              >
                copy
              </span>
            </CopyHandle>
          </div>

          {/* Sign-off */}
          <div className="flex flex-col gap-2">
            <p
              className="text-[15px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Yours in systems,
            </p>
            <p
              className="text-[44px] leading-[0.9] tracking-[-0.015em]"
              style={{
                color: "var(--amber-bright)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
              }}
            >
              — sashreek
            </p>
          </div>
        </article>
      </main>
      <ContactVariantSwitcher current={1} />
    </>
  );
}
