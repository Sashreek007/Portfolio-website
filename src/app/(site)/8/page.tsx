import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";
import CopyHandle from "@/components/site/CopyHandle";

// Variant 8 — Rolodex.
// Vertical stack of index-card strips. Each card has a tab on its left
// edge (like a real Rolodex ring binder) and the channel data in
// large type to the right. Hovering a strip slides it to the right
// and lifts it off the stack.

export const metadata = {
  title: "Contact · rolodex | Sashreek Addanki",
};

type Entry = {
  n: string;
  label: string;
  handle: string;
  sub: string;
  tabColor: string;
  href?: string;
  ext?: boolean;
  copy?: boolean;
};

const entries: Entry[] = [
  {
    n: "A",
    label: "email",
    handle: "sashreek.addanki@gmail.com",
    sub: "Gmail · the long-form lane",
    tabColor: "var(--amber-bright)",
    href: "mailto:sashreek.addanki@gmail.com",
  },
  {
    n: "G",
    label: "github",
    handle: "Sashreek007",
    sub: "where the code lives",
    tabColor: "var(--violet-soft)",
    href: "https://github.com/Sashreek007",
    ext: true,
  },
  {
    n: "L",
    label: "linkedin",
    handle: "sashreek-addanki",
    sub: "for recruiters & intros",
    tabColor: "var(--green-bright)",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    ext: true,
  },
  {
    n: "D",
    label: "discord",
    handle: "sashreek",
    sub: "DMs welcome · click to copy",
    tabColor: "var(--violet-pale)",
    copy: true,
  },
];

export default function ContactVariant8() {
  return (
    <>
      <main
        className="min-h-screen w-full px-[6vw] py-24"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-[920px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p
              className="font-mono text-[11px] tracking-[0.22em] uppercase mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              Contact · Rolodex № 026
            </p>
            <h1
              className="text-[42px] lg:text-[54px] leading-[1.05] font-medium tracking-[-0.015em] mb-4"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Flip the card.
            </h1>
            <p
              className="text-[15px] leading-[1.75] max-w-[520px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Four filed under <em>S</em>, one author, sorted by
              first-letter tab. Hover to lift.
            </p>
          </div>

          {/* Spine — binding holes + the stacked strips */}
          <div className="relative flex flex-col gap-[6px]">
            {/* Faint binding ring indicator at the top of the stack */}
            <div
              className="absolute -left-[18px] top-2 bottom-2 flex flex-col justify-around items-center pointer-events-none"
              aria-hidden
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block rounded-full"
                  style={{
                    width: "10px",
                    height: "10px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--gray-800)",
                    boxShadow: "inset 0 1px 0 var(--gray-800)",
                  }}
                />
              ))}
            </div>

            {entries.map((e) => {
              const cardStyle: React.CSSProperties = {
                background: "var(--bg-surface)",
                border: "1px solid var(--gray-800)",
                borderLeft: `4px solid ${e.tabColor}`,
                borderRadius: "4px",
                padding: "22px 26px",
                display: "grid",
                gridTemplateColumns: "60px 1fr 32px",
                alignItems: "center",
                gap: "20px",
                textAlign: "left",
                width: "100%",
                transition:
                  "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms, background 180ms",
              };
              const body = (
                <>
                  <span
                    className="font-mono text-[34px] lg:text-[40px] font-medium tracking-[-0.02em]"
                    style={{ color: e.tabColor, lineHeight: 1 }}
                  >
                    {e.n}
                  </span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-mono text-[10.5px] tracking-[0.22em] uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {e.label}
                      </span>
                      <span
                        className="text-[20px] lg:text-[22px] leading-[1.15] tracking-[-0.005em] truncate"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {e.handle}
                      </span>
                    </div>
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {e.sub}
                    </span>
                  </div>
                  <span
                    className="font-mono text-[18px] text-right"
                    style={{ color: e.tabColor }}
                  >
                    {e.copy ? "⧉" : e.ext ? "↗" : "→"}
                  </span>
                </>
              );

              if (e.copy) {
                return (
                  <CopyHandle
                    key={e.label}
                    value={e.handle}
                    className="rolodex-strip"
                    style={cardStyle}
                  >
                    {body}
                  </CopyHandle>
                );
              }

              return (
                <a
                  key={e.label}
                  href={e.href}
                  target={e.ext ? "_blank" : undefined}
                  rel={e.ext ? "noreferrer noopener" : undefined}
                  className="rolodex-strip"
                  style={cardStyle}
                >
                  {body}
                </a>
              );
            })}
          </div>

          <p
            className="font-mono text-[10.5px] tracking-[0.22em] uppercase mt-6"
            style={{ color: "var(--gray-600)" }}
          >
            — filed: apr 2026 · last revised: today
          </p>
        </div>
      </main>
      <ContactVariantSwitcher current={8} />
    </>
  );
}
