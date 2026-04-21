import ContactVariantSwitcher from "@/components/site/ContactVariantSwitcher";

// Variant 5 — Monument.
// Negative-space take: a towering headline, one sentence, three glass
// pills. Reads like the closing page of a zine, no directory, no
// dossier — just a centered invitation.

export const metadata = {
  title: "Contact · monument | Sashreek Addanki",
};

const channels = [
  { label: "email", href: "mailto:sashreek.addanki@gmail.com" },
  { label: "github", href: "https://github.com/Sashreek007", ext: true },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    ext: true,
  },
];

export default function ContactVariant5() {
  return (
    <>
      <main
        className="min-h-screen w-full flex flex-col items-center justify-center px-[6vw] py-28 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(1400px circle at 50% 30%, color-mix(in srgb, var(--violet-dim) 18%, transparent), transparent 55%), radial-gradient(900px circle at 50% 110%, color-mix(in srgb, var(--amber-deep) 22%, transparent), transparent 55%), var(--bg-base)",
        }}
      >
        {/* Top kicker — tiny, centered */}
        <div
          className="font-mono text-[11px] tracking-[0.35em] uppercase mb-12"
          style={{ color: "var(--text-muted)" }}
        >
          — say hello —
        </div>

        {/* Monument headline */}
        <h1
          className="text-center leading-[0.92] tracking-[-0.04em] mb-12"
          style={{
            fontSize: "clamp(82px, 16vw, 240px)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
          }}
        >
          say{" "}
          <span
            style={{
              color: "var(--amber-bright)",
              fontStyle: "italic",
            }}
          >
            hi.
          </span>
        </h1>

        {/* Single sentence */}
        <p
          className="text-center text-[17px] lg:text-[19px] leading-[1.6] max-w-[560px] mb-16"
          style={{ color: "var(--text-secondary)" }}
        >
          If you&rsquo;re building something weird, hiring for a co-op, or
          want to argue about a paper — pick a channel and start talking.
        </p>

        {/* Three glass pills */}
        <div className="flex flex-wrap gap-3 justify-center">
          {channels.map(({ label, href, ext }) => (
            <a
              key={label}
              href={href}
              target={ext ? "_blank" : undefined}
              rel={ext ? "noreferrer noopener" : undefined}
              className="glass-pill font-mono text-[13px] px-6 py-3 inline-flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              <span>{label}</span>
              <span
                style={{
                  color: "var(--violet-soft)",
                  fontSize: "14px",
                }}
              >
                {ext ? "↗" : "→"}
              </span>
            </a>
          ))}
        </div>

        {/* Bottom signature */}
        <div
          className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3 font-mono text-[10.5px] tracking-[0.22em] uppercase"
          style={{ color: "var(--gray-600)" }}
        >
          <span>—</span>
          <span>sashreek addanki</span>
          <span>·</span>
          <span>edmonton, ab</span>
          <span>—</span>
        </div>
      </main>
      <ContactVariantSwitcher current={5} />
    </>
  );
}
