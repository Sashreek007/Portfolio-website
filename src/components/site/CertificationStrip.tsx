import { CERTIFICATIONS } from "@/lib/certifications";

// Credentials as dossier rows, in the same grammar as the "## channels" block
// on the contact section: mono label, name, one line of substance, and an
// arrow out. The Credly artwork is the row's mark rather than its subject —
// mounted in the same tile the role logos sit in, and desaturated at rest so a
// gold-and-navy vendor badge does not fight the page's palette. Full colour
// returns on hover and on keyboard focus, which is also the only place the
// badge's own colours mean anything.
//
// The whole row is the link; there is no separate "verify" affordance because
// the arrow already carries that, exactly as the contact rows do.

export default function CertificationStrip() {
  return (
    <div className="mt-14">
      <h3
        className="reveal-child font-mono text-[14px] flex items-baseline gap-2 mb-4"
        style={{ "--ri": 1 } as React.CSSProperties}
      >
        <span style={{ color: "var(--violet-soft)" }}>##</span>
        <span style={{ color: "var(--text-primary)" }}>credentials</span>
      </h3>

      <div
        className="reveal-child flex flex-col"
        style={
          {
            borderTop: "1px solid var(--gray-800)",
            "--ri": 2,
          } as React.CSSProperties
        }
      >
        {CERTIFICATIONS.map((cert) => (
          <a
            key={cert.verifyUrl}
            href={cert.verifyUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="cert-row group"
          >
            <span className="cert-badge">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cert.badge}
                alt={`${cert.issuer} ${cert.name} badge`}
                loading="lazy"
                decoding="async"
                width={400}
                height={400}
              />
            </span>

            <div className="flex flex-col gap-2 min-w-0">
              <span
                className="font-mono text-[12px] tracking-[0.22em] uppercase font-medium"
                style={{ color: "var(--violet-soft)" }}
              >
                {cert.via ? `${cert.issuer} · ${cert.via}` : cert.issuer}
              </span>
              <span
                className="text-[18px] lg:text-[21px] leading-[1.2] tracking-[-0.012em] transition-colors duration-200 group-hover:text-[var(--violet-pale)]"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {cert.name}
              </span>
              <p
                className="text-[13.5px] leading-[1.5] max-w-[620px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {cert.blurb}
              </p>
            </div>

            <div className="cert-when font-mono text-[11.5px] tracking-[0.1em] uppercase">
              <span style={{ color: "var(--text-muted)" }}>{cert.issued}</span>
              <span
                className="cert-arrow font-mono text-[22px] tracking-normal"
                style={{ color: "var(--violet-soft)" }}
                aria-hidden
              >
                ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
