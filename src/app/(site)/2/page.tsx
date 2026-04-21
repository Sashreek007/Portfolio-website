import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";
import CopyHandle from "@/components/site/CopyHandle";

// Variant 2 — Masthead & Directory.
// Gigantic CONTACT masthead stretched across the page, issue metadata
// below, then a two-column body: left = availability blurb, right =
// bordered contact directory with hairline rules (matches the blog
// archive's editorial typography).

export const metadata = {
  title: "Contact · masthead | Sashreek Addanki",
};

const directory = [
  {
    label: "email",
    value: "sashreek.addanki@gmail.com",
    href: "mailto:sashreek.addanki@gmail.com",
  },
  {
    label: "github",
    value: "github.com/Sashreek007",
    href: "https://github.com/Sashreek007",
    ext: true,
  },
  {
    label: "linkedin",
    value: "linkedin.com/in/sashreek-addanki",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    ext: true,
  },
];

export default function ContactVariant2() {
  return (
    <>
      <main
        className="min-h-screen w-full px-[6vw] py-20"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-[1280px] mx-auto flex flex-col">
          {/* Issue metadata row */}
          <div
            className="flex items-center justify-between font-mono text-[11px] tracking-[0.22em] uppercase mb-10"
            style={{ color: "var(--text-muted)" }}
          >
            <span>
              vol. 02 &nbsp; · &nbsp; issue 04 &nbsp; · &nbsp; spring 2026
            </span>
            <span>—</span>
            <span>edmonton, ab</span>
          </div>

          {/* Masthead — one giant word, justified */}
          <h1
            className="font-mono font-medium leading-[0.9] tracking-[-0.05em] mb-4"
            style={{
              fontSize: "clamp(96px, 22vw, 360px)",
              color: "var(--text-primary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span>C</span>
            <span>O</span>
            <span>N</span>
            <span>T</span>
            <span style={{ color: "var(--amber-bright)" }}>A</span>
            <span>C</span>
            <span>T</span>
          </h1>

          <div
            className="h-px mb-20"
            style={{ background: "var(--gray-800)" }}
          />

          {/* Body spread */}
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-20">
            {/* Left — availability prose */}
            <article className="flex flex-col gap-6">
              <div
                className="font-mono text-[11px] tracking-[0.2em] uppercase"
                style={{ color: "var(--violet-soft)" }}
              >
                ## open for correspondence
              </div>
              <h2
                className="text-[28px] lg:text-[34px] leading-[1.2] font-medium tracking-[-0.01em]"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Reach out for internship opportunities, a collaboration,
                or a long email about something you can&rsquo;t stop
                thinking about.
              </h2>
              <p
                className="text-[15px] leading-[1.85] max-w-[480px]"
                style={{ color: "var(--text-secondary)" }}
              >
                I reply from{" "}
                <span style={{ color: "var(--text-primary)" }}>MST</span>, so
                expect a response inside{" "}
                <span style={{ color: "var(--amber-bright)" }}>24–48h</span>.
                I&rsquo;m especially interested in backend systems, MLOps,
                and anything where AI research has to meet a real machine.
              </p>
              <div
                className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase mt-2"
                style={{ color: "var(--green-bright)" }}
              >
                <span
                  className="w-[6px] h-[6px] rounded-full inline-block"
                  style={{
                    background: "var(--green-bright)",
                    animation: "pulse-dot 2.5s ease-in-out infinite",
                  }}
                />
                accepting new mail
              </div>
            </article>

            {/* Right — directory */}
            <aside>
              <div className="flex items-baseline justify-between mb-4">
                <span
                  className="font-mono text-[11px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  — the directory
                </span>
                <span
                  className="font-mono text-[10px] tracking-[0.12em] uppercase"
                  style={{ color: "var(--gray-600)" }}
                >
                  pp. 03
                </span>
              </div>

              <div
                className="flex flex-col"
                style={{
                  borderTop: "1px solid var(--gray-800)",
                  borderBottom: "1px solid var(--gray-800)",
                }}
              >
                {directory.map(({ label, value, href, ext }) => (
                  <a
                    key={label}
                    href={href}
                    target={ext ? "_blank" : undefined}
                    rel={ext ? "noreferrer noopener" : undefined}
                    className="group grid items-baseline gap-4 py-[18px]"
                    style={{
                      gridTemplateColumns: "72px 1fr 28px",
                      borderTop: "1px solid var(--gray-800)",
                    }}
                  >
                    <span
                      className="font-mono text-[10.5px] tracking-[0.22em] uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-[16px] tracking-[-0.005em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {value}
                    </span>
                    <span
                      className="font-mono text-[14px] text-right transition-transform duration-200 group-hover:translate-x-[2px]"
                      style={{ color: "var(--violet-soft)" }}
                    >
                      {ext ? "↗" : "→"}
                    </span>
                  </a>
                ))}
                {/* Discord — copy-to-clipboard row, matches the
                    directory typography exactly. */}
                <CopyHandle
                  value="sashreek"
                  className="group grid items-baseline gap-4 py-[18px] w-full"
                  style={{
                    gridTemplateColumns: "72px 1fr 28px",
                    borderTop: "1px solid var(--gray-800)",
                    background: "transparent",
                    border: "none",
                    borderTopWidth: "1px",
                    borderTopStyle: "solid",
                    borderTopColor: "var(--gray-800)",
                  }}
                >
                  <span
                    className="font-mono text-[10.5px] tracking-[0.22em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    discord
                  </span>
                  <span
                    className="text-[16px] tracking-[-0.005em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    sashreek
                  </span>
                  <span
                    className="font-mono text-[11px] text-right tracking-[0.08em]"
                    style={{ color: "var(--violet-soft)" }}
                  >
                    copy
                  </span>
                </CopyHandle>
              </div>

              <p
                className="font-mono text-[10px] tracking-[0.2em] uppercase mt-5"
                style={{ color: "var(--gray-600)" }}
              >
                — sashreek addanki, editor &amp; sole correspondent
              </p>
            </aside>
          </div>
        </div>
      </main>
      <ContactVariantSwitcher current={2} />
    </>
  );
}
