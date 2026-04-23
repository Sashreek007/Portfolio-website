import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";
import CopyHandle from "@/components/site/CopyHandle";

// Variant 7 — Postcard.
// The back of a postal card: stamp corner in the upper right, address
// block on the right, a short hand-written-style message on the left,
// and a dashed vertical centerline splitting the two. Channels live
// where the address would — one per line.

export const metadata = {
  title: "Contact · postcard | Sashreek Addanki",
};

const channels = [
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
  {
    label: "discord",
    value: "sashreek",
    copy: true,
  },
];

export default function ContactVariant7() {
  return (
    <>
      <main
        className="min-h-screen w-full flex items-center justify-center px-[6vw] py-24"
        style={{
          background:
            "radial-gradient(1200px circle at 30% 80%, color-mix(in srgb, var(--amber-deep) 10%, transparent), transparent 55%), var(--bg-base)",
        }}
      >
        {/* The postcard sheet */}
        <article
          className="glass-strong w-full max-w-[960px] aspect-[16/10] p-10 lg:p-14 relative flex"
          style={{
            fontFamily: "var(--font-mono)",
          }}
        >
          {/* Postmark stamp in upper-right */}
          <div
            className="absolute top-8 right-8 flex flex-col items-center justify-center"
            style={{
              width: "96px",
              height: "112px",
              border: "2px solid var(--amber-bright)",
              borderRadius: "4px",
              background:
                "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--amber-deep) 60%, transparent), transparent 75%)",
              boxShadow:
                "inset 0 0 0 3px color-mix(in srgb, var(--amber-deep) 40%, transparent)",
            }}
          >
            <span
              className="text-[10px] tracking-[0.22em] uppercase"
              style={{ color: "var(--amber-bright)" }}
            >
              SA
            </span>
            <span
              className="text-[22px] font-medium my-1"
              style={{
                color: "var(--amber-bright)",
                fontFamily: "var(--font-body)",
                lineHeight: 1,
              }}
            >
              2026
            </span>
            <span
              className="text-[9px] tracking-[0.22em] uppercase"
              style={{ color: "var(--amber-bright)" }}
            >
              YEG → you
            </span>
          </div>

          {/* Divider line */}
          <span
            className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              borderLeft: "1px dashed var(--gray-800)",
            }}
            aria-hidden
          />

          {/* LEFT — the message */}
          <div className="flex-1 pr-10 flex flex-col">
            <div
              className="text-[10.5px] tracking-[0.22em] uppercase mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              — postcard № 01
            </div>
            <p
              className="text-[22px] lg:text-[26px] leading-[1.35] tracking-[-0.005em] mb-6"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
              }}
            >
              Hey —
            </p>
            <p
              className="text-[15px] lg:text-[16px] leading-[1.8] mb-auto"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Edmonton&rsquo;s cold. Projects are warm. If you want to talk
              about either, or about building AI systems that actually run,
              one of the addresses across the way will reach me.
            </p>
            <div className="mt-8">
              <div
                className="text-[10.5px] tracking-[0.22em] uppercase mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                — sent from
              </div>
              <div
                className="text-[13px]"
                style={{ color: "var(--text-primary)" }}
              >
                Edmonton, Alberta · MST
              </div>
            </div>
          </div>

          {/* RIGHT — the address block (channels) */}
          <div className="flex-1 pl-10 flex flex-col">
            <div
              className="text-[10.5px] tracking-[0.22em] uppercase mb-6 text-right"
              style={{ color: "var(--text-muted)" }}
            >
              addresses ——
            </div>
            <div className="flex flex-col gap-[14px]">
              {channels.map((c) =>
                c.copy ? (
                  <CopyHandle
                    key={c.label}
                    value={c.value}
                    className="group grid items-baseline gap-4 py-[6px] w-full"
                    style={{
                      gridTemplateColumns: "72px 1fr 22px",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px dashed var(--gray-800)",
                    }}
                  >
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {c.label}
                    </span>
                    <span
                      className="text-[14px] transition-colors duration-150 group-hover:text-[var(--violet-pale)] truncate"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {c.value}
                    </span>
                    <span
                      className="text-[13px] text-right"
                      style={{ color: "var(--violet-soft)" }}
                    >
                      ⧉
                    </span>
                  </CopyHandle>
                ) : (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.ext ? "_blank" : undefined}
                    rel={c.ext ? "noreferrer noopener" : undefined}
                    className="group grid items-baseline gap-4 py-[6px]"
                    style={{
                      gridTemplateColumns: "72px 1fr 22px",
                      borderBottom: "1px dashed var(--gray-800)",
                    }}
                  >
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {c.label}
                    </span>
                    <span
                      className="text-[14px] transition-colors duration-150 group-hover:text-[var(--violet-pale)] truncate"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {c.value}
                    </span>
                    <span
                      className="text-[13px] text-right"
                      style={{ color: "var(--violet-soft)" }}
                    >
                      {c.ext ? "↗" : "→"}
                    </span>
                  </a>
                ),
              )}
            </div>
          </div>
        </article>
      </main>
      <ContactVariantSwitcher current={7} />
    </>
  );
}
