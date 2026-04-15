import SectionLabel from "@/components/site/SectionLabel";

export const metadata = {
  title: "Contact | Sashreek Addanki",
};

const contacts = [
  {
    label: "email",
    value: "sashreekaddanki@gmail.com",
    href: "mailto:sashreekaddanki@gmail.com",
  },
  {
    label: "github",
    value: "Sashreek007",
    href: "https://github.com/Sashreek007",
    external: true,
  },
  {
    label: "linkedin",
    value: "sashreek-addanki",
    href: "https://www.linkedin.com/in/sashreek-addanki-121471257/",
    external: true,
  },
];

export default function ContactPage() {
  return (
    <div className="px-[6vw] py-16 max-w-[760px] mx-auto w-full">
      <SectionLabel>Contact</SectionLabel>
      <h1
        className="text-[28px] font-medium leading-[1.3] mb-4"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
      >
        Get in touch
      </h1>
      <p
        className="text-[15px] leading-[1.7] mb-12"
        style={{ color: "var(--text-secondary)" }}
      >
        I&apos;m open to internship opportunities in backend, MLOps, and AI systems
        roles. If you&apos;re working on something interesting, reach out.
      </p>

      <div className="flex flex-col gap-0">
        {contacts.map(({ label, value, href, external }, i) => (
          <a
            key={label}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer noopener" : undefined}
            className="group flex items-center justify-between py-5 transition-colors duration-150"
            style={{
              borderBottom:
                i < contacts.length - 1 ? "1px solid var(--gray-800)" : "none",
            }}
          >
            <span
              className="font-mono text-[11px] tracking-[0.10em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </span>
            <span
              className="text-[15px] font-medium group-hover:text-[var(--violet-pale)] transition-colors duration-150"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              {value}
              {external && (
                <span
                  className="ml-2 font-mono text-[12px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ color: "var(--violet-soft)" }}
                >
                  ↗
                </span>
              )}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
