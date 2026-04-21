import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";

// Variant 3 — Glass card fan.
// Three frosted-glass cards fanned out behind a short intro. Each card
// is a channel with a handle, a blurb, and a call-to-action. Leans on
// the existing .glass token so it lives in the same family as the
// admin cards and the blog post-page rail.

export const metadata = {
  title: "Contact · cards | Sashreek Addanki",
};

const cards = [
  {
    n: "01",
    label: "direct mail",
    channel: "email",
    handle: "sashreek.addanki@gmail.com",
    note: "fastest. replies inside 24–48h, MST.",
    cta: "send an email",
    href: "mailto:sashreek.addanki@gmail.com",
    accent: "var(--amber-bright)",
  },
  {
    n: "02",
    label: "source",
    channel: "github",
    handle: "Sashreek007",
    note: "projects-in-progress and shipped work. stars welcome.",
    cta: "visit github",
    href: "https://github.com/Sashreek007",
    accent: "var(--violet-soft)",
    ext: true,
  },
  {
    n: "03",
    label: "paper trail",
    channel: "linkedin",
    handle: "sashreek-addanki",
    note: "for recruiters and long-form job conversations.",
    cta: "connect on linkedin",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    accent: "var(--green-bright)",
    ext: true,
  },
];

export default function ContactVariant3() {
  return (
    <>
      <main
        className="min-h-screen w-full px-[6vw] py-24"
        style={{
          background:
            "radial-gradient(1100px circle at 75% 12%, color-mix(in srgb, var(--violet-dim) 14%, transparent), transparent 55%), var(--bg-base)",
        }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col">
          {/* Intro */}
          <div className="max-w-[680px] mb-16">
            <div
              className="font-mono text-[11px] tracking-[0.22em] uppercase mb-4"
              style={{ color: "var(--violet-soft)" }}
            >
              ## contact · three channels
            </div>
            <h1
              className="text-[44px] lg:text-[56px] leading-[1.05] font-medium tracking-[-0.015em] mb-5"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Pick a door.
            </h1>
            <p
              className="text-[15.5px] leading-[1.8]"
              style={{ color: "var(--text-secondary)" }}
            >
              Three ways in, same person on the other side. Whichever feels
              right for what you&rsquo;re bringing.
            </p>
          </div>

          {/* Card deck — glass cards on a 3-col grid, subtle stagger */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {cards.map(({ n, label, channel, handle, note, cta, href, ext, accent }, i) => (
              <a
                key={channel}
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noreferrer noopener" : undefined}
                className="glass group relative flex flex-col p-6 transition-transform duration-300 hover:-translate-y-[4px]"
                style={{
                  // subtle vertical stagger so the row feels fanned
                  transform: `translateY(${i * 10}px)`,
                  borderTop: `2px solid ${accent}`,
                }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="font-mono text-[10.5px] tracking-[0.22em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    № {n} · {label}
                  </span>
                  <span
                    className="w-[6px] h-[6px] rounded-full"
                    style={{
                      background: accent,
                      boxShadow: `0 0 12px ${accent}`,
                    }}
                  />
                </div>

                {/* Channel name */}
                <h3
                  className="text-[28px] leading-[1.1] font-medium tracking-[-0.01em] mb-3"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {channel}
                </h3>

                {/* Handle */}
                <div
                  className="font-mono text-[12px] mb-5 truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {handle}
                </div>

                {/* Note */}
                <p
                  className="text-[13.5px] leading-[1.65] mb-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  {note}
                </p>

                {/* CTA */}
                <div
                  className="mt-auto pt-4 flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--gray-800)" }}
                >
                  <span
                    className="font-mono text-[11.5px] tracking-[0.04em]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cta}
                  </span>
                  <span
                    className="font-mono text-[16px] transition-transform duration-200 group-hover:translate-x-[3px]"
                    style={{ color: accent }}
                  >
                    {ext ? "↗" : "→"}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Footer line */}
          <p
            className="font-mono text-[11px] tracking-[0.2em] uppercase mt-16 text-center"
            style={{ color: "var(--gray-600)" }}
          >
            — three channels · one inbox · same person
          </p>
        </div>
      </main>
      <ContactVariantSwitcher current={3} />
    </>
  );
}
